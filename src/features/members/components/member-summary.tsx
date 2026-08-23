import { CaretRight } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import type { Member } from "@/api/members"
import { formatCents } from "@/lib/money"
import { initialsOf, isAbsent } from "@/lib/people"
import { cn } from "@/lib/utils"
import { StatusPill } from "@/components/ui/data-table"
import { CompanyMemberRole, ROLE_LABELS } from "@/types/enums"

const ROLE_TONE = {
  REQUESTER: "neutral",
  APPROVER: "neutral",
  FINANCE_ADMIN: "brand",
} as const

function limitLabel(member: Member): { value: string; note: string } {
  if (member.role === CompanyMemberRole.FINANCE_ADMIN) {
    return { value: "Sem teto", note: "aprova qualquer valor" }
  }

  if (member.role === CompanyMemberRole.REQUESTER) {
    return { value: "Não aprova", note: "apenas abre pedidos" }
  }

  if (Number(member.approvalLimitCents) <= 0) {
    return { value: "Não aprova", note: "todo pedido sobe para o líder" }
  }

  return { value: formatCents(member.approvalLimitCents), note: "aprova sozinha até" }
}

function Chain({ member, members }: { member: Member; members: Member[] }) {
  const chain: Member[] = []
  let current = member.managerId
    ? members.find((item) => item.id === member.managerId)
    : undefined

  while (current && chain.length < 4 && !chain.some((i) => i.id === current!.id)) {
    chain.push(current)
    current = current.managerId
      ? members.find((item) => item.id === current!.managerId)
      : undefined
  }

  if (chain.length === 0) {
    return (
      <p className="text-caption text-muted-foreground">
        Não responde a ninguém — pedidos acima do teto travam aqui.
      </p>
    )
  }

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-caption text-muted-foreground">
      <span>acima:</span>
      {chain.map((item, index) => (
        <span key={item.id} className="flex items-center gap-1.5">
          {index > 0 ? (
            <CaretRight size={10} className="text-border" aria-hidden />
          ) : null}
          <Link
            to={`/equipe/${item.id}`}
            className="text-foreground underline decoration-border underline-offset-3 transition-colors hover:decoration-foreground"
          >
            {item.user?.name?.split(" ")[0] ?? "sem cadastro"}
          </Link>
          <span className="tabular-nums">
            {item.role === CompanyMemberRole.FINANCE_ADMIN
              ? "sem teto"
              : formatCents(item.approvalLimitCents)}
          </span>
        </span>
      ))}
    </p>
  )
}

export function MemberSummary({
  member,
  members,
}: {
  member: Member
  members: Member[]
}) {
  const name = member.user?.name ?? "Pessoa sem cadastro"
  const limit = limitLabel(member)

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card px-5 py-4 shadow-xs lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-subhead font-medium text-muted-foreground"
        >
          {initialsOf(name)}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="text-heading text-foreground">{name}</h1>
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

      <div className="flex flex-col gap-1 border-t border-border pt-4 lg:items-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10 lg:text-right">
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
        <Chain member={member} members={members} />
      </div>
    </div>
  )
}
