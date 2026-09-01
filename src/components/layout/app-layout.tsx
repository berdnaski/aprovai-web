import { MagnifyingGlass, Plus } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { Link, Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import { CommandPalette } from "@/components/shared/command-palette"
import { NotificationBell } from "@/components/shared/notification-bell"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

function isMac() {
  return (
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  )
}

export function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
            <div className="flex min-w-0 items-center">
              <SidebarTrigger className="-ml-1 text-muted-foreground" />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-8 w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 text-caption text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-80 lg:w-96"
            >
              <MagnifyingGlass size={14} aria-hidden className="shrink-0" />
              <span className="truncate">Buscar</span>
              <kbd className="ml-auto hidden shrink-0 rounded border border-border px-1 py-px font-sans text-micro leading-none text-muted-foreground/70 sm:block">
                {isMac() ? "\u2318K" : "Ctrl K"}
              </kbd>
            </button>

            <div className="flex min-w-0 items-center justify-end gap-1.5">
              <NotificationBell />

              <Button
                size="sm"
                nativeButton={false}
                render={<Link to="/pedidos/novo" />}
                className="gap-1.5 bg-primary font-medium text-primary-foreground hover:bg-primary-hover"
              >
                <Plus size={13} weight="bold" aria-hidden />
                <span className="hidden sm:inline">Novo pedido</span>
              </Button>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-6 py-8 lg:px-10 lg:py-10">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </TooltipProvider>
  )
}
