// api/lib/db.js
// Shared database helper — uses Vercel Postgres.
// Requires the POSTGRES_URL environment variable, which Vercel adds
// automatically once you create a Postgres database in your project's
// "Storage" tab.

const { sql } = require('@vercel/postgres');

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      page_type TEXT,
      car TEXT,
      trip_option TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      pickup TEXT,
      drop_location TEXT,
      landmark TEXT,
      travel_date TEXT,
      travel_time TEXT,
      return_date TEXT,
      notes TEXT,
      return_cab BOOLEAN,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  tableReady = true;
}

module.exports = { sql, ensureTable };
