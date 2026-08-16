# Spec do Frontend — AprovAI

Spec-driven development: este documento é a fonte da verdade antes de qualquer linha de código do front. Toda tela, modal e chamada de API listada aqui deve existir; nada deve existir que não esteja aqui. Divergência encontrada durante a implementação atualiza este arquivo primeiro, código depois.

Backend de referência: `aprovia-api`, prefixo `/api`, ~130 rotas, 4 perfis (`REQUESTER`, `APPROVER`, `FINANCE_ADMIN`, `SuperAdmin`).

---

## 0. Princípios e stack

### 0.1 Stack

| camada | escolha |
|---|---|
| build | Vite |
| framework | React 18 + TypeScript |
| roteamento | React Router v6 (data routers) |
| estado de servidor | TanStack Query — toda chamada de API passa por ele, zero `useEffect` + `fetch` manual |
| estado de formulário | React Hook Form + Zod (schema espelha o DTO da API) |
| UI | shadcn/ui + Tailwind CSS |
| tabelas | TanStack Table, para as ~15 telas de listagem |
| ícones | lucide-react (dependência do shadcn) |
| datas | date-fns |
| notificação de UI (toast) | sonner (padrão shadcn) |

### 0.2 Princípios de implementação

- **Nenhum componente chama `fetch` direto.** Toda chamada de API vive em `src/api/<domínio>.ts`, tipada, consumida via hook do TanStack Query em `src/hooks/<domínio>/`.
- **Dinheiro nunca é `number`.** A API devolve centavos como string (`"850000"`). O front formata com `Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'})` dividindo por 100 apenas na exibição — nunca soma/subtrai em ponto flutuante no front. Cálculos de total exibido replicam o que a API já mandou, não recalculam.
- **Erro da API é a fonte da mensagem.** O backend já devolve mensagens em português, para leigos (ver `docs/procure-to-pay.md` e o histórico de reescrita de erros). O front exibe `error.message` direto no toast — não reescreve, não genericiza para "algo deu errado".
- **Cada tela declara o(s) perfil(is) que a acessam.** Rotas fora do perfil do usuário logado nem aparecem no menu — não é seguranca (isso é o backend), é não confundir quem não pode agir ali.
- **Toda action destrutiva ou irreversível passa por confirmação.** Modal de confirmação nomeado explicitamente nas specs de tela abaixo sempre que a ação for `DELETE`, cancelamento, ou perda de dado.
- **Paginação segue o contrato único da API**: toda listagem usa `{ items, meta: { total, page, perPage, totalPages } }` — um único componente `<DataTable>` compartilhado consome esse formato para todas as ~15 telas de lista.

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
│   ├── invoices/
│   ├── matching/
│   ├── payables/
│   ├── notifications/
│   ├── audit-logs/
│   ├── analytics/
│   ├── billing/
│   ├── platform/
│   └── profile/
├── routes/                       # definição das rotas React Router, 1 arquivo por área
└── lib/                          # money.ts, dates.ts, cn.ts (shadcn utils)
```

### 0.4 Componentes compartilhados (construir antes de qualquer tela)

| componente | usado em | contrato |
|---|---|---|
| `<DataTable>` | toda listagem paginada (~15 telas) | recebe `columns`, `data: Page<T>`, `onPageChange`, `isLoading`; renderiza skeleton, empty state, paginação |
| `<StatusBadge>` | qualquer enum de status (`RequestStatus`, `PurchaseOrderStatus`, `InvoiceStatus`, `MatchStatus`, `PayableStatus`, `InviteStatus`...) | mapa `status → {label pt-BR, cor}` centralizado em `lib/status-labels.ts`, uma entrada por enum do backend |
| `<MoneyDisplay>` | qualquer valor `*Cents` | recebe string de centavos, formata BRL |
| `<ConfirmDialog>` | toda ação destrutiva/irreversível | título, descrição, campo de justificativa opcional (usado em cancelamentos que exigem `reason`), botão de confirmação com `isPending` |
| `<EmptyState>` | toda lista vazia | ícone, texto, opcionalmente botão de ação primária |
| `<PageHeader>` | topo de toda tela | título, breadcrumb, slot de ação primária à direita |
| `<RoleGuard>` | em torno de rotas/blocos de UI | recebe `allow: CompanyMemberRole[]`, esconde/redireciona se o perfil do usuário não estiver na lista |
| `<FileDropzone>` | upload de anexos e XML | drag-and-drop + seleção manual, mostra progresso, valida extensão antes de enviar |

---

## 1. Autenticação

Cobre: `POST /auth/register`, `GET /auth/verify-email`, `POST /auth/resend-verification`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/change-password`, `POST /auth/confirm-password-change`, `POST /auth/logout`.

