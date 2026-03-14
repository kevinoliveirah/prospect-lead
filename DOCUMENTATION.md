# 🚀 Documentação Master: Prospect Lead Pro

Seja bem-vindo à documentação oficial do **Prospect Lead Pro**. Este guia foi elaborado para ser a fonte definitiva de informação, cobrindo desde a operação comercial até os detalhes mais profundos da engenharia do sistema.

---

## 🧭 Navegação Rápida
- [🎯 Visão Geral do Produto](#-visão-geral-do-produto)
- [🏗️ Arquitetura e Fluxo de Dados](#️-arquitetura-e-fluxo-de-dados)
- [👤 Guia do Usuário (Operação VGV)](#-guia-do-usuário-operação-vgv)
- [🛠️ Guia do Desenvolvedor (Engenharia)](#️-guia-do-desenvolvedor-engenharia)
- [📡 Referência da API](#-referência-da-api)
- [🛡️ Segurança e Melhores Práticas](#️-segurança-e-melhores-práticas)

---

## 🎯 Visão Geral do Produto

O **Prospect Lead Pro** não é apenas um localizador de empresas; é um ecossistema de inteligência comercial. Ele resolve o problema da prospecção fria e demorada através de três pilares:

1.  **Descoberta Inteligente**: Usa dados brutos do Google Maps e os processa com IA.
2.  **Qualificação Automática**: Identifica faturamento e perfil B2B/B2C sem intervenção humana.
3.  **Gestão de Pipeline**: Um CRM Kanban fluido que mantém o foco no fechamento.

---

## 🏗️ Arquitetura do Sistema e Fluxo de Dados

Para entender "por baixo do kapô", aqui está como a informação viaja no sistema:

```mermaid
graph TD
    A["Usuário (SDR/Vendedor)"] -->|Busca: Segmento/Cidade| B["Frontend (Next.js 14)"]
    B -->|API Request (JSON/JWT)| C["Backend (Node.js/Express)"]
    C -->|Pesquisa Geográfica| D["Google Maps Places API"]
    D -->|Dados Brutos| C
    C -->|Processamento IA| E["Motor de Enriquecimento"]
    E -->|Classifica B2B/B2C + Faturamento| C
    C -->|Leads Qualificados| B
    B -->|Ação: Capturar Lead| C
    C -->|Persistência| F["Banco de Dados PostgreSQL"]
    B -->|Engajamento| G["WhatsApp Web / Mobile"]
```

### O Fluxo da Vitória (Business Logic)
1.  **Exploração**: O usuário define um nicho. O backend não apenas "repassa" a busca; ele filtra ruídos do Maps para garantir que apenas empresas com potencial comercial apareçam.
2.  **Qualificação**: Nossa lógica de IA analisa o nome, categoria e metadados. Se for uma "Indústria de Usinagem", ela ganha o selo **B2B**. Se for um "Pet Shop", ganha **B2C**.
3.  **Conversão**: O CRM Kanban organiza o caos. Quando você move um card, o sistema atualiza o timestamp da última ação, permitindo que gestores vejam a velocidade do funil.

---

## 👤 Guia do Usuário (Operação VGV)

Este guia é para vendas, gestores e SDRs que buscam bater metas.

### 2.1 Fluxo de Trabalho Ideal
1.  **A Exploração**: Vá até a página **Mapa**. Use termos específicos (ex: "Empresas de Logística em Joinville"). O mapa mostrará pontos estratégicos.
2.  **O Filtro de Ouro**: Observe os selos de classificação. Foque em empresas com perfil "B2B" e faturamento estimado compatível com seu ticket médio.
3.  **A Captura**: Ao clicar em salvar, o lead vai para a coluna **"Novo"** do seu CRM.

### 2.2 Dominando o CRM Kanban
- **Visualização**: Cards coloridos indicam o status.
- **Ação Rápida**: Clique no card para ver o telefone e o site original.
- **Notas de Ouro**: Durante a ligação, anote objeções e pontos fortes na seção de Notas. Isso fica salvo para sempre para quem for assumir a conta.

### 2.3 Atalho para a Venda (WhatsApp)
> [!TIP]
> Use os templates disponíveis. Eles foram testados para ter alta taxa de abertura. Basta escolher o template, clicar no ícone do WhatsApp e a conversa inicia já com o nome da empresa preenchido.

---

## 🛠️ Guia do Desenvolvedor (Engenharia)

Seção técnica para manutenção e expansão.

### 3.1 Stack de Tecnologia Elite
| Componente | Tecnologia | Papel |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 | Renderização, SEO e UX Reativa |
| **Styling** | Tailwind CSS | Design System Night Mode |
| **Backend** | Node.js + TS | Lógica de Negócio e Middlewares |
| **Database** | PostgreSQL | Armazenamento Relacional Robusto |
| **Auth** | JWT | Segurança de Sessão Stateless |

### 3.2 Estrutura do Monorepo
```
/
├── backend/            # API Server (TypeScript)
│   ├── src/
│   │   ├── controllers/# Lógica de rotas
│   │   ├── middleware/ # Auth e Validação
│   │   └── routes/     # Definições de Endpoints
│   └── tests/          # Suíte de testes unitários
├── frontend/           # Next.js Application
│   ├── app/            # App Router (Páginas e Layouts)
│   ├── components/     # UI Design System
│   └── context/        # Global States (Auth/Leads)
└── database/           # PostgreSQL Schema & Seeders
```

### 3.3 Guia de Configuração de "Ponta"
1.  **Instalação**: Rode `npm install` na raíz. (O sistema está preparado para gerenciar dependências de forma isolada).
2.  **Database**:
    - Crie o banco `prospect_lead_db`.
    - Importe o arquivo `/database/schema.sql`.
3.  **Secrets**: Crie o arquivo `.env` no backend seguindo o `.env.example`.
    - **CRITICAL**: Nunca compartilhe sua `GOOGLE_MAPS_API_KEY`.

---

## 📡 Referência da API

Consuma os dados do backend de forma programática:

| Método | Rota | Descrição | Protegido? |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Autentica e retorna Bearer Token | Não |
| `GET` | `/companies/search` | Busca empresas via Google Maps + IA | Sim |
| `GET` | `/leads` | Lista leads salvos no CRM | Sim |
| `PATCH` | `/leads/:id` | Altera status ou dados do lead | Sim |
| `POST` | `/ai/prospect` | Processamento manual via IA de uma lista | Sim |

---

## 🛡️ Segurança e Melhores Práticas

- **CORS**: Configurado para aceitar requisições apenas da URL do frontend definida no `.env`.
- **JWT**: Tokens com expiração definida (padrão 24h).
- **Sanitização**: Todas as entradas do banco passam por escapes do `pg-pool` para evitar SQL Injection.

---

> [!IMPORTANT]
> **Próximos Passos de Evolução**:
> - Integração com Webhooks de CRM Externos (Pipefy/Hubspot).
> - Dashboards de métricas por Vendedor.

---
### Prospect Lead Pro - A Inteligência por trás da prospecção de elite.
