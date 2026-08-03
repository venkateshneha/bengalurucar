// api/upload.js
// Admin only. Accepts a photo (as a base64 data URL) from the admin
// panel, uploads it to Vercel Blob storage, and returns a public URL
// that gets saved on the vehicle record.
//
// Needs the Blob store connected to this Vercel project (Storage tab ->
// Create Database -> Blob). Vercel then sets BLOB_READ_WRITE_TOKEN for
// you automatically — no manual setup beyond that.

const { put } = require('@vercel/blob');
const { isAdmin } = require('./lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!isAdmin(req)) {
    return res.status(401).json({ ok: false, error: 'Not authorized. Please log in.' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      ok: false,
      error: 'Photo storage is not set up yet. In Vercel: Storage tab -> Create Database -> Blob, then redeploy.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const { dataUrl, filename } = body;
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return res.status(400).json({ ok: false, error: 'No image data received.' });
  }

  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ ok: false, error: 'Invalid image data.' });
  }
  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  // 5MB cap so nobody accidentally uploads a huge file
  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ ok: false, error: 'Image is too large (max 5MB).' });
  }

  const safeName = (filename || 'vehicle.jpg').replace(/[^a-zA-Z0-9.\-_]/g, '-');

  try {
    const blob = await put(`vehicles/${Date.now()}-${safeName}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true
    });
    return res.status(200).json({ ok: true, url: blob.url });
  } catch (err) {
    console.error('upload.js error:', err);
    return res.status(500).json({ ok: false, error: 'Photo upload failed.' });
  }
};
