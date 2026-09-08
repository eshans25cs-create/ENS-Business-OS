import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

// Connection string from environment variable or standard local PostgreSQL defaults
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'ens_db'}`;

export const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function testAndInitPostgres(): Promise<{ connected: boolean; error?: string }> {
  try {
    const client = await pool.connect();
    try {
      // Run schema migrations automatically
      const schemaSql = fs.readFileSync(new URL('../../schema.sql', import.meta.url), 'utf8');
      await client.query(schemaSql);
      console.log('🐘 PostgreSQL connected & tables verified successfully');
      return { connected: true };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}
