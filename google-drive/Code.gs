// CODEN VIDEO — listagem de vídeos e capas da pasta autorizada.
// Implantação: App da Web, executar como Eu, acesso Qualquer pessoa.
const CODEN_FOLDER_ID = '1qd4urcUfPAIi--4xr9ZFngsPkBnoCnLY';
function doGet() {
  try {
    const files = DriveApp.getFolderById(CODEN_FOLDER_ID).getFiles();
    const videos = [], images = [];
    while (files.hasNext() && videos.length + images.length < 3000) {
      const f = files.next();
      const mime = f.getMimeType();
      const isVideo = mime.startsWith('video/');
      const isImage = ['image/jpeg','image/png','image/webp'].includes(mime);
      if (!isVideo && !isImage) continue;
      // Somente arquivos com leitura pública: não divulgar IDs de arquivos privados.
      const access = f.getSharingAccess();
      if (access !== DriveApp.Access.ANYONE_WITH_LINK && access !== DriveApp.Access.ANYONE) continue;
      const file = {id:f.getId(),name:f.getName(),mimeType:mime,modifiedTime:f.getLastUpdated().toISOString()};
      (isVideo ? videos : images).push(file);
    }
    videos.sort((a,b)=>b.modifiedTime.localeCompare(a.modifiedTime));
    return ContentService.createTextOutput(JSON.stringify({videos,images}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({error:'Falha ao consultar arquivos',videos:[],images:[]}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
