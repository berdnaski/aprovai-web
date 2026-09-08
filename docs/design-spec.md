# Spec de Design — AprovAI

Fonte da verdade visual do produto. Toda tela nova aplica estes tokens; nenhuma cor, espaçamento ou peso de fonte é escolhido ad-hoc numa tela individual — se falta um token, este documento é atualizado primeiro.

Referência de tom: ClickUp, Linear, Notion — SaaS de produtividade com identidade de marca clara, mas execução contida. Não é a estética "IA generativa" (fundo cru, contraste máximo, roxo-neon usado como wallpaper).

---

## 1. Cor

### 1.1 Por que estes valores

A logo define dois pontos fixos: roxo e verde. O erro comum seria usar o roxo vibrante da marca (`#7C3AED`-ish) como cor de superfície ou texto — ele cansa em uso prolongado porque este é um sistema de trabalho, não uma landing page vista uma vez. Por isso o roxo do token `--primary` é fechado (mais escuro, menos saturado) em relação ao da logo: a logo pode ser vibrante porque aparece uma vez no topo; o botão que a pessoa vê 200 vezes por dia não pode.

Nota técnica: em OKLCH, matiz 292 já lê como azul-violeta, não roxo — a faixa que corresponde ao roxo da logo fica em torno de 300–310. Primeira versão deste token usava 292 e saía azulada; corrigido para 305.

Os neutros de texto e borda são cinzas verdadeiramente neutros (`#202020`, `#71717A`, `#E5E5E5`), sem desvio de matiz. Uma versão anterior deste spec usava neutros com traço azulado (matiz 285 em OKLCH); na tela isso deixava o texto com aparência fria e endurecida. O fundo (`--background`) mantém um croma quente mínimo, que é o que faz a página parecer "papel" em vez de "tela branca crua" — mas o texto sobre ele é neutro.

O texto principal nunca é `#000`: preto puro sobre fundo claro gera contraste excessivo, cansa em leitura prolongada e dá aspecto duro à interface.

### 1.2 Tokens — modo claro (único modo por ora)

| token | oklch | hex aprox. | papel |
|---|---|---|---|
| `--background` | `oklch(0.985 0.004 75)` | `#FAFAF8` | fundo da página — off-white morno |
| `--surface` / `--card` | `oklch(1 0 0)` | `#FFFFFF` | cards, modais, inputs — branco reservado a elementos elevados |
| `--foreground` | `#202020` | `#202020` | texto principal — cinza-carvão neutro, nunca `#000` (preto puro cansa a leitura e endurece a tela) |
| `--muted` | `oklch(0.965 0.004 75)` | `#F2F1EE` | fundos secundários (linhas alternadas de tabela, badges neutros) |
| `--muted-foreground` | `#71717A` | `#71717A` | texto secundário, placeholder, timestamp |
| `--border` | `#E5E5E5` | `#E5E5E5` | bordas de input, divisores, contorno de card |
| `--primary` | `oklch(0.44 0.17 305)` | `#6B3FA0` | roxo de marca, fechado — botão primário, link ativo, foco |
| `--primary-hover` | `oklch(0.38 0.17 305)` | `#5A3486` | hover do primary — mesmo matiz, ~5% mais escuro |
| `--primary-foreground` | `oklch(0.99 0 0)` | `#FDFDFD` | texto sobre `--primary` |
| `--brand-accent` | `oklch(0.62 0.16 155)` | `#00A874` | verde de marca — uso cirúrgico: sucesso, confirmação, badge "aprovado" (nome é `--brand-accent`, não `--accent`; ver 6.3) |
| `--brand-accent-foreground` | `oklch(0.99 0 0)` | `#FDFDFD` | texto sobre `--brand-accent` |
| `--accent` | `#F4F4F5` | `#F4F4F5` | hover neutro do shadcn — cinza, **não** o verde de marca |
| `--destructive` | `oklch(0.53 0.16 25)` | `#C4432E` | erro, ação destrutiva — terroso, não vermelho-semáforo |
| `--destructive-foreground` | `oklch(0.99 0 0)` | `#FDFDFD` | texto sobre `--destructive` |
| `--warning` | `oklch(0.72 0.15 75)` | `#C4831F` | pendências, alertas de prazo — âmbar terroso |
| `--ring` | `--primary` a 40% opacidade | — | anel de foco em input/botão |

### 1.3 Regra de uso

- **`--primary` é ação, não decoração.** Aparece em: botão primário, link, item de menu ativo, borda de foco. Nunca em fundo de seção, nunca em texto de corpo.
- **`--brand-accent` (verde) é raro de propósito.** Se ele aparecer em toda tela, perde o significado de "confirmação". Reservado a: status `APPROVED`/`MATCHED`/`RELEASED`, toast de sucesso, ícone de check.
- **90% de qualquer tela é `--background`, `--surface`, `--foreground`, `--muted-foreground`, `--border`.** As cores de marca são o tempero, não o prato.
- **A moldura de navegação usa `--background`, não `--surface`.** Sidebar e barra superior são cromo, não conteúdo elevado: ficam na mesma cor da página e se separam pela borda. Branco é o que sobe (card, modal, input), e é isso que faz um card se destacar. Por um tempo a barra superior ficou em `bg-card` enquanto a sidebar ficava em `--background`: as duas são a mesma camada e destoavam uma da outra.
- **Nunca usar as cores cruas do Tailwind** (`purple-600`, `green-500`, etc). Todo componente referencia os tokens semânticos acima.