Autenticação é por cookie `httpOnly` (`access_token`, `refresh_token`) — o cliente HTTP do front usa `credentials: 'include'` em toda chamada; nunca armazena token em `localStorage`.

### 1.1 Tela — Cadastro (`/registrar`)
- **Acesso**: público.
- **Form**: nome, e-mail, senha (+confirmação), checkbox de aceite de termos.
- **API**: `POST /auth/register`.
- **Sucesso**: redireciona para `/registrar/confirme-seu-email` com o e-mail em query, mostra mensagem "enviamos um link de confirmação".
- **Erro**: e-mail já cadastrado → mensagem da API inline no campo e-mail.

### 1.2 Tela — Confirme seu e-mail (`/registrar/confirme-seu-email`)
- **Acesso**: público, chega só via redirect do 1.1.
- Mostra o e-mail informado, botão "reenviar e-mail" → `POST /auth/resend-verification`, com cooldown de 60s no botão (evita spam de clique).

### 1.3 Tela — Verificação de e-mail (`/verificar-email`)
- **Acesso**: público, via link do e-mail (`?token=`).
- Chama `GET /auth/verify-email?token=` no mount. Três estados: carregando, sucesso (botão "ir para o login"), erro (token expirado/inválido, botão "reenviar verificação").

### 1.4 Tela — Login (`/login`)
- **Acesso**: público.
- **Form**: e-mail, senha, link "esqueci minha senha".
- **API**: `POST /auth/login`.
- **Erro 403 `EmailNotVerified`**: mostra banner com botão "reenviar e-mail de confirmação" em vez de erro genérico.
- **Sucesso sem empresa ativa**: redireciona para onboarding de criação de empresa (seção 2).
- **Sucesso com empresa ativa**: redireciona para `/` (dashboard do perfil).

### 1.5 Tela — Esqueci minha senha (`/esqueci-a-senha`)
- **Form**: e-mail.
- **API**: `POST /auth/forgot-password` — sempre mostra a mesma mensagem de sucesso, independente do e-mail existir (não vaza existência de conta, é intencional no backend).

### 1.6 Tela — Redefinir senha (`/redefinir-senha`)
- **Acesso**: público, via link do e-mail (`?token=`).
- **Form**: nova senha + confirmação.
- **API**: `POST /auth/reset-password`.
- **Sucesso**: redireciona ao login com toast de confirmação.

### 1.7 Modal — Alterar senha (dentro do perfil, seção 20)
- **Form**: senha atual, nova senha, confirmação.
- **API**: `POST /auth/change-password` (dispara e-mail de confirmação) → usuário confirma clicando no link do e-mail → `GET`/página que chama `POST /auth/confirm-password-change`.
- Modal fecha com toast "verifique seu e-mail para confirmar a alteração".

### 1.8 Ação — Logout
- Botão no menu do usuário (topbar). `POST /auth/logout`, limpa cache do TanStack Query, redireciona para `/login`.

### 1.9 Sessão / refresh
- Não é tela. Interceptor no `api/client.ts`: em qualquer 401, tenta `POST /auth/refresh` uma vez; se falhar, limpa estado e redireciona `/login`.
- `GET /auth/me` é chamado no boot do app (dentro de um `AuthProvider`) para popular o usuário logado e decidir se mostra app ou tela de login.

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
- Form com os campos de configuração que hoje moram em `Company`: `overrunTolerancePercent`, `reminderHours`, `escalationHours`, `dualApprovalThresholdCents`, e os campos novos de procure-to-pay: `priceTolerancePercent`, `quantityTolerancePercent`, `requiresReceiptBeforeInvoice` (toggle), `autoReleaseOnMatch` (toggle), `poNumberPrefix`.
- Cada campo tem tooltip curto explicando o efeito (ex: "toda divergência de preço acima disto abre uma exceção para revisão").
- **API**: `PATCH /companies/me/policy`.

---

## 4. Equipe e convites

