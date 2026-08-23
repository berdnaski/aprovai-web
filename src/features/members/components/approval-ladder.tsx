import type { Member } from "@/api/members"
import { formatCents } from "@/lib/money"
import { initialsOf } from "@/lib/people"
import { cn } from "@/lib/utils"
import { CompanyMemberRole } from "@/types/enums"

interface Tier {
  from: string
  to: string | null
  members: Member[]
}

function buildTiers(members: Member[]): Tier[] {
  const approvers = members
    .filter((member) => member.role === CompanyMemberRole.APPROVER)
    .filter((member) => Number(member.approvalLimitCents) > 0)

  const admins = members.filter(
    (member) => member.role === CompanyMemberRole.FINANCE_ADMIN,
  )

  const ceilings = [
    ...new Set(approvers.map((member) => member.approvalLimitCents)),
  ].sort((a, b) => Number(a) - Number(b))

  const tiers: Tier[] = []
  let floor = "0"

  for (const ceiling of ceilings) {
    tiers.push({
      from: floor,
      to: ceiling,
      members: approvers.filter(
        (member) => Number(member.approvalLimitCents) >= Number(ceiling),
      ),
    })
    floor = ceiling
  }

  if (admins.length > 0) {
    tiers.push({ from: floor, to: null, members: admins })
  }

  return tiers
}

function Avatars({ members }: { members: Member[] }) {
  const shown = members.slice(0, 4)
  const rest = members.length - shown.length

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {shown.map((member) => {
        const name = member.user?.name ?? "Pessoa sem cadastro"

        return (
          <span key={member.id} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-medium text-muted-foreground"
            >
              {initialsOf(name)}
            </span>
            <span className="text-body text-foreground">{name}</span>
          </span>
        )
      })}

      {rest > 0 ? (
        <span className="text-caption tabular-nums text-muted-foreground">
          +{rest}
        </span>
      ) : null}
    </span>
  )
}

export function ApprovalLadder({
  members,
  className,
}: {
  members: Member[]
  className?: string
}) {
  const tiers = buildTiers(members)

  if (tiers.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Quem decide cada faixa de valor"
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-xs",
        className,
      )}
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-4 py-3">
        <h2 className="text-label text-foreground">Quem decide cada faixa</h2>
        <span className="text-caption text-muted-foreground">
          o pedido sobe até encontrar quem cobre o valor
        </span>
      </header>

      <ol className="divide-y divide-border/60">
        {tiers.map((tier) => (
          <li
            key={`${tier.from}-${tier.to ?? "top"}`}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6"
          >
            <p className="shrink-0 text-body tabular-nums text-foreground sm:w-56">
              {tier.to === null ? (
                <>
                  acima de {formatCents(tier.from)}
                </>
              ) : Number(tier.from) === 0 ? (
                <>até {formatCents(tier.to)}</>
              ) : (
                <>
                  {formatCents(tier.from)} — {formatCents(tier.to)}
                </>
              )}
            </p>

            <Avatars members={tier.members} />
          </li>
        ))}
      </ol>
    </section>
  )
}
