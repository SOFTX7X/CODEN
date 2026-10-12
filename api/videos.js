// Vercel serverless function. Keeps the Drive sync URL on the server.
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({error:'Método não permitido'}); }
  const endpoint = process.env.CODEN_DRIVE_SCRIPT_URL;
  if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\//.test(endpoint)) {
    return res.status(503).json({error:'Sincronização ainda não configurada'});
  }
  try {
    const response = await fetch(endpoint, { redirect:'follow', signal:AbortSignal.timeout(20000) });
    if(!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.videos)) throw new Error('Resposta inesperada');
    const videos = data.videos.filter(v => typeof v.id === 'string' && /^[A-Za-z0-9_-]{10,}$/.test(v.id) && typeof v.name === 'string')
      .slice(0, 1000).map(v=>({ id:v.id,name:v.name,modifiedTime:v.modifiedTime||null,mimeType:v.mimeType||'video/mp4' }));
    res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({videos});
  } catch(err) {
    console.error('CODEN Drive synchronization error:',err.message);
    return res.status(502).json({error:'Não foi possível consultar o Google Drive'});
  }
};
