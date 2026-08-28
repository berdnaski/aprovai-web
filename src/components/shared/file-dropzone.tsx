import { UploadSimple } from "@phosphor-icons/react"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".")
  return dot === -1 ? "" : name.slice(dot).toLowerCase()
}

export function FileDropzone({
  onSelect,
  accept,
  isUploading = false,
  label = "Arraste um arquivo ou clique",
  hint,
  disabled = false,
  className,
}: {
  onSelect: (file: File) => void
  accept?: string[]
  isUploading?: boolean
  label?: string
  hint?: string
  disabled?: boolean
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState<string | null>(null)

  function take(list: FileList | null) {
    const file = list?.[0]

    if (!file) {
      return
    }

    if (accept && !accept.includes(extensionOf(file.name))) {
      setRejected(
        `${file.name} não é um arquivo aceito. Envie ${accept.join(" ou ")}.`,
      )
      return
    }

    setRejected(null)
    onSelect(file)
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          take(event.dataTransfer.files)
        }}
        disabled={disabled || isUploading}
        className={cn(
          "flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-6 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          dragging
            ? "border-primary/50 bg-primary/[0.04]"
            : rejected
              ? "border-destructive/40 bg-destructive/[0.03]"
              : "border-border hover:border-muted-foreground/40 hover:bg-muted/30",
        )}
      >
        {isUploading ? (
          <span
            aria-hidden
            className="size-4.5 animate-spin rounded-full border-2 border-border border-t-muted-foreground"
          />
        ) : (
          <UploadSimple
            size={18}
            aria-hidden
            className="text-muted-foreground"
          />
        )}

        <span className="text-caption text-foreground">
          {isUploading ? "Enviando…" : label}
        </span>

        {hint ? (
          <span className="text-micro text-muted-foreground">{hint}</span>
        ) : null}
      </button>

      {rejected ? (
        <p role="alert" className="text-caption text-destructive">
          {rejected}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept?.join(",")}
        className="sr-only"
        onChange={(event) => {
          take(event.target.files)
          event.target.value = ""
        }}
      />
    </div>
  )
}
