import type { Icon } from "@phosphor-icons/react"
import {
  Bell,
  Buildings,
  ChartBar,
  ChartLineUp,
  ClockCounterClockwise,
  Clock,
  CurrencyDollar,
  EnvelopeSimple,
  FileText,
  IdentificationCard,
  Invoice,
  NotePencil,
  Package,
  Paperclip,
  Receipt,
  Scales,
  SealCheck,
  Sparkle,
  Storefront,
  Tag,
  TreeStructure,
  UserPlus,
  UserSwitch,
  Users,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react"

type Feature = { label: string; icon: Icon }

const FEATURES: Feature[] = [
  { label: "Pedidos", icon: NotePencil },
  { label: "Rascunhos", icon: FileText },
  { label: "Anexos", icon: Paperclip },
  { label: "Leitura por IA", icon: Sparkle },
  { label: "Alçadas", icon: TreeStructure },
  { label: "Dupla assinatura", icon: UsersThree },
  { label: "Pendências", icon: Clock },
  { label: "Aprovações", icon: SealCheck },
  { label: "Aprovação por e-mail", icon: EnvelopeSimple },
  { label: "Substitutos", icon: UserSwitch },
  { label: "Centros de custo", icon: Buildings },
  { label: "Orçamento", icon: Wallet },
  { label: "Saldo do mês", icon: ChartLineUp },
  { label: "Categorias", icon: Tag },
  { label: "Fornecedores", icon: Storefront },
  { label: "CNPJ na Receita", icon: IdentificationCard },
  { label: "Ordens de compra", icon: Receipt },
  { label: "Recebimento", icon: Package },
  { label: "Notas fiscais", icon: Invoice },
  { label: "Conferência de nota", icon: Scales },
  { label: "Contas a pagar", icon: CurrencyDollar },
  { label: "Notificações", icon: Bell },
  { label: "Histórico", icon: ClockCounterClockwise },
  { label: "Relatórios", icon: ChartBar },
  { label: "Equipe", icon: Users },
  { label: "Convites", icon: UserPlus },
]

export function FeatureMarquee() {
  return (
    <section
      aria-label="O que o AprovAI faz"
      className="px-20 pt-4 pb-10 max-lg:px-10 max-md:px-6 max-md:pt-2 max-md:pb-8 max-sm:px-4"
    >
      <div className="mx-auto w-full max-w-[1430px] overflow-hidden">
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
          }}
        >
          <div className="marquee-strip flex items-start">
            <FeatureRow />
            <FeatureRow aria-hidden />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureRow({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return (
    <ul aria-hidden={ariaHidden} className="flex items-start">
      {FEATURES.map(({ label, icon: FeatureIcon }) => (
        <li
          key={label}
          className="mr-4 flex h-[94px] w-[124px] shrink-0 flex-col items-center justify-center gap-1.5 px-1 text-center max-sm:mr-2 max-sm:w-[104px]"
        >
          <FeatureIcon size={24} className="shrink-0 text-muted-foreground/55" />
          <span className="flex h-10 items-start justify-center text-[14px] leading-5 font-medium text-muted-foreground/70">
            {label}
          </span>
        </li>
      ))}
    </ul>
  )
}
