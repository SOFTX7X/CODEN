# AURORA V1.15 — Catálogo próprio

Projeto completo para GitHub + Vercel.

- Catálogo incorporado ao `app.js`, com títulos reais confirmados no Project Gutenberg.
- Metadados extras também em `data/catalog.json` para manutenção.
- Listagem, pesquisa e `Ver mais livros` funcionam sem Gutendex ou qualquer API de catálogo.
- A leitura continua dependendo da disponibilidade de arquivos de texto no Project Gutenberg (`api/book.js`). **Os textos completos não estão incorporados ao ZIP.**
- Capas originais não são garantidas; a capa tipográfica própria sempre aparece.
- Preserva lógica de paginação de V1.11/1.13.
- O acervo está limitado aos títulos realmente catalogados, não representa todos os livros da internet.
- Para adicionar livros, registrar ID válido e obra com direitos adequados no `app.js` e na allowlist de `api/book.js`; evite inventar identificadores.
- Não precisa de Supabase nem de PC ligado como servidor.
