import type { Member } from "@/api/members"
import { formatCents } from "@/lib/money"
import { initialsOf, isAbsent } from "@/lib/people"
import { cn } from "@/lib/utils"
import { StatusPill } from "@/components/ui/data-table"
import { CompanyMemberRole, ROLE_LABELS } from "@/types/enums"

const ROLE_TONE: Record<CompanyMemberRole, "neutral" | "brand"> = {
  REQUESTER: "neutral",
  APPROVER: "neutral",
  FINANCE_ADMIN: "brand",
  ACCOUNTANT: "neutral",
}

function limitLabel(member: Member): { value: string; note: string } {
  if (member.role === CompanyMemberRole.FINANCE_ADMIN) {
    return { value: "Sem teto", note: "aprova qualquer valor" }
  }

  if (member.role === CompanyMemberRole.REQUESTER) {
    return { value: "Não aprova", note: "apenas abre pedidos" }
  }

  if (Number(member.approvalLimitCents) <= 0) {
    return { value: "Não aprova", note: "sem alçada definida" }
  }

  return { value: formatCents(member.approvalLimitCents), note: "aprova sozinha até" }
}

export function MemberSummary({ member }: { member: Member }) {
  const name = member.user?.name ?? "Pessoa sem cadastro"
  const limit = limitLabel(member)

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card px-5 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-subhead font-medium text-muted-foreground"
        >
          {initialsOf(name)}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="truncate text-heading text-foreground">{name}</h1>
            <StatusPill tone={ROLE_TONE[member.role]}>
              {ROLE_LABELS[member.role]}
            </StatusPill>
            {isAbsent(member) ? (
              <StatusPill tone="warning" dot>
                ausente
              </StatusPill>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-caption text-muted-foreground">
            {member.user?.email ?? "sem e-mail cadastrado"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-0.5 border-t border-border pt-4 sm:items-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-right">
        <span className="text-overline text-muted-foreground">
          {limit.note}
        </span>
        <span
          className={cn(
            "text-heading tabular-nums",
            member.role === CompanyMemberRole.REQUESTER ||
              (member.role === CompanyMemberRole.APPROVER &&
                Number(member.approvalLimitCents) <= 0)
              ? "text-muted-foreground"
              : "text-foreground",
          )}
        >
          {limit.value}
        </span>
      </div>
    </div>
  )
}
