import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateInvite } from "@/hooks/members/use-members"
import { useCostCentersSummary } from "@/hooks/cost-centers/use-cost-centers"
import { cn } from "@/lib/utils"
import {
  CompanyMemberRole,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/types/enums"

const ROLES: CompanyMemberRole[] = [
  CompanyMemberRole.REQUESTER,
  CompanyMemberRole.APPROVER,
  CompanyMemberRole.FINANCE_ADMIN,
]

export function InviteMemberDialog({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<CompanyMemberRole>(
    CompanyMemberRole.REQUESTER,
  )
  const [costCenterId, setCostCenterId] = useState("")

  const { data: centers = [] } = useCostCentersSummary()
  const create = useCreateInvite()

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  function reset() {
    setEmail("")
    setRole(CompanyMemberRole.REQUESTER)
    setCostCenterId("")
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!valid) {
      return
    }

    create.mutate(
      {
        email: email.trim(),
        role,
        defaultCostCenterId: costCenterId || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Convite enviado para ${email.trim()}.`)
          setOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          reset()
        }
      }}
    >
      <DialogTrigger render={trigger} />

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Convidar para a empresa
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              A pessoa recebe um link por e-mail e escolhe a própria senha. O
              perfil abaixo vale assim que ela aceitar.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="invite-email"
                className="text-label text-foreground"
              >
                E-mail
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="colega@empresa.com.br"
                autoComplete="off"
                autoFocus
                className="h-10 text-body md:text-body"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label text-foreground">Perfil</span>
              <div className="flex flex-col gap-1.5">
                {ROLES.map((item) => {
                  const selected = role === item

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-md border px-3 py-2.5 text-left transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        selected
                          ? "border-primary/30 bg-primary/6"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <p
                        className={cn(
                          "text-body font-medium",
                          selected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {ROLE_LABELS[item]}
                      </p>
                      <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
                        {ROLE_DESCRIPTIONS[item]}
                      </p>
                    </button>
                  )
                })}
              </div>
              {role === CompanyMemberRole.APPROVER ? (
                <p className="text-caption text-muted-foreground">
                  A alçada começa em zero. Defina o valor no detalhe da pessoa
                  depois que ela aceitar.
                </p>
              ) : null}
            </div>

            {centers.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-label text-foreground">
                  Centro de Custo padrão{" "}
                  <span className="font-normal text-muted-foreground">
                    opcional
                  </span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <CenterChip
                    active={costCenterId === ""}
                    onClick={() => setCostCenterId("")}
                  >
                    Nenhum
                  </CenterChip>
                  {centers.map((center) => (
                    <CenterChip
                      key={center.id}
                      active={costCenterId === center.id}
                      onClick={() => setCostCenterId(center.id)}
                    >
                      {center.name}
                    </CenterChip>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  type="button"
                  className="font-medium"
                />
              }
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={!valid || create.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {create.isPending ? "Enviando…" : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CenterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2.5 py-1 text-label font-normal transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-primary/30 bg-primary/6 font-medium text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
