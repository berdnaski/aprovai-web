import { Stack, Trash, X } from "@phosphor-icons/react"
import { useState } from "react"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import type { Member } from "@/api/members"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useCostCentersSummary,
  useLinkCostCenterMembers,
} from "@/hooks/cost-centers/use-cost-centers"
import { useDisableMember } from "@/hooks/members/use-members"

export function BulkActionsBar({
  selected,
  members,
  onClear,
}: {
  selected: string[]
  members: Member[]
  onClear: () => void
}) {
  const [targetCenter, setTargetCenter] = useState<string | null>(null)
  const [disabling, setDisabling] = useState(false)

  const { data: centers = [] } = useCostCentersSummary()
  const link = useLinkCostCenterMembers(targetCenter ?? "")
  const disable = useDisableMember()

  const chosen = members.filter((member) => selected.includes(member.id))
  const centerName = centers.find((item) => item.id === targetCenter)?.name ?? ""

  function disableSequentially(ids: string[]) {
    const [head, ...tail] = ids

    if (!head) {
      toast.success(
        chosen.length === 1
          ? "Pessoa inativada."
          : `${chosen.length} pessoas inativadas.`,
      )
      setDisabling(false)
      onClear()
      return
    }

    disable.mutate(head, {
      onSuccess: () => disableSequentially(tail),
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
        setDisabling(false)
      },
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-caption text-muted-foreground">
          {selected.length}{" "}
          {selected.length === 1 ? "selecionada" : "selecionadas"}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="h-8 gap-1.5" />
            }
          >
            <Stack size={13} aria-hidden />
            Vincular a um centro
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {centers.map((center) => (
              <DropdownMenuItem
                key={center.id}
                onClick={() => setTargetCenter(center.id)}
              >
                {center.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setDisabling(true)}
          className="h-8 gap-1.5 text-destructive hover:text-destructive"
        >
          <Trash size={13} aria-hidden />
          Inativar
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 gap-1.5 text-muted-foreground"
        >
          <X size={13} aria-hidden />
          Limpar
        </Button>
      </div>

      <ConfirmDialog
        open={targetCenter !== null}
        onOpenChange={(next) => {
          if (!next) {
            setTargetCenter(null)
          }
        }}
        variant="default"
        title={`Vincular ${selected.length} ${selected.length === 1 ? "pessoa" : "pessoas"} a ${centerName}?`}
        description="Elas passam a abrir pedidos neste centro. O perfil e a alçada de cada uma não mudam."
        confirmLabel={link.isPending ? "Vinculando…" : "Vincular"}
        isPending={link.isPending}
        onConfirm={() =>
          link.mutate(selected, {
            onSuccess: () => {
              toast.success(`Vinculadas a ${centerName}.`)
              setTargetCenter(null)
              onClear()
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      />

      <ConfirmDialog
        open={disabling}
        onOpenChange={setDisabling}
        title={`Inativar ${selected.length} ${selected.length === 1 ? "pessoa" : "pessoas"}?`}
        description="Elas perdem o acesso à empresa. Os pedidos e decisões continuam no histórico."
        confirmLabel={disable.isPending ? "Inativando…" : "Inativar"}
        isPending={disable.isPending}
        onConfirm={() => disableSequentially(selected)}
      >
        <ul className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 px-3.5 py-3">
          {chosen.map((member) => (
            <li key={member.id} className="text-caption text-muted-foreground">
              {member.user?.name ?? "Pessoa sem cadastro"}
            </li>
          ))}
        </ul>
      </ConfirmDialog>
    </>
  )
}
