import { useNavigate } from "react-router-dom"

import { PageHeader } from "@/components/shared/page-header"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTab,
} from "@/components/ui/tabs"
import { CONFERRAL_TABS, type ConferralTab } from "../tabs"

export function ConferralHeader({
  tab,
  action,
}: {
  tab: ConferralTab
  action?: React.ReactNode
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Conferência"
        description="Compara o que foi pedido, o que chegou e o que o fornecedor faturou, antes de liberar o pagamento."
        action={action}
      />

      <Tabs
        className="gap-0"
        value={tab}
        onValueChange={(next) =>
          navigate(CONFERRAL_TABS[next as ConferralTab])
        }
      >
        <TabsList>
          <TabsTab value="results">Conferências</TabsTab>
          <TabsTab value="invoices">Notas recebidas</TabsTab>
          <TabsIndicator />
        </TabsList>
      </Tabs>
    </div>
  )
}
