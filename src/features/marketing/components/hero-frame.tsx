import { Check, Warning } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

import { ProductVideo } from "./product-video"

function FloatCard({
  className,
  tone = "neutral",
  icon,
  title,
  note,
}: {
  className?: string
  tone?: "neutral" | "ok" | "warn"
  icon?: React.ReactNode
  title: string
  note: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute hidden w-max max-w-[13rem] rounded-xl border bg-card px-3.5 py-2.5 lg:block",
        "shadow-[0_2px_6px_oklch(0.2_0_0/0.05),0_12px_32px_oklch(0.2_0_0/0.10)]",
        tone === "ok"
          ? "border-brand-accent/25"
          : tone === "warn"
            ? "border-warning/30"
            : "border-border",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-caption font-medium text-foreground">
        {icon}
        {title}
      </p>
      <p className="mt-0.5 text-micro tabular-nums text-muted-foreground">
        {note}
      </p>
    </div>
  )
}

export function HeroFrame({ videoSrc }: { videoSrc?: string }) {
  return (
    <div className="relative">
      <FloatCard
        className="-top-6 -left-4 -rotate-[3deg] xl:-left-10"
        tone="warn"
        icon={
          <Warning
            size={13}
            weight="fill"
            aria-hidden
            className="text-warning-strong"
          />
        }
        title="Pulou o gerente"
        note="R$ 47.300 acima da alçada"
      />

      <FloatCard
        className="-top-10 right-2 rotate-[2.5deg] xl:-right-8"
        tone="ok"
        icon={
          <Check
            size={13}
            weight="bold"
            aria-hidden
            className="text-brand-accent-strong"
          />
        }
        title="Carla aprovou"
        note="02/09 às 14:12 · registrado"
      />

      <FloatCard
        className="-bottom-8 -left-8 rotate-[2deg] xl:-left-16"
        title="Orçamento do Comercial"
        note="58% comprometido em setembro"
      />

      <FloatCard
        className="right-4 -bottom-10 -rotate-[2deg] xl:-right-12"
        tone="warn"
        title="Nota R$ 1.400 acima"
        note="pagamento travado na conferência"
      />

      <ProductVideo src={videoSrc} />
    </div>
  )
}