Cobre: `POST /invites`, `GET /invites`, `GET /invites/token/{token}`, `POST /invites/token/{token}/accept`, `POST /invites/{id}/resend`, `DELETE /invites/{id}`, `GET /members`, `GET /members/{id}`, `PATCH /members/{id}/role`, `PATCH /members/{id}/limit`, `PATCH /members/{id}/manager`, `PATCH /members/me/substitute`, `GET /members/{id}/responsibilities`, `DELETE /members/{id}`.

### 4.1 Tela — Equipe (`/equipe`)
- **Acesso**: todos os perfis veem (listagem), ações restritas a `FINANCE_ADMIN`.
- `<DataTable>` de `GET /members`: nome, e-mail, papel (`<StatusBadge>` de `CompanyMemberRole`), líder, situação (ativo/inativo).
- Ação "convidar membro" (só `FINANCE_ADMIN`) abre modal 4.3.
- Aba secundária "Convites pendentes" lista `GET /invites`, com ações reenviar (`POST /invites/{id}/resend`) e revogar (`DELETE /invites/{id}`, via `<ConfirmDialog>`).
- Linha da tabela expande para detalhe do membro (rota `/equipe/{id}`).

### 4.2 Tela — Detalhe do membro (`/equipe/{id}`)
- **Acesso**: `FINANCE_ADMIN` para editar; outros perfis veem somente leitura os próprios dados via perfil (seção 20), não esta tela.
- Seções editáveis, cada uma com seu próprio submit:
  - **Papel**: select `CompanyMemberRole` → `PATCH /members/{id}/role`. Se a API retornar `LastAdminError` (409), mostra o erro inline, não deixa trocar.
  - **Alçada de aprovação**: input de valor (BRL) → `PATCH /members/{id}/limit`.
  - **Líder direto**: combobox de busca de outro membro → `PATCH /members/{id}/manager`. Erros de ciclo (`HierarchyCycleError`, `SelfManagerError`) exibidos no combobox.
  - **Responsabilidades**: `GET /members/{id}/responsibilities` lista o que a pessoa gerencia (Centros de Custo, aprovações pendentes) — informativo, sem ação.
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
- Botão "aceitar convite" → `POST /invites/token/{token}/accept`. Sucesso força novo login (mesmo motivo do 2.1) e vai para o dashboard.

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
- **Form**: lista dos CCs que o membro gerencia (pré-marcados), novo gestor (combobox).
- **API**: `POST /cost-centers/transfer-management`.

---

## 6. Matriz de alçadas, categorias e fornecedores

Cobre: `GET /approval-rules`, `PUT /approval-rules`, `GET /approval-rules/resolve`, `POST /approval-rules/simulate`, `DELETE /approval-rules`, `GET /categories`, `POST /categories`, `GET /categories/{id}`, `PATCH /categories/{id}`, `PATCH /categories/{id}/active`, `GET /suppliers/lookup/{cnpj}`, `POST /suppliers`, `GET /suppliers`, `GET /suppliers/{id}`, `PATCH /suppliers/{id}`, `PATCH /suppliers/{id}/blocked`, `POST /suppliers/{id}/revalidate`.

### 6.1 Tela — Matriz de alçadas (`/matriz-de-alcadas`)
- **Acesso**: `FINANCE_ADMIN` edita; `APPROVER` vê em leitura (entender por que um pedido caiu nele).
- Editor de faixas: lista ordenável de `{ minAmountCents, maxAmountCents | null, approverType, ... }` vinda de `GET /approval-rules`.
- Botão "adicionar faixa" insere linha editável; última faixa sempre com teto "sem limite" (`max: null`), reforçado visualmente (não pode remover isso, só a última linha tem esse toggle).
- Validação client-side antes de enviar (evita round-trip óbvio): faixas contíguas, sem sobreposição, primeira começando em zero — mas a validação de verdade é a resposta da API (`ApprovalMatrixGapError`, `ApprovalMatrixOverlapError`, etc. já vêm com mensagem pronta).
- Salvar tudo de uma vez: `PUT /approval-rules` (substitui a matriz inteira).
- Botão "remover matriz" (`DELETE /approval-rules`, `<ConfirmDialog>` com aviso forte: pedidos novos ficarão sem rota até nova matriz).
- Painel lateral "simular": formulário com valor + Centro de Custo + solicitante → `POST /approval-rules/simulate`, mostra a cadeia de aprovadores resultante sem gravar nada. Serve tanto para testar a matriz quanto para o Requester entender antes de criar um pedido.

