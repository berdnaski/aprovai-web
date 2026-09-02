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
  if (typeof navigator === "undefined") {
    return false
  }

  const modern = (
    navigator as Navigator & { userAgentData?: { platform?: string } }
  ).userAgentData?.platform

  return /mac|iphone|ipad|ipod/i.test(modern || navigator.userAgent)
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
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
            <SidebarTrigger className="-ml-1 shrink-0 text-muted-foreground" />

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-caption text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-80 sm:flex-none lg:w-96"
            >
              <MagnifyingGlass size={14} aria-hidden className="shrink-0" />
              <span className="truncate">Buscar</span>
              <kbd className="ml-auto hidden shrink-0 rounded border border-border px-1 py-px font-sans text-micro leading-none text-muted-foreground/70 sm:block">
                {isMac() ? "\u2318K" : "Ctrl K"}
              </kbd>
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
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
