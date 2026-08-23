import type { Member } from "@/api/members"

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  const first = parts[0][0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""

  return (first + last).toUpperCase()
}

export function displayName(member: Member | undefined): string {
  return member?.user?.name ?? "Pessoa sem cadastro"
}

export function displayEmail(member: Member | undefined): string {
  return member?.user?.email ?? ""
}

export function indexMembers(members: Member[]): Map<string, Member> {
  return new Map(members.map((member) => [member.id, member]))
}

export function isAbsent(member: Member, reference = new Date()): boolean {
  if (!member.absentUntil) {
    return false
  }

  const until = new Date(member.absentUntil)
  const from = member.absentFrom ? new Date(member.absentFrom) : null

  return until >= reference && (!from || from <= reference)
}
