import { LogOut } from "lucide-react"

import logo from "@/assets/aprovai.svg"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"

export function HomePage() {
  const { user } = useSession()
  const logoutMutation = useLogout()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <img src={logo} alt="AprovAI" className="h-6 w-auto" />

          <div className="flex items-center gap-4">
            {user ? (
              <span className="hidden text-label font-normal text-muted-foreground sm:inline">
                {user.email}
              </span>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              className="h-9 gap-2 bg-card text-label"
            >
              <LogOut className="size-4" />
              {logoutMutation.isPending ? "Saindo..." : "Sair"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="text-display text-foreground">
          {user?.name ? `Olá, ${user.name.split(" ")[0]}` : "Início"}
        </h1>
        <p className="mt-3 text-subhead text-muted-foreground">
          Sua empresa está configurada. Em breve seus pedidos de compra
          aparecem aqui.
        </p>
      </main>
    </div>
  )
}
