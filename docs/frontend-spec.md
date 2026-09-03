# Spec do Frontend — AprovAI

Spec-driven development: este documento é a fonte da verdade antes de qualquer linha de código do front. Toda tela, modal e chamada de API listada aqui deve existir; nada deve existir que não esteja aqui. Divergência encontrada durante a implementação atualiza este arquivo primeiro, código depois.

Backend de referência: `aprovia-api`, prefixo `/api`, ~130 rotas, 4 perfis (`REQUESTER`, `APPROVER`, `FINANCE_ADMIN`, `SuperAdmin`).

---

## 0. Princípios e stack

### 0.1 Stack

| camada | escolha |
|---|---|
| build | Vite |
| framework | React 19 + TypeScript |
| roteamento | React Router v7, `<BrowserRouter>` + `<Routes>` |
| estado de servidor | TanStack Query — toda chamada de API passa por ele, zero `useEffect` + `fetch` manual |
| estado de formulário | React Hook Form + Zod nas telas de auth e onboarding; estado local nas telas de configuração, onde o salvamento é por campo |
| UI | shadcn/ui sobre Base UI + Tailwind CSS |
| tabelas | `<DataTable>` própria (`components/ui/data-table.tsx`), sem TanStack Table |
| ícones | `@phosphor-icons/react` |
| datas | `Intl.DateTimeFormat` / `toLocaleDateString`, sem biblioteca |
| notificação de UI (toast) | sonner (padrão shadcn) |

Estas escolhas divergem do que este spec listava antes (React 18, data routers, TanStack Table, lucide-react, date-fns). O código nunca usou nenhuma delas: a tabela acima descreve o que está instalado. Trocar qualquer uma agora seria reescrever telas que funcionam, então o spec é que se ajusta.

### 0.2 Princípios de implementação

- **Nenhum componente chama `fetch` direto.** Toda chamada de API vive em `src/api/<domínio>.ts`, tipada, consumida via hook do TanStack Query em `src/hooks/<domínio>/`.
- **Dinheiro nunca é `number`.** A API devolve centavos como string (`"850000"`). O front formata com `Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'})` dividindo por 100 apenas na exibição — nunca soma/subtrai em ponto flutuante no front. Cálculos de total exibido replicam o que a API já mandou, não recalculam.
- **Erro da API é a fonte da mensagem.** O backend já devolve mensagens em português, para leigos (ver `docs/procure-to-pay.md` e o histórico de reescrita de erros). O front exibe `error.message` direto no toast — não reescreve, não genericiza para "algo deu errado".
- **Cada tela declara o(s) perfil(is) que a acessam.** Rotas fora do perfil do usuário logado nem aparecem no menu — não é seguranca (isso é o backend), é não confundir quem não pode agir ali.
- **Toda action destrutiva ou irreversível passa por confirmação.** Modal de confirmação nomeado explicitamente nas specs de tela abaixo sempre que a ação for `DELETE`, cancelamento, ou perda de dado.
- **Paginação segue o contrato único `{ items, meta: { total, page, perPage, totalPages } }`.** O tipo `PageMeta` e o componente `<DataTablePagination>` vivem em `components/ui/data-table.tsx` e servem todas as listagens.
  - Endpoints que já paginam no servidor alimentam `meta` direto da resposta.
  - Endpoints que hoje devolvem array puro (`GET /members`, `GET /cost-centers`, `GET /budgets/{id}/entries`) passam pelo helper `localPage(rows, page, perPage)`, que produz o mesmo `{ items, meta }`. A UI é idêntica nos dois casos: quando esses endpoints ganharem paginação no servidor, troca-se o helper pela resposta da API sem tocar na tela.

### 0.3 Estrutura de pastas

```
src/
├── api/                        # 1 arquivo por domínio do backend, funções tipadas puras
│   ├── client.ts                # instância axios/fetch base, credentials:'include', interceptor 401
│   ├── auth.ts
│   ├── companies.ts
│   ├── members.ts
│   ├── invites.ts
│   ├── cost-centers.ts
│   ├── approval-rules.ts
│   ├── categories.ts
│   ├── suppliers.ts
│   ├── budgets.ts
│   ├── purchase-requests.ts
│   ├── email-approvals.ts
│   ├── purchase-orders.ts
│   ├── receipts.ts
│   ├── invoices.ts
│   ├── matching.ts
│   ├── payables.ts
│   ├── notifications.ts
│   ├── audit-logs.ts
│   ├── analytics.ts
│   ├── billing.ts
│   ├── platform.ts
│   └── users.ts
├── hooks/                       # useQuery/useMutation por domínio, mesmo particionamento de api/
├── types/                       # tipos TS espelhando os DTOs de resposta (gerados ou mão)
├── components/
│   ├── ui/                      # shadcn — Button, Input, Dialog, Table, Select, etc.
│   ├── shared/                  # DataTable, StatusBadge, MoneyDisplay, EmptyState, ConfirmDialog, PageHeader
│   └── layout/                  # AppShell, Sidebar, Topbar, RoleGuard
├── features/                    # 1 pasta por domínio, telas + modais + forms daquele domínio
│   ├── auth/
│   ├── onboarding/
│   ├── company/
│   ├── members/
│   ├── invites/
│   ├── cost-centers/
│   ├── approval-rules/
│   ├── categories/
│   ├── suppliers/
│   ├── budgets/
│   ├── purchase-requests/
│   ├── email-approvals/
│   ├── purchase-orders/
│   ├── receipts/
│   ├── conferral/
│   ├── payables/
│   ├── notifications/
│   ├── audit-logs/
│   ├── analytics/
│   ├── billing/
│   ├── platform/
│   └── profile/
├── routes/                       # definição das rotas React Router, 1 arquivo por área
│   ├── guards.tsx                # RequireAuth, RequireCompany, RequireOnboarding, RedirectIfAuthenticated
│   ├── public-routes.tsx         # rotas de token (verificação, reset) e de visitante (login, registro)
│   ├── onboarding-routes.tsx     # criação de empresa e progresso do onboarding
│   └── app-routes.tsx            # tudo sob AppLayout, agrupado por RoleGuard
└── lib/                          # money.ts, cnpj.ts, people.ts, permissions.ts,
                                  # nav-icons.ts, status-labels.ts, utils.ts (cn)
```

### 0.4 Componentes compartilhados (construir antes de qualquer tela)

| componente | usado em | contrato |
|---|---|---|
| `<DataTable>` | toda listagem (~15 telas) | recebe `columns: DataTableColumn<T>[]`, `rows`, `rowKey`; opcionais `sort`/`onSortChange`, `selection`/`onSelectionChange`, `onRowClick`, `isLoading`, `empty`, `rowActions`, `rowAccent`. Acompanham: `<DataTableShell>` (card + título + contador + toolbar + footer), `<DataTablePagination>`, `<StatusPill>`, `<StatusDot>`, `<CellPerson>`, `<RowAction>`, `<TableToolbar>`, `<TableSearch>`, `<TableSegments>` |
| `<StatusPill>` | qualquer enum de status (`RequestStatus`, `PurchaseOrderStatus`, `InvoiceStatus`, `MatchStatus`, `PayableStatus`, `InviteStatus`...) | recebe `tone` (`neutral`/`brand`/`success`/`warning`/`danger`) e o rótulo como filho. Os mapas `enum → label pt-BR` vivem em `types/enums.ts`, ao lado do enum que espelham — ver nota abaixo |
| `<StatusDot>` | coluna de estado dentro de listagem densa | ponto de cor + rótulo, sem cápsula de fundo. Recebe `tone` e `label`. Substitui `<StatusPill>` **dentro de tabela**: numa coluna em que quase toda linha está no mesmo estado, a cápsula colorida vira mancha; o ponto entrega o mesmo dado com muito menos tinta. A cápsula (`<StatusPill>`) continua sendo a escolha certa fora de tabela — cabeçalho de detalhe, onde o status é dado isolado |
| `<RowAction>` | ações por linha (editar, arquivar, abrir) | botão-ícone de 28px que aparece no hover/foco da linha. Recebe `icon`, `label` (vira `aria-label` e `title`), `onClick`, `tone`. Vive na coluna que `rowActions` reserva no fim da tabela — nunca posicionado por cima de outra coluna |
| `<TableToolbar>` + `<TableSearch>` + `<TableSegments>` | barra acima da tabela | `<TableSearch>` traz atalho `/` para focar e `Esc` para limpar; `<TableSegments>` são filtros com a contagem embutida, e o segmento com contagem zero fica apagado em vez de sumir (some/aparece faria a barra dançar conforme o dado muda) |
| `<MoneyDisplay>` | qualquer valor `*Cents` | recebe string de centavos, formata BRL |
| `<ConfirmDialog>` | toda ação destrutiva/irreversível | título, descrição, campo de justificativa opcional (usado em cancelamentos que exigem `reason`), botão de confirmação com `isPending` |
| `<EmptyState>` | toda lista vazia | ícone, texto, opcionalmente botão de ação primária |
| `<PageHeader>` | topo de toda tela | título, breadcrumb, slot de ação primária à direita |
| `<RoleGuard>` | em torno de rotas/blocos de UI | recebe `allow: CompanyMemberRole[]`, esconde/redireciona se o perfil do usuário não estiver na lista |
| `<FileDropzone>` | upload de anexos e XML | `components/shared/file-dropzone.tsx`. Recebe `onSelect(file)`, `accept?` (lista de extensões), `isUploading`, `label`, `hint`. Faz drag-and-drop e seleção manual, mostra o estado de envio e recusa a extensão errada antes de chamar a API, com a mensagem no próprio componente |

**Densidade e anatomia da linha.** A linha tem 56px de altura, célula em `text-label` e cabeçalho sobre a mesma superfície do card — sem faixa cinza, separado só pela borda. Abaixo de `sm` a tabela deixa de ser tabela e vira lista de cartões (primeira coluna vira título, as demais viram pares rótulo-valor), porque rolagem horizontal no celular esconde justamente a coluna de valor. A hierarquia dentro da linha vem do **peso**, não do tamanho — nome em `font-medium`, identificador secundário (CNPJ, e-mail, descrição) em `text-micro` cinza logo abaixo. Detalhes de implementação em `docs/design-spec.md` §3.1.

