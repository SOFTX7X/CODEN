const C=window.CODEN_CONFIG||{};
const sb=window.supabase?.createClient?.(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
const state={user:null,profile:null,videos:[],currentId:null,liked:new Set(),saved:new Set(),profileTarget:null,fsTimer:null};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const feed=$('#feed');
function safe(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function initial(u='?'){return (u.replace('@','').trim()[0]||'?').toUpperCase()}
function toast(msg){const n=document.createElement('div');n.textContent=msg;Object.assign(n.style,{position:'fixed',left:'50%',bottom:'28px',transform:'translateX(-50%)',background:'#151515',border:'1px solid #333',color:'#fff',padding:'10px 14px',borderRadius:'10px',zIndex:120,fontSize:'12px'});document.body.appendChild(n);setTimeout(()=>n.remove(),2200)}
function openSheet(id){if(id==='actionsSheet'){document.body.classList.add('actions-open');$('#'+id).classList.remove('hidden');return}$('#sheetBackdrop').classList.remove('hidden');$('#'+id).classList.remove('hidden')}
function closeSheet(id){$('#'+id).classList.add('hidden');if(!$$('.sheet:not(.hidden),.mini-sheet:not(.hidden)').length)$('#sheetBackdrop').classList.add('hidden')}
function closeAllSheets(){closeMini();$$('.sheet').forEach(s=>s.classList.add('hidden'));$('#sheetBackdrop').classList.add('hidden')}
function closeMini(){$('#actionsSheet').classList.add('hidden');document.body.classList.remove('actions-open')}
async function ensureAnonymousSession(){if(!sb)return false;if(state.user)return true;let {data}=await sb.auth.getSession();if(data.session?.user){state.user=data.session.user;return true}const {data:anon,error}=await sb.auth.signInAnonymously();if(error){console.error(error);toast('Ative Anonymous Sign-Ins no Supabase para publicar e interagir.');return false}state.user=anon.user||anon.session?.user||null;return !!state.user}
async function loadOwnProfile(){if(!state.user)return;const {data}=await sb.from('profiles').select('*').eq('id',state.user.id).maybeSingle();state.profile=data||null}
async function ensureProfile(){if(!await ensureAnonymousSession())return false;await loadOwnProfile();if(state.profile)return true;openSheet('profileSetupSheet');return false}
async function loadSession(){if(!sb)return;const {data}=await sb.auth.getSession();state.user=data.session?.user||null;if(state.user)await loadOwnProfile()}
async function loadFeed(){if(!sb){feed.innerHTML='<div class="empty">Supabase não conectado.</div>';return}const {data,error}=await sb.from('videos').select('id,user_id,title,video_url,created_at,profiles!videos_user_id_fkey(username,display_name,avatar_url)').eq('status','published').order('created_at',{ascending:false}).limit(50);if(error){feed.innerHTML=`<div class="empty">${safe(error.message)}</div>`;return}state.videos=data||[];await loadFlags();renderFeed()}
async function loadFlags(){state.liked.clear();state.saved.clear();if(!state.user)return;const [{data:l},{data:s}]=await Promise.all([sb.from('video_likes').select('video_id').eq('user_id',state.user.id),sb.from('saved_videos').select('video_id').eq('user_id',state.user.id)]);(l||[]).forEach(x=>state.liked.add(x.video_id));(s||[]).forEach(x=>state.saved.add(x.video_id))}
function renderFeed(){if(!state.videos.length){feed.innerHTML='<div class="empty"><div><div>Ainda não há vídeos publicados.</div><button id="emptyStart">CRIAR MEU PERFIL E PUBLICAR</button></div></div>';$('#emptyStart')?.addEventListener('click',async()=>{if(await ensureProfile())openSheet('publishSheet')});return}
 feed.innerHTML=state.videos.map(v=>{const p=v.profiles||{};const avatar=p.avatar_url?`<img src="${safe(p.avatar_url)}" alt="">`:initial(p.username||'perfil');return `<article class="video-card" data-id="${v.id}" data-user="${v.user_id}"><video playsinline preload="metadata" src="${safe(v.video_url)}"></video><div class="tap-zone"></div><button class="profile-chip" data-profile="${v.user_id}"><span class="avatar-mini">${avatar}</span><b>@${safe(p.username||'perfil')}</b></button><div class="controls-pulse">▶</div></article>`}).join('');
 $$('.video-card').forEach(card=>{const v=card.querySelector('video');v.addEventListener('loadedmetadata',()=>{if(v.videoHeight>v.videoWidth)card.classList.add('is-portrait');positionCardUi(card)});card.querySelector('.tap-zone').onclick=()=>toggleActions(card);card.querySelector('.profile-chip').onclick=e=>{e.stopPropagation();openProfile(card.dataset.user)};v.addEventListener('ended',()=>{v.currentTime=0})});
 positionAllCardUi();
 observeFeed();
}

function mediaBox(card){
  const v=card?.querySelector('video');
  if(!card||!v||!v.videoWidth||!v.videoHeight)return null;
  const r=card.getBoundingClientRect();
  const ratio=v.videoWidth/v.videoHeight;
  const boxRatio=r.width/r.height;
  let w,h,left,top;
  if(ratio>boxRatio){w=r.width;h=w/ratio;left=r.left;top=r.top+(r.height-h)/2}
  else{h=r.height;w=h*ratio;top=r.top;left=r.left+(r.width-w)/2}
  return {left,top,width:w,height:h,right:left+w,bottom:top+h,card:r};
}
function positionCardUi(card){
  if(!card)return;
  const b=mediaBox(card);
  if(!b)return;
  const left=Math.max(10,b.left-b.card.left+12);
  const bottom=Math.max(10,b.card.bottom-b.bottom+12);
  card.style.setProperty('--media-left',left+'px');
  card.style.setProperty('--media-bottom',bottom+'px');
}
function positionAllCardUi(){ $$('.video-card').forEach(positionCardUi); }
function positionActions(card){
  const b=mediaBox(card); if(!b)return;
  const right=Math.max(10,window.innerWidth-b.right+12);
  const bottom=Math.max(10,window.innerHeight-b.bottom+12);
  document.documentElement.style.setProperty('--actions-right',right+'px');
  document.documentElement.style.setProperty('--actions-bottom',bottom+'px');
}
window.addEventListener('resize',()=>{positionAllCardUi();const c=currentCard();if(c&&!$('#actionsSheet').classList.contains('hidden'))positionActions(c)});
let io;
function observeFeed(){io?.disconnect();io=new IntersectionObserver(entries=>entries.forEach(e=>{const v=e.target.querySelector('video');if(e.isIntersecting&&e.intersectionRatio>.72){$$('.video-card video').forEach(x=>{if(x!==v)x.pause()});v.play().catch(()=>{});state.currentId=e.target.dataset.id}else v.pause()}),{threshold:[.72]});$$('.video-card').forEach(c=>io.observe(c))}
function currentCard(){return document.querySelector(`.video-card[data-id="${state.currentId}"]`)||$('.video-card')}
function toggleActions(card){state.currentId=card.dataset.id;const v=card.querySelector('video');if(document.fullscreenElement===card){showFullscreenControls(card);return}if(!$('#actionsSheet').classList.contains('hidden')){closeMini();return}$('#actionLike').textContent=state.liked.has(state.currentId)?'♥':'♡';$('#actionSave').textContent=state.saved.has(state.currentId)?'SALVO':'SALVAR';positionActions(card);openSheet('actionsSheet');}
async function toggleLike(){if(!await ensureProfile())return;const id=state.currentId;if(!id)return;if(state.liked.has(id)){await sb.from('video_likes').delete().eq('user_id',state.user.id).eq('video_id',id);state.liked.delete(id)}else{await sb.from('video_likes').insert({user_id:state.user.id,video_id:id});state.liked.add(id)}$('#actionLike').textContent=state.liked.has(id)?'♥':'♡'}
async function toggleSave(){if(!await ensureProfile())return;const id=state.currentId;if(!id)return;if(state.saved.has(id)){await sb.from('saved_videos').delete().eq('user_id',state.user.id).eq('video_id',id);state.saved.delete(id)}else{await sb.from('saved_videos').insert({user_id:state.user.id,video_id:id});state.saved.add(id)}$('#actionSave').textContent=state.saved.has(id)?'SALVO':'SALVAR'}
async function openComments(){closeMini();const id=state.currentId;if(!id)return;const {data,error}=await sb.from('comments').select('id,body,created_at,profiles(username)').eq('video_id',id).order('created_at',{ascending:true});if(error)return toast(error.message);$('#commentsList').innerHTML=(data||[]).map(c=>`<div class="comment"><b>@${safe(c.profiles?.username||'usuario')}</b><p>${safe(c.body)}</p></div>`).join('')||'<p class="muted small">Nenhum comentário ainda.</p>';openSheet('commentsSheet')}
async function shareCurrent(){const v=state.videos.find(x=>x.id===state.currentId);if(!v)return;if(navigator.share)await navigator.share({title:v.title||'Vídeo',url:v.video_url}).catch(()=>{});else{await navigator.clipboard.writeText(v.video_url).catch(()=>{});toast('Link copiado.')}closeAllSheets()}
async function reportCurrent(){if(!await ensureProfile())return;const reason=prompt('Motivo da denúncia:');if(!reason)return;const {error}=await sb.from('reports').insert({reporter_id:state.user.id,video_id:state.currentId,reason:reason.slice(0,120)});if(error)return toast(error.message);closeAllSheets();toast('Denúncia enviada.')}
function fullscreenCurrent(){const card=currentCard();closeAllSheets();card?.requestFullscreen?.().catch(()=>{})}
function showFullscreenControls(card){const box=$('#fullscreenControls'),v=card.querySelector('video');box.classList.remove('hidden');$('#fsPlayPause').textContent=v.paused?'REPRODUZIR':'PAUSAR';clearTimeout(state.fsTimer);state.fsTimer=setTimeout(()=>box.classList.add('hidden'),2600)}
$('#fsPlayPause').onclick=()=>{const card=document.fullscreenElement;if(!card)return;const v=card.querySelector('video');v.paused?v.play():v.pause();showFullscreenControls(card)};
$('#fsExit').onclick=()=>document.exitFullscreen?.();
document.addEventListener('fullscreenchange',()=>{const card=document.fullscreenElement;if(card?.classList?.contains('video-card')){card.onclick=()=>showFullscreenControls(card);$('#fullscreenControls').classList.add('hidden')}else{$('#fullscreenControls').classList.add('hidden')}});
async function openProfile(userId){const {data:p,error}=await sb.from('profiles').select('*').eq('id',userId).maybeSingle();if(error||!p)return toast(error?.message||'Perfil não encontrado.');state.profileTarget=userId;const [{data:vs},{count:likes}]=await Promise.all([sb.from('videos').select('id,title,video_url').eq('user_id',userId).eq('status','published').order('created_at',{ascending:false}),sb.from('profile_likes').select('*',{count:'exact',head:true}).eq('profile_id',userId)]);$('#profileHandle').textContent='@'+p.username;$('#profileDisplay').textContent=p.display_name||'Perfil de vídeos';$('#profileAvatar').innerHTML=p.avatar_url?`<img src="${safe(p.avatar_url)}" alt="">`:initial(p.username);$('#profileLikes').textContent=likes||0;$('#profileVideos').textContent=(vs||[]).length;$('#profileGrid').innerHTML=(vs||[]).map(v=>`<div class="profile-thumb"><video muted preload="metadata" src="${safe(v.video_url)}"></video><span>${safe(v.title||'Vídeo')}</span></div>`).join('');const own=state.user?.id===userId;$('#profilePublish').style.visibility=own?'visible':'hidden';$('#likeProfileBtn').style.display=own?'none':'block';if(state.user&&!own){const {data}=await sb.from('profile_likes').select('profile_id').eq('user_id',state.user.id).eq('profile_id',userId).maybeSingle();$('#likeProfileBtn').textContent=data?'♥ PERFIL CURTIDO':'♡ CURTIR PERFIL'}$('#profileView').classList.remove('hidden')}
async function openOwnProfile(){if(!await ensureProfile())return;openProfile(state.user.id)}
async function toggleProfileLike(){if(!await ensureProfile())return;const pid=state.profileTarget;if(!pid||pid===state.user.id)return;const {data}=await sb.from('profile_likes').select('profile_id').eq('user_id',state.user.id).eq('profile_id',pid).maybeSingle();if(data)await sb.from('profile_likes').delete().eq('user_id',state.user.id).eq('profile_id',pid);else await sb.from('profile_likes').insert({user_id:state.user.id,profile_id:pid});await openProfile(pid)}
async function createProfile(e){e.preventDefault();if(!await ensureAnonymousSession())return;const username=$('#setupUsername').value.replace(/^@/,'').trim().toLowerCase().replace(/[^a-z0-9._]/g,'');if(username.length<3)return $('#profileSetupStatus').textContent='Use pelo menos 3 caracteres no @.';const display=$('#setupDisplayName').value.trim();const {error}=await sb.from('profiles').upsert({id:state.user.id,username,display_name:display||username},{onConflict:'id'});if(error)return $('#profileSetupStatus').textContent=error.message;await loadOwnProfile();closeSheet('profileSetupSheet');toast('Perfil criado.');openOwnProfile()}
async function publishVideo(e){e.preventDefault();if(!await ensureProfile())return;const f=$('#videoFile').files?.[0];const ext=$('#externalUrl').value.trim();const title=$('#videoTitle').value.trim()||f?.name?.replace(/\.[^.]+$/,'')||'Vídeo';if(!f&&!ext)return toast('Escolha um vídeo ou informe um link.');const btn=$('#publishSubmit');btn.disabled=true;$('#publishStatus').textContent='Publicando…';try{let videoUrl=ext;if(f){const safeName=f.name.replace(/[^a-zA-Z0-9._-]+/g,'-');const path=`${state.user.id}/${Date.now()}-${safeName}`;const {error:upErr}=await sb.storage.from(C.VIDEO_BUCKET||'videos').upload(path,f,{contentType:f.type||'video/mp4',upsert:false});if(upErr)throw upErr;const {data}=sb.storage.from(C.VIDEO_BUCKET||'videos').getPublicUrl(path);videoUrl=data.publicUrl}const {error}=await sb.from('videos').insert({user_id:state.user.id,title,video_url:videoUrl,status:'published'});if(error)throw error;$('#videoFile').value='';$('#externalUrl').value='';$('#videoTitle').value='';$('#pickedFile').textContent='Nenhum vídeo selecionado';$('#publishStatus').textContent='Publicado.';closeSheet('publishSheet');$('#profileView').classList.add('hidden');await loadFeed();toast('Vídeo publicado.')}catch(err){$('#publishStatus').textContent=err.message||'Não foi possível publicar.'}finally{btn.disabled=false}}
$('#actionLike').onclick=toggleLike;$('#actionSave').onclick=toggleSave;$('#actionComment').onclick=openComments;$('#actionShare').onclick=shareCurrent;$('#actionReport').onclick=reportCurrent;$('#actionFullscreen').onclick=fullscreenCurrent;$('#likeProfileBtn').onclick=toggleProfileLike;
$('#commentForm').onsubmit=async e=>{e.preventDefault();if(!await ensureProfile())return;const body=$('#commentInput').value.trim();if(!body)return;const {error}=await sb.from('comments').insert({video_id:state.currentId,user_id:state.user.id,body});if(error)return toast(error.message);$('#commentInput').value='';openComments()};
$('#publishForm').onsubmit=publishVideo;$('#videoFile').onchange=e=>$('#pickedFile').textContent=e.target.files?.[0]?.name||'Nenhum vídeo selecionado';$('#profilePublish').onclick=async()=>{if(await ensureProfile())openSheet('publishSheet')};$('#profileSetupForm').onsubmit=createProfile;
$$('[data-close]').forEach(b=>b.onclick=()=>closeSheet(b.dataset.close));$('#sheetBackdrop').onclick=closeAllSheets;$$('[data-close-view]').forEach(b=>b.onclick=()=>b.closest('.overlay-view').classList.add('hidden'));
sb?.auth.onAuthStateChange(async(_event,session)=>{state.user=session?.user||null;state.profile=null;if(state.user)await loadOwnProfile()});
(async()=>{await loadSession();await loadFeed();if(!state.user)ensureAnonymousSession().then(async ok=>{if(ok){await loadOwnProfile();await loadFlags()}})})();
