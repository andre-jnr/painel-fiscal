# Central de Portais Fiscais

Painel de acesso rápido aos links do faturamento, fiscal e controladoria.
É uma página estática: não tem build nem dependências. Abre direto no
navegador, no Live Server do VS Code ou publicada no GitHub Pages.

## Estrutura

```
index.html          conteúdo: cards, links, checklist, textos para copiar
assets/             ícone da página
css/
  base.css          cores (tema claro/escuro), cabeçalho, cards, links, responsivo
  seletores.css     seletor de unidade e de modelo
  ordem.css         arrastar cards, barra de ações
  secoes.css        "+ Nova seção" e o formulário
  checklist.css     checklist do fechamento (e a versão minimizada)
js/
  tema.js           botão claro/escuro
  seletores.js      unidade (Sistemas internos) e modelo (Relatórios gerenciais)
  secoes.js         seções criadas pelo usuário
  ordem.js          arrastar e salvar a ordem dos cards
  checklist.js      checklist do fechamento fiscal
  copiar.js         botões "Copiar"
```

A ordem dos `<script>` no fim do `index.html` importa: `secoes.js` vem
antes de `ordem.js`, para que as seções do usuário entrem na ordem dos cards.

## Como adicionar ou mudar links

Tudo está no `index.html`. Cada card tem um `data-card` único, por exemplo
`data-card="mouraweb"`, e é ele que fica salvo na ordem personalizada.

- **Novo link num card:** copie um `<a class="link-item">` do mesmo card.
- **Card novo:** copie um card inteiro e dê um `data-card` novo. Quem já
  organizou os cards vai vê-lo aparecer na posição em que ele está no HTML.
- **Link de "Sistemas internos":** use `data-port="PORTA"`. O servidor é
  trocado pelo seletor de unidade.
- **Link de "Relatórios gerenciais":** use `data-host` e `data-path`. A porta
  é trocada pelo seletor de modelo. Um link que só existe num modelo leva
  `data-only-model="PORTA"`.

## O que fica salvo no navegador (localStorage)

Cada pessoa tem as próprias preferências, só no navegador e computador dela.

| Chave | O que guarda |
| --- | --- |
| `painel-fiscal-theme` | tema claro ou escuro |
| `painel-fiscal-unidade` | unidade escolhida em Sistemas internos |
| `painel-fiscal-modelo` | modelo escolhido em Relatórios gerenciais |
| `painel-fiscal-ordem` | ordem personalizada dos cards |
| `painel-fiscal-secoes` | seções criadas pelo usuário |
| `painel-fiscal-checklist` | etapas concluídas, por competência |
| `painel-fiscal-checklist-min` | checklist minimizado e o mês dessa escolha |
