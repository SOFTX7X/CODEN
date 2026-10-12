// Vercel serverless function. Keeps the Drive sync URL on the server.
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({error:'Método não permitido'}); }
  const endpoint = process.env.CODEN_DRIVE_SCRIPT_URL;
  if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\//.test(endpoint)) {
    return res.status(503).json({error:'Sincronização ainda não configurada'});
  }
  try {
    const response = await fetch(endpoint, { redirect:'follow', cache:'no-store', signal:AbortSignal.timeout(20000) });
    if(!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.videos)) throw new Error('Resposta inesperada');
    const videos = data.videos.filter(v => typeof v.id === 'string' && /^[A-Za-z0-9_-]{10,}$/.test(v.id) && typeof v.name === 'string')
      .slice(0, 1000).map(v=>({ id:v.id,name:v.name,modifiedTime:v.modifiedTime||null,mimeType:v.mimeType||'video/mp4' }));
    const images = (Array.isArray(data.images) ? data.images : [])
      .filter(i => i && typeof i.id === 'string' && /^[A-Za-z0-9_-]{10,}$/.test(i.id)
        && typeof i.name === 'string' && /^image\/(jpeg|png|webp)$/.test(i.mimeType || ''))
      .slice(0, 2000).map(i => ({id:i.id,name:i.name,mimeType:i.mimeType}));
    res.setHeader('Cache-Control','no-store, no-cache, max-age=0, must-revalidate');
    res.setHeader('X-Coden-Api-Version','6.1');
    return res.status(200).json({videos,images,version:'6.1'});
  } catch(err) {
    console.error('CODEN Drive synchronization error:',err.message);
    return res.status(502).json({error:'Não foi possível consultar o Google Drive'});
  }
};
