import { PageHeader } from "@/components/shared/page-header"
import { useSession } from "@/hooks/auth/use-session"

export function HomePage() {
  const { user } = useSession()
  const firstName = user?.name?.split(" ")[0]

  return (
    <PageHeader
      title={firstName ? `Olá, ${firstName}` : "Início"}
      description="Sua empresa está configurada. Em breve seus pedidos de compra aparecem aqui."
    />
  )
}
