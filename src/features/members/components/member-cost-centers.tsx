import { Plus, Stack, Trash } from "@phosphor-icons/react"
import { useQueries } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/client"
import {
  listCostCenterMembers,
  type CostCenterSummary,
} from "@/api/cost-centers"
import type { Member } from "@/api/members"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableShell,
  StatusPill,
  type DataTableColumn,
} from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  costCenterKeys,
  useCostCentersSummary,
  useLinkCostCenterMembers,
  useUnlinkCostCenterMember,
} from "@/hooks/cost-centers/use-cost-centers"

interface CenterRole {
  center: CostCenterSummary
  isManager: boolean
}

export function MemberCostCenters({ member }: { member: Member }) {
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState<CostCenterSummary | null>(null)

  const navigate = useNavigate()
  const { data: centers = [], isPending } = useCostCentersSummary()

  const links = useQueries({
    queries: centers.map((center) => ({
      queryKey: costCenterKeys.members(center.id),
      queryFn: () => listCostCenterMembers(center.id),
    })),
  })

  const linksReady = links.every((query) => !query.isPending)

  const rows: CenterRole[] = centers
    .map((center, index) => {
      const isManager = center.managerId === member.id
      const isLinked = (links[index]?.data ?? []).some(
        (link) => link.memberId === member.id,
      )

      if (!isManager && !isLinked) {
        return null
      }

      return { center, isManager }
    })
    .filter((row): row is CenterRole => row !== null)
    .sort((a, b) => {
      if (a.isManager !== b.isManager) {
        return a.isManager ? -1 : 1
      }

      return a.center.name.localeCompare(b.center.name, "pt-BR")
    })

  const available = centers.filter(
    (center) => !rows.some((row) => row.center.id === center.id),
  )

  const columns: DataTableColumn<CenterRole>[] = [
    {
      id: "name",
      header: "Centro",
      cell: ({ center }) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-caption font-medium text-foreground">
            {center.name}
          </span>
          {center.code ? (
            <span className="shrink-0 text-caption tabular-nums text-muted-foreground/80">
              {center.code}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: "role",
      header: "Papel",
      width: "130px",
      cell: ({ isManager }) =>
        isManager ? (
          <StatusPill tone="brand">Gestor</StatusPill>
        ) : (
          <StatusPill tone="neutral">Vinculado</StatusPill>
        ),
    },
    {
      id: "people",
      header: "Pessoas",
      align: "end",
      hideBelow: "sm",
      width: "100px",
      cell: ({ center }) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {center.memberCount}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Ações</span>,
      align: "end",
      width: "56px",
      cell: ({ center, isManager }) =>
        isManager ? null : (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Desvincular de ${center.name}`}
            onClick={(event) => {
              event.stopPropagation()
              setUnlinking(center)
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash size={13} />
          </Button>
        ),
    },
  ]

  return (
    <>
      <DataTableShell
        title="Centros de Custo"
        count={rows.length}
        className="rise-in [animation-delay:120ms]"
        toolbar={
          available.length > 0 ? (
            <LinkMenu
              member={member}
              centers={available}
              open={linking}
              onOpenChange={setLinking}
            />
          ) : undefined
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={({ center }) => center.id}
          isLoading={isPending || !linksReady}
          skeletonRows={2}
          onRowClick={({ center }) =>
            void navigate(`/centros-de-custo/${center.id}`)
          }
          empty={
            <EmptyState
              variant="inline"
              icon={Stack}
              title="Fora de todos os centros"
              description="Sem vínculo, a pessoa não consegue abrir pedidos de compra em lugar nenhum."
            />
          }
        />
      </DataTableShell>

      <UnlinkDialog
        member={member}
        center={unlinking}
        onClose={() => setUnlinking(null)}
      />
    </>
  )
}

function LinkMenu({
  member,
  centers,
  open,
  onOpenChange,
}: {
  member: Member
  centers: CostCenterSummary[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [target, setTarget] = useState<CostCenterSummary | null>(null)
  const link = useLinkCostCenterMembers(target?.id ?? "")

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="sm" className="h-8 gap-1.5" />}
        >
          <Plus size={13} weight="bold" aria-hidden />
          Vincular a um centro
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {centers.map((center) => (
            <DropdownMenuItem
              key={center.id}
              onClick={() => {
                setTarget(center)
                onOpenChange(false)
              }}
            >
              {center.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(next) => {
          if (!next) {
            setTarget(null)
          }
        }}
        variant="default"
        title={`Vincular a ${target?.name ?? ""}?`}
        description={`${member.user?.name ?? "A pessoa"} passa a abrir pedidos neste centro. O perfil e a alçada dela não mudam.`}
        confirmLabel={link.isPending ? "Vinculando…" : "Vincular"}
        isPending={link.isPending}
        onConfirm={() => {
          if (!target) {
            return
          }

          link.mutate([member.id], {
            onSuccess: () => {
              toast.success(`Vinculado a ${target.name}.`)
              setTarget(null)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }}
      />
    </>
  )
}

function UnlinkDialog({
  member,
  center,
  onClose,
}: {
  member: Member
  center: CostCenterSummary | null
  onClose: () => void
}) {
  const unlink = useUnlinkCostCenterMember(center?.id ?? "")

  return (
    <ConfirmDialog
      open={center !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
      title={`Desvincular de ${center?.name ?? ""}?`}
      description={`${member.user?.name ?? "A pessoa"} deixa de abrir pedidos neste centro. Os pedidos já criados continuam como estão.`}
      confirmLabel={unlink.isPending ? "Desvinculando…" : "Desvincular"}
      isPending={unlink.isPending}
      onConfirm={() => {
        if (!center) {
          return
        }

        unlink.mutate(member.id, {
          onSuccess: () => {
            toast.success(`Desvinculado de ${center.name}.`)
            onClose()
          },
          onError: (error) => toast.error(getApiErrorMessage(error)),
        })
      }}
    />
  )
}