**Ações de linha têm coluna própria.** `rowActions` reserva uma coluna no fim da tabela, tanto no cabeçalho quanto nas linhas. As ações aparecem no hover/foco, mas o espaço existe sempre — posicionar por cima de outra coluna (`absolute`) faz o ícone cobrir o dado, e foi assim que a primeira versão desta tela quebrou.

**Rótulos de enum ficam em `types/enums.ts`, não em `lib/status-labels.ts`.** Uma versão anterior deste spec previa um arquivo separado só para os mapas de label. Na implementação isso se mostrou pior: o enum e o texto que o traduz mudam juntos (uma variante nova no backend exige as duas edições), e separá-los em arquivos distintos abre espaço para um ficar sem o outro. Cada enum e seu mapa (`CompanyMemberRole` + `ROLE_LABELS`, `BudgetEntryType` + `BUDGET_ENTRY_TYPE_LABELS`, …) moram no mesmo arquivo, e o `tone` visual é decidido na tela — porque a mesma variante pode ser neutra numa listagem e de destaque em outra.

---

## 1. Autenticação

**Os caminhos de token ficam em inglês de propósito.** `/verify-email`, `/reset-password` e `/confirm-password-change` são montados por `auth-mail.service.ts` e já foram para caixas de entrada: traduzir quebraria links vivos. O resto da navegação segue em português. Versões anteriores deste spec listavam `/verificar-email`, `/login` e `/redefinir-senha`, que nunca existiram no código.

