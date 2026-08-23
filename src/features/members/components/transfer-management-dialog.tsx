import { ArrowRight } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Member, ResponsibilityBlocker } from "@/api/members"
import { PersonPicker } from "@/components/shared/person-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useReassignCostCenterManager } from "@/hooks/cost-centers/use-cost-centers"
import { useTransferManagement } from "@/hooks/members/use-members"
import { cn } from "@/lib/utils"
import { CompanyMemberRole } from "@/types/enums"

const ELIGIBLE: CompanyMemberRole[] = [
  CompanyMemberRole.APPROVER,
  CompanyMemberRole.FINANCE_ADMIN,
]

export function TransferManagementDialog({
  member,
  members,
  blockers,
  open,
  onOpenChange,
}: {
  member: Member
  members: Member[]
  blockers: ResponsibilityBlocker[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const costCenters =
    blockers.find((blocker) => blocker.kind === "COST_CENTER_MANAGER")?.items ??
    []

  const [toMemberId, setToMemberId] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])

  const centerIds = costCenters.map((center) => center.id).join(",")

  useEffect(() => {
    setPicked(centerIds ? centerIds.split(",") : [])
  }, [centerIds, open])

  const transferAll = useTransferManagement()
  const updateOne = useReassignCostCenterManager()

  const options = members
    .filter((item) => item.id !== member.id && ELIGIBLE.includes(item.role))
    .map((item) => ({ member: item }))

  const fromName = member.user?.name ?? "esta pessoa"
  const target = members.find((item) => item.id === toMemberId)
  const targetName = target?.user?.name ?? "o novo gestor"

  const movingAll = picked.length === costCenters.length
  const isPending = transferAll.isPending || updateOne.isPending
  const valid = Boolean(toMemberId) && picked.length > 0

  function finish() {
    toast.success(
      picked.length === 1
        ? `1 Centro de Custo passou para ${targetName}.`
        : `${picked.length} Centros de Custo passaram para ${targetName}.`,
    )
    onOpenChange(false)
    setToMemberId(null)
  }

  function moveOneByOne(ids: string[], managerId: string) {
    const [head, ...tail] = ids

    if (!head) {
      finish()
      return
    }

    updateOne.mutate(
      { costCenterId: head, managerId },
      {
        onSuccess: () => moveOneByOne(tail, managerId),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!valid || !toMemberId) {
      return
    }

    if (movingAll) {
      transferAll.mutate(
        { fromMemberId: member.id, toMemberId },
        {
          onSuccess: finish,
          onError: (error) => toast.error(getApiErrorMessage(error)),
        },
      )
      return
    }

    moveOneByOne(picked, toMemberId)
  }

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-heading">
              Transferir Centros de Custo de {fromName.split(" ")[0]}
            </DialogTitle>
            <DialogDescription className="text-caption leading-relaxed">
              Escolha o que sai das mãos de {fromName.split(" ")[0]}. Quem
              assumir passa a decidir as aprovações desses centros a partir de
              agora.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-caption font-medium text-foreground">
                  O que transferir
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPicked(
                      movingAll ? [] : costCenters.map((center) => center.id),
                    )
                  }
                  className="rounded px-1.5 py-0.5 text-caption text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {movingAll ? "Limpar" : "Selecionar todos"}
                </button>
              </div>

              <ul className="overflow-hidden rounded-lg border border-border">
                {costCenters.map((center) => {
                  const checked = picked.includes(center.id)

                  return (
                    <li
                      key={center.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 px-3 py-2.5 transition-colors",
                          checked ? "bg-primary/4" : "hover:bg-muted/40",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(center.id)}
                        />
                        <span className="min-w-0 flex-1 truncate text-caption text-foreground">
                          {center.label}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>

              {picked.length === 0 ? (
                <p className="text-caption text-muted-foreground">
                  Selecione ao menos um Centro de Custo.
                </p>
              ) : !movingAll ? (
                <p className="text-caption text-muted-foreground">
                  {fromName.split(" ")[0]} continua gestor dos outros{" "}
                  {costCenters.length - picked.length}.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-caption font-medium text-foreground">
                Novo gestor
              </span>

              {options.length > 0 ? (
                <PersonPicker
                  options={options}
                  value={toMemberId}
                  onChange={setToMemberId}
                  allowEmpty={false}
                  placeholder="Escolher quem assume"
                />
              ) : (
                <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-caption leading-relaxed text-muted-foreground">
                  Nenhum aprovador ou admin financeiro disponível para assumir.
                  Promova alguém antes de transferir.
                </p>
              )}
            </div>

            {target ? (
              <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
                <span className="truncate text-caption text-muted-foreground line-through">
                  {fromName}
                </span>
                <ArrowRight
                  size={13}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="truncate text-caption font-medium text-foreground">
                  {target.user?.name}
                </span>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" type="button" />}
            >
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              disabled={!valid || isPending}
              className="bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {isPending
                ? "Transferindo…"
                : picked.length === costCenters.length
                  ? "Transferir tudo"
                  : `Transferir ${picked.length}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
