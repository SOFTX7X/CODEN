# AURORA — Biblioteca digital V1.11

Projeto completo para publicar em Vercel, com `index.html`, `style.css`, `app.js`, `api/` e configurações.

## Leitor

A V1.11 corrige o mecanismo de páginas: separa por cabeçalhos originais como `CAPÍTULO I`, `II.` e `PARTE III`. Cada página visual pertence a **uma única divisão**; capítulos longos são distribuídos em páginas menores, mantendo sua divisão editorial. Evita rolagem infinita e cortes por caractere que atravessavam títulos. Trechos grandes demais são divididos por frases e, em último caso, palavras.

## Testes e limites

Os testes automatizados verificam divisão de capítulos, integridade dos parágrafos, ausência de mistura entre seções e sintaxe JavaScript. As fontes do Project Gutenberg vêm em texto puro e diferem por edição: alguns formatos excepcionais precisarão de revisão por obra. Os serviços externos requerem internet e publicação em ambiente compatível com funções Vercel.

## Publicação

Envie todos os arquivos e pastas da raiz deste ZIP ao repositório da Vercel. Não coloque a pasta mãe dentro do repositório.

## Catálogo V1.12

O botão **Carregar mais livros** percorre páginas do Gutendex até adicionar 48 novas obras ou consultar 12 páginas por lote; o botão continua os lotes até o final da fonte, com atualização gradual. A busca remota reinicia a paginação corretamente. Resultados são desduplicados; a capa da fonte aparece quando disponível, com fallback tipográfico. Obras em português precisam ter informação conservadora de domínio público (autor falecido até 1955, sem tradutor identificado) e podem continuar limitadas pela fonte. Não é um catálogo de todos os livros existentes no Brasil.

## V1.13
Corrige o clique quando o catálogo ainda está consultando a primeira página; carrega em lotes, exibe progresso/erros da fonte e preserva a paginação dos livros da V1.11. Ainda depende da API Gutendex: se ela estiver indisponível, não é possível garantir novos títulos.
