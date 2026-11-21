module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method-not-allowed' });
  }

  const siteKey = process.env.TURNSTILE_SITE_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hostname = process.env.TURNSTILE_HOSTNAME;
  if (!siteKey?.trim() || !secret?.trim() || !hostname?.trim()) {
    return res.status(503).json({ error: 'turnstile-not-configured' });
  }

  return res.status(200).json({ siteKey });
};
