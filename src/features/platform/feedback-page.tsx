import {
  Bug,
  ChatCircleDots,
  ImageSquare,
  Lightbulb,
  MagnifyingGlass,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import type { Feedback } from "@/api/feedback"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadError } from "@/components/shared/load-error"
import { PageHeader } from "@/components/shared/page-header"
import {
  DataTable,
  DataTablePagination,
  DataTableShell,
  StatusPill,
  TableSearch,
  TableSegments,
  TableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useFeedbackCounters,
  usePlatformFeedbacks,
} from "@/hooks/feedback/use-feedback"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { FEEDBACK_STATUS, pillTone } from "@/lib/status-labels"
import { cn } from "@/lib/utils"
import {
  FEEDBACK_KIND_LABELS,
  FeedbackKind,
  FeedbackStatus,
  type FeedbackStatus as FeedbackStatusType,
} from "@/types/enums"

import { FeedbackTriageDialog } from "./components/feedback-triage-dialog"

type Segment = "ALL" | FeedbackStatusType

const KIND_ICON: Record<FeedbackKind, Icon> = {
  SUGGESTION: Lightbulb,
  BUG: Bug,
  OTHER: ChatCircleDots,
}

const KIND_TONE: Record<FeedbackKind, string> = {
  SUGGESTION: "bg-primary/8 text-primary",
  BUG: "bg-destructive/10 text-destructive",
  OTHER: "bg-muted text-muted-foreground",
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })
}

function KindBadge({ kind }: { kind: FeedbackKind }) {
  const KindIcon = KIND_ICON[kind]

  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md",
          KIND_TONE[kind],
        )}
      >
        <KindIcon size={13} />
      </span>
      <span className="text-caption text-foreground">
        {FEEDBACK_KIND_LABELS[kind]}
      </span>
    </span>
  )
}

export function FeedbackPage() {
  const [segment, setSegment] = useState<Segment>("ALL")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Feedback | null>(null)

  const search = useDebouncedValue(query, 300)

  const listQuery = useMemo(
    () => ({
      page,
      perPage: 20,
      status: segment === "ALL" ? undefined : [segment],
      search: search || undefined,
    }),
    [page, segment, search],
  )

  const feedbacks = usePlatformFeedbacks(listQuery)
  const counters = useFeedbackCounters()

  const segments = useMemo(() => {
    const byStatus = counters.data?.byStatus

    return [
      { id: "ALL" as Segment, label: "Todos", count: counters.data?.total },
      {
        id: FeedbackStatus.NEW as Segment,
        label: FEEDBACK_STATUS.NEW.label,
        count: byStatus?.NEW,
        tone: pillTone(FEEDBACK_STATUS.NEW.tone),
      },
      {
        id: FeedbackStatus.TRIAGED as Segment,
        label: FEEDBACK_STATUS.TRIAGED.label,
        count: byStatus?.TRIAGED,
        tone: pillTone(FEEDBACK_STATUS.TRIAGED.tone),
      },
      {
        id: FeedbackStatus.RESOLVED as Segment,
        label: FEEDBACK_STATUS.RESOLVED.label,
        count: byStatus?.RESOLVED,
        tone: pillTone(FEEDBACK_STATUS.RESOLVED.tone),
      },
      {
        id: FeedbackStatus.DISCARDED as Segment,
        label: FEEDBACK_STATUS.DISCARDED.label,
        count: byStatus?.DISCARDED,
        tone: pillTone(FEEDBACK_STATUS.DISCARDED.tone),
      },
    ]
  }, [counters.data])

  const columns: DataTableColumn<Feedback>[] = [
    {
      id: "message",
      header: "Feedback",
      cell: (item) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-caption text-foreground">
            {item.message}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-micro text-muted-foreground/70">
            {item.hasScreenshot ? (
              <ImageSquare
                size={12}
                aria-label="Tem print anexado"
                className="shrink-0"
              />
            ) : null}
            <span className="truncate">
              {item.author?.name ?? "Autor removido"}
              {item.route ? ` · ${item.route}` : ""}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: "company",
      header: "Organização",
      width: "180px",
      hideBelow: "lg",
      cell: (item) => (
        <span className="truncate text-caption text-muted-foreground">
          {item.company?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "kind",
      header: "Tipo",
      width: "140px",
      hideBelow: "lg",
      cell: (item) => <KindBadge kind={item.kind} />,
    },
    {
      id: "status",
      header: "Situação",
      width: "130px",
      cell: (item) => {
        const meta = FEEDBACK_STATUS[item.status]

        return <StatusPill tone={pillTone(meta.tone)}>{meta.label}</StatusPill>
      },
    },
    {
      id: "createdAt",
      header: "Enviado",
      width: "90px",
      align: "end",
      hideBelow: "sm",
      cell: (item) => (
        <span className="text-caption tabular-nums text-muted-foreground">
          {shortDate(item.createdAt)}
        </span>
      ),
    },
  ]

  if (feedbacks.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Feedback" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (feedbacks.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Feedback" />
        <LoadError onRetry={() => void feedbacks.refetch()} />
      </div>
    )
  }

  const rows = feedbacks.data?.items ?? []
  const meta = feedbacks.data?.meta

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Feedback"
        description="O que os usuários das organizações estão relatando, com a tela em que estavam quando enviaram."
      />

      <section>
        <TableToolbar>
          <TableSegments
            value={segment}
            onChange={(next) => {
              setSegment(next)
              setPage(1)
            }}
            segments={segments}
          />

          <TableSearch
            value={query}
            onChange={(next) => {
              setQuery(next)
              setPage(1)
            }}
            placeholder="Buscar no texto do feedback"
            label="Buscar feedback"
            className="ml-auto"
          />
        </TableToolbar>

        <DataTableShell
          footer={
            meta && meta.totalPages > 1 ? (
              <DataTablePagination
                meta={meta}
                onPageChange={setPage}
                label="feedbacks"
              />
            ) : (
              <p className="text-caption tabular-nums text-muted-foreground">
                {meta?.total ?? 0}{" "}
                {meta?.total === 1 ? "feedback" : "feedbacks"}
              </p>
            )
          }
        >
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(item) => item.id}
            onRowClick={(item) => setSelected(item)}
            rowAccent={(item) =>
              item.kind === FeedbackKind.BUG && item.status === FeedbackStatus.NEW
                ? "danger"
                : undefined
            }
            empty={
              <EmptyState
                variant="inline"
                icon={search ? MagnifyingGlass : ChatCircleDots}
                title={
                  search
                    ? "Nenhum feedback encontrado"
                    : "Nenhum feedback ainda"
                }
                description={
                  search
                    ? "Tente outras palavras."
                    : "Quando alguém enviar pelo menu lateral do produto, aparece aqui."
                }
              />
            }
          />
        </DataTableShell>
      </section>

      <FeedbackTriageDialog
        feedback={selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null)
          }
        }}
      />
    </div>
  )
}