### 6.2 Tela — Categorias (`/categorias`)
- **Acesso**: `FINANCE_ADMIN` edita; todos veem (usado no formulário de pedido).
- `<DataTable>` simples de `GET /categories`: nome, descrição, situação (toggle ativo/inativo inline → `PATCH /categories/{id}/active`).
- Modal "nova categoria" / "editar categoria": nome, descrição → `POST /categories` / `PATCH /categories/{id}`.

### 6.3 Tela — Fornecedores (`/fornecedores`)
- **Acesso**: `FINANCE_ADMIN` edita; todos veem (usado no formulário de pedido).
- `<DataTable>` de `GET /suppliers`: razão social, CNPJ formatado, situação cadastral (`RegistrationStatus`), validação (`ValidationStatus`), bloqueado (badge vermelho se sim).
- Linha abre `/fornecedores/{id}`.

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
- Linha do histórico abre `/orcamentos/{id}`.

### 7.2 Tela — Detalhe do orçamento (`/orcamentos/{id}`)
- Dados do período, valor (editável via `PATCH /budgets/{id}`).
- `<DataTable>` do extrato: `GET /budgets/{id}/entries` — tipo (`CONSUMPTION`/`REVERSAL`), valor, pedido relacionado (link), data. É o "livro-caixa" do orçamento, somente leitura.

---

## 8. Ciclo do pedido de compra

Núcleo do sistema. Cobre: `POST /purchase-requests`, `GET /purchase-requests`, `GET /purchase-requests/{id}`, `POST /purchase-requests/{id}/items`, `GET /purchase-requests/{id}/items`, `PATCH /purchase-requests/{id}/items/{itemId}`, `DELETE /purchase-requests/{id}/items/{itemId}`, `POST /purchase-requests/{id}/files`, `GET /purchase-requests/{id}/files`, `GET /purchase-requests/{id}/files/{fileId}/download`, `DELETE /purchase-requests/{id}/files/{fileId}`, `POST /purchase-requests/{id}/extract`, `GET /purchase-requests/{id}/extract`, `PATCH /purchase-requests/{id}`, `POST /purchase-requests/{id}/submit`, `GET /purchase-requests/{id}/timeline`, `POST /purchase-requests/{id}/decisions`, `POST /purchase-requests/{id}/reassign`, `POST /purchase-requests/{id}/duplicate`, `POST /purchase-requests/{id}/cancel`, `DELETE /purchase-requests/{id}`.

### 8.1 Tela — Meus pedidos / Pendentes para mim / Todos (`/pedidos`)
- **Acesso**: todos os perfis, conteúdo muda por `view`.
- Três abas mapeando direto o parâmetro `view` de `GET /purchase-requests`: **Meus pedidos** (`MINE`), **Pendentes para mim** (`PENDING_FOR_ME`, badge com contagem, só visível/relevante para `APPROVER`/`FINANCE_ADMIN`), **Todos** (`ALL`, visibilidade filtrada pelo backend conforme RN43).
- `<DataTable>`: número, título, solicitante, Centro de Custo, valor, `<StatusBadge>` de `RequestStatus`, urgência, data.
- Filtros: status (múltiplo), Centro de Custo, fornecedor, categoria, busca por número/título — todos mapeando os query params de `GET /purchase-requests`.
- Botão "novo pedido" → `/pedidos/novo`.
- Linha abre `/pedidos/{id}`.

