# 🍺 Distribuidora do Batata — CRM Completo para Distribuidoras de Bebidas

Sistema **100% client-side** (um único arquivo HTML) para gestão de distribuidoras de bebidas:
PDV, estoque, lotes/validade (FEFO), rotas, fiscal, comissão, curva ABC, retornáveis,
pedidos recorrentes e muito mais. **Sem servidor, sem build, roda em qualquer lugar.**

> Zero dependências de rede em runtime: SQLite, QR Code e Service Worker são **locais** (vendorizados).

---

## ✨ Funcionalidades

| Área | O que tem |
|---|---|
| **PDV** | Dinheiro, Pix (QR offline), Fiado e Cartão · troco · desconto · cupom · código de barras |
| **Estoque** | Controle de estoque, categorias, alertas e **reposição automática sugerida** (por velocidade de venda) |
| **Lotes / Validade** | Controle por lote (validade, custo) com consumo **FEFO** (vence primeiro → sai primeiro) e alertas |
| **Caixa** | Abertura, sangria, fechamento e histórico de fechamentos |
| **Entregas & Rotas** | Cadastro, iniciar/confirmar, **roteirização por zona** e **App do Motorista** |
| **Fiscal** | Emissão **NF-e/NFC-e (simulada)**: numeração, chave de 44 dígitos, vínculo com pedidos |
| **Comissão** | % configurável por vendedor, com total |
| **Curva ABC** | Classificação A/B/C por receita + margem de contribuição |
| **Tabelas de Preço** | Múltiplos multiplicadores (Varejo/Atacado/Bar/Mercado) aplicados no PDV por cliente |
| **Retornáveis** | Garrafas emprestadas/devolvidas por cliente |
| **Pedidos Recorrentes** | Portal B2B: cliente, itens, frequência e próxima entrega |
| **Dashboard & KPIs** | Indicadores e relatórios **100% reais** (sem dados fictícios) |
| **WhatsApp** | Central de mensagens com modelos pré-prontos |
| **PWA** | Instalável e funciona offline (quando servido via HTTP) |

---

## 🔐 Segurança (top)

- **Login com senha mestre** no 1º uso (PBKDF2 **150.000** iterações + SHA-256).
- **Criptografia em repouso** com **AES-GCM 256** — a chave é derivada da senha e existe **só em memória**.
- **CSP restritiva** (`default-src 'self'`), sem injeção de script externo.
- **Proteção XSS**: todo dado do usuário em `innerHTML` passa por `esc()`.
- **Validação de entrada**: `validarEstado()` na carga e `importarBackup()` antes de hidratar.
- **"Esqueci a senha"** com reset seguro (apaga os dados locais criptografados).

> ⚠️ Modelo client-side: quem souber a senha no mesmo navegador lê os dados. Para equipe,
> migre para backend (ver Roadmap). A senha protege contra leitura do arquivo, não substitui auth de servidor.

---

## 🚀 Como usar

1. Abra `distribuidora-batata-crm-1.html` (duplo clique) **ou** sirva via HTTP.
2. Crie a **senha mestre** no primeiro acesso.
3. Cadastre produtos, clientes e fornecedores (o sistema inicia vazio).
4. Venda no PDV, controle estoque, caixa, entregas, rotas e fiscal.

### 📲 Instalar no celular (PWA)
Para instalar e usar offline, sirva a pasta via HTTP:

```bash
python -m http.server 8000
```

No celular, abra `http://SEU_IP:8000/distribuidora-batata-crm-1.html` → "Adicionar à tela inicial".
> Abrindo direto por `file://` o Service Worker é ignorado (limitação do navegador).

### 💾 Backup
- **Manual**: `Configurações → Exportar Backup` (JSON).
- **Automático**: diário no navegador (retenção 15 dias), restaurável em `Configurações → Importar Backup`.
- **Reset de senha**: `Esqueci a senha` apaga os dados locais e cria uma nova senha (os dados antigos são irreversíveis).

---

## 💾 Armazenamento

Camada `DB` com prioridade:
1. **SQLite local** via [sql.js](https://sql.js.org/) (WebAssembly), persistido no IndexedDB — funciona até abrindo o HTML direto (`file://`).
2. **IndexedDB** (nativo) como fallback.
3. **localStorage** como último recurso.

Salvamento automático com *debounce* (600 ms) + `beforeunload`.

---

## 📁 Estrutura do projeto

| Arquivo | Uso |
|---|---|
| `distribuidora-batata-crm-1.html` | Sistema completo (editar somente este) |
| `AUDITORIA.md` | Auditoria de segurança e roadmap detalhado |
| `manifest.json` / `sw.js` / `icon.svg` | PWA (instalação/offline) |
| `qrcode-lib.js` | Lib QR Code (MIT, offline) do Pix |
| `sql-wasm.js` / `sql-wasm.wasm` / `sql-wasm-b64.js` | SQLite local (offline) |
| `logo-original.jpeg` / `logo-batata.png` / `logo-b64.js` | Logos |

---

## 🧭 Roadmap

### Fase 2 — Backend (recomendado)
- Backend Node.js + Express + `better-sqlite3` (ou FastAPI) com rotas REST.
- Login e perfis (admin/vendedor/caixa) com hash (bcrypt) e sessão.
- Backup automático em arquivo + validação server-side.
- Testes (Playwright) do fluxo de venda.

### Fase 3 — Integrações
- **WhatsApp oficial** (Meta Cloud API / Twilio / Evolution API) para disparo real.
- **NF-e integrada** com emissor oficial.
- **Leitor de código de barras** no PDV.

---

## ⚠️ Aviso

Este é um modelo **single-file, monousuário e local**. Os dados vivem no navegador de uma máquina.
Para uso comercial multi-usuário, siga o roadmap (backend). Veja `AUDITORIA.md` para detalhes de
segurança, armazenamento e limitações.

---

Feito com 🍺 para a Distribuidora do Batata.
