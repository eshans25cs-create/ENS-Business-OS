import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, otp, fullName, purpose } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'Missing email or OTP' });

  const smtpUser = process.env.SMTP_USER || 'excellentnationalsystems@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'ouuhcjhnyaeiauhg';
  if (!smtpUser || !smtpPass) return res.status(500).json({ error: 'Email service not configured' });

  const isReset = purpose === 'password_reset';
  const subjectLine = isReset ? 'ENS Business OS - Password Reset OTP' : 'ENS Business OS - Verify Your Account';
  const greeting = fullName ? `Hello ${fullName},` : 'Hello,';
  const bodyMsg = isReset
    ? 'We received a request to reset your ENS Business OS password. Use the OTP below to continue.'
    : 'Welcome to ENS Business OS! Use the OTP below to verify your account.';

  const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#030B1A;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#030B1A;"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#060F20;border-radius:16px;border:1px solid #0A84FF33;">
<tr><td style="background:linear-gradient(135deg,#0A84FF22,#00C89622);padding:32px 40px;text-align:center;border-bottom:1px solid #0A84FF33;">
<div style="font-size:32px;font-weight:900;color:#0A84FF;">ENS</div>
<div style="font-size:13px;color:#6B7FA3;letter-spacing:4px;">BUSINESS OS</div>
</td></tr>
<tr><td style="padding:40px;">
<p style="color:#F0F4FF;font-size:16px;margin:0 0 8px;">${greeting}</p>
<p style="color:#A0AEC0;font-size:15px;margin:0 0 32px;line-height:1.6;">${bodyMsg}</p>
<div style="background:#0A84FF15;border:2px solid #0A84FF;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
<div style="color:#6B7FA3;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;">Your OTP Code</div>
<div style="color:#0A84FF;font-size:42px;font-weight:900;letter-spacing:12px;font-family:monospace;">${otp}</div>
<div style="color:#6B7FA3;font-size:12px;margin-top:12px;">Valid for <strong style="color:#FFD700;">10 minutes</strong></div>
</div>
<p style="color:#6B7FA3;font-size:13px;line-height:1.6;margin:0;">If you did not request this, ignore this email. Never share this OTP with anyone.</p>
</td></tr>
<tr><td style="background:#030B1A;padding:20px 40px;border-top:1px solid #0A84FF22;text-align:center;">
<p style="color:#6B7FA3;font-size:12px;margin:0;">ENS Business OS - Secure Payment Platform</p>
</td></tr>
</table></td></tr></table></body></html>`;

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } });
    const info = await transporter.sendMail({
      from: `"ENS Business OS" <${smtpUser}>`,
      to: email,
      subject: subjectLine,
      html: htmlBody,
      text: `Your ENS Business OS OTP is: ${otp}\n\nValid for 10 minutes. Do not share.`,
    });
    return res.status(200).json({ success: true, messageId: info.messageId, isRealSmtp: true, sentTo: email });
  } catch (err: any) {
    console.error('SMTP Error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to send email' });
  }
}
