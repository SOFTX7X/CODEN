const IDS=new Set([55752, 54829, 55682, 67162, 69187, 67535, 40409, 42942, 44540, 67740, 67831, 38496, 67724, 67725, 24401, 17591, 71330, 24411, 63439, 63438, 69239, 69229, 67594, 22622, 63080, 70819, 29484, 26777, 15047, 21563, 75220, 25845, 22299, 70662, 63606, 24625, 23620, 62383]);
export default async function handler(req,res){
 const id=Number(req.query.id);if(!Number.isInteger(id)||id<=0||id>1000000)return res.status(400).json({error:'Livro inválido.'});
 if(!IDS.has(id))return res.status(404).json({error:'Livro não consta no catálogo local.'});
 try{
  const urls=[`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,`https://www.gutenberg.org/ebooks/${id}.txt.utf-8`];let value='';
  for(const url of urls){const response=await fetch(url,{headers:{'User-Agent':'AuroraLeituras/1.0 (biblioteca de obras em dominio publico)'},signal:AbortSignal.timeout(7500)});if(response.ok){value=await response.text();break;}}
  if(!value)throw Error('Texto indisponível na fonte neste momento.');
  if(value.length>2000000)throw Error('Arquivo grande demais para esta versão.');
  const start=value.search(/\*\*\* START OF (THE |THIS )?PROJECT GUTENBERG EBOOK/i);if(start>=0){const next=value.indexOf('\n',start);value=value.slice(next+1);}
  const end=value.search(/\*\*\* END OF (THE |THIS )?PROJECT GUTENBERG EBOOK/i);if(end>=0)value=value.slice(0,end);
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800');return res.status(200).json({text:value.trim(),source:`https://www.gutenberg.org/ebooks/${id}`});
 }catch(e){return res.status(502).json({error:'Não foi possível carregar a obra da fonte. Tente novamente ou leia no Project Gutenberg.'});}
}
