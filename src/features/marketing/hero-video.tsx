import { useEffect, useRef, useState } from "react"
import { Pause, Play, SpeakerSimpleHigh, SpeakerSimpleSlash } from "@phosphor-icons/react"

import { ApprovalMark } from "@/components/shared/approval-mark"
import { cn } from "@/lib/utils"

type HeroVideoProps = {
  src?: string
  poster?: string
  label?: string
  duration?: string
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function HeroVideo({
  src,
  poster,
  label = "Um pedido de compra virando pagamento",
  duration = "01:26",
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src || prefersReducedMotion()) return

    let cancelled = false

    const withSound = () => {
      video.muted = false
      return video.play().then(() => {
        if (cancelled) return
        setMuted(false)
        setStarted(true)
      })
    }

    const silent = () => {
      video.muted = true
      setMuted(true)
      return video.play().then(
        () => !cancelled && setStarted(true),
        () => !cancelled && setStarted(false)
      )
    }

    const attempt = () => {
      void withSound().catch(silent)
    }

    if (video.readyState >= 2) attempt()
    else video.addEventListener("loadeddata", attempt, { once: true })

    return () => {
      cancelled = true
      video.removeEventListener("loadeddata", attempt)
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src || !muted || prefersReducedMotion()) return

    const wake = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("a, button, input, textarea, select, [role='dialog']")) return
      video.muted = false
      setMuted(false)
      void video.play()
      setStarted(true)
    }

    document.addEventListener("pointerdown", wake, { once: true })
    return () => document.removeEventListener("pointerdown", wake)
  }, [src, muted])

  function toggleSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    if (video.paused) void video.play()
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setStarted(true)
    } else {
      video.pause()
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[1148px]">
      <div className="rounded-[20px] border border-border bg-card p-1.5 shadow-[0_2px_4px_oklch(0.2_0_0/0.04),0_18px_44px_-16px_oklch(0.2_0_0/0.14),0_48px_88px_-40px_oklch(0.2_0_0/0.24)]">
        <div className="group/player relative aspect-video overflow-hidden rounded-[15px] bg-card ring-1 ring-ink/10 ring-inset">
          {src ? (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              aria-label={label}
              onTimeUpdate={(event) => {
                const el = event.currentTarget
                if (el.duration) setProgress(el.currentTime / el.duration)
              }}
              className="size-full object-cover"
            />
          ) : null}

          {src ? (
            <div
              className={cn(
                "absolute right-4 bottom-4 flex items-center gap-2 transition-opacity duration-300 sm:right-5 sm:bottom-5",
                muted
                  ? "opacity-100"
                  : "opacity-0 group-hover/player:opacity-100 focus-within:opacity-100"
              )}
            >
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
                className="grid size-9 place-items-center rounded-full border border-ink-border/70 bg-ink/55 text-ink-foreground/90 backdrop-blur-md outline-none transition-colors duration-200 hover:bg-ink/75 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {playing ? (
                  <Pause weight="fill" className="size-4" />
                ) : (
                  <Play weight="fill" className="ml-0.5 size-4" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleSound}
                aria-label={muted ? "Ativar som do vídeo" : "Desativar som do vídeo"}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-2 pr-3.5 pl-3 backdrop-blur-md outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
                  muted
                    ? "border-brand-green/45 bg-ink/70 text-ink-foreground hover:bg-ink/85"
                    : "border-ink-border/70 bg-ink/55 text-ink-foreground/90 hover:bg-ink/75"
                )}
              >
                {muted ? (
                  <SpeakerSimpleSlash weight="fill" className="size-4" />
                ) : (
                  <SpeakerSimpleHigh weight="fill" className="size-4" />
                )}
                <span className="text-micro">{muted ? "Ativar som" : duration}</span>
              </button>
            </div>
          ) : (
            <span className="absolute right-4 bottom-4 hidden rounded-full border border-ink-border/70 bg-ink/50 px-2.5 py-1.5 text-micro tabular text-ink-muted backdrop-blur-md sm:inline sm:right-5 sm:bottom-5">
              {duration}
            </span>
          )}

          {src ? (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-ink-foreground/12 transition-opacity duration-300",
                started ? "opacity-100" : "opacity-0"
              )}
            >
              <div
                className="h-full bg-brand-green/90"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>
          ) : null}

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
