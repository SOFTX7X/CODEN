// Google Apps Script - CODEN VIDEO
// Deploy as Web app: Execute as Me; Who has access: Anyone.
const CODEN_FOLDER_ID = '1qd4urcUfPAIi--4xr9ZFngsPkBnoCnLY';

function doGet() {
  try {
    const folder = DriveApp.getFolderById(CODEN_FOLDER_ID);
    const iterator = folder.getFiles();
    const videos = [];
    while(iterator.hasNext() && videos.length < 1000) {
      const file = iterator.next();
      if (!file.getMimeType().startsWith('video/')) continue;
      // Do not publish private files in the public catalog.
      if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK &&
          file.getSharingAccess() !== DriveApp.Access.ANYONE) continue;
      videos.push({id:file.getId(),name:file.getName(),mimeType:file.getMimeType(),modifiedTime:file.getLastUpdated().toISOString()});
    }
    videos.sort((a,b)=>(b.modifiedTime||'').localeCompare(a.modifiedTime||''));
    return ContentService.createTextOutput(JSON.stringify({videos}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({error:'Falha ao ler a pasta',videos:[]}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
