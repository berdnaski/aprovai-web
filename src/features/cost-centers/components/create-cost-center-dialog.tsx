import { Check } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { linkCostCenterMember } from "@/api/cost-centers"
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
  useCostCenterMembers,
  useCostCentersSummary,
  useCreateCostCenter,
  useInvalidateCostCenters,
} from "@/hooks/cost-centers/use-cost-centers"
import { initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"
import { ROLE_LABELS } from "@/types/enums"

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
  const [inheritedIds, setInheritedIds] = useState<string[]>([])
  const [suggestedFor, setSuggestedFor] = useState("")

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const { data: members = [] } = useCompanyMembers()
  const { data: centers = [] } = useCostCentersSummary()
  const { data: parentLinks = [] } = useCostCenterMembers(parentId || undefined)
  const create = useCreateCostCenter()
  const invalidateCostCenters = useInvalidateCostCenters()

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

  const parent = centers.find((center) => center.id === parentId)

  // As pessoas do centro-pai já fazem esse tipo de pedido: sugerir de cara,
  // em vez de mandar vincular uma por uma de novo no centro filho.
  const inherited = members.filter(
    (member) =>
      member.id !== managerId &&
      (member.id === parent?.managerId ||
        parentLinks.some((link) => link.memberId === member.id)),
  )
  const inheritedApprover = inherited.some(
    (member) =>
      member.role === "APPROVER" &&
      inheritedIds.includes(member.id),
  )

  // Ajuste de estado durante a renderização: sempre que o centro-pai (ou o
  // gestor escolhido) muda, a sugestão de quem herdar também muda. Nada de
  // efeito aqui — só recalcular antes do próximo paint.
  const suggestionKey = `${parentId}:${managerId}:${parentLinks.length}`
  if (suggestionKey !== suggestedFor) {
    setSuggestedFor(suggestionKey)
    setInheritedIds(inherited.map((member) => member.id))
  }

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
        onSuccess: async (created) => {
          const toLink = inheritedIds.filter((id) => id !== managerId)

          if (toLink.length > 0) {
            await Promise.all(
              toLink.map((memberId) =>
                linkCostCenterMember(created.id, memberId).catch(() => null),
              ),
            )
            invalidateCostCenters()
          }

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
              O gestor responde pelo orçamento deste centro específico — não é
              o perfil da pessoa, que continua o mesmo em todo o resto do
              sistema. Sempre pode abrir pedidos aqui, mesmo sem se vincular.
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

              <div className="flex w-32 flex-col gap-1.5">
                <Label htmlFor="cc-code" className="text-label text-foreground">
                  Código{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="cc-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="CC-04"
                  autoComplete="off"
                  aria-describedby="cc-code-hint"
                  className="h-10 text-body tabular-nums md:text-body"
                />
              </div>
            </div>

            <p id="cc-code-hint" className="-mt-3 text-caption text-muted-foreground">
              O código é o mesmo que o seu contador usa no ERP. Deixe em branco
              se a empresa ainda não usa um.
            </p>

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

            {parentId && inherited.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-label text-foreground">
                  Herdar pessoas de {parent?.name}
                </span>

                <div className="max-h-48 overflow-y-auto rounded-md border border-border">
                  {inherited.map((member) => {
                    const checked = inheritedIds.includes(member.id)
                    const memberName = member.user?.name ?? "Pessoa sem cadastro"

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() =>
                          setInheritedIds((current) =>
                            checked
                              ? current.filter((id) => id !== member.id)
                              : [...current, member.id],
                          )
                        }
                        aria-pressed={checked}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          checked ? "bg-primary/6" : "hover:bg-muted/50",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input",
                          )}
                        >
                          {checked ? <Check size={11} weight="bold" /> : null}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-body text-foreground">
                          {memberName}
                        </span>
                        <span className="shrink-0 text-caption text-muted-foreground">
                          {ROLE_LABELS[member.role]}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <p className="text-caption leading-relaxed text-muted-foreground">
                  {inheritedApprover
                    ? "Elas passam a abrir pedidos aqui também. O perfil e a alçada de cada uma não mudam."
                    : "Nenhuma aprovadora selecionada: os pedidos daqui caem direto no Admin Financeiro, a não ser que uma delas também tenha alçada em outro Centro de Custo."}
                </p>
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
