import { Play } from "@phosphor-icons/react"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { AppMockup } from "./app-mockup"

export function ProductVideo({
  src,
  poster,
  caption = "app.aprovai.com.br/pedidos/REQ-2026-0042",
}: {
  src?: string
  poster?: string
  caption?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function start() {
    const video = videoRef.current

    if (!video) {
      return
    }

    void video.play()
    setPlaying(true)
  }

  return (
    <figure className="m-0 overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_oklch(0.2_0_0/0.04),0_16px_50px_oklch(0.2_0_0/0.10)]">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </span>

        <span className="mx-auto max-w-full truncate rounded-md bg-card px-3 py-1 text-micro text-muted-foreground">
          {caption}
        </span>
      </div>

      {src ? (
        <div className="relative aspect-video bg-ink">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls={playing}
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="size-full object-cover"
          />

          {playing ? null : (
            <button
              type="button"
              onClick={start}
              aria-label="Reproduzir a demonstração"
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-ink/35 transition-colors",
                "hover:bg-ink/45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
              )}
            >
              <span
                aria-hidden
                className="flex size-16 items-center justify-center rounded-full bg-card shadow-[0_4px_20px_oklch(0.2_0_0/0.25)]"
              >
                <Play size={22} weight="fill" className="ml-1 text-foreground" />
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <AppMockup />
        </div>
      )}
    </figure>
  )
}
