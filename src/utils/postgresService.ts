// Frontend API Client for PostgreSQL Backend

export interface DbStatus {
  connected: boolean;
  database: string;
  error?: string;
}

export async function checkPostgresStatus(): Promise<DbStatus> {
  try {
    const res = await fetch('/api/db/status');
    return await res.json();
  } catch (err: any) {
    return { connected: false, database: 'PostgreSQL', error: err.message };
  }
}

export async function syncUserToPostgres(user: any): Promise<boolean> {
  try {
    const res = await fetch('/api/db/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Postgres user sync skipped (offline mode):', err);
    return false;
  }
}

export async function syncBusinessToPostgres(business: any): Promise<boolean> {
  try {
    const res = await fetch('/api/db/sync-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(business),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Postgres business sync skipped (offline mode):', err);
    return false;
  }
}

export async function syncPaymentSessionToPostgres(session: any): Promise<boolean> {
  try {
    const res = await fetch('/api/db/sync-payment-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Postgres session sync skipped (offline mode):', err);
    return false;
  }
}

export async function syncTransactionToPostgres(tx: any): Promise<boolean> {
  try {
    const res = await fetch('/api/db/sync-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Postgres transaction sync skipped (offline mode):', err);
    return false;
  }
}

export async function syncExpenseToPostgres(expense: any): Promise<boolean> {
  try {
    const res = await fetch('/api/db/sync-expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Postgres expense sync skipped (offline mode):', err);
    return false;
  }
}
