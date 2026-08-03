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

let vehiclesTableReady = false;

async function ensureVehiclesTable() {
  if (vehiclesTableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'sedan',
      seats TEXT,
      luggage TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT true,

      show_local BOOLEAN DEFAULT true,
      local_price NUMERIC,
      local_package TEXT DEFAULT '8Hrs 80Kms',
      local_extra_km NUMERIC,
      local_extra_hr NUMERIC,

      show_outstation BOOLEAN DEFAULT true,
      outstation_rate_oneway NUMERIC,
      outstation_rate_roundtrip NUMERIC,
      outstation_driver_bata NUMERIC DEFAULT 500,
      outstation_min_km NUMERIC DEFAULT 300,

      show_airport BOOLEAN DEFAULT true,
      airport_price NUMERIC,
      airport_toll NUMERIC,

      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  vehiclesTableReady = true;
}

module.exports = { sql, ensureTable, ensureVehiclesTable };
