CODEN VIDEO V3 - FEED LIMPO / SEM LOGIN VISÍVEL

ANTES DE TESTAR:
1. Supabase Dashboard > Authentication > Providers > Anonymous Sign-Ins: habilite Anonymous Sign-Ins.
2. Rode supabase-v3-update.sql uma vez no SQL Editor.
3. O bucket videos da V2 continua sendo usado; não precisa recriar se já existe.

FLUXO:
- O site abre direto no feed.
- Não existe tela de login.
- Supabase cria uma sessão anônima silenciosa para likes, comentários, saves e publicação.
- No feed fica apenas foto + @ do perfil.
- Toque no vídeo abre as ações.
- Toque na foto/@ abre o perfil.
- O + de publicar fica no próprio perfil.
- Tela cheia esconde tudo; toque mostra controles temporários.