Cobre: `POST /auth/register`, `GET /auth/verify-email`, `POST /auth/resend-verification`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/change-password`, `POST /auth/confirm-password-change`, `POST /auth/logout`.

Autenticação é por cookie `httpOnly` (`access_token`, `refresh_token`) — o cliente HTTP do front usa `credentials: 'include'` em toda chamada; nunca armazena token em `localStorage`.

### 1.1 Tela — Cadastro (`/registrar`)
- **Acesso**: público.
- **Form**: nome, e-mail, senha (+confirmação), checkbox de aceite de termos.
- **API**: `POST /auth/register`.
- **Sucesso**: a própria tela troca para o estado "confirme seu e-mail" (1.2). Não há redirect: o e-mail vem de `registerMutation.data.email`, da resposta da API.
- **Erro**: e-mail já cadastrado → mensagem da API inline no campo e-mail.

### 1.2 Estado — Confirme seu e-mail (dentro de `/registrar`)
- **Não tem rota própria.** É o componente `VerificationSent`, que `RegisterPage` renderiza quando a mutação de cadastro tem sucesso.
- Mostra o e-mail informado, botão "reenviar e-mail" → `POST /auth/resend-verification`, com cooldown de 60s no botão (evita spam de clique).
- Uma versão anterior deste spec pedia a rota `/registrar/confirme-seu-email?email=`. Ficou como estado porque o e-mail já está em memória (não precisa trafegar na URL, onde entraria no histórico do navegador) e porque uma rota alcançável "só via redirect" fica quebrada em acesso direto. O custo: recarregar a página perde o aviso e volta ao formulário.

### 1.3 Tela — Verificação de e-mail (`/verify-email`)
- **Acesso**: público, via link do e-mail (`?token=`).
- Chama `GET /auth/verify-email?token=` no mount. Três estados: carregando, sucesso (botão "ir para o login"), erro (token expirado/inválido, botão "reenviar verificação").

### 1.4 Tela — Login (`/entrar`)
- **Acesso**: público.
- **Form**: e-mail, senha, link "esqueci minha senha".
- **API**: `POST /auth/login`.
- **Erro 403 `EmailNotVerified`**: mostra banner com botão "reenviar e-mail de confirmação" em vez de erro genérico.
- **Sucesso sem empresa ativa**: redireciona para onboarding de criação de empresa (seção 2).
- **Sucesso com empresa ativa**: redireciona para `/` (dashboard do perfil).

### 1.5 Tela — Esqueci minha senha (`/esqueci-a-senha`)
- **Form**: e-mail.
- **API**: `POST /auth/forgot-password` — sempre mostra a mesma mensagem de sucesso, independente do e-mail existir (não vaza existência de conta, é intencional no backend).

### 1.6 Tela — Redefinir senha (`/reset-password`)
- **Acesso**: público, via link do e-mail (`?token=`).
- **Form**: nova senha + confirmação.
- **API**: `POST /auth/reset-password`.
- **Sucesso**: redireciona ao login com toast de confirmação.

### 1.7 Modal — Alterar senha (dentro de `/perfil`)
- **Form**: senha atual, nova senha, confirmação. A nova senha mostra as duas regras ao vivo (8 caracteres, diferente da atual) em vez de só reprovar no envio.
- **API**: `POST /auth/change-password` (dispara e-mail de confirmação) → usuário confirma clicando no link do e-mail → `/confirm-password-change`, que chama `POST /auth/confirm-password-change`.
- **É modal, não tela própria.** Uma versão anterior deste spec pedia tela em `/conta/senha`, argumentando que a confirmação por e-mail não caberia num modal que fecha. Na prática cabe: o modal troca para um estado de confirmação — “mandamos um link para seu@email, a senha só muda quando você clicar, e sua senha atual continua valendo” — que informa mais do que um toast e não tira a pessoa do perfil. O §19.1 já previa modal, então este item era também uma contradição interna do spec.
- `/conta/senha` permanece como redirecionamento para `/perfil`, para links antigos. Nenhum e-mail aponta para ela.

### 1.8 Ação — Logout
- Botão no menu do usuário (topbar). `POST /auth/logout`, limpa cache do TanStack Query, redireciona para `/entrar`.

### 1.9 Sessão / refresh
- Não é tela. Interceptor no `api/client.ts`: em qualquer 401, tenta `POST /auth/refresh` uma vez; se falhar, chama o handler registrado, que apenas **zera a sessão no cache**. O interceptor não navega — quem redireciona é o guard `RequireAuth`, para `/entrar?redirect={rota atual}`, preservando o destino. Manter o roteador fora da camada de API é proposital.
- `GET /auth/me` roda pelo hook `useSession()` sobre o TanStack Query, não por um `AuthProvider`: o cache da query já é o estado compartilhado.

---

## 2. Onboarding

Cobre: `POST /companies`, `GET /companies/me`, `GET /onboarding`, `GET /onboarding/cnpj/{cnpj}`, `PATCH /onboarding/step`, `POST /onboarding/complete`.

Fluxo obrigatório e sequencial, sem pular etapa — `GET /onboarding` devolve `{ canComplete, requirements: [{key, met}] }`, que dirige qual tela mostrar.

### 2.1 Tela — Criar empresa (`/onboarding/empresa`)
- **Acesso**: usuário logado sem `companyId` na sessão.
- **Form**: CNPJ (com botão "buscar dados" → `GET /onboarding/cnpj/{cnpj}` pré-preenche razão social/nome fantasia), razão social, nome fantasia, ramo, porte.
- **API**: `POST /companies`.
- **Efeito colateral importante**: após criar a empresa, é preciso forçar novo login (o cookie antigo não carrega `companyId`) — mostrar tela intermediária "empresa criada, entrando..." que dispara `POST /auth/login` silencioso ou solicita login de novo.

### 2.2 Tela — Progresso do onboarding (`/onboarding`)
- **Acesso**: usuário com empresa, onboarding não `DONE`.
- Stepper visual com as etapas de `OnboardingStep` (`ACCOUNT → COMPANY → TEAM → REVIEW → DONE`).
- Lista de requisitos pendentes vindos de `GET /onboarding` (ex: "crie ao menos um Centro de Custo com gestor definido").
- Cada requisito pendente linka para a tela relevante (Centro de Custo, matriz de alçadas).

**Links de notificação.** `notification-templates.ts` grava o caminho de destino na coluna `link` da notificação, no momento em que ela nasce: o valor é congelado, então mudar a rota depois exige corrigir também as linhas já gravadas. Os caminhos precisam bater com `src/routes/` do front, incluindo os de telas ainda não construídas (`/ordens-de-compra`, `/conferencia/notas`, `/conferencia/resultado`, `/contas-a-pagar`).
- Botão "concluir configuração" habilitado só quando `canComplete: true` → `POST /onboarding/complete`.
- Se `POST /onboarding/complete` voltar 409, mostra a lista de pendências do corpo do erro.

---

## 3. Empresa

Cobre: `GET /companies/me`, `PATCH /companies/me`, `PATCH /companies/me/policy`.

### 3.1 Tela — Dados da empresa (`/empresa/dados`)
- **Acesso**: `FINANCE_ADMIN`.
- Form read+edit: razão social, nome fantasia, CNPJ (read-only, não editável), ramo, porte.
- **API**: `GET /companies/me` no load, `PATCH /companies/me` no submit.

### 3.2 Tela — Política da empresa (`/empresa/politica`)
- **Acesso**: `FINANCE_ADMIN`.
- Cinco grupos, cada um com os campos que mudam juntos: **Orçamento** (`overrunTolerancePercent`), **Pedido parado** (`reminderHours`, `escalationHours`), **Dupla assinatura** (`dualApprovalThresholdCents`), **Conferência da nota fiscal** (`priceTolerancePercent`, `quantityTolerancePercent`, `requiresReceiptBeforeInvoice`, `matchRequiredAboveCents`, `autoReleaseOnMatch`) e **Ordens de compra** (`poNumberPrefix`).
- Em vez de tooltip, cada campo mostra a consequência **calculada ao vivo** abaixo do controle: a tolerância vira "um centro com R$ 10.000 de teto aceita até R$ 10.500", as horas viram "entra → lembra em 1 dia útil → escala em 3 dias úteis", o prefixo vira "a próxima ordem fica OC-2026-0001". Explicação que reage ao valor ensina mais que texto fixo escondido no hover.
- Os cinco campos de procure-to-pay ficaram um tempo inacessíveis: existiam no banco e na entidade, mas nem `CompanyResponseDto` os expunha nem `UpdateCompanyPolicyDto` os aceitava. Corrigido nos dois DTOs e no `updatePolicy` do repositório.
- **API**: `PATCH /companies/me/policy`.

---

## 4. Equipe e convites

Cobre: `POST /invites`, `GET /invites`, `GET /invites/token/{token}`, `POST /invites/token/{token}/accept`, `POST /invites/{id}/resend`, `DELETE /invites/{id}`, `GET /members`, `GET /members/{id}`, `PATCH /members/{id}/role`, `PATCH /members/{id}/limit`, `PATCH /members/{id}/manager`, `PATCH /members/me/substitute`, `GET /members/{id}/responsibilities`, `DELETE /members/{id}`.

### 4.1 Tela — Equipe (`/equipe`)
- **Acesso**: todos os perfis veem (listagem), ações restritas a `FINANCE_ADMIN`.
- `<DataTable>` de `GET /members`: pessoa (avatar + nome + e-mail), perfil (`<StatusPill>` de `CompanyMemberRole`), alçada, líder direto. Ordenável por pessoa/perfil/alçada, com busca por nome ou e-mail e paginação.
- **Não há coluna "situação".** `GET /members` devolve apenas membros ativos — a coluna seria constante. Quem foi inativado sai da lista; o histórico dele permanece nos pedidos.
- Linha de indicadores no topo: pessoas ativas, quantas podem aprovar, **quantas estão sem líder definido** (em âmbar quando > 0 — significa que pedidos acima do teto travam) e ausentes hoje.
- Bloco "Quem decide cada faixa": as faixas de valor derivadas das alçadas cadastradas, cada uma listando todos que a cobrem. Responde "um pedido de R$ X vai para quem?" e expõe faixas com um único aprovador.
- Seleção múltipla habilita ações em massa (`FINANCE_ADMIN`): vincular as pessoas escolhidas a um Centro de Custo, ou inativá-las.
- Ação "convidar membro" (só `FINANCE_ADMIN`) abre modal 4.3.
- Aba secundária "Convites pendentes" lista `GET /invites`, com ações reenviar (`POST /invites/{id}/resend`) e revogar (`DELETE /invites/{id}`, via `<ConfirmDialog>`).
- Linha da tabela expande para detalhe do membro (rota `/equipe/{id}`).

### 4.2 Tela — Detalhe do membro (`/equipe/{id}`)
- **Acesso**: `FINANCE_ADMIN` para editar; outros perfis veem somente leitura os próprios dados via perfil (seção 20), não esta tela.
- Seções editáveis, cada uma com seu próprio submit:
  - **Papel**: select `CompanyMemberRole` → `PATCH /members/{id}/role`. Se a API retornar `LastAdminError` (409), mostra o erro inline, não deixa trocar.
  - **Alçada de aprovação**: input de valor (BRL) → `PATCH /members/{id}/limit`.
  - **Líder direto**: combobox de busca de outro membro → `PATCH /members/{id}/manager`. Erros de ciclo (`HierarchyCycleError`, `SelfManagerError`) exibidos no combobox.
  - **Centros de Custo**: `<DataTable>` com os centros em que a pessoa aparece, uma linha por centro, coluna "papel" distinguindo gestor de vinculado. Vincular a outro centro e desvincular por linha.
  - **Quem depende desta pessoa**: `GET /members/{id}/responsibilities` — quem responde a ela (`subordinates`) e de quem ela é substituto (`substituteFor`). Informativo, sem ação; some quando não há nada.
- Botão "inativar membro" (`DELETE /members/{id}`) via `<ConfirmDialog>`. Se a API voltar 409 com `details` de responsabilidades pendentes (`MemberHasResponsibilitiesError`), o modal lista essas responsabilidades em vez de fechar, orientando a resolver antes.

### 4.3 Modal — Convidar membro
- **Form**: e-mail, papel (`CompanyMemberRole`), Centro de Custo padrão (opcional), líder direto (opcional).
- **API**: `POST /invites`.
- Erro 409 (`DuplicatePendingInviteError`) mostrado inline no campo e-mail.

### 4.4 Modal — Definir substituto temporário
- Acessível a partir do próprio perfil (seção 20), não da tela de equipe (é sempre sobre "me/substitute").
- **Form**: combobox de substituto (só lista `APPROVER`/`FINANCE_ADMIN` ativos), período de ausência (data início/fim).
- **API**: `PATCH /members/me/substitute`. Enviar `substituteId: null` remove a substituição (botão "remover substituto" separado).

### 4.5 Tela pública — Aceitar convite (`/convite/{token}`)
- **Acesso**: público, sem exigir login prévio — mas exige estar logado com a conta certa antes de aceitar (RN05: e-mail precisa bater).
- `GET /invites/token/{token}` no load, mostra nome da empresa, papel oferecido.
- Se não logado: botões "criar conta" / "já tenho conta", ambos preservando o token no retorno.
- Se logado com e-mail diferente do convite: mensagem clara "este convite foi enviado para outro endereço" (não botão de aceitar).
- Botão "aceitar convite" → `POST /invites/token/{token}/accept`, seguido de `POST /auth/refresh` e refetch da sessão. **Não é preciso pedir a senha de novo**: `companyId`/`memberId`/`role` vêm do payload do JWT (não de consulta ao banco), então um refetch puro devolveria a sessão velha — mas `refresh-token.use-case` re-deriva o vínculo e emite cookie novo. (Versão anterior deste spec mandava forçar login.)
- **A rota é `/convites/{token}`, no plural.** É o que `invite-mail.template.ts` monta no link do e-mail. `/convite/{token}` (singular) responde também, como apelido, para os links já enviados.

---

## 5. Centros de Custo

Cobre: `POST /cost-centers`, `GET /cost-centers`, `GET /cost-centers/{id}`, `PATCH /cost-centers/{id}`, `GET /cost-centers/{id}/members`, `POST /cost-centers/{id}/members`, `DELETE /cost-centers/{id}/members/{memberId}`, `POST /cost-centers/transfer-management`, `PATCH /cost-centers/{id}/disable`, `DELETE /cost-centers/{id}`.

### 5.1 Tela — Centros de Custo (`/centros-de-custo`)
- **Acesso**: `FINANCE_ADMIN` para gerenciar; demais perfis veem em modo leitura (para saber a qual pertencem).
- `<DataTable>` hierárquica (indentação por `parentId`) de `GET /cost-centers`: nome, código, gestor, situação.
- Botão "novo Centro de Custo" (só `FINANCE_ADMIN`) abre modal 5.3.
- Linha abre `/centros-de-custo/{id}`.

### 5.2 Tela — Detalhe do Centro de Custo (`/centros-de-custo/{id}`)
- Seções:
  - **Dados**: nome, código, gestor (combobox), Centro de Custo pai (combobox) → `PATCH /cost-centers/{id}`.
  - **Membros vinculados**: `<DataTable>` de `GET /cost-centers/{id}/members`, botão "vincular membro" (modal com combobox de membro → `POST /cost-centers/{id}/members`), ação de desvincular por linha (`DELETE /cost-centers/{id}/members/{memberId}`, `<ConfirmDialog>`).
  - **Orçamento** — link para a aba de orçamento deste CC (seção 6.2), não duplicado aqui.
- Ações de rodapé: "inativar" (`PATCH /cost-centers/{id}/disable`, `<ConfirmDialog>`) e "excluir" (`DELETE /cost-centers/{id}`, `<ConfirmDialog>` — se a API voltar 409 `CostCenterInUseError`, o modal mostra o detalhamento de uso e sugere inativar em vez de excluir).

### 5.3 Modal — Novo Centro de Custo
- **Form**: nome, código, gestor (combobox de membro elegível), Centro de Custo pai (opcional).
- **API**: `POST /cost-centers`.

### 5.4 Modal — Transferir gestão
- Acionado a partir do detalhe do membro (4.2) quando ele vai ser inativado/rebaixado e gerencia Centros de Custo.
- **Form**: lista dos CCs que o membro gerencia com checkbox por linha (todos pré-marcados), novo gestor (combobox com busca).
- **API**, conforme a seleção:
  - **todos marcados** → `POST /cost-centers/transfer-management` (move tudo de uma vez; é o caminho que libera a inativação do RF25).
  - **seleção parcial** → um `PATCH /cost-centers/{id}` por centro escolhido, alterando `managerId`. O endpoint de transferência move todos obrigatoriamente, então transferência parcial passa por aqui.
- Quando a seleção é parcial, o modal informa de quantos centros a pessoa continua gestora.

---

## 6. Matriz de alçadas, categorias e fornecedores

Cobre: `GET /approval-rules`, `PUT /approval-rules`, `GET /approval-rules/resolve`, `POST /approval-rules/simulate`, `DELETE /approval-rules`, `GET /categories`, `POST /categories`, `GET /categories/{id}`, `PATCH /categories/{id}`, `PATCH /categories/{id}/active`, `GET /suppliers/lookup/{cnpj}`, `POST /suppliers`, `GET /suppliers`, `GET /suppliers/{id}`, `PATCH /suppliers/{id}`, `PATCH /suppliers/{id}/blocked`, `POST /suppliers/{id}/revalidate`.

### 6.1 Tela — Matriz de alçadas (`/matriz-de-alcadas`)
- **Acesso**: `FINANCE_ADMIN` edita; `APPROVER` vê em leitura (entender por que um pedido caiu nele). `REQUESTER` não vê a tela.

**Abrangências (RF35).** A empresa não tem *uma* matriz: tem a matriz padrão (`costCenterId` e `categoryId` nulos) e, opcionalmente, exceções por Centro de Custo, por categoria, ou pela combinação dos dois. Um pedido resolve pela mais específica que o cobrir. A tela lista as matrizes numa trilha lateral (padrão fixa no topo, exceções da mais específica para a mais ampla) e edita uma por vez; abaixo de `xl` a trilha vira um seletor no próprio título.

- Editor de faixas: `{ minAmountCents, maxAmountCents | null, approverType, requiresDualApproval }` vindas de `GET /approval-rules`, ordenadas por valor.
- **Só os cortes são editáveis, não os pares início/fim independentes.** O início de uma faixa é o teto da faixa de baixo mais um centavo: os dois campos existem na tela e editar qualquer um move o outro. Buraco, sobreposição e "não começa em zero" deixam de ser representáveis, em vez de serem validados depois. Resta validar que os tetos sobem.
- Dois valores são fixos por regra do domínio, mostrados com cadeado e o motivo em tooltip: a primeira faixa começa em `R$ 0,00` e a última fica sem teto (`max: null`).
- Salvar tudo de uma vez: `PUT /approval-rules` (substitui a matriz *daquela* abrangência). Como a gravação é integral, o editor trabalha sobre rascunho e uma barra fixa é a única saída dele — ela grava todas as matrizes com rascunho pendente e some quando não há nada a salvar.
- Botão "remover exceção" (`DELETE /approval-rules?costCenterId=&categoryId=`, via `<ConfirmDialog>`): aqueles pedidos voltam a seguir a matriz padrão. **A matriz padrão não pode ser removida** — `ranges: []` sobre a abrangência global é recusado com `ApprovalMatrixEmptyError`, e não haveria para onde cair. Exceção criada e ainda não salva some sem chamar a API.
- Painel lateral "simular": valor + Centro de Custo + solicitante (+ categoria, + data) → `POST /approval-rules/simulate`, mostra a cadeia resultante sem gravar nada. A data serve para conferir substituição por ausência (RN29). A faixa que pegou o valor é destacada na escada atrás.
  - **A simulação roda contra a matriz gravada**, não contra o rascunho — não há endpoint que aceite faixas não persistidas. Com alterações pendentes, o painel avisa.
  - `POST /simulate` é `@Roles(FINANCE_ADMIN)`: o `APPROVER` em leitura não vê o botão, e o `REQUESTER` não alcança a tela. (Uma versão anterior deste spec dizia que o painel serviria ao Requester antes de criar um pedido — o backend nunca permitiu isso.)
- Falha de simulação é um beco sem saída se parar na mensagem: o backend manda a regra violada em `details.rule`, e a tela oferece o caminho — `RN27` (ninguém com alçada) e `RN24` com `memberId` (hierarquia circular) linkam para Equipe. A mensagem da API é exibida sem reescrita (§0.2).
- `GET /approval-rules/resolve` existe na camada de API mas nenhuma tela consome: nesta, `POST /simulate` responde o mesmo e mais (devolve `ruleId` *e* a cadeia). Fica para o formulário de pedido (§8), onde a cadeia não interessa.

### 6.2 Tela — Categorias (`/categorias`)
- **Acesso**: `FINANCE_ADMIN` edita; todos veem (usado no formulário de pedido).
- `<DataTable>` de `GET /categories?includeInactive=true`: categoria (nome + descrição como linha secundária) e situação (`<StatusDot>` — "Em uso" / "Arquivada").
- `<TableSegments>` acima da tabela: **Em uso** (padrão), **Arquivadas**, **Todas**, cada um com a contagem. O filtro padrão é "Em uso" porque arquivada é exceção e não deve ocupar a vista principal.
- `<TableSearch>` filtra por nome ou descrição. Busca, filtro e paginação são resolvidos no cliente sobre o lote de `GET /categories` (o endpoint devolve array puro; ver §0.2).
- `rowActions` por linha: editar (abre o modal) e arquivar/reativar (`PATCH /categories/{id}/active` via `<ConfirmDialog>`, porque arquivar tira a categoria de novos pedidos).
- Rodapé informa quantas estão arquivadas, ou a paginação quando passa de uma página.
- Modal "nova categoria" / "editar categoria": nome, descrição → `POST /categories` / `PATCH /categories/{id}`.

### 6.3 Tela — Fornecedores (`/fornecedores`)
- **Acesso**: `FINANCE_ADMIN` edita; todos veem (usado no formulário de pedido).
- `<DataTable>` de `GET /suppliers`: fornecedor (nome fantasia ou razão social + CNPJ formatado como linha secundária), situação de uso (`<StatusDot>` de `SupplierUsage`), conferência na Receita (`<StatusDot>` de `ValidationStatus`, a partir de `lg`) e local (a partir de `xl`).
- `rowAccent` marca a linha com um filete de 2px **só quando o fornecedor foge do normal**: âmbar em `BLOCKS_APPROVAL`, vermelho em `BLOCKS_SUBMISSION`/bloqueado. Fornecedor liberado não recebe marca — um marcador presente em toda linha não informaria nada.
- `<TableSegments>`: **Todos**, **Com trava** (`blocked=true` — bloqueio manual da empresa, trava na largada) e **Sem conferir** (`validationStatus=PENDING` — CNPJ pendente na Receita, deixa criar mas trava a aprovação final). Os três ficam sempre visíveis; o de contagem zero fica apagado.
- Busca, filtro e paginação são **do servidor** — `GET /suppliers` já pagina, então os query params vão direto para a API (ver §0.2). As contagens dos chips vêm de consultas de `perPage: 1` por filtro, lendo `meta.total`.
- Linha abre `/fornecedores/{id}`; `rowActions` traz o atalho de abrir.

### 6.4 Tela — Detalhe do fornecedor (`/fornecedores/{id}`)
- Dados cadastrais (edição via `PATCH /suppliers/{id}`).
- Badge de situação + botão "revalidar CNPJ na Receita" (`POST /suppliers/{id}/revalidate`), mostra spinner durante a chamada (é uma consulta externa, pode demorar).
- Toggle "bloqueado" (`PATCH /suppliers/{id}/blocked`) com `<ConfirmDialog>` explicando o efeito (bloqueia novos pedidos com este fornecedor).

### 6.5 Modal — Novo fornecedor
- Campo CNPJ com botão "buscar" → `GET /suppliers/lookup/{cnpj}`, pré-preenche razão social/endereço a partir do retorno.
- **API**: `POST /suppliers`. Erro 409 (`SupplierCnpjTakenError`) leva à tela do fornecedor existente em vez de deixar o form travado.

---

## 7. Orçamento

Cobre: `POST /cost-centers/{costCenterId}/budgets`, `GET /cost-centers/{costCenterId}/budgets`, `GET /cost-centers/{costCenterId}/budgets/current`, `GET /budgets/{id}`, `PATCH /budgets/{id}`, `GET /budgets/{id}/entries`.

### 7.1 Aba — Orçamento (dentro de `/centros-de-custo/{id}`)
- **Acesso**: `FINANCE_ADMIN` edita; gestor do CC vê leitura.
- Painel de consumo do período vigente (`GET /cost-centers/{costCenterId}/budgets/current`): valor total, comprometido, disponível — barra de progresso visual, cor muda perto do limite de tolerância.
- `<DataTable>` de histórico de períodos (`GET /cost-centers/{costCenterId}/budgets`): período, total, comprometido, disponível.
- Botão "definir orçamento do período" → modal com período (mês/trimestre/ano conforme regra de negócio) + valor → `POST /cost-centers/{costCenterId}/budgets`.
- Linha do histórico troca o período exibido no painel; a seta ao fim da linha abre `/orcamentos/{id}` (extrato completo do período).

### 7.2 Tela — Detalhe do orçamento (`/orcamentos/{id}`)
- **Acesso**: mesma regra da aba 7.1 (`RoleGuard area="cost-centers"`).
- Cabeçalho com o período (`GET /budgets/{id}`), link de volta ao Centro de Custo e botão "exportar CSV" (`GET /budgets/{id}/entries/export`).
- Três indicadores derivados do extrato: teto do período, comprometido, disponível — o disponível vira âmbar quando negativo ("o período estourou o teto"). Somados em `BigInt` sobre os centavos, nunca em ponto flutuante.
- `<DataTable>` do extrato: `GET /budgets/{id}/entries` — data, tipo (`<StatusPill>` de `CONSUMPTION`/`REVERSAL`), descrição, pedido relacionado (link) e valor com sinal (− consumo, + estorno). Paginado, somente leitura.
- A edição do valor do período fica na aba 7.1 ("ajustar teto", que exige motivo pela RF30) — não é duplicada aqui.

---

## 8. Ciclo do pedido de compra

Núcleo do sistema. Cobre: `POST /purchase-requests`, `GET /purchase-requests`, `GET /purchase-requests/{id}`, `POST /purchase-requests/{id}/items`, `GET /purchase-requests/{id}/items`, `PATCH /purchase-requests/{id}/items/{itemId}`, `DELETE /purchase-requests/{id}/items/{itemId}`, `POST /purchase-requests/{id}/files`, `GET /purchase-requests/{id}/files`, `GET /purchase-requests/{id}/files/{fileId}/download`, `DELETE /purchase-requests/{id}/files/{fileId}`, `POST /purchase-requests/{id}/extract`, `GET /purchase-requests/{id}/extract`, `PATCH /purchase-requests/{id}`, `POST /purchase-requests/{id}/submit`, `GET /purchase-requests/{id}/timeline`, `POST /purchase-requests/{id}/decisions`, `POST /purchase-requests/{id}/reassign`, `POST /purchase-requests/{id}/duplicate`, `POST /purchase-requests/{id}/cancel`, `DELETE /purchase-requests/{id}`.

### 8.1 Tela — Meus pedidos / Pendentes para mim / Todos (`/pedidos`)
- **Acesso**: todos os perfis, conteúdo muda por `view`.
- Três abas mapeando direto o parâmetro `view` de `GET /purchase-requests`: **Meus pedidos** (`MINE`), **Pendentes para mim** (`PENDING_FOR_ME`, badge com contagem, só visível/relevante para `APPROVER`/`FINANCE_ADMIN`), **Todos** (`ALL`, visibilidade filtrada pelo backend conforme RN43).
- `<DataTable>`: pedido (título + número, com o ponto de urgência antes do título), Centro de Custo (a partir de `lg`), solicitante (a partir de `xl`), situação (`<StatusBadge>` de `RequestStatus`), valor e data de abertura (a partir de `lg`). Urgência não tem coluna própria: vira um ponto colorido ao lado do título, e some quando é `MEDIUM` — um marcador presente em toda linha não informaria nada.
- Filtros: situação, Centro de Custo, fornecedor e categoria, mais busca por número/título — todos mapeando os query params de `GET /purchase-requests`. Cada filtro mostra o **nome da dimensão** quando vazio e o **valor** quando escolhido, ganhando cor de ativo; a opção de limpar fica dentro da lista ("Todas as situações"). A API aceita `status` como array, mas a tela envia um valor por vez: seleção múltipla numa barra de filtro exige um controle bem mais pesado, e não houve demanda.
- Botão "novo pedido" → `/pedidos/novo`.
- Linha abre `/pedidos/{id}`.

### 8.2 Tela — Novo pedido / Editar rascunho (`/pedidos/novo`, `/pedidos/{id}/editar`)
- **Acesso**: qualquer perfil pode criar; editar só o dono do rascunho (`RequestNotOwnedError` se não for).
- **Form principal**: título, descrição, Centro de Custo (combobox — só os que o usuário tem acesso, RN checada no backend), categoria, fornecedor (combobox com busca, ou botão "cadastrar novo fornecedor" que abre o modal 6.5 embutido), urgência, condições de pagamento.
- **API**: `POST /purchase-requests` (criar) / `PATCH /purchase-requests/{id}` (editar) — ambos só operam sobre `DRAFT` (backend rejeita com `RequestNotDraftError` fora disso; UI nem mostra o form de edição se o status não for `DRAFT`, mostra a tela 8.3 em modo leitura).
- **Seção de itens** (inline na mesma tela, não modal separado — é o coração do form): tabela editável com adicionar linha (`POST /purchase-requests/{id}/items`), editar quantidade/preço inline (`PATCH .../items/{itemId}`), remover linha (`DELETE .../items/{itemId}`, `<ConfirmDialog>` leve). Total recalculado a cada mudança, refletindo `GET /purchase-requests/{id}` — nunca somado no front.
- **Seção de anexos**: `<FileDropzone>`, lista de arquivos (`GET .../files`) com download (`GET .../files/{fileId}/download`, abre URL assinada em nova aba) e remoção (`DELETE .../files/{fileId}`).
- **Extração assistida por IA**: botão "extrair dados de um documento" abre modal 8.6.
- **Não há botão "salvar rascunho".** O rascunho grava sozinho: campos de texto no `blur`, selects e urgência no ato, com um indicador de estado no cabeçalho (`Salvando` / `Salvo` / `Não salvou`). É rascunho, nada é notificado, e um botão de salvar convivendo com auto-save gera dois modelos mentais concorrentes.
- Painel lateral fixo de envio, no lugar de um rodapé: mostra o total, a lista do que ainda falta para poder enviar (título, Centro de Custo, fornecedor, ao menos um item — exatamente o que o backend exige) e o botão "enviar para aprovação", habilitado só quando tudo está pronto. Antes, o que faltava só aparecia como erro **depois** do clique.
- **Fluxo de duplicata (RN36)**: se `submit` voltar 400, `details.duplicates` traz `[{ number, amountCents, createdAt }]` — **sem `id`**, então o link de cada um vai para `/pedidos?search={number}`, não para o detalhe direto. Checkbox "confirmo que não é duplicata" → reenvia `submit` com `confirmDuplicate: true`.
- **Fluxo de override de orçamento**: não implementado — `requiresOverride` existe na entidade e é gravado na submissão, mas **não é exposto em `PurchaseRequestResponseDto`**, então o front não tem como saber. O aviso na tela depende de o backend passar a devolver o campo. O caminho segue funcionando: quem aprova vê a opção "aprovar com ressalva" no modal 8.4.

### 8.3 Tela — Detalhe do pedido (`/pedidos/{id}`)
- **Acesso**: todos os perfis com visibilidade (RN43, backend decide, front só reage a 403/404).
- Cabeçalho: número, título, `<StatusBadge>`, valor total, urgência.
- Corpo: dados do pedido (read-only fora de `DRAFT`), tabela de itens (read-only), anexos (lista + download), resultado da extração de IA se houver.
- `GET /purchase-requests/{id}` devolve **só o pedido** — itens, anexos e trilha vêm de `GET .../items`, `GET .../files` e `GET .../timeline`, em chamadas próprias.
- **Timeline** (`GET /pedidos/{id}/timeline`): componente vertical de eventos — criação, submissão, cada decisão com decisor/justificativa/data, cancelamento. É o mesmo componente usado dentro do modal de decisão (8.4) para dar contexto.
- **Painel de ações**, condicional ao status e ao perfil do usuário logado (o backend já valida; o front só evita mostrar botão que vai dar 403 na cara):
  - `DRAFT` + dono → "editar" (vai para 8.2), "excluir" (`DELETE`, `<ConfirmDialog>`).
  - `PENDING` + é o aprovador da etapa atual → "decidir" abre modal 8.4.
  - `PENDING`/`CHANGES_REQUESTED`/`APPROVED` + dono ou `FINANCE_ADMIN` (conforme regra de reversão) → "cancelar" abre modal 8.5.
  - `APPROVED` + `FINANCE_ADMIN` → "emitir ordem de compra" (leva à seção 9.1, ou abre inline se preferir modal — recomendo tela própria porque tem campos de entrega).
  - Qualquer status → "duplicar" (`POST .../duplicate`, vai direto para 8.2 em modo edição do novo rascunho).
  - `PENDING` + `FINANCE_ADMIN` → "reatribuir etapa" abre modal com combobox de novo aprovador → `POST .../reassign`.

### 8.4 Modal — Decidir pedido
- **Acesso**: aprovador da etapa atual da `PENDING` (backend valida com a mensagem "você criou este pedido..." ou "aguardando decisão de outra pessoa" quando não for o caso — mostrar direto se vier 403).
- Mostra resumo do pedido (valor, itens, solicitante) e a timeline reduzida.
- **Form**: rádio/tabs de decisão — Aprovar / Aprovar com ressalva / Solicitar ajustes / Rejeitar (mapeando `DecisionType`). Campo de justificativa aparece condicionalmente (obrigatório e min 10 caracteres nos três últimos, conforme RN44 — replicar a validação no client mas a mensagem de erro final vem da API).
- Se o pedido tiver `requiresOverride: true`, a opção "aprovar com ressalva" vem destacada/pré-selecionada com um aviso do porquê.
- **API**: `POST /purchase-requests/{id}/decisions`.

### 8.5 Modal — Cancelar pedido
- **Form**: campo de motivo (obrigatório, min 10 caracteres).
- **API**: `POST /purchase-requests/{id}/cancel`.
- Se vier 403 (`RequestNotOwnedError`/regra de reversão), a mensagem da API já explica que só Admin Financeiro reverte aprovado — mostrar como está.

### 8.6 Modal — Extração assistida por IA
- **Acesso**: dentro do form de rascunho (8.2), qualquer perfil.
- Área de colar texto ou anexar imagem/PDF de nota/orçamento.
- **API**: `POST /purchase-requests/{id}/extract` (enfileira), depois polling em `GET /purchase-requests/{id}/extract` a cada poucos segundos até status sair de `QUEUED`.
- Sucesso: mostra os campos extraídos lado a lado com os campos do form, botão "aplicar ao pedido" preenche o form automaticamente (usuário ainda confirma antes de salvar).
- Falha: mostra a razão em texto simples (o backend já devolve `FAILED` com motivo legível).

---

## 9. Ordens de compra

Cobre: `POST /purchase-requests/{id}/purchase-order`, `GET /purchase-orders`, `GET /purchase-orders/{id}`, `GET /purchase-orders/{id}/balance`, `POST /purchase-orders/{id}/send`, `POST /purchase-orders/{id}/cancel`.

### 9.1 Tela — Emitir ordem de compra (`/pedidos/{id}/emitir-ordem`)
- **Acesso**: `FINANCE_ADMIN`, só a partir de um pedido `APPROVED` sem PO ainda (backend rejeita duplicidade com `PurchaseOrderAlreadyIssuedError` — se já existe, este link nem aparece, vai direto para 9.3).
- Resumo do pedido (itens, fornecedor, total) — read-only, é o que será copiado.
- **Form**: prazo de entrega esperado, endereço de entrega, condições de pagamento (pré-preenchido do pedido, editável), observações, prefixo de numeração (pré-preenchido de `company.poNumberPrefix`, editável).
- O prefixo só passou a vir da política depois de duas correções no backend: `IssuePurchaseOrderDto` tinha `numberPrefix: string = 'PO'` como default de classe, que sobrescrevia qualquer consulta à empresa, e o use case nunca lia `company.poNumberPrefix`. Hoje o DTO é opcional de verdade e o use case cai na política quando o campo vem vazio.
- **API**: `POST /purchase-requests/{id}/purchase-order`.
- Sucesso: redireciona para `/ordens-de-compra/{id}`.

### 9.2 Tela — Ordens de compra (`/ordens-de-compra`)
- **Acesso**: todos os perfis.
- `<DataTable>` de `GET /purchase-orders`: número, fornecedor, valor, `<StatusBadge>` de `PurchaseOrderStatus`, data de emissão, prazo de entrega.
- Filtros: status (múltiplo), fornecedor, busca por número/título do pedido.
- Linha abre `/ordens-de-compra/{id}`.

### 9.3 Tela — Detalhe da ordem de compra (`/ordens-de-compra/{id}`)
- Cabeçalho: número, `<StatusBadge>`, link para o pedido de origem.
- Dados: fornecedor, valores, prazo, endereço, condições de pagamento.
- **Saldo por item** (`GET .../balance`): tabela com pedido/recebido/pendente por item — é a informação-chave que guia o próximo recebimento.
- **Recebimentos**: lista resumida (link para seção 10), botão "registrar recebimento" leva à tela 10.1.
- **Notas fiscais**: lista resumida (link para seção 11), botão "enviar nota desta ordem" leva ao upload 11.1.
- Ações de rodapé: "marcar como enviada ao fornecedor" (`POST .../send`, sem confirmação — é reversível em impacto, é só um marcador conforme já discutido) e "cancelar ordem" (`POST .../cancel`, `<ConfirmDialog>` com campo de motivo obrigatório; se vier 409 `PurchaseOrderHasReceiptsError`, a mensagem já orienta a registrar devolução em vez de cancelar).

---

## 10. Recebimentos

Cobre: `POST /purchase-orders/{id}/receipts`, `GET /purchase-orders/{id}/receipts`, `GET /receipts/{id}`.

### 10.1 Tela — Registrar recebimento (`/ordens-de-compra/{id}/receber`)
- **Acesso**: quem criou o pedido original, ou `FINANCE_ADMIN` (backend valida com `ReceiptNotOwnedError` — a UI só mostra o botão de acesso a esta tela para esses dois casos).
- Tabela pré-carregada com os itens pendentes (`GET .../balance`), uma linha por item: quantidade pendente (info), campo "quantidade recebida" (pré-preenchido com o total pendente, editável — cobre o caso comum "recebimento completo" com edição mínima), campo "quantidade recusada" (opcional, expande campo de motivo obrigatório se > 0).
- Campo data de recebimento (default agora), observações gerais.
- **API**: `POST /purchase-orders/{id}/receipts`.
- Erro 409 (`QuantityExceedsOrderError`) exibido inline na linha do item específico, com o saldo real informado pela API — o form não deixa submeter valor calculável como inválido no client, mas a validação final é sempre da API.
- Sucesso: volta para `/ordens-de-compra/{id}` com toast de confirmação.

### 10.2 Tela — Detalhe do recebimento (`/recebimentos/{id}`)
- Read-only: número, ordem de compra relacionada (link), quem recebeu, data, itens com quantidade recebida/recusada/motivo, observações.

---

## 11. Notas recebidas

**A nota é insumo da conferência, não um bem que o sistema administra.** O AprovAI nunca emite nota: quem emite é o fornecedor, e o arquivo chega aqui para ser comparado com a ordem e o recebimento. A guarda fiscal de cinco anos continua sendo da contabilidade do cliente — o sistema serve o XML de volta para download, mas não se apresenta como arquivo fiscal.

Por isso esta seção e a 12 vivem sob **uma única entrada de menu, "Conferência"** (`/conferencia`), com duas abas: "Conferências" (resultados) e "Notas recebidas". `features/conferral/` guarda as duas.

**Escopo declarado na tela.** A conferência aceita apenas NF-e de produto, modelo 55. CT-e (frete), NFC-e (cupom) e NFS-e (serviço) são recusados no parser com mensagem que aponta o caminho alternativo, e o componente `<ScopeNote>` diz isso na própria listagem em vez de deixar o usuário descobrir pelo erro.

Cobre: `POST /purchase-orders/{id}/invoices/upload`, `POST /invoices/upload`, `GET /purchase-orders/{id}/invoices`, `GET /invoices/{id}`, `POST /invoices/{id}/link`, `POST /invoices/{id}/reject`.

### 11.1 Tela/Modal — Enviar nota fiscal
- **Caminho principal**, a partir de `/ordens-de-compra/{id}` (botão "enviar nota"): `<FileDropzone>` restrito a `.xml`, contexto da ordem já conhecido → `POST /purchase-orders/{id}/invoices/upload`.
- **Caminho secundário**, a partir de `/conferencia/notas` (botão "enviar nota"): mesmo dropzone, sem ordem pré-selecionada → `POST /invoices/upload`. Usado quando ainda não se sabe a ordem — resultado entra sem vínculo, com aviso "esta nota não está vinculada a nenhuma ordem, vincule manualmente".
- Erros mostrados diretamente da API: `InvoiceRecipientMismatchError` (CNPJ de destino não bate — provavelmente arquivo errado), `InvoiceAlreadyRegisteredError` (nota duplicada, com link para a nota já existente), `InvoiceParseFailedError` (detalha o que faltou no XML), `UnsupportedDocumentModelError` (o arquivo é CT-e/NFC-e/outro modelo), `InvoiceNotAuthorizedError` (sem protocolo de autorização da SEFAZ, ou rejeitada) e `InvoiceHomologationError` (nota de ambiente de teste, sem valor fiscal).

### 11.2 Aba — Notas recebidas (`/conferencia/notas`)
- **Acesso**: `FINANCE_ADMIN`.
- `<DataTable>`: número, fornecedor emitente, valor, `<StatusBadge>` de `InvoiceStatus`, ordem de compra vinculada (ou "sem vínculo"), data de upload.
- Linha abre `/conferencia/notas/{id}`.

### 11.3 Tela — Detalhe da nota (`/conferencia/notas/{id}`)
- Dados extraídos: emitente, chave de acesso, número/série, valores (total, produtos, frete, seguro, desconto), impostos destacados (`TaxKind` por linha).
- Itens da nota, cada um mostrando se já foi casado com um item de ordem de compra (`purchaseOrderItemId` preenchido ou não).
- Se `purchaseOrderId` nulo: banner "nota sem ordem vinculada", botão "vincular a uma ordem" abre modal com combobox de ordens em aberto do mesmo fornecedor → `POST /invoices/{id}/link`.
- Botão "rodar conferência" (se já vinculada e ainda não conferida) → dispara `POST /invoices/{id}/match`, redireciona para o resultado (seção 12.2).
- Botão "rejeitar nota" (`<ConfirmDialog>` com motivo) → `POST /invoices/{id}/reject`.
- Botão "baixar XML" → `GET /invoices/{id}/xml`, devolve o arquivo original byte a byte.
- **Faixa de autorização**: `authorizationStatus`, `protocolNumber` e `protocolReceivedAt` lidos do `protNFe/infProt` do próprio XML, mais `integrityWarnings` (DV da chave, CNPJ/número/série divergentes do corpo). A faixa declara a procedência: o dado vem do arquivo, o sistema não consulta a SEFAZ, e por isso cancelamento posterior à autorização não aparece.

---

## 12. Conferência e pagamento

Cobre: `POST /invoices/{id}/match`, `GET /match-results`, `GET /match-results/{id}`, `POST /match-results/{id}/override`, `GET /payables`, `POST /payables/release-without-invoice`, `POST /payables/{id}/pay`.

### 12.1 Aba — Fila de conferências (`/conferencia`)
- **Acesso**: `FINANCE_ADMIN`.
- `<DataTable>` de `GET /match-results`, filtro padrão em `status=DIVERGENT` (é a fila de trabalho real — o que bateu sozinho não precisa de atenção humana).
- Colunas: nota, ordem de compra, `<StatusBadge>` de `MatchStatus`, valores comparados (pedido/recebido/faturado lado a lado), data.

### 12.2 Tela — Detalhe da conferência (`/conferencia/resultado/{id}`)
- Comparativo visual em três colunas: **Pedido** × **Recebido** × **Faturado**, valores e quantidades por item.
- Lista de divergências (`MatchDivergenceResponseDto`), cada uma com o tipo traduzido (mapa `DivergenceKind → label pt-BR`, ex: `PRICE_ABOVE_ORDER` → "cobraram mais caro que o combinado"), valor esperado vs. valor real, diferença.
- Se `status: DIVERGENT`: botão "liberar exceção e aprovar pagamento" abre modal 12.3.
- Se já resolvido (`OVERRIDDEN`): mostra quem resolveu, quando, e a justificativa.

### 12.3 Modal — Liberar exceção (override)
- **Form**: campo de justificativa (obrigatório, min 10 caracteres).
- **API**: `POST /match-results/{id}/override`.
- Fecha o modal e atualiza a tela 12.2 para o novo status.

### 12.4 Tela — Contas a pagar (`/contas-a-pagar`)
- **Acesso**: `FINANCE_ADMIN`.
- `<DataTable>` de `GET /payables`: fornecedor, valor, vencimento, `<StatusBadge>` de `PayableStatus`, motivo de liberação (`PayableReleaseReason`, se liberado).
- Filtro padrão útil: `status=RELEASED` (o que está pronto para pagar) com aba separada para `BLOCKED`.
- Linha com ação "marcar como pago" (só se `RELEASED`) → `POST /payables/{id}/pay`, `<ConfirmDialog>` simples (reforça que não executa transferência real, é só registro).
- Botão de topo "liberar pagamento sem nota fiscal" abre modal 12.5.

### 12.5 Modal — Liberar pagamento sem nota fiscal
- **Acesso**: `FINANCE_ADMIN` apenas (o form nem aparece para outros perfis).
- **Form**: fornecedor (combobox), valor, vencimento, campo de justificativa, `<FileDropzone>` de comprovante (PDF/imagem, anexo livre).
- **API**: `POST /payables/release-without-invoice` (multipart).
- **O comprovante é condicional a `matchRequiredAboveCents`.** Igual ou abaixo do limite, a liberação dispensa anexo e grava `releaseReason: BELOW_MATCH_THRESHOLD`; acima dele o comprovante é obrigatório e o motivo é `NO_INVOICE_REQUIRED`. Com o limite nulo, a política é "conferir sempre" e o comprovante é sempre exigido. A regra mora no use case, não no controller — uma trava anterior no controller exigia o anexo antes da regra rodar e anulava o limite.
- Contexto explicativo fixo no modal: "use para assinaturas de software, serviços do exterior ou qualquer compra que não gera nota fiscal brasileira conferível".

---

## 13. Aprovação por e-mail

Cobre: `GET /email-approvals/{token}`, `POST /email-approvals/{token}`.

### 13.1 Tela pública — Decisão por e-mail (`/aprovacoes/{token}`)
- **Acesso**: público, sem exigir login — é o ponto do recurso.
- `GET /email-approvals/{token}` no load. Três estados:
  - **`actionable: true`**: mostra número, valor, solicitante, itens; dois botões grandes "Aprovar" / "Rejeitar", cada um levando a uma confirmação com campo de justificativa (obrigatório para rejeitar).
  - **`actionable: false`** com `reason` preenchido (já decidido, cancelado, expirado): mostra a `reason` da API tal como veio, sem tela de erro — é estado, não falha.
  - **Token inválido** (404): página de erro simples "link inválido ou expirado".
- **API de decisão**: `POST /email-approvals/{token}`. Sucesso mostra tela de confirmação "decisão registrada", sem exigir nenhum login.
- Layout completamente isolado do app autenticado (sem sidebar/topbar) — é uma página pública standalone, mobile-first (é aberta de e-mail, provavelmente no celular).

---

## 14. Notificações

Cobre: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all`, `GET /notifications/preferences`, `PATCH /notifications/preferences`.

