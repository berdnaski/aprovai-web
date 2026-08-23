import { useEffect, useState } from "react"
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
import {
  useCompanyMembers,
  useCostCentersSummary,
  useCreateCostCenter,
} from "@/hooks/cost-centers/use-cost-centers"
import { initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"

const ELIGIBLE_ROLES = ["APPROVER", "FINANCE_ADMIN"]

export function CreateCostCenterDialog({
  trigger,
  defaultParentId = "",
  parentName,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: React.ReactElement
  defaultParentId?: string
  parentName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [managerId, setManagerId] = useState("")
  const [parentId, setParentId] = useState(defaultParentId)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const { data: members = [] } = useCompanyMembers()
  const { data: centers = [] } = useCostCentersSummary()
  const create = useCreateCostCenter()

  function setOpen(next: boolean) {
    if (!isControlled) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next)
  }

  useEffect(() => {
    if (!open) {
      setName("")
      setCode("")
      setManagerId("")
      setParentId(defaultParentId)
    }
  }, [open, defaultParentId])

  const eligible = members.filter((member) =>
    ELIGIBLE_ROLES.includes(member.role),
  )

  const parents = centers.filter((center) => !center.parentId)
  const canSubmit = name.trim().length >= 2 && managerId.length > 0

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    create.mutate(
      {
        name: name.trim(),
        code: code.trim() ? code.trim() : null,
        managerId,
        parentId: parentId ? parentId : null,
      },
      {
        onSuccess: () => {
          toast.success(`Centro de Custo "${name.trim()}" criado.`)
          setOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger} /> : null}

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              {parentName
                ? `Novo centro dentro de ${parentName}`
                : "Novo Centro de Custo"}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              O gestor aprova os pedidos que nascem aqui e responde pelo
              orçamento do período.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cc-name" className="text-label text-foreground">
                  Nome
                </Label>
                <Input
                  id="cc-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tecnologia"
                  autoComplete="off"
                  autoFocus
                  className="h-10 text-body md:text-body"
                />
              </div>

              <div className="flex w-28 flex-col gap-1.5">
                <Label htmlFor="cc-code" className="text-label text-foreground">
                  Código
                </Label>
                <Input
                  id="cc-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="CC-04"
                  autoComplete="off"
                  className="h-10 text-body tabular-nums md:text-body"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label text-foreground">Gestor</span>

              {eligible.length > 0 ? (
                <div className="max-h-48 overflow-y-auto rounded-md border border-border">
                  {eligible.map((member) => {
                    const selected = managerId === member.id
                    const memberName =
                      member.user?.name ?? "Pessoa sem cadastro"

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
                          {initialsOf(memberName)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-body text-foreground">
                          {memberName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-caption text-muted-foreground">
                  Nenhum aprovador ou admin financeiro disponível. Convide
                  alguém com esse perfil antes de criar o centro.
                </p>
              )}
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
              disabled={!canSubmit || create.isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {create.isPending ? "Criando…" : "Criar Centro de Custo"}
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