### 8.2 Tela — Novo pedido / Editar rascunho (`/pedidos/novo`, `/pedidos/{id}/editar`)
- **Acesso**: qualquer perfil pode criar; editar só o dono do rascunho (`RequestNotOwnedError` se não for).
- **Form principal**: título, descrição, Centro de Custo (combobox — só os que o usuário tem acesso, RN checada no backend), categoria, fornecedor (combobox com busca, ou botão "cadastrar novo fornecedor" que abre o modal 6.5 embutido), urgência, condições de pagamento.
- **API**: `POST /purchase-requests` (criar) / `PATCH /purchase-requests/{id}` (editar) — ambos só operam sobre `DRAFT` (backend rejeita com `RequestNotDraftError` fora disso; UI nem mostra o form de edição se o status não for `DRAFT`, mostra a tela 8.3 em modo leitura).
- **Seção de itens** (inline na mesma tela, não modal separado — é o coração do form): tabela editável com adicionar linha (`POST /purchase-requests/{id}/items`), editar quantidade/preço inline (`PATCH .../items/{itemId}`), remover linha (`DELETE .../items/{itemId}`, `<ConfirmDialog>` leve). Total recalculado a cada mudança, refletindo `GET /purchase-requests/{id}` — nunca somado no front.
- **Seção de anexos**: `<FileDropzone>`, lista de arquivos (`GET .../files`) com download (`GET .../files/{fileId}/download`, abre URL assinada em nova aba) e remoção (`DELETE .../files/{fileId}`).
- **Extração assistida por IA**: botão "extrair dados de um documento" abre modal 8.6.
- Rodapé fixo: botão "salvar rascunho" (sempre disponível) e "enviar para aprovação" (`POST /purchase-requests/{id}/submit`) — desabilitado se não houver itens.
- **Fluxo de duplicata (RN36)**: se `submit` voltar 400 listando pedidos parecidos, modal mostra a lista com link para cada um e checkbox "confirmo que não é duplicata" → reenvia `submit` com `confirmDuplicate: true`.
- **Fluxo de override de orçamento**: se o backend indicar `requiresOverride: true` na resposta da criação/edição, banner amarelo persistente na tela explicando que o pedido excede o orçamento disponível e vai precisar de aprovação com ressalva — não bloqueia o envio, só avisa.

### 8.3 Tela — Detalhe do pedido (`/pedidos/{id}`)
- **Acesso**: todos os perfis com visibilidade (RN43, backend decide, front só reage a 403/404).
- Cabeçalho: número, título, `<StatusBadge>`, valor total, urgência.
- Corpo: dados do pedido (read-only fora de `DRAFT`), tabela de itens (read-only), anexos (lista + download), resultado da extração de IA se houver.
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
- **Form**: prazo de entrega esperado, endereço de entrega, condições de pagamento (pré-preenchido do pedido, editável), observações, prefixo de numeração (pré-preenchido da política da empresa).
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

## 11. Notas fiscais

Cobre: `POST /purchase-orders/{id}/invoices/upload`, `POST /invoices/upload`, `GET /purchase-orders/{id}/invoices`, `GET /invoices/{id}`, `POST /invoices/{id}/link`, `POST /invoices/{id}/reject`.

### 11.1 Tela/Modal — Enviar nota fiscal
- **Caminho principal**, a partir de `/ordens-de-compra/{id}` (botão "enviar nota"): `<FileDropzone>` restrito a `.xml`, contexto da ordem já conhecido → `POST /purchase-orders/{id}/invoices/upload`.
- **Caminho secundário**, tela própria `/notas-fiscais/enviar`: mesmo dropzone, sem ordem pré-selecionada → `POST /invoices/upload`. Usado quando ainda não se sabe a ordem — resultado entra sem vínculo, com aviso "esta nota não está vinculada a nenhuma ordem, vincule manualmente".
- Erros mostrados diretamente da API: `InvoiceRecipientMismatchError` (CNPJ de destino não bate — provavelmente arquivo errado), `InvoiceAlreadyRegisteredError` (nota duplicada, com link para a nota já existente), `InvoiceParseFailedError` (detalha o que faltou no XML).

### 11.2 Tela — Notas fiscais (`/notas-fiscais`)
- **Acesso**: `FINANCE_ADMIN`.
- `<DataTable>`: número, fornecedor emitente, valor, `<StatusBadge>` de `InvoiceStatus`, ordem de compra vinculada (ou "sem vínculo"), data de upload.
- Linha abre `/notas-fiscais/{id}`.

### 11.3 Tela — Detalhe da nota fiscal (`/notas-fiscais/{id}`)
- Dados extraídos: emitente, chave de acesso, número/série, valores (total, produtos, frete, seguro, desconto), impostos destacados (`TaxKind` por linha).
- Itens da nota, cada um mostrando se já foi casado com um item de ordem de compra (`purchaseOrderItemId` preenchido ou não).
- Se `purchaseOrderId` nulo: banner "nota sem ordem vinculada", botão "vincular a uma ordem" abre modal com combobox de ordens em aberto do mesmo fornecedor → `POST /invoices/{id}/link`.
- Botão "rodar conferência" (se já vinculada e ainda não conferida) → dispara `POST /invoices/{id}/match`, redireciona para o resultado (seção 12.2).
- Botão "rejeitar nota" (`<ConfirmDialog>` com motivo) → `POST /invoices/{id}/reject`.

---

## 12. Conferência e pagamento