Lembrete de arquitetura (não muda a spec, mas define o comportamento): não há WebSocket. `unread-count` é buscado via polling (`refetchInterval` do TanStack Query, sugestão: 30s) e ao focar a aba do navegador.

### 14.1 Componente — Sino de notificações (topbar, global)
- Badge com `GET /notifications/unread-count`.
- Clique abre popover/drawer com lista resumida (últimas ~10 de `GET /notifications`), cada uma com título, mensagem curta, tempo relativo, link (`content.link` da notificação).
- Clicar numa notificação marca como lida (`PATCH /notifications/{id}/read`) e navega para o link.
- Botão "marcar todas como lidas" (`PATCH /notifications/read-all`).
- Rodapé do popover: "ver todas" → `/notificacoes`.

### 14.2 Tela — Central de notificações (`/notificacoes`)
- Lista completa paginada de `GET /notifications`, mesmo padrão visual do popover, mais espaçoso.
- Filtro por lido/não lido.

### 14.3 Tela — Preferências de notificação (`/notificacoes/preferencias`)
- Lista dos eventos (`NotificationEvent`) com toggle "receber por e-mail" cada um, vindo de `GET /notifications/preferences`.
- Cada toggle salva individualmente ou em lote com botão "salvar" — recomendo salvar em lote (`PATCH /notifications/preferences` aceita array) para evitar N chamadas.
- Textos amigáveis por evento (mapa local, não literal do enum): "Pedido pendente para minha aprovação", "Decisão tomada no meu pedido", "Pedido devolvido para ajuste", "Lembrete de prazo", "Etapa escalada", "Alerta de orçamento", "Relatório mensal".

