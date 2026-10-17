# AURORA — Importação HTML estruturada

Esta edição prioriza o HTML do Project Gutenberg. Preserva a ordem dos blocos, títulos, parágrafos e imagens, sem truncar parágrafos longos, sem remover textos repetidos e sem tentar reconstruir a obra por tamanho do texto.

Os livros são carregados de `api/book.js`, que usa o HTML ilustrado quando disponível e TXT como alternativa. A leitura continua dependendo da acessibilidade da fonte externa.

**Importante:** edições Gutenberg diferem de estrutura. O código foi validado com testes locais de HTML e sintaxe; não há garantia de que a limpeza editorial esteja perfeita em todas as 63 obras. Não foi aplicada modernização automática da ortografia.
