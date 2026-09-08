import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import fs from 'fs'
import nodemailer from 'nodemailer'

function ensApkPlugin() {
  return {
    name: 'ens-apk-headers',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url.endsWith('.apk') || url === '/ENS-Business-OS.apk') {
          const apkPath = resolve(process.cwd(), 'public/ENS-Business-OS.apk');
          if (fs.existsSync(apkPath)) {
            const stat = fs.statSync(apkPath);
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="ENS-Business-OS.apk"');
            res.setHeader('Content-Length', stat.size);
            const stream = fs.createReadStream(apkPath);
            return stream.pipe(res);
          }
        }
        next();
      });
    },
  };
}

function ensEmailPlugin() {
  return {
    name: 'ens-email-service',
    configureServer(server: any) {
      server.middlewares.use('/api/send-otp', async (req: any, res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const { email, otp, fullName, purpose } = JSON.parse(body || '{}');
            if (!email || !otp) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Email and OTP required' }));
              return;
            }

            const smtpUser = process.env.SMTP_USER || 'excellentnationalsystems@gmail.com';
            const smtpPass = process.env.SMTP_PASS;

            let transporter: any;
            let previewUrl: string | false = false;

            if (smtpPass) {
              // Real Gmail / SMTP delivery to recipient's actual inbox
              transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 465,
                secure: process.env.SMTP_SECURE !== 'false',
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
              });
            } else {
              // Development fallback: Ethereal test SMTP account (zero setup required)
              const testAccount = await nodemailer.createTestAccount();
              transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                  user: testAccount.user,
                  pass: testAccount.pass,
                },
              });
            }

            const isReset = purpose === 'password_reset';
            const subject = isReset
              ? `${otp} is your ENS password reset code`
              : `${otp} is your ENS Business verification code`;
            const actionText = isReset
              ? 'Your 6-digit verification code to reset your password on ENS is:'
              : 'Your 6-digit verification code to register your business on ENS is:';

            const mailOptions = {
              from: `"ENS Business OS" <${smtpUser}>`,
              to: email,
              subject,
              text: `Hello ${fullName || 'Partner'},\n\n${actionText} ${otp}\n\nValid for 5 minutes. Do not share this code.\n\nENS Smart Transaction\nHelpline: +91 88675 41037`,
              html: `
                <div style="font-family: Arial, sans-serif; background-color: #070D1E; color: #F0F4FF; padding: 30px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #0A84FF; font-size: 24px; margin: 0; letter-spacing: 1px;">ENS SMART TRANSACTION</h1>
                    <p style="color: #7E8B9F; font-size: 13px; margin: 5px 0 0 0;">Open Source • Direct Bank Settlements • Zero Commission</p>
                  </div>
                  <div style="background-color: #0D152D; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 25px; text-align: center;">
                    <p style="font-size: 14px; margin: 0 0 10px 0; color: #A0AEC0;">Hello ${fullName || 'Partner'},</p>
                    <p style="font-size: 14px; color: #7E8B9F; margin-bottom: 20px;">${actionText}</p>
                    <div style="background: rgba(10,132,255,0.15); border: 2px dashed #0A84FF; border-radius: 12px; padding: 16px; font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #00D26A; font-family: monospace;">
                      ${otp}
                    </div>
                    <p style="font-size: 12px; color: #7E8B9F; margin-top: 20px;">This code is valid for 5 minutes. Never share this OTP with anyone.</p>
                  </div>
                  <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #4B5563;">
                    Helpline: +91 88675 41037 • excellentnationalsystems@gmail.com
                  </div>
                </div>
              `,
            };

            const info = await transporter.sendMail(mailOptions);
            previewUrl = nodemailer.getTestMessageUrl(info);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              messageId: info.messageId,
              previewUrl: previewUrl || null,
              isRealSmtp: !!smtpPass,
              sentTo: email,
            }));
          } catch (err: any) {
            console.error('Mail dispatch error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Failed to send email' }));
          }
        });
      });
    },
  };
}