---

## 15. Auditoria

Cobre: `GET /audit-logs`.

### 15.1 Tela — Trilha de auditoria (`/auditoria`)
- **Acesso**: `FINANCE_ADMIN` apenas.
- `<DataTable>` de `GET /audit-logs`: data/hora, ator (nome ou "sistema" se `actorId: null`), tipo de evento (`AuditEventType`, traduzido), entidade afetada (tipo + link se aplicável), IP.
- Filtros: tipo de evento, ator, tipo de entidade, id de entidade, intervalo de datas.
- Linha **abre um diálogo** com `oldData`/`newData` em três colunas (campo, antes, depois), o valor alterado em destaque e o anterior riscado. Uma versão anterior deste spec previa expandir a linha na própria tabela; o `<DataTable>` não tem expansão, e acrescentá-la mexeria num componente usado por ~15 telas para servir uma só. O diálogo entrega o mesmo dado com risco menor, e o `onRowClick` já existia.
- Os nomes de campo são traduzidos por um mapa próprio da tela (`amountCents` → "Valor", `divergenceCount` → "Divergências"). O mapa cobre as 25 chaves que os 21 use cases realmente gravam; chave desconhecida cai no próprio nome em vez de sumir.
- O ator vem de `actorId`, que aponta para `users.id` e é resolvido via `GET /members`. `actorId: null` é ação do agendador e aparece como "Sistema".
- É a única tela do sistema inteiramente somente-leitura — nenhum botão de ação, e o backend não expõe rota de alteração ou remoção (RN45).

