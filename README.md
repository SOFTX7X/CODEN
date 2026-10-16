# Aurora — Biblioteca digital (versão inicial)

Site responsivo gratuito e sem anúncios. Contém catálogo de 8 clássicos verificados no Project Gutenberg, leitor interno com salvamento de progresso no navegador, favoritos, temas, tamanho da fonte e uma integração inicial para leitura bíblica.

## Publicar gratuitamente na Vercel

1. Extraia o ZIP e publique os arquivos num repositório GitHub.
2. No painel Vercel, clique **Add New → Project**, importe o repositório.
3. Framework Preset: **Other**; Root Directory: pasta raiz; Build Command: deixe vazio; Output Directory: deixe vazio.
4. Faça o deploy. A Vercel executará automaticamente as funções `api/book.js` e `api/bible.js`.
5. Teste a leitura de um dos livros. As funções precisam de internet para buscar textos externos.

Não é necessário Supabase, token, banco de dados ou servidor no computador. Não há funcionalidades comerciais configuradas; confira as regras do plano Hobby da Vercel antes de uso comercial.

## Testar localmente

Para testar **também as APIs**, instale Node.js e execute `npx vercel dev` na pasta (precisa da CLI e poderá pedir login). Abrir `index.html` diretamente não executará as APIs e caminhos absolutos de assets também podem não resolver.

## Conteúdo e direitos

Textos: Project Gutenberg (https://www.gutenberg.org/) — listagens individuais possuem créditos de digitalização. A seleção contém autores clássicos em domínio público no Brasil; reavalie direitos de textos e de traduções antes de ampliar. As capas são geradas visualmente com CSS; não são reproduções de capas comerciais. Livro completo é solicitado sob demanda; não há cópias desses textos embutidas no ZIP.

## Bíblia — atenção

A UI lista 66 livros. A API experimental usa `bible-api.com` com `translation=almeida`. A disponibilidade dessa tradução não foi validada neste ambiente; quando houver falha, o site mostra uma mensagem clara e links para leitura externa. **Não anunciar como Bíblia integral já hospedada.** Próxima atualização recomendada: importar uma edição integral com licença conferida, tornando o leitor bíblico independente.

## Estrutura

- `index.html`: estrutura visual
- `style.css`: layout desktop e mobile
- `app.js`: páginas e interações
- `api/book.js`: proxy protegido de 8 obras selecionadas
- `api/bible.js`: consulta bíblica experimental
- `vercel.json`: cabeçalhos e limites

## Melhorias futuras

Importar mais textos revisados, disponibilizar leitura offline, implementar busca no corpo das obras, adicionar sincronização opcional e revisão de acessibilidade. Não há módulo de publicação por autores nesta versão.
