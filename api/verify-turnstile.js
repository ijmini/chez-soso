const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ALLOWED_ACTIONS = new Set(['order', 'reservation']);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method-not-allowed' });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const expectedHostname = process.env.TURNSTILE_HOSTNAME?.trim().toLowerCase();
  if (!secret || !expectedHostname) {
    return res.status(503).json({ success: false, error: 'turnstile-not-configured' });
  }

  const body = req.body;
  const token = body && typeof body === 'object' && !Array.isArray(body) ? body.token : null;
  const action = body && typeof body === 'object' && !Array.isArray(body) ? body.action : null;
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048 || !ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({ success: false, error: 'invalid-request' });
  }

  let origin;
  try {
    origin = new URL(req.headers.origin);
  } catch {
    return res.status(403).json({ success: false, error: 'invalid-origin' });
  }
  const isLocalDevelopment = process.env.VERCEL_ENV === 'development'
    && origin.protocol === 'http:'
    && ['localhost', '127.0.0.1'].includes(origin.hostname);
  if ((!isLocalDevelopment && origin.protocol !== 'https:') || origin.hostname !== expectedHostname) {
    return res.status(403).json({ success: false, error: 'invalid-origin' });
  }

  const payload = new URLSearchParams({ secret, response: token });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let verificationResponse;
  try {
    verificationResponse = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
      signal: controller.signal
    });
  } catch (error) {
    console.error('Turnstile Siteverify request failed.', error);
    return res.status(502).json({ success: false, error: 'verification-unavailable' });
  } finally {
    clearTimeout(timeout);
  }

  if (!verificationResponse.ok) {
    console.error('Turnstile Siteverify returned HTTP', verificationResponse.status);
    return res.status(502).json({ success: false, error: 'verification-unavailable' });
  }

  let verification;
  try {
    verification = await verificationResponse.json();
  } catch (error) {
    console.error('Turnstile Siteverify returned invalid JSON.', error);
    return res.status(502).json({ success: false, error: 'verification-unavailable' });
  }

  if (!verification || typeof verification !== 'object') {
    console.error('Turnstile Siteverify returned an invalid response shape.');
    return res.status(502).json({ success: false, error: 'verification-unavailable' });
  }

  if (
    verification.success !== true
    || verification.action !== action
    || verification.hostname !== expectedHostname
  ) {
    return res.status(403).json({ success: false, error: 'verification-rejected' });
  }

  return res.status(200).json({ success: true });
};