Cobre: `POST /invoices/{id}/match`, `GET /match-results`, `GET /match-results/{id}`, `POST /match-results/{id}/override`, `GET /payables`, `POST /payables/release-without-invoice`, `POST /payables/{id}/pay`.

### 12.1 Tela — Fila de conferências (`/conferencias`)
- **Acesso**: `FINANCE_ADMIN`.
- `<DataTable>` de `GET /match-results`, filtro padrão em `status=DIVERGENT` (é a fila de trabalho real — o que bateu sozinho não precisa de atenção humana).
- Colunas: nota, ordem de compra, `<StatusBadge>` de `MatchStatus`, valores comparados (pedido/recebido/faturado lado a lado), data.

### 12.2 Tela — Detalhe da conferência (`/conferencias/{id}`)
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
- **Form**: fornecedor (combobox), valor, vencimento, campo de justificativa, `<FileDropzone>` de comprovante (obrigatório — PDF/imagem, aceita qualquer coisa, é anexo livre).
- **API**: `POST /payables/release-without-invoice` (multipart).
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
- Linha expande para mostrar `oldData`/`newData` em formato legível (diff simples chave-valor, não JSON cru).
- É a única tela do sistema inteiramente somente-leitura — reforçar visualmente (sem nenhum botão de ação).

---

## 16. Métricas e exportação

Cobre: `GET /analytics/dashboard`, `GET /analytics/exports/requests`.

### 16.1 Tela — Dashboard (`/` para `FINANCE_ADMIN`, ou `/analytics`)
- **Acesso**: `FINANCE_ADMIN` apenas (backend retorna 403 para os demais).
- Cards de totais (`totals`), gráfico/barra de consumo por Centro de Custo (`consumption`), tabela de performance por aprovador (`approvers` — tempo médio de decisão), gargalos (`bottlenecks`), pedidos repetidos/possíveis duplicatas não confirmadas (`repeated`).
- Filtro de período no topo, afeta todos os blocos.
- Botão "exportar" abre modal com escolha de formato (CSV/XLSX) → `GET /analytics/exports/requests?format=`, dispara download direto do arquivo (não abre em nova aba, força save).

---

## 17. Plano e assinatura

Cobre: `GET /billing/subscription`, `GET /billing/plans`.

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

---

## 19. Perfil do usuário

Cobre: `GET /users/me`, `PATCH /users/me`, `GET /users`, `GET /users/{id}`, `DELETE /users/me`.

> **Nota de risco herdada do backend**: `GET /users` e `GET /users/{id}` hoje não são escopadas por empresa (achado registrado no histórico de testes — listam todos os usuários da plataforma para qualquer autenticado). O front **não deve construir nenhuma tela de "listar todos os usuários"** a partir dessas rotas — usar apenas `GET /members` (que já é escopado corretamente) para qualquer listagem de pessoas dentro da empresa. Isso é uma decisão de spec, não uma limitação técnica: a rota existe, mas propositalmente não vira tela, até o backend corrigir o escopo.

### 19.1 Tela — Meu perfil (`/perfil`)
- **Acesso**: qualquer usuário logado.
- Form: nome, telefone, avatar (upload — mesmo `<FileDropzone>`, aceita imagem) → `PATCH /users/me`.
- E-mail mostrado como read-only (mudança de e-mail não está no escopo de rotas atual).
- Seção "segurança": botão "alterar senha" abre modal 1.7.
- Seção "ausência e substituto": abre modal 4.4 (é sobre o próprio membro).
- Seção "preferências de notificação": link para 14.3.
- Rodapé perigoso, isolado visualmente: "excluir minha conta" → `<ConfirmDialog>` reforçado (exige digitar "excluir" ou senha para confirmar, dado que é LGPD/irreversível) → `DELETE /users/me`.

---

## 20. Roteamento, guards e layout

### 20.1 Layouts

| layout | rotas | conteúdo |
|---|---|---|
| `PublicLayout` | login, registro, esqueci senha, verificação, aceitar convite | sem sidebar, card central, logo |
| `EmailApprovalLayout` | `/aprovacoes/{token}` | standalone, mobile-first, sem elementos do app |
| `AppLayout` | tudo autenticado de empresa | sidebar (menu por perfil), topbar (sino de notificação, menu do usuário), breadcrumb |
| `PlatformLayout` | `/plataforma/*` | sidebar própria, sem referência a Centro de Custo/pedidos |

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
- Sessão válida sem `companyId` → `/onboarding/empresa`.
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
