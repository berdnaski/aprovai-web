import { CompanyMemberRole } from "@/types/enums"

export const APP_HOME = "/pedidos"

export const LANDING = "/"

/**
 * ACCOUNTANT não tem acesso a "/pedidos" (APP_HOME padrão) — mandar esse
 * perfil para lá causaria um redirect loop no RoleGuard. Primeira área que
 * ele efetivamente enxerga: fornecedores (dados fiscais).
 */
export function appHomeFor(
  role: CompanyMemberRole | null | undefined,
): string {
  if (role === CompanyMemberRole.ACCOUNTANT) {
    return "/fornecedores"
  }

  return APP_HOME
}

/**
 * Só caminho interno: um "redirect" vindo da URL não pode levar para fora do
 * app nem para outro host.
 */
export function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null
  }

  return value
}