---

## 2. Tipografia

### 2.1 Famílias

| papel | fonte | uso |
|---|---|---|
| Interface (padrão) | **Inter** (Google Fonts, SIL OFL) | tudo — títulos, corpo, botões, labels |
| Dados/números | **Inter** com `font-variant-numeric: tabular-nums` | valores monetários, tabelas — para alinhamento vertical de dígitos |

Uma família só, com pesos variados — não introduzir uma segunda fonte "de destaque" (display serifada + corpo sans é o template nº1 de design gerado por IA).

Inter é aplicada com `font-feature-settings: "cv11", "ss01"` no `body`: `cv11` troca o `l` minúsculo pela variante com cauda (evita confusão com `I` maiúsculo e `1`), e `ss01` ativa o conjunto estilístico alternativo que arredonda alguns terminais. São esses ajustes que separam Inter "de fábrica" da Inter usada em produtos com acabamento cuidado.

Nota: a primeira versão do projeto usava Satoshi (Fontshare). Trocada por Inter por dois motivos: licença SIL OFL (permite self-hosting sem autorização por escrito, ao contrário da ITF Free Font License) e melhor legibilidade em tamanhos pequenos nas tabelas densas que o produto tem.

### 2.2 Escala

Os tokens abaixo existem como utilities reais em `src/index.css` (bloco `@utility` do Tailwind v4). Não são descrição: são a definição. Uma tela escreve `text-display`, nunca `text-[30px] leading-[1.15] font-bold`.

| token | tamanho / altura | peso | tracking | uso |
|---|---|---|---|---|
| `text-display` | 30px / 1.15 | 700 (Bold) | `-0.025em` | título de página isolada (ex: "Criar conta") |
| `text-heading` | 20px / 1.3 | 600 (SemiBold) | `-0.01em` | título de card, seção |
| `text-subhead` | 15px / 1.6 | 400 (Regular) | `0` | subtítulo sob o `text-display`, texto de apoio |
| `text-body` | 14px / 1.55 | 400 (Regular) | `0` | texto corrido, descrição, input |
| `text-label` | 13px / 1.4 | 500 (Medium) | `0` | label de campo, botão |
| `text-caption` | 12.5px / 1.45 | 400 (Regular) | `0` | helper text, timestamp, mensagem de erro |
| `text-overline` | 11.5px / 1.4 | 500 (Medium) | `0.04em` + uppercase | rótulo de agrupamento acima de um bloco |
| `text-micro` | 11px / 1.5 | 500 (Medium) | `0` | pill de status dentro de tabela densa — o único lugar abaixo de `text-caption` |

O peso e a altura de linha vêm no token. `text-label` já é Medium: escrever `text-label font-medium` é redundante, e `text-label font-normal` é uma exceção deliberada (usada quando o rótulo é texto secundário, não label de campo).

Notas sobre valores que mudaram durante a implementação:

- **display era 32px, virou 30px.** As telas de onboarding foram construídas em 30px e ficaram com respiro melhor no viewport de notebook; as de auth estavam em 28px. Unificado em 30px, que é o meio-termo que já estava validado na tela.
- **body era 15px, virou 14px + `text-subhead` em 15px.** Um único token para "texto que não é título" não dava conta: o subtítulo sob o H1 pede 15px, e o corpo dentro de formulário e tabela pede 14px. Separar os dois eliminou o valor arbitrário que aparecia em toda tela.
- **tracking do display é `-0.025em`, não `-0.01em`.** A 30px em Bold, `-0.01em` deixa o título frouxo. `-0.01em` continua correto em `text-heading` (20px).

---

## 3. Espaçamento e raio

- Grid base: **4px**. Todo espaçamento é múltiplo de 4 (4, 8, 12, 16, 24, 32, 48).
- `--radius`: **10px** em cards e botões, **8px** em inputs, **6px** em badges/chips pequenos. Cantos arredondados mas contidos — nem o `rounded-full` de pílula que a IA generativa adora, nem o raio zero de broadsheet.
- Sombra: uma só, sutil, para elevação de card/modal — `0 1px 2px oklch(0.2 0 0 / 0.04), 0 1px 8px oklch(0.2 0 0 / 0.04)`. Nunca sombra colorida (`shadow-purple-500/50`), que é outro tique de IA generativa.

### 3.1 Densidade de tabela

As listagens são o lugar onde o produto é usado o dia inteiro, e onde a escala do corpo (14px) desperdiça linha. O padrão, implementado em `components/ui/data-table.tsx`:

| elemento | valor |
|---|---|
| altura da linha do corpo | 56px (`h-14`) |
| altura do cabeçalho | 56px (`h-14`) |
| altura do header do card | 44px (`min-h-11`) |
| texto de célula | `text-label` (13px) em peso normal |
| texto de cabeçalho | `text-overline` (11,5px) |
| pill de status | `text-micro` (11px) |
| gutter da primeira/última coluna | 20px (`first:pl-5 last:pr-5`) |
| fundo do cabeçalho | `bg-card/95`, sticky com `backdrop-blur-sm` |
| divisor entre linhas | `border-border/40` |
| linha selecionada | `bg-primary/4` + `border-l-2 border-l-primary` |

