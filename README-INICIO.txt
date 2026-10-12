CODEN VIDEO — primeira versão de teste

SITE: index.html e assets/ (arquivos de publicação no site).
WORKER: worker/ (API opcional para sincronização automática).

O catálogo abre imediatamente em modo de demonstração com o vídeo do Chaves.
Isso NÃO significa que a sincronização esteja ativada.

PARA ATIVAR A SINCRONIZAÇÃO:
1) No Google Drive, abra a pasta CODEN VIDEO:
   https://drive.google.com/drive/folders/1qd4urcUfPAIi--4xr9ZFngsPkBnoCnLY
   Configure acesso geral da PASTA como "Qualquer pessoa com o link" (Leitor).
   Os VÍDEOS também precisam permitir leitura pública individualmente.
2) No Google Cloud Console, crie/seleciona um projeto, habilite Google Drive API e crie uma API Key.
   Restrinja a chave à Google Drive API. Não coloque a chave no index.html ou no JS do navegador.
3) Publique o conteúdo worker/ em um Cloudflare Worker.
   Adicione GOOGLE_API_KEY como SECRET do Worker.
   Configure rota codenoficial.online/api/videos* apontando ao Worker.
4) Publique index.html e assets/ no domínio codenoficial.online.
5) Confira https://codenoficial.online/api/videos: deverá retornar {"videos":[...]}.
   Em até cerca de 1 minuto de cache, vídeos novos serão lidos ao atualizar o catálogo.

OBS: Apenas criar o arquivo na pasta NÃO publica automaticamente com segurança se o
arquivo novo estiver RESTRITO. Confirme a permissão de leitura do próprio arquivo.
Não é necessário colocar nenhuma credencial no site público.

REPRODUÇÃO: embed de prévia do Google Drive; pode sofrer quotas/limitações e não
substitui uma hospedagem de streaming. Teste no celular e no computador.

CATEGORIAS: detectadas por palavras-chave no nome do arquivo, sem IA paga.
As palavras "ação", "terror", "suspense", "chaves" etc. geram categorias.

Nenhuma alteração foi feita no domínio, no Cloudflare, nem na configuração do Drive.
