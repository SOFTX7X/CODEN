'use strict';
const FALLBACK=[{id:'1cCXD1eHJDY3yr6oWMrETXoZpozX-mhWZ',name:'Chaves - Vamos todos a Acapulco Parte 16',category:'Comédia',modifiedTime:'2026-10-12T06:27:14Z'}];
const API_URL='/api/videos';
const $=sel=>document.querySelector(sel);
const state={videos:[],filter:'Todos',search:''};
const categories=[['Ação',['acao','ação','action']],['Terror',['terror','horror']],['Suspense',['suspense','thriller']],['Comédia',['comedia','comédia','humor','chaves']],['Aventura',['aventura']],['Romance',['romance']],['Drama',['drama']],['Animação',['animacao','animação','desenho']],['Documentário',['documentario','documentário']],['Ficção científica',['ficcao cientifica','ficção científica','sci-fi']]];
const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function getCategories(name){const n=normalize(name);return categories.filter(([_,words])=>words.some(w=>new RegExp('(^|[^a-z0-9])'+normalize(w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])').test(n))).map(x=>x[0]);}
function displayTitle(name){return String(name||'Vídeo').replace(/\s*\[[^\]]+\](?=\.(?:mp4|m4v|mov|webm|mkv)$|$)/gi,'').replace(/\.(mp4|m4v|mov|webm|mkv)$/i,'').replace(/^\s*\d+[kKmM]?\s+views\s+\d+\s+reactions\s+/i,'').replace(/[_]+/g,' ').trim()}
function videoCategories(v){
 const name=String(v.name||v.title||'');
 const explicit=[...name.matchAll(/\[([^\]]+)\]/g)].flatMap(m=>m[1].split(/[,;|]/)).map(x=>x.trim());
 const recognized=explicit.flatMap(x=>getCategories(x)).filter((x,i,a)=>a.indexOf(x)===i);
 if(recognized.length)return recognized;
 if(Array.isArray(v.categories)&&v.categories.length)return v.categories;
 const automatic=getCategories(name);return automatic.length?automatic:['Outros'];
}
// Associa capas usando o nome, independentemente de acentos, categoria e sufixos comuns.
function mediaKey(value){
 let s=String(value||'').replace(/\.(?:mp4|m4v|mov|webm|mkv|jpe?g|png|webp)$/i,'');
 s=s.replace(/\s*\[[^\]]*\]/g,'').replace(/(?:\s*[-_ ]+)?(?:thumbnail|thumb|capa|cover)$/i,'');
 s=s.replace(/\s*\(\d+\)$/,'').replace(/(?:\s*[-_ ]+)?(?:thumbnail|thumb|capa|cover)$/i,'');
 return normalize(s).replace(/[^a-z0-9]+/g,' ').trim();
}
function attachCovers(videos, images){
 const map=new Map();
 for(const im of images){
  if(!im || !/^[A-Za-z0-9_-]{10,}$/.test(im.id||'') || !/^image\/(?:jpeg|png|webp)$/.test(im.mimeType||''))continue;
  const key=mediaKey(im.name);if(key&&!map.has(key))map.set(key,im.id);
 }
 return videos.map(v=>{
  const coverId=map.get(mediaKey(v.name));
  return coverId?{...v,coverId}:v;
 });
}
function card(v){
 const t=document.createElement('button');t.className='tile';t.type='button';
 const thumb=document.createElement('span');thumb.className='thumb fallback';
 const img=document.createElement('img');img.loading='lazy';img.alt='';img.referrerPolicy='no-referrer';
 const sources=[v.coverId&&`https://drive.google.com/thumbnail?id=${encodeURIComponent(v.coverId)}&sz=w960`,v.thumbnailLink,`https://drive.google.com/thumbnail?id=${encodeURIComponent(v.id)}&sz=w960`,`https://lh3.googleusercontent.com/d/${encodeURIComponent(v.id)}=w960`].filter(Boolean);
 let idx=0;img.onload=()=>{thumb.classList.remove('fallback');if(!img.isConnected)thumb.append(img)};
 img.onerror=()=>{idx++;if(idx<sources.length)img.src=sources[idx]};
 img.src=sources[0];
 const name=document.createElement('span');name.className='tile-title';name.textContent=displayTitle(v.name||v.title);
 const meta=document.createElement('span');meta.className='tile-meta';meta.textContent=videoCategories(v).join(' • ');
 t.append(thumb,name,meta);t.addEventListener('click',()=>openVideo(v));return t
}
function makeRow(label,videos){
 const section=document.createElement('section');section.className='category-row';section.setAttribute('aria-label',label);
 const header=document.createElement('div');header.className='row-heading';
 const title=document.createElement('h2');title.textContent=label;
 const actions=document.createElement('div');actions.className='row-actions';
 const prev=document.createElement('button');prev.type='button';prev.className='row-arrow';prev.setAttribute('aria-label','Voltar em '+label);prev.textContent='‹';
 const next=document.createElement('button');next.type='button';next.className='row-arrow';next.setAttribute('aria-label','Avançar em '+label);next.textContent='›';
 const track=document.createElement('div');track.className='video-track';track.setAttribute('aria-label','Vídeos de '+label);track.append(...videos.map(card));
 const move=dir=>track.scrollBy({left:dir*track.clientWidth*.85,behavior:'smooth'});
 prev.onclick=()=>move(-1);next.onclick=()=>move(1);
 const update=()=>{const limit=track.scrollWidth-track.clientWidth;prev.disabled=track.scrollLeft<4;next.disabled=limit<4||track.scrollLeft>=limit-4;actions.hidden=limit<4};
 track.addEventListener('scroll',update,{passive:true});
 if('ResizeObserver' in window){const obs=new ResizeObserver(update);obs.observe(track)}
 actions.append(prev,next);header.append(title,actions);section.append(header,track);requestAnimationFrame(update);return section;
}
function render(){
 const q=normalize(state.search);
 const list=state.videos.filter(v=>normalize((v.name||v.title)+' '+videoCategories(v).join(' ')).includes(q));
 $('#count').textContent=`${list.length} vídeo${list.length===1?'':'s'}`;
 const groups=new Map();
 for(const v of list){for(const category of videoCategories(v)){
   if(!groups.has(category))groups.set(category,[]);groups.get(category).push(v);
 }}
 const preferred=['Ação','Terror','Suspense','Comédia','Aventura','Romance','Drama','Animação','Documentário','Ficção científica','Outros'];
 const ordered=[...groups.keys()].sort((a,b)=>{const ia=preferred.indexOf(a),ib=preferred.indexOf(b);return (ia<0?999:ia)-(ib<0?999:ib)||a.localeCompare(b,'pt-BR')});
 $('#grid').replaceChildren(...ordered.map(category=>makeRow(category,groups.get(category))));
 $('#status').textContent=list.length?'':'Nenhum vídeo encontrado.';
}
function openVideo(v){$('#watchTitle').textContent=displayTitle(v.name||v.title);$('#watchCategory').textContent=videoCategories(v).join(' • ');$('#driveLink').href=`https://drive.google.com/file/d/${encodeURIComponent(v.id)}/view`;$('#player').src=`https://drive.google.com/file/d/${encodeURIComponent(v.id)}/preview`;$('#watch').showModal();document.body.style.overflow='hidden'}
function closeVideo(){const d=$('#watch');if(d.open)d.close();$('#player').src='about:blank';document.body.style.overflow=''}
$('#closeWatch').onclick=closeVideo;$('#watch').addEventListener('close',closeVideo);$('#watch').addEventListener('click',e=>{if(e.target===$('#watch'))closeVideo()});$('#search').addEventListener('input',e=>{state.search=e.target.value;render()});$('#searchForm').addEventListener('submit',e=>{e.preventDefault();$('#catalog').scrollIntoView()})
async function init(){try{const r=await fetch(API_URL,{cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);const x=await r.json();if(!Array.isArray(x.videos))throw Error('Resposta inválida');state.videos=attachCovers(x.videos,Array.isArray(x.images)?x.images:[]);$('#status').textContent=''}catch(e){state.videos=FALLBACK;$('#status').textContent='Modo de demonstração: a sincronização automática ainda precisa ser ativada.'}render()}init();
