# Museu do Bit

Museu virtual de computadores e consoles clássicos (1975–1995), feito com **HTML, CSS e JavaScript puros**, sem frameworks nem bibliotecas. Projeto da disciplina de Webdesign.

**Site publicado:** _(link do deploy)_

## O que é

Quinze máquinas, de Altair 8800 a PlayStation, incluindo dois micros brasileiros (TK 90X e Gradiente Expert). Cada peça tem ilustração em pixel art, ficha técnica e uma curiosidade. O visitante pode buscar, filtrar, favoritar, comparar, ouvir sons, ver vídeos e até digitar comandos num terminal.

A identidade visual parte da luz âmbar dos monitores de fósforo: fundo quase preto, tipografia serifada de contraste (Fraunces), rótulos em monoespaçada (IBM Plex Mono) e cartões que imitam placas de museu sob um spot de luz.

## Páginas

| Página | Arquivo | Conteúdo |
| --- | --- | --- |
| Início | `index.html` | Hero, faixa animada, números, destaques sorteados, terminal e quiz |
| Acervo | `acervo.html` | Busca, filtros, ordenação, favoritos e comparador |
| Linha do tempo | `linha-do-tempo.html` | Três eras ilustradas e linha horizontal navegável |
| Sala multimídia | `sala-multimidia.html` | Players de áudio com visualizador e vídeos com efeito CRT |
| Sobre | `sobre.html` | História, bastidores, FAQ e formulário de contato |

Todas se ligam pelo menu do topo, pelo rodapé e por links internos (por exemplo, da ficha de uma peça para o ano dela na linha do tempo).

## Requisitos da atividade

| Requisito | Como foi atendido |
| --- | --- |
| 5 páginas | 5 páginas HTML (tabela acima) |
| 20 mídias | 26 arquivos: 15 ilustrações das máquinas, logo, hero, 3 capas de era, 4 áudios e 2 vídeos |
| Páginas interligadas | Menu, rodapé, botões de chamada e links contextuais |
| 30 estilizações | Lista abaixo (mais de 30) |
| Responsivo | Três pontos de quebra (1024, 860 e 560 px), testado em 390 px sem rolagem horizontal |
| 10 funcionalidades | 14, listadas abaixo |
| Menu interativo | Menu hambúrguer animado que vira tela cheia no celular, com link da página atual destacado |
| 30 commits | Histórico no GitHub |
| README | Este arquivo |
| Deploy | GitHub Pages |

## Funcionalidades

1. Menu hambúrguer responsivo com foco, `Esc` e link ativo
2. Tema claro e escuro, lembrado entre visitas
3. Efeito CRT (linhas de varredura) ligável no site inteiro
4. Busca em tempo real, ignorando acentos
5. Filtros por década, tipo e "feitos no Brasil", com ordenação
6. Favoritos salvos no navegador, com contador no topo e filtro dedicado
7. Ficha da peça em janela modal (`dialog`), com navegação por setas
8. Comparador lado a lado de duas máquinas
9. Linha do tempo com arrastar, slider de ano, botões e barra de progresso
10. Contadores animados ao rolar
11. Quiz "Qual máquina é você?"
12. Terminal interativo (`help`, `ls`, `info`, `open`, `boot`, `modem`, `sid`...)
13. Players de áudio com visualizador de frequências e volume global
14. Formulário com validação em tempo real, contador de caracteres e tela de sucesso

Extras: barra de progresso de leitura, botão de voltar ao topo, avisos (toast), revelar ao rolar, FAQ em acordeão.

## Estilizações

Variáveis CSS · tema claro/escuro · `color-mix()` · gradientes cônicos (spot de luz) · gradientes radiais · padrão de pontos com máscara · `backdrop-filter` (vidro no cabeçalho) · cabeçalho `sticky` · CSS Grid · Flexbox · `clamp()` para tipografia fluida · `aspect-ratio` · animação de cursor piscando · faixa em loop infinito · transições com curva personalizada · `transform` em hover · sombras e brilho âmbar · menu hambúrguer que vira "X" · sublinhado animado no menu · revelar ao rolar com atraso escalonado · barra de progresso de leitura · modal com `::backdrop` desfocado · pulsação do coração ao favoritar · chips de filtro com estado `aria-pressed` · tabela estilizada · linha do tempo com `scroll-snap` · cartão ativo destacado na linha do tempo · estilização do `input[type=range]` com `accent-color` · visualizador em canvas · efeito CRT com `repeating-linear-gradient` · terminal com `text-shadow` fosforescente · acordeão com ícone que gira · mensagens de erro de formulário · foco visível personalizado · `::selection` · scrollbar estilizada · `prefers-reduced-motion` · três `@media` de responsividade.

## Como a mídia foi criada

Nada foi copiado de outros sites. Tudo é gerado por scripts em `tools/`:

| Script | O que gera |
| --- | --- |
| `tools/gerar-maquinas.mjs` | 15 ilustrações SVG em pixel art das máquinas |
| `tools/gerar-marca.mjs` | Logo, favicon, hero e as 3 capas de era |
| `tools/sintetizar-audio.py` | 4 sons sintetizados (ondas quadrada, pulso, serra e triângulo) |

Os dois vídeos foram gerados com `ffmpeg` a partir dos filtros `life` (Jogo da Vida) e `cellauto` (autômato celular, regra 90).

```bash
node tools/gerar-maquinas.mjs
node tools/gerar-marca.mjs
python3 tools/sintetizar-audio.py
```

## Como rodar

Basta abrir o `index.html`. Para o visualizador de áudio funcionar por completo, sirva a pasta por HTTP:

```bash
python3 -m http.server 8000
```

e acesse `http://localhost:8000`.

## Estrutura

```
index.html · acervo.html · linha-do-tempo.html · sala-multimidia.html · sobre.html
css/style.css
js/data.js        dados do acervo e da linha do tempo
js/main.js        núcleo: tema, menu, favoritos, modal, rolagem
js/home.js · acervo.js · timeline.js · midia.js · sobre.js
img/ · audio/ · video/ · tools/
```

## Observações

- Os dados técnicos foram revisados com cuidado, mas valores como clock e vendas são aproximados (marcados com `~` ou "estimativas"). Para uso acadêmico, confirme em uma fonte primária.
- As ilustrações são simplificadas e não pretendem ser fiéis ao milímetro.
- O formulário de contato é uma simulação: nada é enviado.
