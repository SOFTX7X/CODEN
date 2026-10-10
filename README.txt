CODEN VIDEO - BASE V1

OBJETIVO
- Feed vertical de vídeos com foco em vídeos longos.
- Interface extremamente limpa.
- Publicação por vídeo da Galeria ou link externo.
- Likes no vídeo, comentários simples, salvos, compartilhamento.
- Perfil com "curtir perfil" em vez de seguidores tradicionais.
- Informações institucionais fora do feed.

ESTADO ATUAL
- Protótipo funcional front-end em modo DEMO.
- Não envia arquivos para servidor ainda.
- config.js já possui campos para SUPABASE_URL e SUPABASE_ANON_KEY.
- supabase-schema.sql contém a estrutura inicial do banco e políticas RLS.

IMPORTANTE SOBRE CHAVES
- Use somente SUPABASE_URL e SUPABASE_ANON_KEY no front-end.
- NUNCA coloque service_role ou segredo administrativo em JavaScript público.

PRÓXIMA ETAPA
1. Criar/ligar projeto Supabase.
2. Configurar Auth.
3. Aplicar supabase-schema.sql.
4. Definir onde vídeos grandes serão armazenados/CDN.
5. Conectar feed, perfis, likes, comentários, salvos, progresso e denúncias.
6. Depois transformar em WebApp Android.
