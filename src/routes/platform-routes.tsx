import { Navigate, Route } from "react-router-dom"

import { PlatformLayout } from "@/components/layout/platform-layout"
import { OrganizationDetailPage } from "@/features/platform/organization-detail-page"
import { OrganizationsPage } from "@/features/platform/organizations-page"
import { PlansPage } from "@/features/platform/plans-page"

export function platformRoutes() {
  return (
    <Route path="/plataforma" element={<PlatformLayout />}>
      <Route
        index
        element={<Navigate to="/plataforma/organizacoes" replace />}
      />
      <Route path="organizacoes" element={<OrganizationsPage />} />
      <Route path="organizacoes/:id" element={<OrganizationDetailPage />} />
      <Route path="planos" element={<PlansPage />} />
    </Route>
  )
}
