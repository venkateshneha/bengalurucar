// api/lib/auth.js
// Shared helper — checks the same admin cookie that api/login.js sets,
// so any endpoint can require admin auth with one line.

function getCookie(req, name) {
  if (req.cookies && req.cookies[name]) return req.cookies[name];
  const header = req.headers.cookie || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function isAdmin(req) {
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
  if (!ADMIN_TOKEN) return false;
  const cookieToken = getCookie(req, 'bcr_admin');
  return !!cookieToken && cookieToken === ADMIN_TOKEN;
}

module.exports = { getCookie, isAdmin };
