const IDS=new Set([55752, 54829, 55682, 67162, 69187, 67535, 40409, 42942, 44540, 67740, 67831, 38496, 67724, 67725, 24401, 17591, 71330, 24411, 63439, 63438, 69239, 69229, 67594, 22622, 63080, 70819, 29484, 26777, 15047, 21563, 75220, 25845, 22299, 70662, 63606, 24625, 23620, 62383, 31347, 27637, 18220, 31971, 23145, 25641, 16384, 17515, 26988, 26110, 16425, 27541, 27364, 62624, 26025, 21406, 29435, 17927, 57001, 61653, 33056, 56737, 55797, 67780, 67935]);
export default async function handler(req,res){
 const id=Number(req.query.id);if(!Number.isInteger(id)||id<=0||id>1000000)return res.status(400).json({error:'Livro inválido.'});
 if(!IDS.has(id))return res.status(404).json({error:'Livro não consta no catálogo local.'});
 try{
  // Preferir HTML ilustrado; a versão TXT remove todas as imagens.
  const htmlUrls=[
   `https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`,
   `https://www.gutenberg.org/files/${id}/${id}-h/${id}-h.htm`,
   `https://www.gutenberg.org/cache/epub/${id}/pg${id}.html`
  ];
  for(const url of htmlUrls){
   try{
    const r=await fetch(url,{signal:AbortSignal.timeout(4500),headers:{'User-Agent':'AuroraLeituras/1.0'}});
    if(!r.ok)continue;
    const html=await r.text();
    if(html.length<2000||html.length>3500000||!/<body\b/i.test(html))continue;
    res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({format:'html',html,baseUrl:url,source:`https://www.gutenberg.org/ebooks/${id}`});
   }catch{}
  }
  const urls=[`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,`https://www.gutenberg.org/ebooks/${id}.txt.utf-8`];let value='';
  for(const url of urls){try{const response=await fetch(url,{signal:AbortSignal.timeout(6500)});if(response.ok){value=await response.text();break;}}catch{}}
  if(!value)throw Error('Texto indisponível na fonte neste momento.');
  if(value.length>4000000)throw Error('Arquivo grande demais para esta versão.');
  const start=value.search(/\*\*\* START OF (THE |THIS )?PROJECT GUTENBERG EBOOK/i);if(start>=0){const next=value.indexOf('\n',start);value=value.slice(next+1);}
  const end=value.search(/\*\*\* END OF (THE |THIS )?PROJECT GUTENBERG EBOOK/i);if(end>=0)value=value.slice(0,end);
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');return res.status(200).json({format:'text',text:value.trim(),source:`https://www.gutenberg.org/ebooks/${id}`});
 }catch(e){return res.status(502).json({error:'Não foi possível carregar a obra da fonte. Tente novamente ou leia no Project Gutenberg.'});}
}
