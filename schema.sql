-- PostgreSQL Database Schema for ENS Smart Transaction
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) DEFAULT 'BUSINESS_ADMIN',
  status VARCHAR(32) DEFAULT 'active',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(64) NOT NULL,
  address TEXT,
  phone VARCHAR(32),
  upi_id VARCHAR(128) NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  qr_data TEXT,
  qr_image_url TEXT,
  status VARCHAR(32) DEFAULT 'active',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_sessions (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) REFERENCES businesses(id) ON DELETE CASCADE,
  cashier_id VARCHAR(64),
  amount NUMERIC(12, 2) NOT NULL,
  upi_id VARCHAR(128) NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  upi_uri TEXT NOT NULL,
  currency VARCHAR(8) DEFAULT 'INR',
  status VARCHAR(32) NOT NULL,
  note TEXT,
  transaction_ref VARCHAR(128),
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  confirmed_at BIGINT
);

CREATE TABLE IF NOT EXISTS bills (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) REFERENCES businesses(id) ON DELETE CASCADE,
  cashier_id VARCHAR(64),
  subtotal NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_status VARCHAR(32) NOT NULL,
  payment_method VARCHAR(32),
  items_json JSONB,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) REFERENCES businesses(id) ON DELETE CASCADE,
  bill_id VARCHAR(64),
  amount NUMERIC(12, 2) NOT NULL,
  method VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  reference VARCHAR(128),
  payer_masked VARCHAR(128),
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  date BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);
