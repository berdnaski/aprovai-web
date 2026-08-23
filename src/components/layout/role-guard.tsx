import { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { toast } from "sonner"

import { usePermissions } from "@/hooks/auth/use-permissions"

export function RoleGuard({
  area,
  requireManage = false,
}: {
  area: string
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
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function RequireRole({
  area,
  requireManage = false,
  fallback = null,
  children,
}: {
  area: string
  requireManage?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { areaAccess } = usePermissions()
  const access = areaAccess(area)

  const allowed = requireManage ? access === "full" : access !== "none"

  return <>{allowed ? children : fallback}</>
}