O contraste de hierarquia dentro da linha vem do **peso** (nome em `font-medium`, e-mail em `text-muted-foreground`), não do tamanho.

**A linha era 44px e o texto 12,5px.** A densidade original mirava o operador que passa o dia na listagem, mas apertava demais: com duas informações empilhadas na célula (nome mais CNPJ, número mais fornecedor), 44px comprime o entrelinhamento e o texto de 12,5px fica pequeno em tela de notebook. 56px e 13px continuam densos — cabem 12 linhas numa dobra de 1080px — sem parecer planilha.

**O cabeçalho perdeu o preenchimento cinza.** `bg-muted/35` sob texto já esmaecido criava uma faixa que pesava mais que as próprias linhas. Agora o cabeçalho é a mesma superfície do card, separado só pela borda.

### 3.2 Tabela vira cartão no celular

Abaixo de `sm`, `<DataTable>` deixa de renderizar `<table>` e passa a renderizar uma lista de cartões: a primeira coluna vira o título do cartão, as demais viram pares rótulo-valor empilhados. As colunas com `hideBelow` continuam valendo no modo tabela.

Antes disso, a tabela apenas rolava na horizontal no celular, o que esconde justamente a coluna de valor — a que mais importa — atrás de um gesto que ninguém descobre. O `rowAccent` e o clique da linha funcionam igual nos dois modos.

---

## 4. Estados interativos

- **Foco**: anel de 2px em `--ring` (primary a 40%), sempre visível — nunca `outline: none` sem substituto.
- **Hover em botão primário**: `--primary` → `--primary-hover`, sem mudança de tamanho/sombra.
- **Disabled**: opacidade 50%, cursor `not-allowed`, sem mudança de cor de fundo.
- **Transições**: 150ms `ease-out` em cor/borda/sombra. Sem animação de entrada elaborada em elementos de formulário — este é um sistema de trabalho usado o dia inteiro, fricção de movimento cansa em uso repetido.

---

## 5. Assinatura visual do produto

Um elemento recorrente que qualquer tela do AprovAI carrega, para não parecer template shadcn puro:

**O traço do check da logo como acento de estado.** O ícone de "aprovado"/sucesso em qualquer lugar do produto (toast, badge, ícone de confirmação) usa o mesmo ângulo de traço do check verde na logo — não o ícone `Check` genérico do lucide-react rotacionado, mas um traço com a mesma geometria (~30° de inclinação, ponta quadrada). É pequeno, mas é a única forma proprietária do sistema, repetida com intenção.

---

## 6. Aplicação em shadcn/ui

Os tokens de cor vivem em `:root` e os de tipografia em blocos `@utility`, ambos em `src/index.css`. O bloco `.dark` permanece no arquivo mas não é mantido/testado nesta fase (ver decisão: só modo claro por ora).

Regra de manutenção: falta um tamanho, um peso ou uma cor? Adiciona-se o token aqui e em `index.css` antes de usá-lo numa tela. Valor arbitrário direto no `className` (`text-[17px]`, `bg-purple-600`) é o que este documento existe para impedir — é assim que dois botões acabam com dois roxos diferentes.

Mapeamento direto:
```
--background        → 1.2 --background
--foreground         → 1.2 --foreground
--card               → 1.2 --surface
--card-foreground    → 1.2 --foreground
--primary            → 1.2 --primary
--primary-foreground → 1.2 --primary-foreground
--secondary          → 1.2 --muted (usado para botão secundário/outline)
--muted              → 1.2 --muted
--muted-foreground   → 1.2 --muted-foreground
--accent             → permanece neutro (hover do shadcn); o verde de marca
                        vive em --brand-accent, ver 6.3
--destructive        → 1.2 --destructive
--border / --input   → 1.2 --border
--ring               → 1.2 --ring
```

### 6.1 Largura de página

Duas larguras, decididas pelo tipo de conteúdo:

- **Listagem com tabela** ocupa os 1200px do `AppLayout` inteiros. Coluna é dado, e cortar largura corta informação.
- **Formulário, leitura e configuração** ficam em `max-w-3xl` **com `mx-auto`**. Sem o `mx-auto` o bloco encosta à esquerda e sobra um vazio de ~430px à direita, que lê como página inacabada — foi assim que Empresa, Notificações, Recebimentos e Emitir ordem nasceram, e todas precisaram ser corrigidas depois.

### 6.2 A escala tipográfica precisa ser declarada no `tailwind-merge`

Os tokens de `2.2` são `@utility`, não classes nativas do Tailwind — então o `tailwind-merge`, que roda dentro do `cn()`, não os reconhecia e classificava `text-caption` como **cor**. Ao encontrar uma cor de verdade na mesma chamada, ele descartava um dos dois:

```
cn("text-caption", "text-destructive")  →  "text-destructive"
```

O tamanho sumia e o texto caía para o herdado — maior que o previsto, estourando a largura de linhas e tabelas. Não havia erro nem aviso: só um layout que não fecha. Afetava 536 usos em 79 arquivos.

