import { Route } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { RoleGuard } from "@/components/layout/role-guard"
import { ChangePasswordPage } from "@/features/account/change-password-page"
import { BudgetDetailPage } from "@/features/budgets/budget-detail-page"
import { CostCenterDetailPage } from "@/features/cost-centers/cost-center-detail-page"
import { CostCentersPage } from "@/features/cost-centers/cost-centers-page"
import { HomePage } from "@/features/home/home-page"
import { MemberDetailPage } from "@/features/members/member-detail-page"
import { MembersPage } from "@/features/members/members-page"

export function appRoutes() {
  return (
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/conta/senha" element={<ChangePasswordPage />} />

      <Route element={<RoleGuard area="cost-centers" />}>
        <Route path="/centros-de-custo" element={<CostCentersPage />} />
        <Route path="/centros-de-custo/:id" element={<CostCenterDetailPage />} />
        <Route path="/orcamentos/:id" element={<BudgetDetailPage />} />
      </Route>

      <Route element={<RoleGuard area="members" />}>
        <Route path="/equipe" element={<MembersPage />} />
      </Route>

      <Route element={<RoleGuard area="members" requireManage />}>
        <Route path="/equipe/:id" element={<MemberDetailPage />} />
      </Route>
    </Route>
  )
}
