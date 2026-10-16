const IDS=new Set([55752,54829,55682,67162,69187,67535,40409,42942]);
export default async function handler(req,res){
 const id=Number(req.query.id);if(!Number.isInteger(id)||id<=0||id>1000000)return res.status(400).json({error:'Livro inválido.'});
 if(!IDS.has(id)){
  try{const response=await fetch(`https://gutendex.com/books/${id}`,{signal:AbortSignal.timeout(5500)});if(!response.ok)throw Error();
  const item=await response.json();if(!(item.languages||[]).includes('pt')||item.copyright!==false||item.media_type!=='Text'||(item.translators||[]).length||!item.authors?.some(a=>a.death_year!==null&&a.death_year<=1955))return res.status(403).json({error:'Edição não liberada para leitura integrada.'});
  }catch{return res.status(502).json({error:'Falha na validação da edição.'});}
 }
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