`src/lib/utils.ts` registra os tokens no grupo `font-size` via `extendTailwindMerge`. **Todo token novo de tamanho adicionado em `2.2` precisa entrar nessa lista também** — caso contrário ele volta a ser tratado como cor, e o sintoma reaparece longe da causa.

### 6.4 Visualização de dados

Recharts, já instalado. Nenhuma biblioteca de gráfico nova foi adicionada — o que faltava era método, não ferramenta.

**A paleta de gráfico é verificada, não escolhida no olho.** Os tokens `--chart-1..5` existiam desde o começo. Rodados contra um validador de acessibilidade (banda de luminosidade, piso de croma, separação para daltonismo e contraste com a superfície), eles **reprovam como paleta categórica**:

| verificação | resultado |
|---|---|
| Piso de croma | falha em `--chart-5` (`#71717A`) — é neutro, lê como cinza |
| Separação normal | falha em `--chart-4` ↔ `--chart-3` (terracota ↔ âmbar), ΔE 14,7 — abaixo de 15, difícil distinguir mesmo com visão normal |
| Contraste | aviso em `--chart-2` (verde), 2,98:1 — exige rótulo visível |

Consequências que valem como regra:

- **Terracota e âmbar nunca aparecem no mesmo gráfico.** O par é indistinguível o bastante para enganar quem tem visão normal, e rótulo não resolve esse caso específico.
- **Não existe gráfico de pizza ou rosca de status no produto.** Cinco status seriam cinco cores que a paleta não sustenta. Distribuição de status é mostrada com rótulo escrito ao lado, cor como reforço.
- **Verde só entra acompanhado de legenda ou rótulo**, por causa do contraste.
- O par validado e aprovado é **`--chart-1` (roxo) + `--chart-2` (verde)**, ΔE 32,8 normal e 24,0 no pior caso de daltonismo. É o que a série "abertos x decididos" usa.

**Anatomia dos gráficos:**

- Linha de 2px, área com gradiente de 18% a 1%, ponto ativo de 4px com anel de 2px na cor do card.
- Grade só horizontal, em `--border` a 70%. Eixos sem linha e sem tick.
- Toda série tem camada de hover: cursor vertical mais tooltip em card, com o valor de cada série.
- Barra de progresso de consumo muda de cor por limiar: `--chart-1` abaixo de 85%, `--warning` de 85 a 99%, `--destructive` de 100% em diante. O número em porcentagem sempre aparece ao lado — a cor nunca é o único indicador.
- `isAnimationActive` respeita `prefers-reduced-motion`, pelo hook `usePrefersReducedMotion`.

### 6.3 Ajuste ao padrão shadcn

shadcn usa `--accent`/`--accent-foreground` para estado de hover neutro (menu item hover, etc), não para "cor de destaque de marca". Como este projeto reserva verde para significado semântico (sucesso), a tela cria um token adicional `--brand-accent` para o verde, e mantém `--accent` no papel neutro padrão do shadcn (hover discreto, tom de `--muted`). Isso evita reescrever o comportamento interno de componentes shadcn que já assumem `--accent` como neutro.

---

## 7. Superfícies de marketing (landing)

A landing (`/`, `features/marketing/`) é a única tela que **não** segue as regras de 1.3 ao pé da letra, e a exceção é deliberada — o §1.1 já a antecipa: "a logo pode ser vibrante porque aparece uma vez no topo; o botão que a pessoa vê 200 vezes por dia não pode". A landing é vista uma vez. O produto é visto o dia inteiro.

O que muda, e só aqui:

| token | valor | papel |
|---|---|---|
| `--brand-purple` | `#7409F4` | roxo cru da logo. Aparece **apenas** como lavagem de fundo e halo, nunca em texto, botão ou borda |
| `--brand-green` | `#08DA81` | verde cru da logo. Uso pontual (ponto de status no pôster do vídeo) |

`--primary` continua sendo o roxo fechado do produto em todo elemento acionável da landing — botão, foco, barra de progresso. O roxo cru é atmosfera; o roxo do produto é ação. Misturar os dois num mesmo botão é o que faria a landing e o app parecerem produtos diferentes.

**Um matiz por fundo.** A primeira versão da lavagem usava roxo e verde juntos: o verde entrava pela direita como cinza-menta e brigava com o roxo. O fundo é roxo; o verde vive onde significa aprovação.

**A lavagem é da página, não da seção** (`page-backdrop.tsx`, montada em `landing-page.tsx`). Enquanto ela pertencia ao hero, terminava na borda daquela seção e a faixa de funcionalidades começava sobre o off-white cru: a emenda aparecia como uma linha horizontal atravessando a página, porque o desvio de matiz entre lavanda e o off-white morno do `--background` é visível mesmo a 5%. Toda seção nova da landing entra sem fundo próprio e herda essa superfície.

### 7.1 Escala tipográfica da landing

A escala de 2.2 vai até 30px (`text-display`), que é título de tela de produto. Título de landing é outra função — precisa ser lido a três metros da tela. Os dois tokens abaixo existem em `index.css` e estão registrados no `tailwind-merge` (ver 6.2):

