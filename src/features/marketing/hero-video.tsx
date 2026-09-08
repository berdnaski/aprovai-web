import { useRef, useState } from "react"
import { Play } from "@phosphor-icons/react"

import { ApprovalMark } from "@/components/shared/approval-mark"
import { cn } from "@/lib/utils"

type HeroVideoProps = {
  src?: string

  poster?: string
  label?: string
  duration?: string
}

export function HeroVideo({
  src,
  poster,
  label = "Um pedido virando pagamento em 90 segundos",
  duration = "01:32",
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function play() {
    setPlaying(true)
    void videoRef.current?.play()
  }

  return (
    <div className="relative mx-auto w-full max-w-[1148px]">
      <div className="rounded-[20px] border border-border bg-card p-1.5 shadow-[0_2px_4px_oklch(0.2_0_0/0.04),0_18px_44px_-16px_oklch(0.2_0_0/0.14),0_48px_88px_-40px_oklch(0.2_0_0/0.24)]">
        <div className="relative aspect-video overflow-hidden rounded-[15px] bg-ink ring-1 ring-ink/10 ring-inset">
          {src ? (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              controls={playing}
              playsInline
              preload="metadata"
              onPause={() => setPlaying(false)}
              className="size-full object-cover"
            />
          ) : null}

          <div
            aria-hidden={playing}
            className={cn(
              "absolute inset-0 transition-opacity duration-300 ease-out",
              playing ? "pointer-events-none opacity-0" : "opacity-100"
            )}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 60% at 22% -4%, oklch(1 0 0 / 0.11) 0%, transparent 62%), radial-gradient(90% 80% at 50% 120%, oklch(0 0 0 / 0.5) 0%, transparent 70%), linear-gradient(165deg, var(--ink-2) 0%, var(--ink) 100%)",
              }}
            />

            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(oklch(1 0 0 / 0.07) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.07) 1px, transparent 1px)",
                backgroundSize: "88px 88px",
                maskImage:
                  "radial-gradient(ellipse 62% 62% at 50% 50%, transparent 12%, #000 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 62% 62% at 50% 50%, transparent 12%, #000 100%)",
              }}
            />

            <div className="absolute inset-0 grid place-items-center">
              <PlayAffordance interactive={Boolean(src)} onPlay={play} label={label} />
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-2.5 rounded-full border border-ink-border/70 bg-ink/50 py-1.5 pr-3.5 pl-3 backdrop-blur-md sm:top-5 sm:left-5">
              <span className="size-1.5 rounded-full bg-brand-green" />
              <span className="text-micro text-ink-foreground/90">{label}</span>
            </div>

            <span className="absolute right-4 bottom-4 hidden rounded-full border border-ink-border/70 bg-ink/50 px-2.5 py-1.5 text-micro tabular text-ink-muted backdrop-blur-md sm:inline sm:right-5 sm:bottom-5">
              {duration}
            </span>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-12 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(1 0 0), transparent)",
            }}
          />
        </div>
      </div>

      <ApprovalCard />
      <BudgetCard />
    </div>
  )
}

function PlayAffordance({
  interactive,
  onPlay,
  label,
}: {
  interactive: boolean
  onPlay: () => void
  label: string
}) {
  const body = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 rounded-full ring-8 ring-card/12 transition-all duration-200 ease-out group-hover:ring-[18px] sm:ring-[12px]"
      />
      <span className="relative grid size-14 place-items-center rounded-full bg-card sm:size-[72px] shadow-[0_8px_28px_-6px_oklch(0.1_0_0/0.5)] transition-transform duration-200 ease-out group-hover:scale-[1.04]">
        <Play weight="fill" className="ml-0.5 size-4.5 text-primary sm:size-[22px]" />
      </span>
    </>
  )

  if (!interactive) {
    return (
      <span aria-hidden className="group relative inline-flex">
        {body}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Assistir: ${label}`}
      className="group relative inline-flex rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {body}
    </button>
  )
}

function ApprovalCard() {
  return (
    <div className="drift-y absolute -top-6 right-2 hidden w-[264px] rounded-2xl border border-border/70 bg-card/95 p-3.5 shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_18px_44px_-18px_oklch(0.2_0_0/0.24)] backdrop-blur-sm lg:block xl:-right-8">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-accent/12 text-brand-accent-strong">
          <ApprovalMark className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-label text-foreground">Pedido #1042 aprovado</p>
          <p className="mt-0.5 text-micro tabular text-muted-foreground">
            Notebooks · Tecnologia · R$ 18.864,65
          </p>
        </div>
      </div>
      <p className="mt-3 border-t border-border/70 pt-2.5 text-micro text-muted-foreground">
        Marina respondeu direto do e-mail
      </p>
    </div>
  )
}

function BudgetCard() {
  return (
    <div
      className="drift-y absolute -bottom-7 left-2 hidden w-[232px] rounded-2xl border border-border/70 bg-card/95 p-3.5 shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_18px_44px_-18px_oklch(0.2_0_0/0.24)] backdrop-blur-sm lg:block xl:-left-8"
      style={{ animationDelay: "-2.4s" }}
    >
      <span className="text-overline text-muted-foreground">Orçamento · Marketing</span>
      <p className="mt-2 text-heading tabular text-foreground">62%</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[62%] rounded-full bg-primary" />
      </div>
      <p className="mt-2 text-micro tabular text-muted-foreground">
        R$ 62.400 usados de R$ 100.000
      </p>
    </div>
  )
}
