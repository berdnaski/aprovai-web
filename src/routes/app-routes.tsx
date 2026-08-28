import { Route } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { RoleGuard } from "@/components/layout/role-guard"
import { ChangePasswordPage } from "@/features/account/change-password-page"
import { ApprovalRulesPage } from "@/features/approval-rules/approval-rules-page"
import { BudgetDetailPage } from "@/features/budgets/budget-detail-page"
import { CategoriesPage } from "@/features/categories/categories-page"
import { CompanyPage } from "@/features/company/company-page"
import { CostCenterDetailPage } from "@/features/cost-centers/cost-center-detail-page"
import { CostCentersPage } from "@/features/cost-centers/cost-centers-page"
import { HomePage } from "@/features/home/home-page"
import { RequestDetailPage } from "@/features/purchase-requests/request-detail-page"
import { RequestFormPage } from "@/features/purchase-requests/request-form-page"
import { RequestStartPage } from "@/features/purchase-requests/request-start-page"
import { RequestsPage } from "@/features/purchase-requests/requests-page"
import { MemberDetailPage } from "@/features/members/member-detail-page"
import { MembersPage } from "@/features/members/members-page"
import { SupplierDetailPage } from "@/features/suppliers/supplier-detail-page"
import { SuppliersPage } from "@/features/suppliers/suppliers-page"

export function appRoutes() {
  return (
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/conta/senha" element={<ChangePasswordPage />} />

      <Route element={<RoleGuard area="purchase-requests" />}>
        <Route path="/pedidos" element={<RequestsPage />} />
        <Route path="/pedidos/novo" element={<RequestStartPage />} />
        <Route path="/pedidos/:id" element={<RequestDetailPage />} />
        <Route path="/pedidos/:id/editar" element={<RequestFormPage />} />
      </Route>

      <Route element={<RoleGuard area="cost-centers" />}>
        <Route path="/centros-de-custo" element={<CostCentersPage />} />
        <Route path="/centros-de-custo/:id" element={<CostCenterDetailPage />} />
        <Route path="/orcamentos/:id" element={<BudgetDetailPage />} />
      </Route>

      <Route element={<RoleGuard area="suppliers" />}>
        <Route path="/fornecedores" element={<SuppliersPage />} />
        <Route path="/fornecedores/:id" element={<SupplierDetailPage />} />
      </Route>

      <Route element={<RoleGuard area="approval-rules" />}>
        <Route path="/matriz-de-alcadas" element={<ApprovalRulesPage />} />
      </Route>

      <Route element={<RoleGuard area="categories" />}>
        <Route path="/categorias" element={<CategoriesPage />} />
      </Route>

      <Route element={<RoleGuard area="company" requireManage />}>
        <Route path="/empresa/dados" element={<CompanyPage />} />
        <Route path="/empresa/politica" element={<CompanyPage />} />
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
