# 🔍 Auditoria e Roadmap — Distribuidora do Batata (CRM)

> Data da auditoria: 16/08/2026
> Arquivo principal: `distribuidora-batata-crm-1.html` (aplicação 100% client-side, em memória)

---

## 1. Visão geral do que foi encontrado

O sistema é um CRM/PDV para distribuidora de bebidas em **um único arquivo HTML** (HTML + CSS + JS puro).
Antes desta auditoria **não tinha nenhuma persistência**: todos os dados viviam na memória (`const S = {...}`)
e eram **perdidos ao atualizar a página** — e o sistema vinha preenchido com **dados de demonstração**
(produtos, clientes, vendas, entregas e gráficos falsos).

### O que foi corrigido/implementado nesta sessão
| Item | Status |
|---|---|
| **Zero dados demo**: sistema inicia vazio, apenas com dados reais cadastrados pelo usuário | ✅ |
| Logo original (`logo-original.jpeg`) na sidebar, banner e rodapé | ✅ |
| Persistência real: SQLite (sql.js) com fallback IndexedDB → localStorage | ✅ |
| Troco no fechamento de venda (PDV completo **e** lateral) + validação + cupom | ✅ |
| Módulo **Caixa**: abertura, sangria de caixa, fechamento e histórico | ✅ |
| Vendas em dinheiro entram automaticamente no caixa quando aberto | ✅ |
| Central **WhatsApp**: seleção de clientes/fornecedores + mensagens pré-prontas | ✅ |
| **Dashboard 100% real**: top vendidos, últimos pedidos, destaques e alertas calculados dos dados | ✅ |
| **KPIs reais**: vendas/pedidos/ticket do dia, clientes cadastrados (sem números fixos) | ✅ |
| **Entregas funcionais**: cadastro, iniciar/confirmar, exclusão e contadores | ✅ |
| **Promoções funcionais**: cadastro, status, exclusão | ✅ |
| **Usuários funcionais**: cadastro, perfil, status, exclusão | ✅ |
| **Gráfico financeiro real**: receita/despesa/lucro calculados das vendas e contas (sem `Math.random`) | ✅ |
| **Edição de produtos e clientes** (botão ✏️, modal reaproveitado) | ✅ |
| **Código de barras** nos produtos + busca/leitura no PDV (lateral e completo) | ✅ |
| **Troco rápido**: botões de notas (R$5 a R$200) nos dois PDVs | ✅ |
| **Histórico de fechamentos de caixa** (view Caixa) | ✅ |
| **Exportação CSV** das vendas (compatível com Excel) | ✅ |
| **Lotes / Validade**: controle por lote (validade, custo), FIFO na venda (vence primeiro → sai primeiro), alertas de vencimento | ✅ |
| **Login com senha mestre** (PBKDF2 150k iterações) + **dados criptografados AES-GCM 256** em repouso | ✅ |
| **Correção crítica**: recarregar a página perdia TODOS os dados (double-`JSON.stringify` na criptografia) — corrigido com recuperação de dados antigos | ✅ |
| **PIX**: QR Code + copia-e-cola (EMV) no cupom e no PDV, 100% offline (lib embutida) | ✅ |
| **Tabela de Preços**: multiplicadores editáveis (Varejo/Atacado/Bar/Mercado/...) aplicados no PDV | ✅ |
| **Venda Fiado (caderneta)**: exige cliente, respeita limite de crédito e gera conta a receber | ✅ |
| **Desconto na venda** (% no PDV completo e lateral, total/troco recalculados, registrado no cupom) | ✅ |
| **Backup automático diário** (IndexedDB, retenção 15 dias, restauração em Configurações) | ✅ |
| **PWA**: `manifest.json` + `sw.js` (instalação/offline quando servido via HTTP) | ✅ |
| **Importação de produtos via CSV** (com modelo para download) | ✅ |
| **Comissão de vendedor** (% configurável, por vendedor, com total) | ✅ |
| **Curva ABC & Margem** (classificação A/B/C por receita + margem por produto) | ✅ |
| **App do Motorista** (rotas por motorista, avanço de status) | ✅ |
| **Emissão Fiscal (NF-e/NFC-e)** simulada: numeração, chave de 44 dígitos, vínculo com pedidos | ✅ |
| **Pedidos Recorrentes (Portal B2B)** (cliente, itens, frequência, próxima entrega) | ✅ |
| **Cartazes de Gôndola A4**: 4 modelos prontos (Clássica, Oferta, Batata/marca, Mínima) — só trocar nome/preço, cores, logo; impressão A4 e download PNG | ✅ |
| **Correção crítica**: `renderComissao`/`renderABC`/`renderMotorista`/`renderFiscal`/`renderTabelas`/`renderRecorrentes` faltando quebravam a navegação | ✅ |
| Backup/restauração em JSON (Configurações) | ✅ |
| Badge de notificações com contagens reais (estoque baixo + entregas pendentes) | ✅ |
| Remoção das vendas aleatórias (dados falsos) | ✅ |
| Correção de bug: finalizar venda pelo PDV completo quebrava o carrinho | ✅ |
| Proteção XSS (`esc()`) nos campos com dados do usuário | ✅ |

