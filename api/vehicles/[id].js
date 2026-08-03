// api/vehicles/[id].js
// PUT    -> admin only. Replaces a vehicle's fields.
// DELETE -> admin only. Removes a vehicle.

const { sql, ensureVehiclesTable } = require('../lib/db');
const { isAdmin } = require('../lib/auth');

function toNumOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalize(body) {
  return {
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
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAdmin(req)) {
    return res.status(401).json({ ok: false, error: 'Not authorized. Please log in.' });
  }

  const id = Number(req.query.id);
  if (!id) {
    return res.status(400).json({ ok: false, error: 'Invalid vehicle id.' });
  }

  if (!process.env.POSTGRES_URL) {
    return res.status(500).json({ ok: false, error: 'Database not configured yet (POSTGRES_URL missing).' });
  }

  try {
    await ensureVehiclesTable();

    if (req.method === 'PUT') {
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
        UPDATE vehicles SET
          name = ${v.name}, category = ${v.category}, seats = ${v.seats}, luggage = ${v.luggage},
          image_url = ${v.image_url}, display_order = ${v.display_order}, active = ${v.active},
          show_local = ${v.show_local}, local_price = ${v.local_price}, local_package = ${v.local_package},
          local_extra_km = ${v.local_extra_km}, local_extra_hr = ${v.local_extra_hr},
          show_outstation = ${v.show_outstation}, outstation_rate_oneway = ${v.outstation_rate_oneway},
          outstation_rate_roundtrip = ${v.outstation_rate_roundtrip}, outstation_driver_bata = ${v.outstation_driver_bata},
          outstation_min_km = ${v.outstation_min_km},
          show_airport = ${v.show_airport}, airport_price = ${v.airport_price}, airport_toll = ${v.airport_toll},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      if (!result.rows.length) {
        return res.status(404).json({ ok: false, error: 'Vehicle not found.' });
      }
      return res.status(200).json({ ok: true, vehicle: result.rows[0] });
    }

    if (req.method === 'DELETE') {
      const result = await sql`DELETE FROM vehicles WHERE id = ${id} RETURNING id;`;
      if (!result.rows.length) {
        return res.status(404).json({ ok: false, error: 'Vehicle not found.' });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('vehicles/[id].js error:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong.' });
  }
};
