import { CheckCircle, EnvelopeSimple } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import { PasswordInput } from "@/components/shared/password-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useChangePassword } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"

const MIN_LENGTH = 8

export function ChangePasswordDialog({
  open,
  onOpenChange,
  email,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [sent, setSent] = useState(false)

  const change = useChangePassword()

  const longEnough = next.length >= MIN_LENGTH
  const differs = next.length > 0 && next !== current
  const matches = confirm.length > 0 && confirm === next

  const confirmError =
    confirm.length > 0 && confirm !== next
      ? "As duas senhas precisam ser iguais."
      : undefined

  const sameAsCurrent =
    next.length > 0 && next === current
      ? "A nova senha precisa ser diferente da atual."
      : undefined

  const ready =
    current.length > 0 && longEnough && differs && matches && !change.isPending

  function reset() {
    setCurrent("")
    setNext("")
    setConfirm("")
    setSent(false)
  }

  function close(nextOpen: boolean) {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      window.setTimeout(reset, 180)
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!ready) {
      return
    }

    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => setSent(true),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-brand-accent/12 text-brand-accent-strong"
            >
              <EnvelopeSimple size={20} />
            </span>

            <DialogHeader className="items-center gap-1.5">
              <DialogTitle className="text-heading">
                Confirme pelo e-mail
              </DialogTitle>
              <DialogDescription className="text-caption leading-relaxed">
                Mandamos um link para{" "}
                <span className="font-medium text-foreground">{email}</span>. A
                senha só muda depois que você clicar nele, e o link vale por uma
                hora.
              </DialogDescription>
            </DialogHeader>

            <p className="text-caption leading-relaxed text-muted-foreground">
              Até lá, sua senha atual continua valendo.
            </p>

            <DialogClose
              render={
                <Button className="mt-1 w-full bg-primary font-medium text-primary-foreground hover:bg-primary-hover" />
              }
            >
              Entendi
            </DialogClose>
          </div>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-heading">Alterar senha</DialogTitle>
              <DialogDescription className="text-caption leading-relaxed">
                Por segurança, a troca é confirmada por e-mail antes de valer.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="current-password" className="text-label text-foreground">
                  Senha atual
                </Label>
                <PasswordInput
                  id="current-password"
                  value={current}
                  onChange={(event) => setCurrent(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Sua senha de hoje"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password" className="text-label text-foreground">
                  Nova senha
                </Label>
                <PasswordInput
                  id="new-password"
                  value={next}
                  onChange={(event) => setNext(event.target.value)}
                  autoComplete="new-password"
                  aria-invalid={Boolean(sameAsCurrent)}
                  placeholder={`Pelo menos ${MIN_LENGTH} caracteres`}
                />

                <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
                  <Rule met={longEnough} label={`${MIN_LENGTH} caracteres`} />
                  <Rule met={differs} label="Diferente da atual" />
                </div>

                {sameAsCurrent ? (
                  <p className="text-caption text-destructive">{sameAsCurrent}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password" className="text-label text-foreground">
                  Repita a nova senha
                </Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  autoComplete="new-password"
                  aria-invalid={Boolean(confirmError)}
                  placeholder="A mesma de cima"
                />
                {confirmError ? (
                  <p className="text-caption text-destructive">{confirmError}</p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" type="button" className="font-medium" />
                }
              >
                Cancelar
              </DialogClose>
              <Button
                type="submit"
                disabled={!ready}
                className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
              >
                {change.isPending ? "Enviando…" : "Enviar confirmação"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Rule({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-caption transition-colors",
        met ? "text-brand-accent-strong" : "text-muted-foreground",
      )}
    >
      <CheckCircle
        size={13}
        weight={met ? "fill" : "regular"}
        aria-hidden
        className="shrink-0"
      />
      {label}
    </span>
  )
}