| token | tamanho / altura | peso | tracking |
|---|---|---|---|
| `text-hero` | `clamp(2.5rem, 5.6vw, 4.5rem)` / 1.03 | 700 | `-0.035em` |
| `text-hero-sub` | `clamp(1rem, 0.78vw + 0.82rem, 1.1875rem)` / 1.55 | 400 | `-0.005em` |

Nota: o hero atual usa 56px em peso 600 direto no `className`, não `text-hero`. Os dois tokens ficam para os títulos das seções seguintes; se o hero se estabilizar em 56/600, é esse valor que vira token e o `text-hero` é corrigido — não o contrário.

### 7.2 Raio na landing

O produto usa 10px em card/botão (§3). A landing acrescenta duas medidas maiores, para peças que o produto não tem:

| peça | raio |
|---|---|
| botão, link de navegação | 10px — igual ao produto |
| campo de captura de e-mail | 16px |
| ilha flutuante de navegação | 20px |
| moldura do vídeo | 20px externo / 15px interno |
| pílula de módulo | `rounded-full` |

`rounded-full` continua proibido em botão dentro do produto (§3). Na landing ele é usado só nas pílulas de módulo, que são rótulos, não ações.

### 7.3 Sombra

Vale a regra do §3: sombra neutra, nunca colorida. A landing usa três degraus, todos em `oklch(0.2 0 0 / α)`:

- `0 2px 4px /0.04` — botão, pílula, campo;
- `0 2px 22px /0.06` — ilha flutuante de navegação;
- `0 2px 4px /0.04, 0 18px 44px -16px /0.14, 0 48px 88px -40px /0.24` — moldura do vídeo, a única peça que precisa de sombra em camadas.

O halo roxo atrás da moldura do vídeo **não é sombra**: é um gradiente radial desfocado atrás do card, sem opacidade sobre a borda. É a diferença entre iluminar o fundo e tingir a sombra.

### 7.4 Duas barras de navegação

No topo da página vale uma barra estática, larga, sem fundo. A partir de 24px de rolagem ela dá lugar a uma ilha flutuante branca centralizada (`fixed top-2`, raio 20px), que entra por `translate-y` + `opacity` em 300ms.

Uma barra só, trocando de fundo no scroll, resolveria a navegação — e é o que toda landing faz. A troca por ilha custa uma classe de transform e é o que dá a leitura de interface viva. O wrapper da ilha é `pointer-events-none` para não capturar cliques do hero enquanto ela está escondida.

### 7.5 Faixa infinita de funcionalidades

Abaixo do vídeo, uma faixa que desliza sem parar com os módulos do produto (`features/marketing/feature-marquee.tsx`). Anatomia:

| elemento | valor |
|---|---|
| item | 124×94px (`104px` abaixo de `sm`), gap de 16px, sem fundo e sem raio |
| ícone | 24px, `--muted-foreground` a 55% |
| rótulo | 14px/20 peso 500, `--muted-foreground` a 70% |
| caixa do rótulo | altura fixa de 40px (duas linhas), alinhada ao topo |
| máscara | `linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)` |
| animação | `translateX(0 → -50%)`, 20s linear infinita (~180px/s) |

Três coisas fazem a faixa parecer contínua, e nenhuma é opcional:

- **A lista é duplicada e o deslocamento é exatamente `-50%`.** Ao reiniciar, a segunda cópia está no pixel onde a primeira começou. Qualquer outro valor produz o salto que denuncia o truque.
- **A caixa do rótulo reserva duas linhas sempre.** Sem a reserva, "Anexos" (uma linha) sobe e "Aprovação por e-mail" (duas) desce, e a fileira de ícones perde a régua. Foi o defeito da primeira versão.
- **A máscara nas duas pontas.** Sem ela os itens entram e saem com corte reto, e a faixa lê como conteúdo cortado em vez de conteúdo que continua.

A cópia duplicada é `aria-hidden` — leitor de tela lê a lista uma vez.

**A faixa não reage ao ponteiro.** Sem fundo de hover e sem pausa. Ela é ambiente, não menu: destacar um item sugere que há algo para clicar, e parar no hover interrompe a leitura de fluxo contínuo exatamente quando a pessoa está olhando. Uma versão anterior fazia as duas coisas.

**Em `prefers-reduced-motion` ela desacelera, não congela.** É a exceção às outras duas animações da landing (`rise-in`, `drift-y`), que somem. Parada, a faixa deixa de comunicar que a lista continua e vira uma fileira aparentemente cortada nas duas pontas — o movimento *é* a informação aqui. A 60s em vez de 20s, o deslocamento sai do campo do estímulo periférico e vira deriva lenta.

**O contraste do rótulo é baixo de propósito e isso tem limite.** `--muted-foreground` a 70% sobre `--background` fica abaixo de 4.5:1: é decoração ambiente, não informação. Qualquer item que precise ser lido para a pessoa decidir algo não entra nesta faixa — vai para uma seção com contraste de texto normal.

### 7.6 Seções de conteúdo da landing

A partir do hero, toda seção segue a mesma pauta (`audience-section.tsx` é a referência):

