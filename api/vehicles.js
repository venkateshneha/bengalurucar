// api/vehicles.js
// GET  -> public. Returns the vehicle fleet so the website pages
//         (local-cabs.html, outstation-cabs.html, airport-taxi.html)
//         can render cards dynamically instead of hardcoding them.
//         ?type=local|outstation|airport filters to vehicles that should
//         show on that page. ?all=1 (admin only) returns every vehicle,
//         including inactive ones, for the admin "Manage Vehicles" screen.
// POST -> admin only. Creates a new vehicle.

const { sql, ensureVehiclesTable } = require('./lib/db');
const { isAdmin } = require('./lib/auth');

const NUMERIC_FIELDS = [
  'local_price', 'local_extra_km', 'local_extra_hr',
  'outstation_rate_oneway', 'outstation_rate_roundtrip',
  'outstation_driver_bata', 'outstation_min_km',
  'airport_price', 'airport_toll', 'display_order'
];

function toNumOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalize(body) {
  const out = {
    name: String(body.name || '').trim(),
    category: String(body.category || 'sedan').trim() || 'sedan',
    seats: String(body.seats || '').trim(),
    luggage: String(body.luggage || '').trim(),
    image_url: String(body.image_url || '').trim(),
    display_order: toNumOrNull(body.display_order) || 0,
    active: body.active === false ? false : true,

    show_local: body.show_local === false ? false : true,
    local_price: toNumOrNull(body.local_price),
    local_package: String(body.local_package || '8Hrs 80Kms').trim(),
    local_extra_km: toNumOrNull(body.local_extra_km),
    local_extra_hr: toNumOrNull(body.local_extra_hr),

    show_outstation: body.show_outstation === false ? false : true,
    outstation_rate_oneway: toNumOrNull(body.outstation_rate_oneway),
    outstation_rate_roundtrip: toNumOrNull(body.outstation_rate_roundtrip),
    outstation_driver_bata: toNumOrNull(body.outstation_driver_bata) ?? 500,
    outstation_min_km: toNumOrNull(body.outstation_min_km) ?? 300,

    show_airport: body.show_airport === false ? false : true,
    airport_price: toNumOrNull(body.airport_price),
    airport_toll: toNumOrNull(body.airport_toll)
  };
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.POSTGRES_URL) {
    return res.status(200).json({ ok: true, vehicles: [], warning: 'Database not configured yet (POSTGRES_URL missing).' });
  }

  try {
    await ensureVehiclesTable();

    if (req.method === 'GET') {
      const wantAll = req.query.all === '1';
      const type = req.query.type; // 'local' | 'outstation' | 'airport'

      if (wantAll && !isAdmin(req)) {
        return res.status(401).json({ ok: false, error: 'Not authorized. Please log in.' });
      }

      let result;
      if (wantAll) {
        result = await sql`SELECT * FROM vehicles ORDER BY display_order ASC, id ASC;`;
      } else if (type === 'local') {
        result = await sql`SELECT * FROM vehicles WHERE active = true AND show_local = true ORDER BY display_order ASC, id ASC;`;
      } else if (type === 'outstation') {
        result = await sql`SELECT * FROM vehicles WHERE active = true AND show_outstation = true ORDER BY display_order ASC, id ASC;`;
      } else if (type === 'airport') {
        result = await sql`SELECT * FROM vehicles WHERE active = true AND show_airport = true ORDER BY display_order ASC, id ASC;`;
      } else {
        result = await sql`SELECT * FROM vehicles WHERE active = true ORDER BY display_order ASC, id ASC;`;
      }
      return res.status(200).json({ ok: true, vehicles: result.rows });
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) {
        return res.status(401).json({ ok: false, error: 'Not authorized. Please log in.' });
      }
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      body = body || {};

      if (!body.name || !String(body.name).trim()) {
        return res.status(400).json({ ok: false, error: 'Vehicle name is required.' });
      }

      const v = normalize(body);
      const result = await sql`
        INSERT INTO vehicles (
          name, category, seats, luggage, image_url, display_order, active,
          show_local, local_price, local_package, local_extra_km, local_extra_hr,
          show_outstation, outstation_rate_oneway, outstation_rate_roundtrip, outstation_driver_bata, outstation_min_km,
          show_airport, airport_price, airport_toll
        ) VALUES (
          ${v.name}, ${v.category}, ${v.seats}, ${v.luggage}, ${v.image_url}, ${v.display_order}, ${v.active},
          ${v.show_local}, ${v.local_price}, ${v.local_package}, ${v.local_extra_km}, ${v.local_extra_hr},
          ${v.show_outstation}, ${v.outstation_rate_oneway}, ${v.outstation_rate_roundtrip}, ${v.outstation_driver_bata}, ${v.outstation_min_km},
          ${v.show_airport}, ${v.airport_price}, ${v.airport_toll}
        )
        RETURNING *;
      `;
      return res.status(200).json({ ok: true, vehicle: result.rows[0] });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('vehicles.js error:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong.' });
  }
};
