import { SignOut } from "@phosphor-icons/react"
import logo from "@/assets/aprovai.svg"
import { Button } from "@/components/ui/button"
import { SetupProgress } from "@/features/onboarding/components/setup-progress"
import type { SetupPhase } from "@/features/onboarding/setup-phases"
import { useLogout } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"

export function SetupShell({
  phases,
  currentPhase,
  children,
}: {
  phases: SetupPhase[]
  currentPhase: string
  children: React.ReactNode
}) {
  const { user } = useSession()
  const logoutMutation = useLogout()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <img src={logo} alt="AprovAI" className="h-6 w-auto" />

          <div className="flex items-center gap-3">
            {user ? (
              <span className="hidden text-label font-normal text-muted-foreground sm:inline">
                {user.email}
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-label font-normal text-muted-foreground hover:text-foreground"
            >
              <SignOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-14">
        <div className="mb-12">
          <SetupProgress phases={phases} currentPhase={currentPhase} />
        </div>

        {children}
      </main>
    </div>
  )
}