---

## 16. Métricas e exportação

Cobre: `GET /analytics/dashboard`, `GET /analytics/exports/requests`.

### 16.1 Tela — Dashboard (`/analytics`)
- **Acesso**: `FINANCE_ADMIN` apenas (backend retorna 403 para os demais).
- **Quatro indicadores no topo**, na ordem da pergunta que o Admin Financeiro faz: esperando decisão (com há quanto tempo o mais antigo espera), aprovado no período, tempo médio de decisão e centros com orçamento (quantos estouraram). Indicador é número, não gráfico — a skill de visualização é explícita que às vezes a resposta não é um gráfico.
- **Série diária "abertos x decididos"**, área com duas linhas sobre o mesmo eixo. Nunca dois eixos y: as duas séries são contagem de pedidos, mesma unidade.
- Consumo por Centro de Custo (`consumption`) em barras horizontais com limiar de cor; gargalos (`bottlenecks`); tempo por aprovador (`approvers`); possíveis repetidos (`repeated`), que só aparecem quando existem.
- Filtro de período no topo (30, 90 ou 180 dias) afeta todos os blocos.
- Botão "exportar" baixa direto em XLSX via `GET /analytics/exports/requests?format=`, usando `responseType: "blob"` e âncora com `download` — sem abrir aba.
- **`GET /analytics/dashboard` ganhou o campo `daily`**, que não existia: o backend só devolvia agregados sem dimensão de tempo, e não havia como montar tendência. A query usa `generate_series` para não deixar buraco em dia sem movimento — dia vazio vira zero, não some do eixo.
- Decisões de cor, anatomia de marca e o resultado da validação de paleta estão em `docs/design-spec.md` §6.4.

