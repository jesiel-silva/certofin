# 📘 Guia de Arquitetura e Manutenção — CertoFin

Este documento serve como referência técnica detalhada para qualquer desenvolvedor que vá realizar manutenção, correção ou novas implementações na aplicação **CertoFin**.

---

## 1. 🏗️ Visão Geral da Arquitetura

O CertoFin é um **SaaS de Gestão Financeira** construído sobre o ecossistema React/Next.js moderno, integrando banco de dados em tempo real e autenticação com o Supabase.

### Stack Tecnológica
* **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
* **Linguagem:** TypeScript (estrita tipagem, sem asserções forçadas `!`)
* **Banco de Dados & Auth:** [Supabase](https://supabase.com/) (PostgreSQL com RLS, `@supabase/ssr` e `@supabase/supabase-js`)
* **Estilização:** CSS Variables com temas Dark/Light nativos + Tailwind Utilities
* **Gráficos & Dashboards:** Recharts
* **Relatórios PDF:** jsPDF + jsPDF-AutoTable
* **Ícones:** Lucide React

---

## 2. 🗺️ Mapa de Diretórios e Arquivos

```
certofin/
├── public/                     # Arquivos estáticos (logos, favicons, ilustrações)
├── supabase/                   # Schemas SQL e migrações do banco de dados
│   ├── migrations/             # Scripts versionados de migração
│   └── schema.sql              # Schema consolidado de tabelas, RLS e RPCs
├── src/
│   ├── app/                    # Next.js App Router (Rotas da aplicação)
│   │   ├── (auth)/             # Grupo de rotas públicas de autenticação
│   │   │   ├── login/          # /login (Entrada no sistema)
│   │   │   ├── signup/         # /signup (Criação de nova conta)
│   │   │   ├── forgot-password/# /forgot-password (Recuperação de senha)
│   │   │   └── update-password/# /update-password (Redefinição de senha)
│   │   ├── (protected)/        # Grupo de rotas autenticadas (requer login)
│   │   │   ├── layout.tsx      # Wrapper do layout autenticado
│   │   │   ├── layout-client.tsx # Gerenciamento de estado da Sidebar/Header
│   │   │   ├── personal/       # Rotas do escopo Pessoal
│   │   │   │   ├── dashboard/  # /personal/dashboard (Dashboard principal)
│   │   │   │   ├── transactions/ # /personal/transactions (Listagem pessoal)
│   │   │   │   │   ├── new/    # /personal/transactions/new (Novo lançamento)
│   │   │   │   │   └── [id]/edit/ # /personal/transactions/[id]/edit (Editar)
│   │   │   │   ├── planos/     # /personal/planos (Visualização de planos)
│   │   │   │   ├── notifications/ # /personal/notifications (Central de avisos)
│   │   │   │   ├── settings/   # /personal/settings (Ajustes de perfil/conta)
│   │   │   │   └── ajuda/      # /personal/ajuda (Central de ajuda e FAQs)
│   │   │   └── business/       # Rotas do escopo Negócio (PJ)
│   │   │       └── transactions/ # /business/transactions (Listagem negócio)
│   │   │           ├── new/    # /business/transactions/new (Novo lançamento PJ)
│   │   │           └── [id]/edit/ # /business/transactions/[id]/edit (Editar PJ)
│   │   ├── api/                # Rotas de API HTTP (Webhooks, integrações)
│   │   │   ├── contact/        # Formulário de contato público
│   │   │   └── stripe/         # Integrações Stripe (Checkout, Portal, Webhook)
│   │   ├── confirm/            # Confirmação de e-mail pós-cadastro
│   │   ├── contato/            # Página pública de contato
│   │   ├── privacidade/        # Termos de privacidade (LGPD)
│   │   ├── termos/             # Termos de uso
│   │   ├── globals.css         # Variáveis de tema CSS, reset e scanlines
│   │   ├── layout.tsx          # Root Layout (ThemeProvider, Fontes, Metadados)
│   │   └── page.tsx            # Landing Page pública
│   ├── components/             # Componentes de UI modulares e reutilizáveis
│   │   ├── account/            # Modais de conta (ex: pesquisa de cancelamento)
│   │   ├── auth/               # Formulários de autenticação desacoplados
│   │   ├── dashboard/          # Cards de KPI, gráficos e comparativos mensais
│   │   ├── help/               # Views e accordions da Central de Ajuda
│   │   ├── layout/             # Sidebar, Header e sino de notificações
│   │   ├── notifications/      # Componentes da lista de notificações
│   │   ├── pricing/            # Cards de planos e tela de upgrade
│   │   ├── settings/           # Telas de configurações de perfil e avatar
│   │   ├── transactions/       # Listagem, formulário e relatórios PDF
│   │   └── ui/                 # Design System primitivo (Button, Card, Input, etc)
│   └── lib/                    # Camada de serviços, hooks, tipos e utilitários
│       ├── hooks/              # Custom React Hooks
│       │   ├── use-plan-limits.ts # Limites do plano (Free vs Pro)
│       │   └── use-notifications.ts # Notificações e contador de não lidas
│       ├── stripe/             # Instância e configurações do Stripe
│       ├── supabase/           # Configuração de clientes Supabase (Client, Server, Admin, Middleware)
│       ├── types.ts            # Definição centralizada de tipos TypeScript
│       └── utils.ts            # Formatadores de moeda, datas e manipuladores de classe
├── middleware.ts               # Middleware Next.js de proteção de rotas
├── DEVELOPER_GUIDE.md          # Este guia técnico
└── AGENTS.md                   # Diretrizes operacionais para IAs e engenheiros
```

---

## 3. 🔐 Fluxo de Autenticação e Sessão

1. **Clientes Supabase (`src/lib/supabase/`):**
   * `client.ts`: Usado em Client Components (`"use client"`). Obtém a sessão via cookies locais do navegador.
   * `server.ts`: Usado em Server Components e Server Actions, gerenciando cookies via `next/headers`.
   * `admin.ts`: Cliente com privilégios elevados (`SUPABASE_SERVICE_ROLE_KEY`), utilizado exclusivamente em rotas de API seguras (ex: webhooks, deleção de dados protegidos).
   * `middleware.ts`: Responsável por renovar tokens de sessão a cada requisição e proteger rotas restritas.

2. **Regra do Middleware (`middleware.ts`):**
   * Usuários não autenticados tentando acessar rotas sob `/(protected)/` (como `/personal/*` e `/business/*`) são redirecionados automaticamente para `/login`.
   * Usuários já autenticados tentando acessar `/login`, `/signup` ou `/forgot-password` são redirecionados para `/personal/dashboard`.

---

## 4. 💼 Separação de Escopos: Pessoal (`personal`) vs Negócio (`business`)

O CertoFin permite que o usuário gerencie finanças em dois escopos distintos:
* **`personal`:** Finanças pessoais (salário, moradia, mercado, etc). Disponível no plano Free e Pro.
* **`business`:** Finanças de empresa/MEI/PJ (vendas, notas, custos operacionais). Recurso exclusivo do **Plano Pro**.

### Regra de visualização:
* As transações e categorias possuem uma coluna `scope: 'personal' | 'business'`.
* No Dashboard Geral (`/personal/dashboard`), os dados são consolidados ou filtrados conforme os cards de KPI.
* Nas páginas de listagem (`/personal/transactions` e `/business/transactions`), o componente `TransactionList` recebe a prop `scope` para filtrar apenas o contexto desejado.

---

## 5. 💳 Sistema de Planos e Pagamentos

> ⚠️ **Status Atual: Em Decisão de Gateway (Stripe vs Asaas)**
> 
> Atualmente, a estrutura do Stripe está montada em `src/lib/stripe/` e `src/app/api/stripe/` como referência de implementação.
> Quando a decisão final entre **Stripe** ou **Asaas** for consolidada, este capítulo deverá ser atualizado com:
> - Configuração das chaves de API e Webhook Secret
> - Rotas de criação de checkout/assinatura
> - Tratamento de eventos de webhook (pagamento aprovado, renovação, cancelamento)
> - Sincronização do status na tabela `profiles`

### Controle de Acesso por Plano (`src/lib/hooks/use-plan-limits.ts`):
* **Plano Free:** Máximo de 10 lançamentos/mês, apenas escopo `personal`, sem lançamentos recorrentes.
* **Plano Pro / Trial:** Lançamentos ilimitados, acesso ao escopo `business`, lançamentos recorrentes liberados.

---

## 6. 🗄️ Banco de Dados (Supabase / PostgreSQL)

As migrações e scripts estão em `supabase/schema.sql`.

### Principais Tabelas:
1. **`profiles`:** Dados de usuário, nome, avatar, status de assinatura (`subscription_status`), identificador de cliente externo e período de trial (`trial_ends_at`, `trial_used_at`).
2. **`categories`:** Categorias de receitas e despesas vinculadas por `user_id`, `scope` e `type`.
3. **`transactions`:** Lançamentos financeiros com valor, datas, status (`pending` | `paid`), frequência (`one_time` | `monthly`), recorrência e escopo.
4. **`notifications`:** Avisos de vencimento, comparativos mensais e alertas do sistema.

### RPCs (Stored Procedures):
* `get_user_plan_info(user_uuid)`: Retorna o total de transações do mês e os limites vigentes do usuário.
* `refresh_notifications(user_uuid)`: Gera automaticamente notificações de contas a vencer ou vencidas com base nos lançamentos pendentes.

---

## 7. 🎯 Padrões e Convenções de Desenvolvimento

Para garantir a estabilidade e manutenibilidade do código:

1. **Páginas vs Componentes:**
   * Os arquivos de rota `src/app/**/page.tsx` devem atuar primariamente como **wrappers leves** e receptores de parâmetros.
   * A lógica de renderização, formulários e estados complexos deve residir em `src/components/<domínio>/`.

2. **Tipagem e Segurança:**
   * **Nunca** utilize non-null assertions `!` sem uma verificação prévia de nulidade.
   * Sempre valide tipos rodando `npx tsc --noEmit` após cada alteração.

3. **Design System & CSS:**
   * Utilize as variáveis semânticas definidas em `globals.css`:
     * Backgrounds: `var(--background)`, `var(--card)`, `var(--accent)`
     * Cores de Texto: `var(--foreground)`, `var(--muted-foreground)`
     * Cores de Estado: `var(--primary)`, `var(--success)`, `var(--destructive)`, `var(--warning)`
     * Cores Financeiras: `var(--income)`, `var(--expense)`

4. **Tratamento de Erros:**
   * Todas as chamadas ao Supabase ou APIs externas devem conter blocos `try/catch` e verificação da propriedade `error` do Supabase.

---

## 8. 🚀 Como Adicionar uma Nova Funcionalidade

Ao implementar uma nova tela ou fluxo no sistema:

1. **Defina os Tipos:** Adicione ou estenda as interfaces em `src/lib/types.ts`.
2. **Crie o Componente:** Desenvolva o componente de visualização dentro de `src/components/<area>/<nome>-view.tsx`.
3. **Crie a Rota:** Crie a pasta correspondente em `src/app/(protected)/<escopo>/<nome>/page.tsx` e importe o componente.
4. **Atualize a Navegação:** Se for um item de menu, adicione o link no `src/components/layout/sidebar.tsx`.
5. **Valide os Tipos:** Execute `npx tsc --noEmit` no terminal para garantir que não há regressões.

---

## 9. 🔄 Lógica de Lançamentos Recorrentes e Dashboard

### Transações Recorrentes (`frequency: "monthly" / is_recurring: true`):
1. **Templates no Banco:**
   * Quando uma transação mensal é criada, ela atua como um *template* com `is_recurring = true`.
   * Quando marcada como paga, `last_paid_date` armazena a data de pagamento (`YYYY-MM-DD`).
   * A cada pagamento, o sistema gera a próxima ocorrência para o mês seguinte com a tag `[auto_recurring:<id>]` nas notas.

2. **Cálculo no Dashboard (`src/components/dashboard/dashboard-view.tsx`):**
   * O Dashboard considera no somatório de receitas e despesas tanto as transações normais (`!t.is_recurring`) quanto as templates recorrentes do mês (`isRecurringPaidForMonth` e `isRecurringPendingForMonth`).
   * A verificação de tela vazia (`isEmpty`) verifica conjuntamente transações regulares e templates recorrentes do mês selecionado.
   * O histórico mensal (`calcMonthlyHistory`) mapeia todos os meses presentes em transações e templates recorrentes para construir os gráficos de evolução e comparação.

