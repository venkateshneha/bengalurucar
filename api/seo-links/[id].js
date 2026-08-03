// api/seo-links/[id].js
// PUT    -> admin only. Updates a keyword link's fields.
// DELETE -> admin only. Removes a keyword link.

const { sql, ensureSeoLinksTable } = require('../lib/db');
const { isAdmin } = require('../lib/auth');

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
    return res.status(400).json({ ok: false, error: 'Invalid link id.' });
  }

  if (!process.env.POSTGRES_URL) {
    return res.status(500).json({ ok: false, error: 'Database not configured yet (POSTGRES_URL missing).' });
  }

  try {
    await ensureSeoLinksTable();

    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      body = body || {};

      const label = String(body.label || '').trim();
      const url = String(body.url || '').trim();
      const display_order = Number(body.display_order) || 0;
      const active = body.active === false ? false : true;

      if (!label || !url) {
        return res.status(400).json({ ok: false, error: 'Both label and URL are required.' });
      }

      const result = await sql`
        UPDATE seo_links SET
          label = ${label}, url = ${url}, display_order = ${display_order}, active = ${active},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      if (!result.rows.length) {
        return res.status(404).json({ ok: false, error: 'Link not found.' });
      }
      return res.status(200).json({ ok: true, link: result.rows[0] });
    }

    if (req.method === 'DELETE') {
      const result = await sql`DELETE FROM seo_links WHERE id = ${id} RETURNING id;`;
      if (!result.rows.length) {
        return res.status(404).json({ ok: false, error: 'Link not found.' });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('seo-links/[id].js error:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong.' });
  }
};