---

## 17. Plano e assinatura

Cobre: `GET /billing/subscription`, `GET /billing/plans`.

**O eixo de cobrança é volume de pedidos, não assentos.** Aprovador usa o sistema poucos minutos por semana, e cobrar por cabeça faz o cliente economizar compartilhando login — o que destrói a trilha de auditoria, que é o maior diferencial do produto. Por isso `maxMembers` é nulo nos três planos e `maxRequestsMonth` é o que os separa. A tela lidera com pedidos do mês; pessoas aparece depois, como "ilimitado".

O limite de pedidos **não era aplicado**: `maxRequestsMonth` existia no schema, era mapeado em `Entitlements` e exposto na API, e nenhum use case o consumia — o quinto campo morto encontrado no projeto. Hoje `EntitlementsService.assertRequestQuota()` roda no `submit` do pedido, não na criação do rascunho: rascunho não é pedido, e cobrar por rascunho puniria quem escreve com cuidado. A contagem é por mês corrente sobre `submitted_at`.

### 17.1 Tela — Plano e assinatura (`/plano`)
- **Acesso**: `FINANCE_ADMIN`.
- Card do plano vigente: nome, status (`SubscriptionStatus`), vagas usadas/limite, funcionalidades incluídas.
- Comparativo dos planos disponíveis (`GET /billing/plans`) — sem ação de upgrade self-service nesta versão (isso é feito via `platform`, seção 18, pelo SuperAdmin) — a tela aqui é informativa, com um CTA "fale conosco para fazer upgrade" se aplicável ao modelo de negócio.
- Se `usedSeats` próximo/no limite: banner de aviso.

---

## 18. Plataforma (SuperAdmin)

Cobre: `GET /platform/organizations`, `GET /platform/plans`, `POST /platform/organizations/{companyId}/plan`, `POST /platform/organizations/{companyId}/feature-overrides`.

Área completamente separada do app de empresa — layout próprio, sem sidebar de Centro de Custo/pedidos, acessível apenas se `user.isSuperAdmin`.

### 18.1 Tela — Organizações (`/plataforma/organizacoes`)
- `<DataTable>` de `GET /platform/organizations`: nome, CNPJ, plano atual, vagas, status da assinatura, data de criação.
- Linha abre `/plataforma/organizacoes/{id}`.

### 18.2 Tela — Detalhe da organização (`/plataforma/organizacoes/{id}`)
- Dados da empresa (leitura).
- Ação "trocar plano": combobox dos planos (`GET /platform/plans`) → `POST /platform/organizations/{companyId}/plan`.
- Ação "conceder exceção de funcionalidade": combobox de feature + data de expiração → `POST /platform/organizations/{companyId}/feature-overrides`.

### 18.3 Tela — Planos comerciais (`/plataforma/planos`)
- Listagem somente leitura de `GET /platform/plans` (criação/edição de plano não está no escopo de rotas atual — se não existe endpoint de escrita, não existe tela de escrita).

### 18.4 Tela — Feedback (`/plataforma/feedbacks`)

Cobre `GET /platform/feedbacks`, `GET /platform/feedbacks/counters`, `PATCH /platform/feedbacks/{id}`.

- `<TableSegments>` por situação (Todos / Novo / Em análise / Resolvido / Descartado) alimentado por `counters`, com busca no texto à direita.
- `<DataTable>`: mensagem (com autor e a tela de origem embaixo), organização, tipo, situação, data.
- Filete vermelho na linha (`rowAccent`) quando é **Problema ainda Novo** — é o único recorte que exige ação imediata.
- Ícone de imagem na linha quando há print anexado.
- Clique na linha abre o diálogo de triagem: o print (se houver), mensagem inteira, contexto capturado (tela, e-mail, navegador), troca de situação e nota interna.
- **O print nunca é servido pelo `storageKey`.** `GET /platform/feedbacks/{id}/screenshot` devolve URL assinada com validade — o bucket pode mudar sem quebrar o cliente.

**A nota interna nunca volta para o tenant.** Ela existe para a plataforma registrar decisão de roadmap; o usuário final só vê a situação.

### 18.5 Tela — Lista de espera (`/plataforma/lista-de-espera`)

Cobre `GET /platform/waitlist`. Quem deixou e-mail no site, com origem (`hero` ou `secao-lista`) para saber qual parte da página converte.

---

## 18-A. Site público (`/`)

Rotas públicas: `GET /public/plans` e `POST /public/waitlist`, ambas com `@IsPublic()`.

**Os preços não são escritos à mão.** A seção de planos lê `GET /public/plans`, que usa o mesmo `ListPlansUseCase` da tela do SuperAdmin — mudou o preço em `/plataforma/planos`, muda no site. O array `PLANS` do arquivo continua existindo só como conteúdo de reserva quando a API não responde; sem isso a página quebraria para um visitante caso a API caísse, o que é o pior momento possível.

