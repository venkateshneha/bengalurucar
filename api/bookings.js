// api/bookings.js
// Protected endpoint — returns all bookings from the database.
// Only works if the request carries the correct admin cookie (set by
// api/login.js after a successful login).

const { sql, ensureTable } = require('./lib/db');

function getCookie(req, name) {
  if (req.cookies && req.cookies[name]) return req.cookies[name];
  const header = req.headers.cookie || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
  if (!ADMIN_TOKEN) {
    return res.status(500).json({ ok: false, error: 'Admin login is not configured yet.' });
  }

  const cookieToken = getCookie(req, 'bcr_admin');
  if (!cookieToken || cookieToken !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Not authorized. Please log in.' });
  }

  if (!process.env.POSTGRES_URL) {
    return res.status(200).json({ ok: true, bookings: [], warning: 'Database not configured yet (POSTGRES_URL missing).' });
  }

  try {
    await ensureTable();
    const result = await sql`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 500;`;
    return res.status(200).json({ ok: true, bookings: result.rows });
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    return res.status(500).json({ ok: false, error: 'Failed to fetch bookings.' });
  }
};
