export default async function handler(req,res){
  const page=Math.max(1,Math.min(1000,Number(req.query.page)||1));
  const search=String(req.query.search||'').slice(0,100);
  const url=new URL('https://gutendex.com/books/');url.searchParams.set('languages','pt');url.searchParams.set('page',String(page));
  if(search)url.searchParams.set('search',search);
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(9000)});
    if(!response.ok)throw Error('Fonte indisponível');const d=await response.json();
    const results=(d.results||[]).filter(b=>b.copyright===false && b.media_type==='Text' && b.authors?.some(a=>a.death_year!==null && a.death_year<=1955) && !(b.translators||[]).length).map(b=>({id:b.id,title:b.title,authors:b.authors,cover:b.formats?.['image/jpeg']||null}));
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({results,total:d.count||0,next:!!d.next,page});
  }catch{return res.status(502).json({error:'Falha temporária ao consultar o catálogo.'});}
}
