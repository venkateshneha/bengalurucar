// api/seo-links.js
// GET  -> public. Returns the SEO keyword links shown in the site footer.
//         ?all=1 (admin only) returns every link, including inactive ones,
//         for the admin "Manage Keywords" screen.
// POST -> admin only. Creates a new keyword link.

const { sql, ensureSeoLinksTable } = require('./lib/db');
const { isAdmin } = require('./lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.POSTGRES_URL) {
    return res.status(200).json({ ok: true, links: [], warning: 'Database not configured yet (POSTGRES_URL missing).' });
  }

  try {
    await ensureSeoLinksTable();

    if (req.method === 'GET') {
      const wantAll = req.query.all === '1';

      if (wantAll && !isAdmin(req)) {
        return res.status(401).json({ ok: false, error: 'Not authorized. Please log in.' });
      }

      const result = wantAll
        ? await sql`SELECT * FROM seo_links ORDER BY display_order ASC, id ASC;`
        : await sql`SELECT * FROM seo_links WHERE active = true ORDER BY display_order ASC, id ASC;`;

      return res.status(200).json({ ok: true, links: result.rows });
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

      const label = String(body.label || '').trim();
      const url = String(body.url || '').trim();
      const display_order = Number(body.display_order) || 0;
      const active = body.active === false ? false : true;

      if (!label || !url) {
        return res.status(400).json({ ok: false, error: 'Both label and URL are required.' });
      }

      const result = await sql`
        INSERT INTO seo_links (label, url, display_order, active)
        VALUES (${label}, ${url}, ${display_order}, ${active})
        RETURNING *;
      `;
      return res.status(200).json({ ok: true, link: result.rows[0] });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('seo-links.js error:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong.' });
  }
};
