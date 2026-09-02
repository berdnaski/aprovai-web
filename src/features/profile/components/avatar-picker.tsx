import { Camera, Trash } from "@phosphor-icons/react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { avatarSrc, type CurrentUser } from "@/api/users"
import { Button } from "@/components/ui/button"
import { useRemoveAvatar, useUploadAvatar } from "@/hooks/users/use-users"
import { initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"

const ACCEPT = "image/png,image/jpeg,image/webp"
const MAX_BYTES = 2 * 1024 * 1024

export function AvatarPicker({
  user,
  compact = false,
}: {
  user: CurrentUser
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()

  const busy = upload.isPending || remove.isPending
  const src = preview ?? avatarSrc(user.avatarUrl)

  function choose(file: File | undefined) {
    if (!file) {
      return
    }

    if (file.size > MAX_BYTES) {
      toast.error("A imagem precisa ter no máximo 2 MB.")
      return
    }

    const local = URL.createObjectURL(file)
    setPreview(local)

    upload.mutate(file, {
      onSuccess: () => toast.success("Foto atualizada."),
      onError: (error) => {
        setPreview(null)
        toast.error(getApiErrorMessage(error))
      },
      onSettled: () => URL.revokeObjectURL(local),
    })
  }

  const removeButton =
    user.avatarUrl && !busy ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          remove.mutate(undefined, {
            onSuccess: () => {
              setPreview(null)
              toast.success("Foto removida.")
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
        className="gap-1.5 text-muted-foreground hover:text-destructive"
      >
        <Trash size={13} aria-hidden />
        Remover
      </Button>
    ) : null

  return (
    <div
      className={cn(
        "flex gap-4",
        compact ? "flex-col items-center" : "items-center",
      )}
    >
      <div className="relative shrink-0">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          aria-label={src ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
          className={cn(
            "group relative flex size-18 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted shadow-xs",
            "transition-[box-shadow,border-color] duration-150 ease-out",
            "hover:border-muted-foreground/30 hover:shadow-sm",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
            busy && "opacity-70",
          )}
        >
          {src ? (
            <img
              src={src}
              alt=""
              crossOrigin="use-credentials"
              className="size-full object-cover"
            />
          ) : (
            <span className="text-heading font-medium tracking-tight text-muted-foreground">
              {initialsOf(user.name)}
            </span>
          )}

          <span
            aria-hidden
            className={cn(
              "absolute inset-x-0 bottom-0 flex h-7 items-center justify-center bg-foreground/70 text-background",
              "translate-y-full transition-transform duration-150 ease-out",
              "group-hover:translate-y-0 group-focus-visible:translate-y-0",
              busy && "translate-y-0",
            )}
          >
            <Camera size={15} weight="fill" />
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => {
            choose(event.target.files?.[0])
            event.target.value = ""
          }}
        />
      </div>

      {compact ? (
        removeButton
      ) : (
        <div className="min-w-0">
          <p className="text-label text-foreground">Foto de perfil</p>
          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            {busy
              ? "Enviando…"
              : "PNG, JPG ou WEBP, até 2 MB. Aparece ao lado do seu nome em todo o sistema."}
          </p>
          {removeButton ? <div className="-ml-2 mt-1">{removeButton}</div> : null}
        </div>
      )}

    </div>
  )
}
