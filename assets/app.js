const C=window.CODEN_CONFIG||{};
const sb=window.supabase?.createClient?.(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
const state={user:null,profile:null,videos:[],currentId:null,liked:new Set(),saved:new Set(),profileTarget:null,fsTimer:null,channel:null,audioUnlocked:false};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const feed=$('#feed');
function safe(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function initial(u='?'){return (u.replace('@','').trim()[0]||'?').toUpperCase()}
function toast(msg){const n=document.createElement('div');n.className='toast';n.textContent=msg;document.body.appendChild(n);setTimeout(()=>n.remove(),2200)}
function openSheet(id){$('#sheetBackdrop').classList.remove('hidden');$('#'+id).classList.remove('hidden')}
function closeSheet(id){$('#'+id).classList.add('hidden');if(!$$('.sheet:not(.hidden),.mini-sheet:not(.hidden)').length)$('#sheetBackdrop').classList.add('hidden')}
function closeAllSheets(){$$('.sheet,.mini-sheet').forEach(s=>s.classList.add('hidden'));$('#sheetBackdrop').classList.add('hidden')}
async function ensureAnonymousSession(){if(!sb)return false;if(state.user)return true;const {data:s}=await sb.auth.getSession();if(s.session?.user){state.user=s.session.user;return true}const {data,error}=await sb.auth.signInAnonymously();if(error){toast('Ative Anonymous Sign-Ins no Supabase.');return false}state.user=data.user||data.session?.user||null;return !!state.user}
async function loadOwnProfile(){if(!state.user)return;const {data}=await sb.from('profiles').select('*').eq('id',state.user.id).maybeSingle();state.profile=data||null;refreshNavAvatar()}
async function ensureProfile(){if(!await ensureAnonymousSession())return false;await loadOwnProfile();if(state.profile)return true;openSheet('profileSetupSheet');return false}
async function loadSession(){if(!sb)return;const {data}=await sb.auth.getSession();state.user=data.session?.user||null;if(state.user)await loadOwnProfile()}
async function loadFlags(){state.liked.clear();state.saved.clear();if(!state.user)return;const [{data:l},{data:s}]=await Promise.all([sb.from('video_likes').select('video_id').eq('user_id',state.user.id),sb.from('saved_videos').select('video_id').eq('user_id',state.user.id)]);(l||[]).forEach(x=>state.liked.add(x.video_id));(s||[]).forEach(x=>state.saved.add(x.video_id))}
async function enrichCounts(rows){if(!rows.length)return rows;await Promise.all(rows.map(async v=>{const [{count:likes},{count:comments}]=await Promise.all([sb.from('video_likes').select('*',{count:'exact',head:true}).eq('video_id',v.id),sb.from('comments').select('*',{count:'exact',head:true}).eq('video_id',v.id)]);v.like_count=likes||0;v.comment_count=comments||0}));return rows}
async function loadFeed({keepPosition=true}={}){if(!sb){feed.innerHTML='<div class="empty">Supabase não conectado.</div>';return}const oldId=keepPosition?state.currentId:null;const {data,error}=await sb.from('videos').select('id,user_id,title,video_url,created_at,profiles!videos_user_id_fkey(username,display_name,avatar_url)').eq('status','published').order('created_at',{ascending:false}).limit(50);if(error){feed.innerHTML=`<div class="empty">${safe(error.message)}</div>`;return}state.videos=await enrichCounts(data||[]);await loadFlags();renderFeed();if(oldId){const el=document.querySelector(`.video-card[data-id="${oldId}"]`);el?.scrollIntoView({block:'start'})}}
function profileMarkup(p){return p?.avatar_url?`<img src="${safe(p.avatar_url)}" alt="">`:initial(p?.username||'perfil')}
function svgIcon(name,filled=false){
 const common='viewBox="0 0 24 24" aria-hidden="true"';
 const icons={
  heart: filled?`<svg ${common} class="icon-svg is-filled"><path d="M12 21s-7.2-4.35-9.42-8.3C.74 9.42 2.14 5.5 5.7 4.5c2.15-.6 4.15.22 5.3 1.75C12.15 4.72 14.15 3.9 16.3 4.5c3.56 1 4.96 4.92 3.12 8.2C17.2 16.65 12 21 12 21Z"/></svg>`:`<svg ${common} class="icon-svg"><path d="M20.8 5.7c-2.1-2.2-5.6-2.3-7.8-.2L12 6.5l-1-1c-2.2-2.1-5.7-2-7.8.2-2.2 2.3-2 6 .3 8.2L12 21l8.5-7.1c2.3-2.2 2.5-5.9.3-8.2Z"/></svg>`,
  comment:`<svg ${common} class="icon-svg"><path d="M21 11.4a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-3.8-.8L3 21l1.5-4.5A8.4 8.4 0 1 1 21 11.4Z"/></svg>`,
  save: filled?`<svg ${common} class="icon-svg is-filled"><path d="M6 3.5h12v17L12 17l-6 3.5Z"/></svg>`:`<svg ${common} class="icon-svg"><path d="M6 3.5h12v17L12 17l-6 3.5Z"/></svg>`,
  share:`<svg ${common} class="icon-svg"><path d="m21 3-8.2 18-2.3-7.5L3 11.2 21 3Z"/><path d="m10.5 13.5 4.4-4.4"/></svg>`,
  fullscreen:`<svg ${common} class="icon-svg"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>`,
  shrink:`<svg ${common} class="icon-svg"><path d="M8 8H3V3M16 8h5V3M8 16H3v5M16 16h5v5"/><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/></svg>`,
  play:`<svg ${common} class="icon-svg is-filled"><path d="m8 5 11 7-11 7Z"/></svg>`,
  pause:`<svg ${common} class="icon-svg is-filled"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>`
 };
 return icons[name]||'';
}
function actionButton(cls,icon,label,count=''){return `<button class="rail-btn ${cls}" aria-label="${label}"><span class="rail-icon">${icon}</span>${count!==''?`<b class="rail-count">${count}</b>`:''}</button>`}
function renderFeed(){
 if(!state.videos.length){
  feed.innerHTML='<div class="empty"><div><div>Ainda não há vídeos publicados.</div><button id="emptyStart">PUBLICAR O PRIMEIRO</button></div></div>';
  $('#emptyStart')?.addEventListener('click',async()=>{if(await ensureProfile())openSheet('publishSheet')});
  return;
 }
 feed.innerHTML=state.videos.map(v=>{
  const p=v.profiles||{};
  const liked=state.liked.has(v.id),saved=state.saved.has(v.id);
  return `<article class="video-card" data-id="${v.id}" data-user="${v.user_id}">
   <video playsinline autoplay loop preload="auto" src="${safe(v.video_url)}"></video>
   <div class="tap-zone" aria-label="Reproduzir ou pausar"></div>
   <div class="video-info">
    <button class="profile-chip" data-profile="${v.user_id}"><span class="avatar-mini">${profileMarkup(p)}</span><b>@${safe(p.username||'perfil')}</b></button>
    ${v.title?`<p class="video-caption">${safe(v.title)}</p>`:''}
   </div>
   <aside class="action-rail">
    ${actionButton('like-btn',svgIcon('heart',liked),'Curtir',v.like_count)}
    ${actionButton('comment-btn',svgIcon('comment'),'Comentar',v.comment_count)}
    ${actionButton('save-btn',svgIcon('save',saved),'Salvar')}
    ${actionButton('share-btn',svgIcon('share'),'Compartilhar')}
    ${actionButton('fs-btn',svgIcon('fullscreen'),'Tela cheia')}
   </aside>
   <div class="controls-pulse">${svgIcon('play',true)}</div>
   <div class="fs-ui" aria-hidden="true">
    <button class="fs-toggle" aria-label="Pausar">${svgIcon('pause',true)}</button>
    <input class="fs-range" type="range" min="0" max="1000" value="0" aria-label="Progresso do vídeo">
    <button class="fs-shrink" aria-label="Voltar à tela normal">${svgIcon('shrink')}</button>
   </div>
  </article>`
 }).join('');
 $$('.video-card').forEach(card=>{
  const v=card.querySelector('video'),range=card.querySelector('.fs-range');
  v.addEventListener('loadedmetadata',()=>{if(v.videoHeight>v.videoWidth)card.classList.add('is-portrait')});
  v.addEventListener('timeupdate',()=>{if(v.duration&&range)range.value=Math.round((v.currentTime/v.duration)*1000)});
  v.addEventListener('error',()=>console.error('Falha ao carregar vídeo',v.currentSrc||v.src,v.error));
  card.querySelector('.tap-zone').onclick=e=>{
   e.stopPropagation();
   if(document.fullscreenElement===card){showCardFsControls(card);return}
   if(v.paused){v.dataset.manualPaused='0';playVideoSmart(v)}else{v.dataset.manualPaused='1';v.pause()}
   pulse(card,v.paused?'play':'pause');
  };
  card.querySelector('.profile-chip').onclick=e=>{e.stopPropagation();openProfile(card.dataset.user)};
  card.querySelector('.like-btn').onclick=e=>{e.stopPropagation();state.currentId=card.dataset.id;toggleLike()};
  card.querySelector('.comment-btn').onclick=e=>{e.stopPropagation();state.currentId=card.dataset.id;openComments()};
  card.querySelector('.save-btn').onclick=e=>{e.stopPropagation();state.currentId=card.dataset.id;toggleSave()};
  card.querySelector('.share-btn').onclick=e=>{e.stopPropagation();state.currentId=card.dataset.id;shareCurrent()};
  card.querySelector('.fs-btn').onclick=e=>{e.stopPropagation();state.currentId=card.dataset.id;fullscreenCurrent()};
  card.querySelector('.fs-toggle').onclick=e=>{e.stopPropagation();v.paused?v.play().catch(()=>{}):v.pause();showCardFsControls(card)};
  card.querySelector('.fs-shrink').onclick=e=>{e.stopPropagation();exitFullscreen()};
  range?.addEventListener('input',e=>{e.stopPropagation();if(v.duration)v.currentTime=(Number(range.value)/1000)*v.duration});
  v.addEventListener('play',()=>syncFsButton(card));
  v.addEventListener('pause',()=>syncFsButton(card));
  v.addEventListener('ended',()=>{if(v.dataset.manualPaused!=='1'){v.currentTime=0;playVideoSmart(v)}});
 });
 observeFeed();
}
function pulse(card,t){const p=card.querySelector('.controls-pulse');p.innerHTML=svgIcon(t==='play'?'play':'pause',true);p.classList.add('show');setTimeout(()=>p.classList.remove('show'),450)}
async function playVideoSmart(v){
 if(!v||v.dataset.manualPaused==='1')return;
 try{
  v.muted=false;
  await v.play();
  state.audioUnlocked=true;
 }catch(_){
  try{v.muted=true;await v.play()}catch(__){}
 }
}
function unlockCurrentAudio(){
 state.audioUnlocked=true;
 const card=currentCard(),v=card?.querySelector('video');
 if(v&&v.dataset.manualPaused!=='1'){v.muted=false;v.play().catch(()=>{})}
}
['pointerdown','touchstart','keydown'].forEach(evt=>document.addEventListener(evt,unlockCurrentAudio,{capture:true,once:false,passive:true}));
let io;function observeFeed(){io?.disconnect();io=new IntersectionObserver(entries=>entries.forEach(e=>{const v=e.target.querySelector('video');if(e.isIntersecting&&e.intersectionRatio>.72){$$('.video-card video').forEach(x=>{if(x!==v)x.pause()});state.currentId=e.target.dataset.id;if(v.dataset.manualPaused!=='1')playVideoSmart(v)}else v.pause()}),{threshold:[.72]});$$('.video-card').forEach(c=>io.observe(c))}
function currentCard(){return document.querySelector(`.video-card[data-id="${state.currentId}"]`)||$('.video-card')}
async function toggleLike(){if(!await ensureProfile())return;const id=state.currentId;if(!id)return;if(state.liked.has(id)){await sb.from('video_likes').delete().eq('user_id',state.user.id).eq('video_id',id);state.liked.delete(id)}else{await sb.from('video_likes').insert({user_id:state.user.id,video_id:id});state.liked.add(id)}const v=state.videos.find(x=>x.id===id);if(v)v.like_count=Math.max(0,(v.like_count||0)+(state.liked.has(id)?1:-1));updateCardActions(id)}
async function toggleSave(){if(!await ensureProfile())return;const id=state.currentId;if(!id)return;if(state.saved.has(id)){await sb.from('saved_videos').delete().eq('user_id',state.user.id).eq('video_id',id);state.saved.delete(id)}else{await sb.from('saved_videos').insert({user_id:state.user.id,video_id:id});state.saved.add(id)}updateCardActions(id)}
function updateCardActions(id){
 const card=document.querySelector(`.video-card[data-id="${id}"]`),v=state.videos.find(x=>x.id===id);if(!card||!v)return;
 card.querySelector('.like-btn .rail-icon').innerHTML=svgIcon('heart',state.liked.has(id));
 card.querySelector('.like-btn .rail-count').textContent=v.like_count||0;
 card.querySelector('.save-btn .rail-icon').innerHTML=svgIcon('save',state.saved.has(id));
}
async function openComments(){const id=state.currentId;if(!id)return;const {data,error}=await sb.from('comments').select('id,body,created_at,profiles(username,avatar_url)').eq('video_id',id).order('created_at',{ascending:true});if(error)return toast(error.message);$('#commentsList').innerHTML=(data||[]).map(c=>`<div class="comment"><b>@${safe(c.profiles?.username||'usuario')}</b><p>${safe(c.body)}</p></div>`).join('')||'<p class="muted small">Nenhum comentário ainda.</p>';openSheet('commentsSheet')}
async function shareCurrent(){const v=state.videos.find(x=>x.id===state.currentId);if(!v)return;if(navigator.share)await navigator.share({title:v.title||'Vídeo',url:v.video_url}).catch(()=>{});else{await navigator.clipboard.writeText(v.video_url).catch(()=>{});toast('Link copiado.')}}
function syncFsButton(card){const v=card?.querySelector('video'),b=card?.querySelector('.fs-toggle');if(!v||!b)return;b.innerHTML=svgIcon(v.paused?'play':'pause',true);b.setAttribute('aria-label',v.paused?'Reproduzir':'Pausar')}
function showCardFsControls(card){if(!card)return;card.classList.add('fs-visible');syncFsButton(card);clearTimeout(state.fsTimer);state.fsTimer=setTimeout(()=>card.classList.remove('fs-visible'),3000)}
function fullscreenCurrent(){const card=currentCard();if(!card)return;const req=card.requestFullscreen||card.webkitRequestFullscreen;if(req){Promise.resolve(req.call(card)).then(()=>{setTimeout(()=>showCardFsControls(card),80)}).catch(()=>{})}}
function exitFullscreen(){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)exit.call(document)}
document.addEventListener('fullscreenchange',()=>{const card=document.fullscreenElement;if(card?.classList?.contains('video-card')){card.classList.remove('fs-visible');clearTimeout(state.fsTimer)}else{$$('.video-card').forEach(c=>c.classList.remove('fs-visible'));clearTimeout(state.fsTimer)}});
document.addEventListener('webkitfullscreenchange',()=>{const card=document.webkitFullscreenElement;if(card?.classList?.contains('video-card')){card.classList.remove('fs-visible');clearTimeout(state.fsTimer)}else{$$('.video-card').forEach(c=>c.classList.remove('fs-visible'));clearTimeout(state.fsTimer)}});
async function openProfile(userId){const {data:p,error}=await sb.from('profiles').select('*').eq('id',userId).maybeSingle();if(error||!p)return toast(error?.message||'Perfil não encontrado.');state.profileTarget=userId;const [{data:vs},{count:likes}]=await Promise.all([sb.from('videos').select('id,title,video_url').eq('user_id',userId).eq('status','published').order('created_at',{ascending:false}),sb.from('profile_likes').select('*',{count:'exact',head:true}).eq('profile_id',userId)]);$('#profileHandle').textContent='@'+p.username;$('#profileDisplay').textContent=p.display_name||'Perfil de vídeos';$('#profileAvatar').innerHTML=profileMarkup(p);$('#profileLikes').textContent=likes||0;$('#profileVideos').textContent=(vs||[]).length;$('#profileGrid').innerHTML=(vs||[]).map(v=>`<div class="profile-thumb"><video muted preload="metadata" src="${safe(v.video_url)}"></video><span>${safe(v.title||'Vídeo')}</span></div>`).join('');const own=state.user?.id===userId;$('#profilePublish').style.visibility=own?'visible':'hidden';$('#likeProfileBtn').style.display=own?'none':'block';$('#editProfileBtn').style.display=own?'block':'none';if(state.user&&!own){const {data}=await sb.from('profile_likes').select('profile_id').eq('user_id',state.user.id).eq('profile_id',userId).maybeSingle();$('#likeProfileBtn').textContent=data?'♥ PERFIL CURTIDO':'♡ CURTIR PERFIL'}$('#profileView').classList.remove('hidden')}
async function openOwnProfile(){if(!await ensureProfile())return;openProfile(state.user.id)}
async function toggleProfileLike(){if(!await ensureProfile())return;const pid=state.profileTarget;if(!pid||pid===state.user.id)return;const {data}=await sb.from('profile_likes').select('profile_id').eq('user_id',state.user.id).eq('profile_id',pid).maybeSingle();if(data)await sb.from('profile_likes').delete().eq('user_id',state.user.id).eq('profile_id',pid);else await sb.from('profile_likes').insert({user_id:state.user.id,profile_id:pid});await openProfile(pid)}
async function createProfile(e){e.preventDefault();if(!await ensureAnonymousSession())return;const username=$('#setupUsername').value.replace(/^@/,'').trim().toLowerCase().replace(/[^a-z0-9._]/g,'');if(username.length<3)return $('#profileSetupStatus').textContent='Use pelo menos 3 caracteres no @.';const display=$('#setupDisplayName').value.trim();const {error}=await sb.from('profiles').upsert({id:state.user.id,username,display_name:display||username},{onConflict:'id'});if(error)return $('#profileSetupStatus').textContent=error.message;await loadOwnProfile();closeSheet('profileSetupSheet');await loadFeed();openOwnProfile()}
async function publishVideo(e){e.preventDefault();if(!await ensureProfile())return;const f=$('#videoFile').files?.[0],ext=$('#externalUrl').value.trim(),title=$('#videoTitle').value.trim()||f?.name?.replace(/\.[^.]+$/,'')||'Vídeo';if(!f&&!ext)return toast('Escolha um vídeo ou informe um link.');const btn=$('#publishSubmit');btn.disabled=true;$('#publishStatus').textContent='Publicando…';try{let videoUrl=ext;if(f){const safeName=f.name.replace(/[^a-zA-Z0-9._-]+/g,'-'),path=`${state.user.id}/${Date.now()}-${safeName}`;const {error:upErr}=await sb.storage.from(C.VIDEO_BUCKET||'videos').upload(path,f,{contentType:f.type||'video/mp4',upsert:false});if(upErr)throw upErr;videoUrl=sb.storage.from(C.VIDEO_BUCKET||'videos').getPublicUrl(path).data.publicUrl}const {error}=await sb.from('videos').insert({user_id:state.user.id,title,video_url:videoUrl,status:'published'});if(error)throw error;$('#publishForm').reset();$('#pickedFile').textContent='Nenhum vídeo selecionado';closeSheet('publishSheet');$('#profileView').classList.add('hidden');await loadFeed({keepPosition:false});feed.scrollTo({top:0,behavior:'smooth'});toast('Vídeo publicado.')}catch(err){$('#publishStatus').textContent=err.message||'Não foi possível publicar.'}finally{btn.disabled=false}}
async function editProfile(e){e.preventDefault();if(!await ensureProfile())return;const username=$('#editUsername').value.replace(/^@/,'').trim().toLowerCase().replace(/[^a-z0-9._]/g,''),display=$('#editDisplayName').value.trim(),f=$('#avatarFile').files?.[0];if(username.length<3)return $('#profileEditStatus').textContent='Use pelo menos 3 caracteres no @.';let avatar=state.profile?.avatar_url||null;try{if(f){const safeName=f.name.replace(/[^a-zA-Z0-9._-]+/g,'-'),path=`${state.user.id}/avatar-${Date.now()}-${safeName}`;const {error}=await sb.storage.from(C.VIDEO_BUCKET||'videos').upload(path,f,{contentType:f.type||'image/jpeg',upsert:false});if(error)throw error;avatar=sb.storage.from(C.VIDEO_BUCKET||'videos').getPublicUrl(path).data.publicUrl}const {error}=await sb.from('profiles').update({username,display_name:display||username,avatar_url:avatar}).eq('id',state.user.id);if(error)throw error;await loadOwnProfile();closeSheet('profileEditSheet');await loadFeed();await openOwnProfile();toast('Perfil atualizado.')}catch(err){$('#profileEditStatus').textContent=err.message||'Não foi possível salvar.'}}
function refreshNavAvatar(){const n=$('#navAvatar');if(!n)return;n.innerHTML=state.profile?.avatar_url?`<img src="${safe(state.profile.avatar_url)}" alt="">`:initial(state.profile?.username||'P')}
function openEditProfile(){if(!state.profile)return;$('#editUsername').value=state.profile.username||'';$('#editDisplayName').value=state.profile.display_name||'';openSheet('profileEditSheet')}
function searchLocal(q){q=q.trim().toLowerCase();const box=$('#searchResults');if(!q){box.innerHTML='<p class="muted small">Digite um título ou @perfil.</p>';return}const hits=state.videos.filter(v=>(v.title||'').toLowerCase().includes(q)||(v.profiles?.username||'').toLowerCase().includes(q)).slice(0,20);box.innerHTML=hits.map(v=>`<button class="search-item" data-id="${v.id}"><b>@${safe(v.profiles?.username||'perfil')}</b><span>${safe(v.title||'Vídeo')}</span></button>`).join('')||'<p class="muted small">Nenhum resultado.</p>';$$('.search-item').forEach(b=>b.onclick=()=>{closeSheet('searchSheet');document.querySelector(`.video-card[data-id="${b.dataset.id}"]`)?.scrollIntoView({behavior:'smooth',block:'start'})})}
function setupRealtime(){if(!sb)return;state.channel?.unsubscribe?.();let timer;const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>loadFeed(),250)};state.channel=sb.channel('coden-video-live').on('postgres_changes',{event:'*',schema:'public',table:'videos'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'video_likes'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'comments'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'profiles'},refresh).subscribe()}
$('#likeProfileBtn').onclick=toggleProfileLike;$('#editProfileBtn').onclick=openEditProfile;$('#commentForm').onsubmit=async e=>{e.preventDefault();if(!await ensureProfile())return;const body=$('#commentInput').value.trim();if(!body)return;const {error}=await sb.from('comments').insert({video_id:state.currentId,user_id:state.user.id,body});if(error)return toast(error.message);$('#commentInput').value='';const v=state.videos.find(x=>x.id===state.currentId);if(v)v.comment_count=(v.comment_count||0)+1;updateCommentCount(state.currentId);await openComments()};
function updateCommentCount(id){const card=document.querySelector(`.video-card[data-id="${id}"]`),v=state.videos.find(x=>x.id===id);if(card&&v){const c=card.querySelector('.comment-btn .rail-count');if(c)c.textContent=v.comment_count||0}}
$('#publishForm').onsubmit=publishVideo;$('#videoFile').onchange=e=>$('#pickedFile').textContent=e.target.files?.[0]?.name||'Nenhum vídeo selecionado';$('#avatarFile').onchange=e=>$('#pickedAvatar').textContent=e.target.files?.[0]?.name||'Nenhuma foto selecionada';$('#profilePublish').onclick=async()=>{if(await ensureProfile())openSheet('publishSheet')};$('#profileSetupForm').onsubmit=createProfile;$('#profileEditForm').onsubmit=editProfile;$('#searchInput').oninput=e=>searchLocal(e.target.value);
$$('[data-close]').forEach(b=>b.onclick=()=>closeSheet(b.dataset.close));$('#sheetBackdrop').onclick=closeAllSheets;$$('[data-close-view]').forEach(b=>b.onclick=()=>b.closest('.overlay-view').classList.add('hidden'));
$$('#bottomNav button').forEach(b=>b.onclick=async()=>{const a=b.dataset.nav;if(a==='home'){$('#profileView').classList.add('hidden');feed.scrollTo({top:0,behavior:'smooth'})}if(a==='search'){openSheet('searchSheet');setTimeout(()=>$('#searchInput').focus(),100)}if(a==='publish'){if(await ensureProfile())openSheet('publishSheet')}if(a==='profile')openOwnProfile()});
sb?.auth.onAuthStateChange(async(_event,session)=>{state.user=session?.user||null;state.profile=null;if(state.user)await loadOwnProfile()});
(async()=>{await loadSession();await ensureAnonymousSession();await loadOwnProfile();await loadFeed({keepPosition:false});setupRealtime()})();
