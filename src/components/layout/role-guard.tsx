import { useEffect } from "react"
import { APP_HOME } from "@/routes/destinations"
import { Navigate, Outlet } from "react-router-dom"
import { toast } from "sonner"

import { usePermissions } from "@/hooks/auth/use-permissions"
import type { NavAreaKey } from "@/lib/permissions"

export function RoleGuard({
  area,
  requireManage = false,
}: {
  area: NavAreaKey
  requireManage?: boolean
}) {
  const { areaAccess, isLoading } = usePermissions()
  const access = areaAccess(area)

  const denied =
    !isLoading && (requireManage ? access !== "full" : access === "none")

  useEffect(() => {
    if (denied) {
      toast.error("Você não tem acesso a esta área.")
    }
  }, [denied])

  if (isLoading) {
    return null
  }

  if (denied) {
    return <Navigate to={APP_HOME} replace />
  }

  return <Outlet />
}

export function RequireRole({
  area,
  requireManage = false,
  fallback = null,
  children,
}: {
  area: NavAreaKey
  requireManage?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { areaAccess } = usePermissions()
  const access = areaAccess(area)

  const allowed = requireManage ? access === "full" : access !== "none"

  return <>{allowed ? children : fallback}</>
}