**Simulador de economia.** Três controles (pedidos/mês, ticket médio, minutos gastos cobrando aprovação) que estimam horas devolvidas e cobrança a mais barrada, e cruzam o volume com o plano real para mostrar ganho **líquido**. As premissas ficam impressas embaixo do simulador — hora a R$ 60, corte de 70% na cobrança, 4% de notas divergentes, 6% cobrado a mais. É estimativa declarada, nunca promessa: número inventado sem premissa visível vira objeção na primeira reunião.

**Lista de espera é idempotente.** Reenviar o mesmo e-mail devolve `alreadyOnList: true` com a posição, em vez de erro. O e-mail é normalizado no DTO (`trim` + minúsculas) antes do `@unique`, senão `Compras@X.com` e `compras@x.com` viram duas linhas.

**Animação sem biblioteca.** `useReveal` usa `IntersectionObserver` e devolve o estado já resolvido na inicialização quando o visitante pede movimento reduzido — não há `setState` dentro de efeito. Nenhuma dependência foi adicionada.

**Os mockups são componentes, não imagens.** `DeviceShowcase` monta desktop e celular em HTML com os tokens do design system. Custa mais que exportar um PNG do Figma, mas fica nítido em qualquer tela, acompanha mudança de marca sem reexportar e pesa menos que a imagem equivalente.

---

## 19. Perfil do usuário

Cobre: `GET /users/me`, `PATCH /users/me`, `GET /users`, `GET /users/{id}`, `DELETE /users/me`.

> **Nota de risco herdada do backend**: `GET /users` e `GET /users/{id}` hoje não são escopadas por empresa (achado registrado no histórico de testes — listam todos os usuários da plataforma para qualquer autenticado). O front **não deve construir nenhuma tela de "listar todos os usuários"** a partir dessas rotas — usar apenas `GET /members` (que já é escopado corretamente) para qualquer listagem de pessoas dentro da empresa. Isso é uma decisão de spec, não uma limitação técnica: a rota existe, mas propositalmente não vira tela, até o backend corrigir o escopo.

### 19.1 Tela — Meu perfil (`/perfil`)
- **Acesso**: qualquer usuário logado.
- Form: nome e telefone → `PATCH /users/me`. O telefone é formatado enquanto se digita e enviado só com dígitos; vazio vira `null`.
- **Sem upload de avatar.** O backend expõe `avatarUrl` como string e não tem endpoint de upload, então a tela mostra as iniciais. Versão anterior deste spec previa `<FileDropzone>` — não havia para onde enviar o arquivo.
- O cartão de ausência e substituto é o mesmo componente da tela de Equipe, e só aparece para `APPROVER` e `FINANCE_ADMIN`: `GET /members` responde 403 ao `REQUESTER`, e quem não aprova não tem o que delegar.
- E-mail mostrado como read-only (mudança de e-mail não está no escopo de rotas atual).
- Seção "Acesso e segurança": e-mail somente leitura com selo de confirmado, botão "alterar senha" que abre o modal 1.7, atalho para as preferências de notificação (14.3) e a data de entrada na equipe.
- Seção "ausência e substituto": abre modal 4.4 (é sobre o próprio membro).
- Seção "preferências de notificação": link para 14.3.
- Rodapé perigoso, isolado visualmente: "excluir minha conta" → `<ConfirmDialog>` reforçado (exige digitar "excluir" ou senha para confirmar, dado que é LGPD/irreversível) → `DELETE /users/me`.

### 19.1 Enviar feedback (diálogo do menu lateral)

Cobre `POST /feedbacks` e `GET /feedbacks/mine`.

- Aberto pelo item "Enviar feedback" no rodapé da sidebar. Não é rota própria: feedback é interrupção de uma tarefa, e mandar o usuário para outra página perde o contexto que ele queria relatar.
- **Duas abas: "Escrever" e "Seus envios".** O histórico não pode morar embaixo do formulário — com 20 envios a lista empurraria o botão de enviar para fora da tela. Em aba própria ele rola dentro de `max-h-72` e o formulário fica sempre do mesmo tamanho.
- Tipo (Sugestão / Problema / Outro) é um **segmentado compacto**, não três cartões com descrição. Cartão grande com título e parágrafo é peso visual demais para um campo que o usuário responde em meio segundo, e a descrição só repete o rótulo.
- O texto é o herói: a caixa engloba textarea, anexo, contexto e o botão numa moldura só, que acende junto no foco (`focus-within`). Isso substitui a pilha rótulo/campo/ajuda, que era o que dava cara de formulário genérico.
- **Print opcional** (PNG/JPEG/WEBP, até 5 MB), com miniatura e remoção. O tipo é validado pela assinatura do arquivo no servidor, não pela extensão — um PDF renomeado é recusado.
- **A tela atual continua sendo capturada sozinha** via `useLocation`, exibida como chip ao lado do anexo; o navegador vem do `User-Agent` no servidor. O print é complemento, não substituto: a rota chega sempre, mesmo quando o usuário não anexa nada.
- O formulário vive num componente montado só enquanto o diálogo está aberto, então o estado zera por desmontagem em vez de `useEffect` — o padrão antigo dispara `react-hooks/set-state-in-effect`. Pelo mesmo motivo, a URL da miniatura sai de `useMemo` e o efeito só revoga.

---

## 20. Roteamento, guards e layout

### 20.1 Layouts

| layout | rotas | conteúdo |
|---|---|---|
| `PublicLayout` | login, registro, esqueci senha, verificação, aceitar convite | sem sidebar, card central, logo |
| `EmailApprovalLayout` | `/aprovacoes/{token}` | standalone, mobile-first, sem elementos do app |
| `AppLayout` | tudo autenticado de empresa | sidebar (menu por perfil), topbar (sino de notificação, menu do usuário), breadcrumb |
| `PlatformLayout` | `/plataforma/*` | sidebar própria, sem referência a Centro de Custo/pedidos |

**A busca do topo é ancorada à esquerda, não centralizada.** Ela fica logo depois do botão de recolher a sidebar; o sino e "Novo pedido" vão para a direita com `ml-auto`. Centralizar era o comportamento anterior e estava errado por um motivo estrutural: o cabeçalho começa depois da sidebar, então "centro do cabeçalho" e "centro da tela" são pontos diferentes — e a distância entre eles muda conforme a sidebar abre. O resultado era uma busca que parecia deslocada com a sidebar aberta e correta com ela fechada. Ancorada, a busca não se move em nenhum dos dois estados.

**O atalho da busca aceita ⌘K e Ctrl+K.** O handler testa `metaKey || ctrlKey`, e o rótulo dentro do campo troca conforme o sistema. A detecção usa `navigator.userAgentData.platform` com fallback para o `userAgent` — `navigator.platform` é depreciada e, onde já foi esvaziada, faria um Mac exibir "Ctrl K".

### 20.2 Menu lateral por perfil (dentro de `AppLayout`)

| item | `REQUESTER` | `APPROVER` | `FINANCE_ADMIN` |
|---|---|---|---|
| Pedidos | ✅ | ✅ | ✅ |
| Ordens de compra | — | — | ✅ |
| Recebimentos | ✅ (só os próprios pedidos) | — | ✅ |
| Notas fiscais | — | — | ✅ |
| Conferências | — | — | ✅ |
| Contas a pagar | — | — | ✅ |
| Centros de Custo | leitura | leitura | ✅ |
| Orçamento | leitura (do próprio CC) | leitura | ✅ |
| Matriz de alçadas | — | leitura | ✅ |
| Fornecedores / Categorias | leitura | leitura | ✅ |
| Equipe | leitura | leitura | ✅ |
| Auditoria | — | — | ✅ |
| Dashboard/Analytics | — | — | ✅ |
| Plano e assinatura | — | — | ✅ |
| Empresa (dados/política) | — | — | ✅ |

`<RoleGuard>` implementa esta tabela como fonte única (`lib/permissions.ts`), consumida tanto pelo menu quanto pelas rotas — nunca duas fontes de verdade para a mesma regra.

### 20.3 Redirecionamentos globais

- Sem sessão válida → `/login`, preservando `?redirect=` para voltar após autenticar.
- Sessão válida sem `companyId` → `/onboarding/empresa`, **exceto SuperAdmin**, que vai para `/plataforma`. Quem administra a plataforma não tem empresa própria a configurar, e forçá-lo pelo onboarding de CNPJ era um beco sem saída: o fluxo terminaria criando uma empresa que ele não usa. A regra vive em `landingWithoutCompany()` em `routes/guards.tsx`, consumida por `RequireCompany` e por `RedirectIfAuthenticated`, para não haver duas fontes da mesma decisão.
- No `PlatformLayout`, o atalho "voltar para a empresa" **só aparece quando existe vínculo**. Sem ele o botão devolveria o SuperAdmin ao mesmo redirecionamento, num laço. Sem empresa, o cabeçalho oferece apenas sair.
- Sessão válida, empresa criada, onboarding não `DONE` → força `/onboarding` até completar (bloqueia navegação para outras rotas, exceto perfil e logout).
- Rota fora do perfil do usuário → redireciona para `/` com toast "você não tem acesso a esta área".
- `isSuperAdmin: true` → item extra no menu do usuário "ir para plataforma" (`/plataforma`), sem sair automaticamente do contexto de empresa (a pessoa pode ter os dois papéis).

---

## 21. Cobertura — checklist final

Todas as ~130 rotas do backend mapeadas para pelo menos uma tela/modal/ação acima, exceto as rotas de refresh/logout/me (infraestrutura de sessão, seção 1.9) e as duas rotas de `/users` deliberadamente não usadas para listagem (seção 19, nota de risco).

| domínio backend | seção deste spec |
|---|---|
| auth | 1 |
| onboarding | 2 |
| companies | 3 |
| invites, members | 4 |
| cost-centers | 5 |
| approval-rules, categories, suppliers | 6 |
| budgets | 7 |
| purchase-requests | 8 |
| purchase-orders | 9 |
| receipts | 10 |
| invoices | 11 |
| matching, payables | 12 |
| email-approvals | 13 |
| notifications | 14 |
| audit-logs | 15 |
| analytics | 16 |
| billing | 17 |
| platform | 18 |
| users | 19 |