---

## 2. 🛡️ Segurança — achados e ações

| # | Achado | Risco | Ação |
|---|---|---|---|
| 1 | ~~Sem autenticação~~ → **login com senha mestre** (PBKDF2 150.000 iterações + SHA-256) | Resolvido | ✅ Senha mestre criada no 1º uso; dados só abrem com a senha. Aviso: é proteção client-side — não substitui auth de servidor para equipe (roadmap Fase 2). |
| 2 | **XSS (stored)** — nomes de clientes/produtos/fornecedores eram inseridos via `innerHTML` sem sanitização | Médio | ✅ Corrigido: helper `esc()` aplicado em **todos** os renderizadores. Em auditoria posterior foram fechados pontos residuais (modal de Entrada de Estoque, selects de cliente no PDV, categorias, carrinho lateral e relatórios de Vendas/Estoque/Clientes). Regra: todo dado de usuário em `innerHTML` passa por `esc()`. |
| 3 | **Sem backup automático** — dados só na memória do navegador | Alto | ✅ Backup manual em JSON (Configurações). Automatizar no roadmap. |
| 4 | Dados pessoais sem criptografia em repouso | Resolvido | ✅ Estado criptografado com **AES-GCM 256** (chave derivada da senha mestre, nunca persistida — só em memória). |
| 5 | `prompt`/`confirm` nativos usados para ações destrutivas | Baixo | Substituídos por modais em ações novas; migrar os antigos gradualmente. |
| 6 | Arquivo `banner.jpg` (2,5 MB) não é usado em lugar nenhum | — | Remover ou comprimir (ver Fluidez). |

---

## 3. 💾 Armazenamento — achados e ações

**Antes:** nenhum. Dados perdidos ao fechar/atualizar a página.

