import fs from 'node:fs';
import path from 'node:path';
const catalog=JSON.parse(fs.readFileSync(path.join(process.cwd(),'data/catalog.json'),'utf8'));
export default function handler(req,res){
 const page=Math.max(1,Number(req.query.page)||1),search=String(req.query.search||'').toLocaleLowerCase('pt-BR');
 const matches=catalog.filter(b=>(b.title+' '+b.author+' '+b.genre).toLocaleLowerCase('pt-BR').includes(search));
 const results=matches.slice((page-1)*24,page*24);
 res.setHeader('Cache-Control','public, s-maxage=3600');
 return res.status(200).json({results,total:matches.length,next:page*24<matches.length,page});
}