| elemento | valor |
|---|---|
| seção | `pt-24 pb-16`, laterais `px-20 / 40 / 24 / 16` por breakpoint |
| bloco de cabeçalho | coluna centralizada, `gap-6` |
| etiqueta | 12px/600, `rounded-lg`, `bg-primary/8` + `text-primary` |
| título | 40px máx. (`clamp`), peso 600, tracking `-0.01em`, `max-w-[600px]` |
| subtítulo | 18px/24, `--muted-foreground`, `max-w-[525px]` |
| grade | `mt-16`, `grid-cols-3` com `gap-6` (uma coluna abaixo de `md`) |
| cartão | `rounded-[24px]`, borda, `px-7 pt-10 pb-11`, `gap-8` |
| mockup | 280×264, sem borda; só uma luz radial de marca ao fundo |
| título do cartão | 19px/24 peso 600, `--foreground` |
| descrição | 16px/28, `--muted-foreground`, sem `max-w` e sem `text-balance` |

**Cartões soltos, não um bloco fatiado.** Uma versão anterior usava o truque do vão de 1px sobre fundo `--border`: economiza tinta e é o que a referência faz, mas na tela os três cartões leem como um bloco único, e a moldura em volta vira um retângulo reto atravessando a página. A regra passou a ser vão de verdade (`gap-6`), cada cartão com sua borda, seu raio de 24px e sua sombra.

**A medida da linha é a largura útil do cartão.** Nada de `max-w-[333px]` num cartão de 411px: a faixa vazia de cada lado é o que faz o texto parecer espremido. E nada de `text-balance` na descrição — ele iguala o comprimento das linhas *encolhendo* a medida, que é exatamente o efeito a evitar. No título e no subtítulo da seção ele continua valendo, porque ali o objetivo é justamente equilibrar duas linhas curtas.

**As três descrições ocupam o mesmo número de linhas.** Não é detalhe de copy: com 4, 4 e 3 linhas, o rodapé dos cartões desanda. Texto novo nessa grade é escrito para fechar em quatro linhas a 16px na largura útil do cartão.

**O gradiente do título muda de ângulo conforme o número de linhas.** O hero usa 347° (diagonal) porque tem duas linhas longas; as seções usam 91° (quase horizontal) porque com linhas curtas a diagonal clarearia a segunda linha inteira. Mesmo recurso, mesma paleta (`--foreground` → `--foreground` a 44% sobre branco).

**Os mockups são UI desenhada, não screenshot.** Um print encolhido para caber ali vira borrão, e amarra a landing à versão do produto que estava no ar naquele dia. Desenhados, mostram só o gesto que interessa em cada perfil, em tipografia legível à distância de leitura.

**A folga entre as peças é o que faz cada peça ser lida.** A primeira versão punha cartões de 212px numa moldura de 280×231: eles encostavam uns nos outros e no selo, e o conjunto lia como aperto. Regra: moldura de 280×264, nenhuma peça acima de 224px, e nada colado na aresta.

**O fundo do mockup não é uma caixa.** A tentativa anterior — malha de linhas em toda a área — desenhava o retângulo de 280px em vez de sugerir superfície, e o mockup virava um card dentro do card. Agora é só uma luz radial de `--brand-purple` a 7%.

**Relação entre peças se desenha, não se subentende.** No mockup de "quem pede", o traço tracejado que liga o documento aos campos com o selo de extração no meio é o que transforma dois cartões soltos numa sequência. Sem ele o selo vira enfeite entre duas caixas.

### 7.7 Entrada por scroll

Toda seção abaixo do hero entra quando chega à viewport, pelo hook `useReveal` (`hooks/use-reveal.ts` — `IntersectionObserver` com `threshold` e `rootMargin` de -60px). O contêiner recebe `data-shown`, e os filhos marcados com `data-reveal` sobem 14px e aparecem em 620ms com `cubic-bezier(0.16, 1, 0.3, 1)`.

- **É transição, não `@keyframes`.** Com animação e `animation-fill-mode: backwards`, o conteúdo fica invisível para sempre se o observer nunca disparar. Com transição, o estado de repouso é o visível.
- **O escalonamento é aditivo.** A coluna declara `--col-delay`, a peça declara o seu, e o atraso final é `calc(var(--col-delay) + Xms)`. É isso que faz as três colunas entrarem em cascata *e* cada mockup manter a ordem de leitura interna (o documento, a extração, os campos preenchidos).
- **Não aninhe dois `data-reveal`.** Envolver o mockup inteiro num, além dos internos, faz a moldura subir junto com o conteúdo dela e o movimento acumula.
- Em `prefers-reduced-motion` o hook já devolve `shown` verdadeiro na primeira renderização e a CSS zera a transição.

A única peça cujo *valor* anima é a barra de orçamento (0 → 62%, com atraso, atrelada ao `group/col`). É o único número que muda no conjunto, e o preenchimento diz isso sem legenda.

### 7.8 Painel de abas

A terceira seção (`solution-section.tsx`) troca duas telas do produto num painel único.

| elemento | valor |
|---|---|
| painel | `rounded-[24px]`, borda, `bg-muted/80`, `pt-[68px]` para abrir espaço ao entalhe |
| entalhe | faixa de 392×68 em `--background`, `rounded-b-[20px]`, sobreposta ao topo do painel |
| esquinas do entalhe | 20×20 com `mask: radial-gradient(20px at 0 100%, #0000 98%, #000)` (espelhada à direita) |
| seletor | trilho de 360×40, `rounded-xl`, pílula ativa deslizando por `translateX` em 300ms |
| painel de conteúdo | grade `340px + 1fr`, card branco à esquerda, janela do app sangrando à direita |

