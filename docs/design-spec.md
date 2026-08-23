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
| `--brand-accent` | `oklch(0.62 0.16 155)` | `#00A874` | verde de marca — uso cirúrgico: sucesso, confirmação, badge "aprovado" (nome é `--brand-accent`, não `--accent`; ver 6.1) |
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
| altura da linha do corpo | 44px (`h-11`) |
| altura do cabeçalho | 36px (`h-9`) |
| altura do header do card | 48px (`min-h-12`) |
| texto de célula e de cabeçalho | `text-caption` (12,5px) |
| pill de status | `text-micro` (11px) |
| gutter da primeira/última coluna | 16px (`first:pl-4 last:pr-4`) |
| fundo do cabeçalho | `bg-muted/35`, sticky com `backdrop-blur-sm` |
| divisor entre linhas | `border-border/40` |
| linha selecionada | `bg-primary/4` + `border-l-2 border-l-primary` |

O contraste de hierarquia dentro da linha vem do **peso** (nome em `font-medium`, e-mail em `text-muted-foreground`), não do tamanho — é o que mantém a linha em 44px sem achatar a leitura.

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
                        vive em --brand-accent, ver 6.1
--destructive        → 1.2 --destructive
--border / --input   → 1.2 --border
--ring               → 1.2 --ring
```

### 6.1 Ajuste ao padrão shadcn

shadcn usa `--accent`/`--accent-foreground` para estado de hover neutro (menu item hover, etc), não para "cor de destaque de marca". Como este projeto reserva verde para significado semântico (sucesso), a tela cria um token adicional `--brand-accent` para o verde, e mantém `--accent` no papel neutro padrão do shadcn (hover discreto, tom de `--muted`). Isso evita reescrever o comportamento interno de componentes shadcn que já assumem `--accent` como neutro.
