// api/booking.js
// Vercel Serverless Function — receives a booking, validates it on the
// server (never trust the browser alone), and emails it to the business
// owner plus a confirmation to the customer.
//
// Runs automatically on Vercel because it lives inside /api.
// No extra config needed — just set the 3 environment variables below
// in your Vercel Project Settings before it will actually send emails.

const nodemailer = require('nodemailer');
const { sql, ensureTable } = require('./lib/db');

const NAME_RE = /^[a-zA-Z\s.'-]{3,60}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  const errors = {};

  if (!body.name || !NAME_RE.test(String(body.name).trim())) {
    errors.name = 'Valid full name is required.';
  }
  if (!body.phone || !PHONE_RE.test(String(body.phone).trim())) {
    errors.phone = 'Valid 10-digit Indian mobile number is required.';
  }
  if (!body.email || !EMAIL_RE.test(String(body.email).trim())) {
    errors.email = 'Valid email address is required.';
  }
  if (!body.pickup || String(body.pickup).trim().length < 3) {
    errors.pickup = 'Pickup location is required.';
  }
  if (!body.drop || String(body.drop).trim().length < 3) {
    errors.drop = 'Drop location is required.';
  }
  if (!body.date) {
    errors.date = 'Date is required.';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(body.date);
    if (chosen < today) errors.date = 'Date cannot be in the past.';
  }
  if (!body.time) {
    errors.time = 'Time is required.';
  }

  return errors;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async function handler(req, res) {
  // CORS / method guard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const errors = validate(body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  const {
    pageType = 'airport',
    car = '', tripOption = '', name, phone, email,
    pickup, drop, landmark = '', date, time,
    returnDate = '', notes = '', returnCab = false
  } = body;

  const rows = [
    ['Booking Type', pageType],
    ['Vehicle', car],
    ['Trip Option', tripOption],
    ['Name', name],
    ['Phone', phone],
    ['Email', email],
    ['Pickup', pickup],
    ['Drop', drop],
    ['Landmark', landmark],
    ['Date', date],
    ['Time', time],
    ['Return Date', returnDate],
    ['Notes', notes],
    ['Return Cab', returnCab ? 'Yes' : 'No']
  ].filter(([, v]) => v !== '' && v !== undefined && v !== null);

  const htmlRows = rows
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:600;border:1px solid #eee;">${escapeHtml(k)}</td><td style="padding:6px 12px;border:1px solid #eee;">${escapeHtml(v)}</td></tr>`)
    .join('');

  const textSummary = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  // Save to the database so it shows up in the admin dashboard.
  // If the database isn't configured yet, don't fail the booking —
  // it will still be emailed / sent over WhatsApp.
  if (process.env.POSTGRES_URL) {
    try {
      await ensureTable();
      await sql`
        INSERT INTO bookings (
          page_type, car, trip_option, name, phone, email,
          pickup, drop_location, landmark, travel_date, travel_time,
          return_date, notes, return_cab
        ) VALUES (
          ${pageType}, ${car}, ${tripOption}, ${name}, ${phone}, ${email},
          ${pickup}, ${drop}, ${landmark}, ${date}, ${time},
          ${returnDate}, ${notes}, ${!!returnCab}
        );
      `;
    } catch (dbErr) {
      console.error('Failed to save booking to database:', dbErr);
    }
  } else {
    console.log('POSTGRES_URL not set — booking not saved to database:', textSummary);
  }

  // If email credentials aren't configured yet, don't fail the booking —
  // just log it so it still shows up in Vercel's function logs.
  const { EMAIL_USER, EMAIL_PASS, OWNER_EMAIL } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || !OWNER_EMAIL) {
    console.log('New booking received (email not configured):', textSummary);
    return res.status(200).json({ ok: true, emailed: false });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });

    // Email to the business owner
    await transporter.sendMail({
      from: `"BengaluruCabRentals Website" <${EMAIL_USER}>`,
      to: OWNER_EMAIL,
      subject: `New ${pageType} booking — ${name} (${phone})`,
      text: textSummary,
      html: `<h2>New Booking Request</h2><table style="border-collapse:collapse;">${htmlRows}</table>`
    });

    // Confirmation email to the customer
    await transporter.sendMail({
      from: `"Bengaluru Cab Rentals" <${EMAIL_USER}>`,
      to: email,
      subject: 'We received your booking — Bengaluru Cab Rentals',
      text: `Hi ${name},\n\nThanks for booking with Bengaluru Cab Rentals! Our team will confirm your ride shortly.\n\n${textSummary}\n\nFor urgent help call +91 9152333388.`,
      html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for booking with <strong>Bengaluru Cab Rentals</strong>! Our team will confirm your ride shortly.</p><table style="border-collapse:collapse;">${htmlRows}</table><p>For urgent help call <strong>+91 9152333388</strong>.</p>`
    });

    return res.status(200).json({ ok: true, emailed: true });
  } catch (err) {
    console.error('Email send failed:', err);
    // Booking data is still logged even if email fails
    console.log('New booking received (email failed):', textSummary);
    return res.status(200).json({ ok: true, emailed: false });
  }
};