function ensPostgresPlugin() {
  return {
    name: 'ens-postgres-service',
    configureServer(server: any) {
      // Dynamic import to avoid loading issues in browser bundle
      const getPgPool = async () => {
        const { pool, testAndInitPostgres } = await import('./src/server/db.js').catch(async () => {
          return await import('./src/server/db.ts');
        });
        return { pool, testAndInitPostgres };
      };

      // Helper to parse JSON body
      const parseJsonBody = (req: any): Promise<any> => {
        return new Promise((res, rej) => {
          let b = '';
          req.on('data', (c: any) => { b += c; });
          req.on('end', () => {
            try { res(JSON.parse(b || '{}')); } catch (e) { rej(e); }
          });
        });
      };

      // 1. Status endpoint
      server.middlewares.use('/api/db/status', async (_req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const { testAndInitPostgres } = await getPgPool();
          const result = await testAndInitPostgres();
          res.end(JSON.stringify({
            connected: result.connected,
            database: 'PostgreSQL',
            error: result.error || null,
          }));
        } catch (err: any) {
          res.end(JSON.stringify({
            connected: false,
            database: 'PostgreSQL',
            error: err.message || 'Database offline',
          }));
        }
      });

      // 2. Sync User
      server.middlewares.use('/api/db/sync-user', async (req: any, res: any) => {
        if (req.method !== 'POST') return res.end();
        res.setHeader('Content-Type', 'application/json');
        try {
          const { pool } = await getPgPool();
          const u = await parseJsonBody(req);
          await pool.query(
            `INSERT INTO users (id, full_name, username, email, password_hash, role, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               full_name = EXCLUDED.full_name,
               email = EXCLUDED.email,
               status = EXCLUDED.status,
               updated_at = EXCLUDED.updated_at`,
            [u.id, u.fullName, u.username, u.email, u.passwordHash, u.role || 'BUSINESS_ADMIN', u.status || 'active', u.createdAt || Date.now(), u.updatedAt || Date.now()]
          );
          res.end(JSON.stringify({ success: true }));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      // 3. Sync Business
      server.middlewares.use('/api/db/sync-business', async (req: any, res: any) => {
        if (req.method !== 'POST') return res.end();
        res.setHeader('Content-Type', 'application/json');
        try {
          const { pool } = await getPgPool();
          const b = await parseJsonBody(req);
          await pool.query(
            `INSERT INTO businesses (id, owner_id, name, type, address, phone, upi_id, merchant_name, qr_data, qr_image_url, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               type = EXCLUDED.type,
               address = EXCLUDED.address,
               phone = EXCLUDED.phone,
               upi_id = EXCLUDED.upi_id,
               merchant_name = EXCLUDED.merchant_name,
               qr_data = EXCLUDED.qr_data,
               qr_image_url = EXCLUDED.qr_image_url,
               status = EXCLUDED.status`,
            [b.id, b.ownerId, b.name, b.type, b.address, b.phone, b.upiId, b.merchantName, b.qrData, b.qrImageUrl, b.status || 'active', b.createdAt || Date.now()]
          );
          res.end(JSON.stringify({ success: true }));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      // 4. Sync Payment Session
      server.middlewares.use('/api/db/sync-payment-session', async (req: any, res: any) => {
        if (req.method !== 'POST') return res.end();
        res.setHeader('Content-Type', 'application/json');
        try {
          const { pool } = await getPgPool();
          const s = await parseJsonBody(req);
          await pool.query(
            `INSERT INTO payment_sessions (id, business_id, cashier_id, amount, upi_id, merchant_name, upi_uri, currency, status, note, transaction_ref, created_at, expires_at, confirmed_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (id) DO UPDATE SET
               status = EXCLUDED.status,
               transaction_ref = EXCLUDED.transaction_ref,
               confirmed_at = EXCLUDED.confirmed_at`,
            [s.id, s.businessId, s.cashierId || null, s.amount, s.upiId, s.merchantName, s.upiUri, s.currency || 'INR', s.status, s.note || null, s.transactionRef || null, s.createdAt, s.expiresAt, s.confirmedAt || null]
          );
          res.end(JSON.stringify({ success: true }));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      // 5. Sync Transaction
      server.middlewares.use('/api/db/sync-transaction', async (req: any, res: any) => {
        if (req.method !== 'POST') return res.end();
        res.setHeader('Content-Type', 'application/json');
        try {
          const { pool } = await getPgPool();
          const t = await parseJsonBody(req);
          await pool.query(
            `INSERT INTO transactions (id, business_id, bill_id, amount, method, status, reference, payer_masked, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               status = EXCLUDED.status,
               reference = EXCLUDED.reference`,
            [t.id, t.businessId, t.billId || null, t.amount, t.method, t.status, t.reference || null, t.payerMasked || null, t.createdAt || Date.now()]
          );
          res.end(JSON.stringify({ success: true }));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      // 6. Sync Expense
      server.middlewares.use('/api/db/sync-expense', async (req: any, res: any) => {
        if (req.method !== 'POST') return res.end();
        res.setHeader('Content-Type', 'application/json');
        try {
          const { pool } = await getPgPool();
          const e = await parseJsonBody(req);
          await pool.query(
            `INSERT INTO expenses (id, business_id, name, category, amount, description, date, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               category = EXCLUDED.category,
               amount = EXCLUDED.amount,
               description = EXCLUDED.description`,
            [e.id, e.businessId, e.name, e.category, e.amount, e.description || null, e.date, e.createdAt || Date.now()]
          );
          res.end(JSON.stringify({ success: true }));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    },
  };
}

function ensSecurityPlugin() {
  return {
    name: 'ens-security-headers',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // Anti-Clickjacking & Anti-Framing protection
        res.setHeader('X-Frame-Options', 'DENY');
        // Prevent MIME-sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        // Cross-site scripting filter
        res.setHeader('X-XSS-Protection', '1; mode=block');
        // Referrer privacy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        // Permissions restrictions
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // No-cache for dynamic API routes
        if (req.url && req.url.startsWith('/api/')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    plugins: [
      ensSecurityPlugin(),
      ensApkPlugin(),
      react(),
      tailwindcss(),
      ensEmailPlugin(),
      ensPostgresPlugin(),
    ],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: true,
      allowedHosts: true,
      port: 5173,
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  };
});