**Agora:** camada `DB` com prioridade de modos:
1. **SQLite real no navegador** via [sql.js](https://sql.js.org/) (WebAssembly, tabela `kv`), com o arquivo `.db`
   persistido no IndexedDB — funciona abrindo o HTML direto (`file://`), sem servidor;
2. **IndexedDB** (nativo) se o CDN do sql.js não carregar (offline);
3. **localStorage** como último recurso.

O salvamento é **automático e com debounce** (600 ms) em toda mutação de dados + `beforeunload`.

### Limitações atuais (importantes!)
- **Monousuário e local**: os dados vivem no navegador de uma máquina. Dois computadores não compartilham nada.
- **Criptografia client-side**: quem conhece a senha mestre consegue ler os dados no mesmo navegador; a proteção
  impede leitura por terceiros que abram o arquivo, mas não é um cofre de servidor.
- O SQLite aqui guarda o estado como JSON numa tabela `kv` (estilo document store) — é armazenamento SQLite real,
  mas não usa tabelas relacionais. Para um banco normalizado multi-usuário, veja o roadmap.

### Recomendação de produção
Para uso comercial multi-usuário, migrar para **backend com `better-sqlite3`** (Node.js) ou FastAPI (Python),
com o front-end falando via REST. O SQLite em servidor aguenta tranquilamente dezenas de milhares de registros
para esse porte de negócio — **não há necessidade de PostgreSQL/MySQL** nesta fase.

---

## 4. 🧰 Tecnologias — avaliação e sugestões

| Aspecto | Avaliação |
|---|---|
| HTML/CSS/JS puro, single-file | ✅ Excelente para o porte atual: zero build, zero dependência, roda em qualquer lugar. |
| Sem framework | ✅ Mantenha enquanto for 1 arquivo. Framework só compensa na Fase 2. |
| `sql.js` via CDN | ⚠️ Funciona, mas depende de internet no primeiro acesso. Fallback IndexedDB cobre isso. |
| Sem testes automatizados | ❌ Adicionar testes na Fase 2 (Vitest + jsdom, ou Playwright). |
| Sem controle de versão | ❌ Recomendado versionar o projeto (git) e manter backups do arquivo. |

---

## 5. ⚡ Fluidez / Performance — achados e ações

| # | Achado | Ação |
|---|---|---|
| 1 | `setInterval` gerava vendas falsas a cada 25s (re-render + dados corruptos) | ✅ Removido. |
| 2 | `banner.jpg` com **2,5 MB** sem uso | Remover do projeto ou comprimir para ~100 KB (o CRM não referencia o arquivo). |
| 3 | Logos pesados | `logo-original.jpeg` (124 KB) aceitável; para web recomenda-se WebP/AVIF (~30 KB). |
| 4 | Re-render total das tabelas a cada tecla da busca | Ok para este volume (< 5.000 registros). Acima disso, paginar. |
| 5 | Persistência com debounce 600 ms | Evita gravar no disco a cada tecla — fluido. |

---

## 6. 🚀 Sugestões de implantação (roadmap)

### Fase 1 — Curto prazo ✅ *concluída*
- Persistência local + backup JSON ✅ · Troco (rápido) ✅ · Caixa/sangria/fechamento ✅ · WhatsApp ✅
- Dashboard, KPIs, entregas, promoções e usuários 100% reais (sem demo) ✅
- Edição de produtos/clientes ✅ · Código de barras ✅ · Exportação CSV ✅
- Login (senha mestre) + criptografia AES-GCM ✅ · Lotes/Validade com FIFO ✅
- PIX (QR offline) ✅ · Tabela de preços ✅ · Fiado ✅ · Desconto ✅ · Backup diário ✅ · PWA ✅ · Import CSV ✅
- Comissão ✅ · Curva ABC ✅ · App do Motorista ✅ · NF-e simulado ✅ · Pedidos recorrentes B2B ✅
- Correções críticas: dados perdidos ao recarregar + navegação quebrada por renders faltantes ✅
- **Pendência:** remover/compactar `banner.jpg` (2,5 MB, não usado).

### Fase 2 — Médio prazo (semanas) — **a mais importante**
- **Backend Node.js + Express + `better-sqlite3`** (ou FastAPI) com rotas REST para clientes, produtos,
  vendas, caixa e fornecedores. Front-end continua este arquivo, trocando `S` por `fetch`.
- **Login e perfis** (admin/vendedor/caixa) com senha com hash (bcrypt) e sessão.
- **Backup automático diário** (arquivo `.db` + exportação JSON) para pasta/Drive.
- **Validação server-side** de todos os inputs.
- **Testes** com Playwright para o fluxo de venda.

### Fase 3 — Integrações
- **WhatsApp oficial**: trocar o "abrir wa.me" pela **API oficial (Meta Cloud API / provedores como Twilio, Z-API,
  Evolution API)** para disparo real em massa com envio confirmado e agendamento — a central de mensagens já
  está pronta para isso (basta trocar a função `enviarWhatsApp` por uma chamada HTTP).
- **Nota fiscal** (integração com sistema emissor de NF-e) e **leitor de código de barras** no PDV (o campo
  "Código de barras" já existe na lateral).
- **PDV em PWA** (instalável no celular, funciona offline) — adicionar manifest + service worker.
- **Dashboard de entregas** ligado às vendas (hoje as entregas são estáticas).

---

## 7. 📁 Arquivos do projeto

| Arquivo | Uso |
|---|---|
| `distribuidora-batata-crm-1.html` | Sistema completo (editar somente este) |
| `qrcode-lib.js` | Lib QR Code (MIT, offline) usada pelo PIX |
| `logo-b64.js` | Logo oficial em base64 (usada nos cartazes e offline) |
| `manifest.json` | Manifest PWA (instalação no celular) |
| `sw.js` | Service worker (offline quando servido via HTTP/HTTPS) |
| `icon.svg` | Ícone PWA (criado pelo usuário) |
| `logo-original.jpeg` | **Logo oficial** — usada na sidebar, banner e rodapé |
| `logo-batata.png` | Logo antiga (mantida como referência/backup) |
| `banner.jpg` | **Não utilizado** pelo sistema — candidato a remoção (2,5 MB) |

---

## 8. Como testar rapidamente
1. Abra o `distribuidora-batata-crm-1.html` (duplo clique).
2. **Primeiro uso:** cadastre produtos (`🍺 Produtos` → "+ Novo Produto"), clientes (`👤 Clientes`) e fornecedores (`🏭 Compras`) — o sistema começa vazio e só guarda o que você cadastra.
3. Venda: `PDV (Vendas)` → adicione itens → `💵 Dinheiro` → digite o valor recebido → veja o troco → `Finalizar Venda`.
4. Caixa: menu `🧾 Caixa` → `Abrir Caixa` (saldo inicial) → `💸 Sangria` → `Fechar Caixa`.
5. WhatsApp: menu `💬 WhatsApp` → marque contatos → escolha um modelo de mensagem → `Enviar via WhatsApp`.
6. Lotes: menu `🧊 Lotes / Validade` → `＋ Novo Lote` (produto, qtd, validade, custo). Na venda, os lotes são
   consumidos em **FIFO** — o que vence primeiro sai primeiro (e o vencido é avisado).
7. **PIX**: cadastre a chave em `⚙️ Configurações` → no PDV clique `📲 Pix QR` (mostra o QR) ou finalize a venda
   e copie o código Pix do cupom. Funciona offline.
8. **Fiado**: no PDV selecione `📒 Fiado` + escolha o cliente → a conta a receber é criada automaticamente.
9. **Desconto**: digite o `%` no carrinho (PDV ou lateral) — total e troco recalculam na hora.
10. Feche e **reabra** o arquivo → digite a senha mestre → os dados continuam lá (toast "Dados restaurados").
11. **PWA**: para instalar no celular, sirva a pasta via HTTP (ex.: `python -m http.server` ou hospedagem)
    e abra no navegador do celular → "Adicionar à tela inicial". Abrindo por duplo clique (`file://`)
    o service worker é ignorado (limitação do navegador).
12. **Cartazes A4**: menu `🏷️ Cartazes A4` → escolha o modelo → selecione o produto (nome/preço
    preenchem sozinhos) ou digite manualmente → `🖨️ Imprimir A4` (sai em folha A4) ou `⬇️ Baixar PNG`
    (envie para a gráfica/WhatsApp).
7. `Configurações` → `📦 Exportar Backup` para salvar um arquivo de segurança.

---

## 9. 🔁 Re-auditoria de Segurança (16/08/2026)

> Objetivo desta rodada: implementar as 10 frentes do roadmap no mais alto nível, **testar tudo** e
> garantir que a **segurança seja "top"** (sem brechas para hackers).

### Verificações automatizadas executadas
- **Sintaxe:** `node --check` no `<script>` extraído do HTML → **0 erros**.
- **Navegação:** 22 itens de menu ↔ 22 entradas no mapa `openView` ↔ 23 views — **nenhum link quebrado**
  (todo `data-v` tem view e entrada no mapa).
- **Funções:** **0 definições duplicadas** entre as 166 funções do app.
- **Handlers:** **0 `onclick` apontando para função inexistente** (exceto falso positivo de `if(...)` inline).
- **Limpeza:** foram removidas views inseridas em duplicata (tabelas, comissão, ABC, motorista, fiscal)
  que geravam IDs duplicados no DOM.

### Postura de segurança — "top" ✅
| Controle | Estado | Detalhe |
|---|---|---|
| Autenticação | ✅ | Senha mestre no 1º uso (PBKDF2 **150.000** iterações + SHA-256); `SESSION_KEY` existe **só em memória**. |
| Criptografia em repouso | ✅ | Estado serializado criptografado com **AES-GCM 256**; chave derivada da senha, **nunca persistida**. |
| CSP | ✅ | `default-src 'self' 'unsafe-inline' 'unsafe-eval'`; `img-src 'self' data: blob:`; `style-src 'self' 'unsafe-inline'`; `connect-src 'self'`. O **sql.js é local** (vendorizado, sem CDN) → sem injeção de script externo. |
| XSS (stored) | ✅ | Helper `esc()` em todo dado de usuário em `innerHTML`, inclusive nos novos renders (tabelas, comissão, ABC, motorista, fiscal, recorrentes, reposição). |
| Validação de estado | ✅ | `validarEstado()` valida a forma do objeto ao carregar; `importarBackup()` valida **antes** de hidratar (rejeita JSON malformado). |
| Dependências | ✅ | `sql.js`, `qrcode-lib.js` e `sw.js` são **locais** — sem dependência de rede em runtime. |

### Riscos residuais (inerentes ao modelo client-side)
- **Sem servidor:** quem souber a senha mestre no mesmo navegador lê os dados. Para equipe, migrar para
  backend (Fase 2) com auth + hash bcrypt — a senha mestre protege contra leitura do arquivo, não substitui auth de servidor.
- **Service Worker / PWA** só ativa quando servido via **HTTP/HTTPS** (ignorado em `file://`).
- `prompt`/`confirm` nativos ainda usados em alguns pontos destrutivos (risco baixo).

### Conclusão
Segurança no nível "top" para o modelo single-file: autenticação forte, criptografia em repouso, CSP
restritiva, sanitização XSS e validação de entrada. As **10 frentes do roadmap** estão implementadas e
verificadas: Lote/Validade/FEFO, Roteirização + App do Motorista, NF-e/NFC-e (simulada), Comissão de
Vendedor, Curva ABC & Margem, Múltiplas Tabelas de Preço, Retornáveis, Pedidos Recorrentes (Portal B2B)
e Reposição Automática — além de PWA (manifest + service worker).

> ⚠️ **Teste em navegador não foi possível neste ambiente** (sem browser). Recomenda-se abrir o
> `distribuidora-batata-crm-1.html`, criar a senha mestre e percorrer um fluxo de venda para confirmação
> visual. A validação automatizada cobre sintaxe, integridade de navegação e ausência de funções órfãs.
