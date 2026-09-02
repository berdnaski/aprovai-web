import { useSession } from "@/hooks/auth/use-session"
import { useMyCompany } from "@/hooks/companies/use-companies"

export function useCompanyName(): string | null {
  const { membership } = useSession()
  const company = useMyCompany()

  if (!membership) {
    return null
  }

  const loaded = company.data

  if (loaded) {
    return loaded.tradeName ?? loaded.legalName
  }

  return membership.companyName.trim().length > 0
    ? membership.companyName
    : null
}
