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
function card(v){
 const t=document.createElement('button');t.className='tile';t.type='button';
 const thumb=document.createElement('span');thumb.className='thumb fallback';
 const img=document.createElement('img');img.loading='lazy';img.alt='';img.referrerPolicy='no-referrer';
 const sources=[v.thumbnailLink,`https://drive.google.com/thumbnail?id=${encodeURIComponent(v.id)}&sz=w960`,`https://lh3.googleusercontent.com/d/${encodeURIComponent(v.id)}=w960`].filter(Boolean);
 let idx=0;img.onload=()=>{thumb.classList.remove('fallback');if(!img.isConnected)thumb.append(img)};
 img.onerror=()=>{idx++;if(idx<sources.length)img.src=sources[idx]};
 img.src=sources[0];
 const name=document.createElement('span');name.className='tile-title';name.textContent=displayTitle(v.name||v.title);
 const meta=document.createElement('span');meta.className='tile-meta';meta.textContent=videoCategories(v).join(' • ');
 t.append(thumb,name,meta);t.addEventListener('click',()=>openVideo(v));return t
}
function render(){const cs=['Todos',...new Set(state.videos.flatMap(videoCategories))];const f=$('#filters');f.replaceChildren();cs.forEach(c=>{const b=document.createElement('button');b.textContent=c;b.className=c===state.filter?'active':'';b.onclick=()=>{state.filter=c;render()};f.append(b)});if(!cs.includes(state.filter))state.filter='Todos';const q=normalize(state.search);const list=state.videos.filter(v=>(state.filter==='Todos'||videoCategories(v).includes(state.filter))&&normalize((v.name||v.title)+' '+videoCategories(v).join(' ')).includes(q));$('#count').textContent=`${list.length} vídeo${list.length===1?'':'s'}`;$('#grid').replaceChildren(...list.map(card));$('#status').textContent=list.length?'':'Nenhum vídeo encontrado.'}
function openVideo(v){$('#watchTitle').textContent=displayTitle(v.name||v.title);$('#watchCategory').textContent=videoCategories(v).join(' • ');$('#driveLink').href=`https://drive.google.com/file/d/${encodeURIComponent(v.id)}/view`;$('#player').src=`https://drive.google.com/file/d/${encodeURIComponent(v.id)}/preview`;$('#watch').showModal();document.body.style.overflow='hidden'}
function closeVideo(){const d=$('#watch');if(d.open)d.close();$('#player').src='about:blank';document.body.style.overflow=''}
$('#closeWatch').onclick=closeVideo;$('#watch').addEventListener('close',closeVideo);$('#watch').addEventListener('click',e=>{if(e.target===$('#watch'))closeVideo()});$('#search').addEventListener('input',e=>{state.search=e.target.value;render()});$('#searchForm').addEventListener('submit',e=>{e.preventDefault();$('#catalog').scrollIntoView()})
async function init(){try{const r=await fetch(API_URL,{cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);const x=await r.json();if(!Array.isArray(x.videos))throw Error('Resposta inválida');state.videos=x.videos;$('#status').textContent=''}catch(e){state.videos=FALLBACK;$('#status').textContent='Modo de demonstração: a sincronização automática ainda precisa ser ativada.'}render()}init();
