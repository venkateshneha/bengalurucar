// api/logout.js
// Clears the admin cookie.

module.exports = async function handler(req, res) {
  res.setHeader('Set-Cookie', ['bcr_admin=; Path=/; HttpOnly; Max-Age=0']);
  return res.status(200).json({ ok: true });
};
