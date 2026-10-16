// O texto bíblico é consultado em um serviço público externo; não é garantido e não há cópia local.
export default async function handler(req,res){
 const book=String(req.query.book||'genesis').toLowerCase().replace(/[^a-z0-9]/g,'');
 const chapter=Number(req.query.chapter||1);
 if(!/^[a-z0-9]{2,30}$/.test(book)||!Number.isInteger(chapter)||chapter<1||chapter>150)return res.status(400).json({error:'Referência inválida'});
 try{
  const response=await fetch(`https://bible-api.com/${book}+${chapter}?translation=almeida`,{signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw new Error('indisponível');
  const data=await response.json();if(!Array.isArray(data.verses)||!data.verses.length)throw Error('sem versos');
  res.setHeader('Cache-Control','public, s-maxage=604800');return res.status(200).json({verses:data.verses.map(v=>({number:v.verse,text:v.text})),translation:data.translation_name||'Almeida',reference:data.reference});
 }catch(e){return res.status(502).json({error:'A tradução online está indisponível. Use o link da fonte para continuar a leitura.'});}
}
