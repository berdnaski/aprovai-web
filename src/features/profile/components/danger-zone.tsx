import { Warning } from "@phosphor-icons/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSessionActions } from "@/hooks/auth/use-session"
import { useDeleteMe } from "@/hooks/users/use-users"

const CONFIRMATION = "excluir"

export function DangerZone() {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")

  const navigate = useNavigate()
  const { clearSession } = useSessionActions()
  const remove = useDeleteMe()

  const confirmed = typed.trim().toLowerCase() === CONFIRMATION

  function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!confirmed) {
      return
    }

    remove.mutate(undefined, {
      onSuccess: () => {
        clearSession()
        toast.success("Conta excluída.")
        navigate("/entrar", { replace: true })
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <section
      aria-label="Excluir conta"
      className="flex flex-col gap-4 rounded-lg border border-destructive/25 bg-destructive/[0.04] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex items-start gap-3">
        <Warning
          size={16}
          aria-hidden
          className="mt-0.5 shrink-0 text-destructive"
        />
        <div className="min-w-0">
          <p className="text-label text-foreground">Excluir minha conta</p>
          <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
            Seus dados pessoais são anonimizados e a sessão encerra na hora. Os
            pedidos, aprovações e a trilha de auditoria permanecem, sem seu nome,
            porque a lei exige a guarda desses registros.
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          setTyped("")
          setOpen(true)
        }}
        className="h-9 shrink-0 border-destructive/30 font-medium text-destructive hover:bg-destructive/8 hover:text-destructive"
      >
        Excluir conta
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-heading">
                Excluir sua conta
              </DialogTitle>
              <DialogDescription className="text-caption leading-relaxed">
                Não dá para desfazer. Você perde o acesso ao AprovAI e precisará
                de um convite novo para voltar.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2 py-5">
              <Label htmlFor="confirm-delete" className="text-label text-foreground">
                Para confirmar, digite <span className="font-medium text-foreground">{CONFIRMATION}</span>
              </Label>
              <Input
                id="confirm-delete"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
                placeholder={CONFIRMATION}
                className="h-10 max-w-[14rem] text-body md:text-body"
              />
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
                disabled={!confirmed || remove.isPending}
                className="bg-destructive font-medium text-white hover:bg-destructive/90"
              >
                {remove.isPending ? "Excluindo…" : "Excluir minha conta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