**O entalhe é uma peça vazada, não dois retângulos.** A faixa branca sozinha encosta no painel em ângulo reto e a junção denuncia a sobreposição. As duas esquinas mascaradas devolvem o raio ao cinza dos dois lados, e é isso que faz o conjunto ler como um recorte.

**A pílula do seletor desliza, não troca de cor.** Duas pílulas acendendo e apagando fazem a troca parecer recarregamento; uma que se move diz que os dois painéis são o mesmo lugar visto de dois ângulos.

**Os dois painéis ficam montados, empilhados no mesmo lugar.** O inativo sai do fluxo (`absolute inset-0`), perde o ponteiro e desliza 12px. Desmontar o inativo faz a altura do bloco pular no meio da transição.

**No celular o entalhe some e as abas sobem para cima do painel.** O entalhe pressupõe um painel mais estreito que a viewport; em tela cheia ele não tem o que recortar. A troca é `max-md:static` mais **`max-md:order-first`** — sem o `order`, o bloco cai depois do painel, porque no DOM ele vem depois. Foi assim que a primeira versão saiu, com as abas escondidas embaixo de tudo.

**As janelas de app sangram pela direita e têm rodapé.** O corte sugere que a tela continua; o rodapé (`WindowFooter`) existe porque a janela estica até a altura do card da esquerda, e sem ele sobra um vazio do tamanho da diferença.

### 7.9 Seção de encaixe (com ou sem ERP)

A quarta seção (`erp-fit-section.tsx` + `fit-diagrams.tsx`) apresenta dois cenários lado a lado, em dois cartões da largura da página. É a seção com menos texto da landing: chip, mockup, uma frase de título e três marcadores de três palavras. **Quem explica é o desenho.**

| elemento | valor |
|---|---|
| container | `max-w-[1430px]` — o mesmo das seções 7.6 e 7.8 |
| grade | `grid-cols-2 gap-6` (uma coluna abaixo de `md`) |
| cartão | `rounded-[24px]`, borda, `p-8`, chip de cenário no topo |
| mockup | altura fixa `md:h-[320px]`, livre no celular |
| marcadores | fileira que quebra sozinha, `gap-x-5`, sem parágrafo antes |

**Largura de container é propriedade da página, não da seção.** Uma versão desta seção foi construída em `max-w-[720px]`: numa página que trabalha em 1430px, isso lê como uma fita fina entre dois vazios, a seção parece de outro site e todo texto dentro dela fica com medida curta. Se um conteúdo parece pedir menos largura, o que ele precisa é de mais conteúdo por linha, não de um container menor.

**Sem parágrafo.** Uma versão anterior tinha quatro linhas de prosa por cartão. Numa seção cujo argumento é visual, o parágrafo é justamente o que ninguém lê — e ele empurrava o mockup pra cima, roubando o espaço de quem estava fazendo o trabalho.

**Os mockups são telas de produto, não diagramas de caixinha.** Fila de pedidos com avatar, valor tabular e pílula de status; faixa de indicadores; botão de ação. Uma versão anterior usava ícone mais rótulo ligados por linha, e lia como fluxograma de apresentação: informa a estrutura, mas não vende o produto. Com quase nenhum texto em volta, o mockup precisa ter densidade de tela real.

**A estrutura de cada mockup é o argumento:**

- `StandaloneApp` (sem ERP): uma janela cheia, com fila, valores e decisão. Mostra que o AprovAI *é* o sistema, não um acessório.
- `ErpHandoff` (com ERP): janela do AprovAI em cima, arquivo de conciliação no meio, janela do ERP embaixo **em cinza, com barras neutras**. O cinza é intencional: o ERP continua fazendo o que fazia, sem cor e sem novidade.

**Selo flutuante encaixa por margem negativa, não por `absolute`.** `-mt-3 -mr-3 ml-auto` sobrepõe exatamente os 12px de respiro que a última linha tem embaixo. Com `absolute`, a sobreposição passava a depender da altura do conteúdo acima, e o selo cobria a pílula de status da última linha — foi o defeito da primeira versão desta peça.

**A altura fixa do mockup só vale a partir de `md`.** É ela que mantém título e marcadores dos dois cartões alinhados quando estão lado a lado. Empilhados no celular não há o que alinhar.

**Nunca prometer "integração automática" ou "sincroniza com seu ERP".** Integração direta com ERP está fora de escopo desta versão (`docs/procure-to-pay.md` §10: "Integração com ERP — exportação de arquivo resolve o MVP"). O contato é sempre nomeado como exportação para conciliação, e o mockup mostra literalmente o arquivo (`conciliacao-set.csv`).

**Os pontos de venda são qualitativos, não números inventados.** Nenhum chip do tipo "R$ 0 de economia" ou "3x mais rápido": esses números não existem e seriam o tique de landing gerada às pressas que o projeto evita.

### 7.10 Segurança (grade bento)

Grade de 4 colunas com duas células largas (`col-span-2`) e quatro estreitas. É a única grade assimétrica da landing, e a assimetria tem função: a trilha de auditoria e o limite da IA são os dois argumentos que fecham venda técnica, e o resto é checklist.

