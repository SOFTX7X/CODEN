'use strict';
// Public cover thumbnail relay. Never accepts arbitrary URLs.
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  const id = typeof req.query?.id === 'string' ? req.query.id : '';
  if (!/^[a-zA-Z0-9_-]{15,100}$/.test(id)) return res.status(400).end();
  const urls = [
    `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w960`,
    `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w960`
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, {redirect:'follow', signal:AbortSignal.timeout(10000), headers:{'Accept':'image/avif,image/webp,image/png,image/jpeg,*/*'}});
      if (!r.ok) continue;
      const type = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!['image/jpeg','image/png','image/webp','image/avif'].includes(type)) continue;
      const bytes = Buffer.from(await r.arrayBuffer());
      if (!bytes.length || bytes.length > 8 * 1024 * 1024) continue;
      res.setHeader('Content-Type',type);
      res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600');
      res.setHeader('X-Content-Type-Options','nosniff');
      return res.status(200).send(bytes);
    } catch (_) { /* try next source */ }
  }
  res.setHeader('Cache-Control','no-store');
  return res.status(404).json({error:'Capa não disponível externamente'});
};
