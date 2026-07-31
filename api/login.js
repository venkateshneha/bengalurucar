// api/login.js
// Simple admin login. Checks the submitted username/password against
// two environment variables (ADMIN_USERNAME, ADMIN_PASSWORD) and, if they
// match, sets a secure cookie that the dashboard checks on every request.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const { username, password } = body;
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_TOKEN) {
    return res.status(500).json({
      ok: false,
      error: 'Admin login is not configured yet. Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_TOKEN in your environment variables.'
    });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Invalid username or password' });
  }

  // Set an httpOnly cookie holding the shared admin token.
  // httpOnly = JavaScript on the page can't read it (safer against XSS).
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', [
    `bcr_admin=${ADMIN_TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${isProd ? '; Secure' : ''}`
  ]);

  return res.status(200).json({ ok: true });
};
