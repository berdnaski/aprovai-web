import { Warning } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { CostCenter } from "@/api/cost-centers"
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
import {
  useCompanyMembers,
  useCostCentersSummary,
  useUpdateCostCenter,
} from "@/hooks/cost-centers/use-cost-centers"
import { initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"

const ELIGIBLE_ROLES = ["APPROVER", "FINANCE_ADMIN"]

export function EditCostCenterDialog({
  costCenter,
  open,
  onOpenChange,
}: {
  costCenter: CostCenter
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(costCenter.name)
  const [code, setCode] = useState(costCenter.code ?? "")
  const [managerId, setManagerId] = useState(costCenter.managerId)
  const [parentId, setParentId] = useState(costCenter.parentId ?? "")

  const { data: members = [] } = useCompanyMembers()
  const { data: centers = [] } = useCostCentersSummary()
  const update = useUpdateCostCenter(costCenter.id)

  useEffect(() => {
    if (open) {
      setName(costCenter.name)
      setCode(costCenter.code ?? "")
      setManagerId(costCenter.managerId)
      setParentId(costCenter.parentId ?? "")
    }
  }, [open, costCenter])

  const eligible = members.filter(
    (member) => ELIGIBLE_ROLES.includes(member.role) && !member.absentUntil,
  )

  const parents = centers.filter(
    (center) => center.id !== costCenter.id && !center.parentId,
  )

  const managerChanged = managerId !== costCenter.managerId
  const canSubmit = name.trim().length >= 2 && managerId.length > 0

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    update.mutate(
      {
        name: name.trim(),
        code: code.trim() ? code.trim() : null,
        managerId,
        parentId: parentId ? parentId : null,
      },
      {
        onSuccess: () => {
          toast.success(`${name.trim()} atualizado.`)
          onOpenChange(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Editar {costCenter.name}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Os pedidos já criados continuam neste centro. Mudanças aqui valem
              para o que vier a partir de agora.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name" className="text-label text-foreground">
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="off"
                  className="h-10 text-body md:text-body"
                />
              </div>

              <div className="flex w-28 flex-col gap-1.5">
                <Label htmlFor="edit-code" className="text-label text-foreground">
                  Código
                </Label>
                <Input
                  id="edit-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  autoComplete="off"
                  className="h-10 text-body tabular-nums md:text-body"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label text-foreground">Gestor</span>
              <div className="max-h-48 overflow-y-auto rounded-md border border-border">
                {eligible.map((member) => {
                  const selected = managerId === member.id
                  const name = member.user?.name ?? "Pessoa sem cadastro"

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setManagerId(member.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        selected ? "bg-primary/6" : "hover:bg-muted/50",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-medium",
                          selected
                            ? "bg-primary/12 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {initialsOf(name)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-body text-foreground">
                        {name}
                      </span>
                      {selected ? (
                        <span className="shrink-0 text-caption font-medium text-primary">
                          gestor
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              {managerChanged ? (
                <p className="flex items-start gap-2 rounded-md border border-warning/25 bg-warning/6 px-3 py-2 text-caption leading-relaxed text-foreground">
                  <Warning
                    size={14}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-warning-strong"
                    aria-hidden
                  />
                  <span>
                    Trocar o gestor muda quem aprova os pedidos deste centro
                    daqui em diante.
                  </span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label text-foreground">
                Fica dentro de{" "}
                <span className="font-normal text-muted-foreground">
                  opcional
                </span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                <ParentChip
                  active={parentId === ""}
                  onClick={() => setParentId("")}
                >
                  Centro raiz
                </ParentChip>
                {parents.map((center) => (
                  <ParentChip
                    key={center.id}
                    active={parentId === center.id}
                    onClick={() => setParentId(center.id)}
                  >
                    {center.name}
                  </ParentChip>
                ))}
              </div>
            </div>
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
              disabled={!canSubmit || update.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {update.isPending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ParentChip({
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
