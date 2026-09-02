import { Navigate, Route } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { RoleGuard } from "@/components/layout/role-guard"
import { ApprovalRulesPage } from "@/features/approval-rules/approval-rules-page"
import { BudgetDetailPage } from "@/features/budgets/budget-detail-page"
import { CategoriesPage } from "@/features/categories/categories-page"
import { CompanyPage } from "@/features/company/company-page"
import { CostCenterDetailPage } from "@/features/cost-centers/cost-center-detail-page"
import { CostCentersPage } from "@/features/cost-centers/cost-centers-page"
import { HomePage } from "@/features/home/home-page"
import { AnalyticsPage } from "@/features/analytics/analytics-page"
import { BillingPage } from "@/features/billing/billing-page"
import { ReceiptsPage } from "@/features/receipts/receipts-page"
import { AuditLogsPage } from "@/features/audit-logs/audit-logs-page"
import { ProfilePage } from "@/features/profile/profile-page"
import { InvoiceDetailPage } from "@/features/conferral/invoice-detail-page"
import { InvoicesPage } from "@/features/conferral/invoices-page"
import { MatchDetailPage } from "@/features/conferral/match-detail-page"
import { MatchesPage } from "@/features/conferral/matches-page"
import { PayablesPage } from "@/features/payables/payables-page"
import { IssueOrderPage } from "@/features/purchase-orders/issue-order-page"
import { OrderDetailPage } from "@/features/purchase-orders/order-detail-page"
import { OrdersPage } from "@/features/purchase-orders/orders-page"
import { ReceiptDetailPage } from "@/features/receipts/receipt-detail-page"
import { RegisterReceiptPage } from "@/features/receipts/register-receipt-page"
import { NotificationPreferencesPage } from "@/features/notifications/notification-preferences-page"
import { NotificationsPage } from "@/features/notifications/notifications-page"
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
      <Route path="/conta/senha" element={<Navigate to="/perfil" replace />} />
      <Route path="/notificacoes" element={<NotificationsPage />} />
      <Route
        path="/notificacoes/preferencias"
        element={<NotificationPreferencesPage />}
      />

      <Route element={<RoleGuard area="purchase-requests" />}>
        <Route path="/pedidos" element={<RequestsPage />} />
        <Route path="/pedidos/novo" element={<RequestStartPage />} />
        <Route path="/pedidos/:id" element={<RequestDetailPage />} />
        <Route path="/pedidos/:id/editar" element={<RequestFormPage />} />
      </Route>

      <Route element={<RoleGuard area="purchase-orders" />}>
        <Route path="/pedidos/:id/emitir-ordem" element={<IssueOrderPage />} />
        <Route path="/ordens-de-compra" element={<OrdersPage />} />
        <Route path="/ordens-de-compra/:id" element={<OrderDetailPage />} />
      </Route>

      <Route element={<RoleGuard area="receipts" />}>
        <Route
          path="/ordens-de-compra/:id/receber"
          element={<RegisterReceiptPage />}
        />
        <Route path="/recebimentos" element={<ReceiptsPage />} />
        <Route path="/recebimentos/:id" element={<ReceiptDetailPage />} />
      </Route>

      <Route element={<RoleGuard area="conferral" />}>
        <Route path="/conferencia" element={<MatchesPage />} />
        <Route path="/conferencia/notas" element={<InvoicesPage />} />
        <Route path="/conferencia/notas/:id" element={<InvoiceDetailPage />} />
        <Route path="/conferencia/resultado/:id" element={<MatchDetailPage />} />
      </Route>

      <Route path="/perfil" element={<ProfilePage />} />

      <Route element={<RoleGuard area="billing" />}>
        <Route path="/plano" element={<BillingPage />} />
      </Route>

      <Route element={<RoleGuard area="analytics" />}>
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route element={<RoleGuard area="audit-logs" />}>
        <Route path="/auditoria" element={<AuditLogsPage />} />
      </Route>

      <Route element={<RoleGuard area="payables" />}>
        <Route path="/contas-a-pagar" element={<PayablesPage />} />
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