**Todo número e toda garantia sai de um RNF de `aprovia-api/docs/requirements.md`.** Segurança é a seção onde uma frase bonita inventada custa mais caro: o comprador técnico confere. Se a garantia não estiver escrita num requisito, ela não entra na célula.

**A célula "A IA sugere, quem decide é gente" não é opcional.** Num produto chamado AprovAI, é a primeira pergunta de quem avalia risco (RNF16: nenhum valor sugerido por IA é submetido sem confirmação humana; RNF15: a rota é determinística). Esconder isso não evita a pergunta, só faz ela aparecer na reunião.

### 7.11 FAQ

Acordeão em **duas colunas independentes**, não numa grade de duas colunas.

**Numa grade, os dois itens de uma mesma linha compartilham altura:** abrir o da esquerda estica a linha e deixa um buraco visível embaixo do da direita. Com duas pilhas `flex-col` separadas, cada coluna cresce sozinha. A ordem de leitura passa a ser coluna a coluna, o que num FAQ é aceitável.

**A altura anima por `grid-template-rows: 0fr → 1fr`**, com `min-h-0` no filho. Não precisa medir conteúdo em JavaScript e funciona com texto de qualquer tamanho.

### 7.12 CTA final e rodapé

O CTA de fechamento é o **único bloco escuro da página** fora do pôster do vídeo. Depois de sete seções em off-white, a inversão de tom marca o fim da leitura e devolve o olho pro campo de e-mail, que é deliberadamente a mesma peça do hero: quem rolou a página inteira reencontra o mesmo gesto, não um formulário novo pra decifrar.

**O rodapé só linka o que existe.** Nenhum link para termos, privacidade ou contato até que essas páginas existam: link morto em rodapé é o primeiro lugar onde alguém percebe que o site foi entregue pela metade.

**Item de menu só entra depois da seção.** O `NAV_ITEMS` do cabeçalho e as âncoras da página são verificados juntos — hoje as cinco âncoras (`#produto`, `#alcadas`, `#seguranca`, `#precos`, `#faq`) resolvem para seções montadas.

### 7.13 Planos

Três cartões, o do meio em destaque por **borda e sombra**, não por bloco de cor: uma lavagem forte atrás do cartão aperta o contraste do texto que está por cima dela.

**Nenhum preço ou limite numérico aparece.** Os três níveis existem no produto (`PLAN_TIER_LABELS` em `types/enums.ts`), mas `priceCents`, `maxMembers` e `maxRequestsMonth` moram no banco e são definidos pelo SuperAdmin. Valor inventado numa landing é descoberto na primeira conversa de venda. A seção se apoia no teste grátis, que existe (`SubscriptionStatus.TRIALING`), e o layout já comporta uma linha de preço acima da lista quando a tabela comercial for definida.

### 7.14 O roxo decorativo saiu da landing

A landing acumulou, ao longo da construção, oito gradientes de `--brand-purple` (lavagem de fundo cobrindo 1900px, halo atrás do vídeo, luz atrás de cada mockup, lavagem no cartão de plano em destaque, dois radiais no painel escuro de fechamento) e seis pílulas `bg-primary/8 text-primary` abrindo as seções. **Todos foram removidos.**

**Isso nunca foi permitido.** O §1.3 já dizia: `--primary` é ação, e aparece em botão, link, item de menu ativo e borda de foco. Nunca em fundo de seção. A landing violava a própria regra do produto, e o resultado é a assinatura visual mais reconhecível de página gerada por IA: roxo difuso por toda parte porque a logo é roxa.

**O que dá relevo à página agora é estrutura, não atmosfera:**

| antes | agora |
|---|---|
| lavagem roxa no fundo do hero | `--background` liso com grão |
| halo roxo atrás do vídeo e dos mockups | nada; a sombra em camadas do próprio cartão |
| roxo nas superfícies escuras | luz branca a 10% no alto e vinheta preta embaixo |
| pílula roxa abrindo cada seção | `SectionLabel`: versalete entre dois fios de 24px |
| lavagem no cartão de plano em destaque | borda e sombra |

**O roxo que ficou é o roxo que faz alguma coisa:** botão primário, anel de foco, pílula que desliza no seletor de abas, item ativo de menu lateral nos mockups, barra de progresso de orçamento, borda do plano em destaque, estado aberto do acordeão, e os selos de status `brand` dentro das telas desenhadas. Sobre off-white liso, esse roxo bate muito mais forte do que batia competindo com um fundo já roxo.

**Auditoria de regressão:** `grep -rn "brand-purple" src/features/marketing/` deve devolver zero, e nenhum elemento de mais de 40.000px² dentro de `main`/`footer` pode ter fundo ou gradiente na faixa do primary.

### 7.15 Lista de espera

Todo CTA da página aponta para a lista de espera, não para cadastro imediato: cabeçalho, campo do hero, cartões de plano, painel de fechamento e rodapé dizem **"Entrar na lista"**. Nada de "grátis" ou "teste" aparece no texto renderizado.

O destino ainda é `/registrar`, porque não existe endpoint de lista de espera no backend. Quando existir, o `onSubmit` do hero e do fechamento troca de rota num lugar só cada.
