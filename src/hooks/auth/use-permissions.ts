import { useSession } from "@/hooks/auth/use-session"
import { NAV_AREAS, accessFor, type NavAccess } from "@/lib/permissions"
import { CompanyMemberRole } from "@/types/enums"

export function usePermissions() {
  const { membership, isLoading } = useSession()
  const role = membership?.role ?? null

  function areaAccess(areaKey: string): NavAccess {
    const area = NAV_AREAS.find((item) => item.key === areaKey)
    return area ? accessFor(area, role) : "none"
  }

  return {
    role,
    isLoading,
    isFinanceAdmin: role === CompanyMemberRole.FINANCE_ADMIN,
    isApprover: role === CompanyMemberRole.APPROVER,
    areaAccess,
    canManage: (areaKey: string) => areaAccess(areaKey) === "full",
    canView: (areaKey: string) => areaAccess(areaKey) !== "none",
  }
}
