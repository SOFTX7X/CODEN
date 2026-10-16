const SOURCES=['https://gutendex.com/books/','https://quirereader.dev/books/'];

export default async function handler(req,res){
  const page=Math.max(1,Math.min(1000,parseInt(req.query.page,10)||1));
  const search=String(req.query.search||'').slice(0,100);
  const failures=[];
  for(const source of SOURCES){
    const url=new URL(source);
    url.searchParams.set('languages','pt');
    url.searchParams.set('page',String(page));
    if(search)url.searchParams.set('search',search);
    try{
      const response=await fetch(url.toString(),{headers:{Accept:'application/json'},signal:AbortSignal.timeout(11500)});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const d=await response.json();
      if(!Array.isArray(d.results))throw new Error('Resposta inválida');
      const results=d.results.filter(b=>b.copyright===false && b.media_type==='Text' && b.authors?.some(a=>a.death_year!=null&&a.death_year<=1955) && !(b.translators||[]).length).map(b=>({id:b.id,title:b.title,authors:b.authors,cover:b.formats?.['image/jpeg']||null}));
      res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json({results,total:d.count||0,next:!!d.next,page});
    }catch(e){failures.push(`${new URL(source).hostname}: ${String(e?.message||e).slice(0,130)}`)}
  }
  return res.status(502).json({error:'Nenhuma fonte do catálogo respondeu. '+failures.join(' | ')});
}
