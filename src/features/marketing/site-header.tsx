import { useEffect, useState } from "react"
import { List, X } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import logo from "@/assets/aprovai.svg"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Produto", href: "#produto" },
  { label: "Como funciona", href: "#alcadas" },
  { label: "Segurança", href: "#seguranca" },
  { label: "Planos", href: "#precos" },
  { label: "FAQ", href: "#faq" },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          "relative z-40 h-20 transition-opacity duration-200 ease-out",

          scrolled ? "pointer-events-none opacity-0 lg:opacity-0" : "opacity-100"
        )}
      >

        <div className="relative mx-auto flex h-20 w-full max-w-[1240px] items-center justify-between gap-10 px-6 sm:px-8">
          <Brand />
          <NavLinks className="absolute left-1/2 hidden -translate-x-1/2 lg:flex" />
          <div className="flex items-center gap-2">
            <Actions className="hidden sm:flex" />
            <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />
          </div>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-x-0 top-2 z-50 hidden justify-center px-4 lg:flex">
        <nav
          aria-hidden={!scrolled}
          className={cn(
            "flex items-center gap-10 rounded-[20px] border border-border bg-card py-4 pr-4 pl-5 shadow-[0_2px_22px_oklch(0.2_0_0/0.06)] transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-[calc(100%+0.5rem)] opacity-0"
          )}
        >
          <Brand />
          <NavLinks />
          <Actions />
        </nav>
      </div>

      {menuOpen ? (
        <div className="fixed inset-x-3 top-[72px] z-50 rise-in rounded-[20px] border border-border bg-card p-3 shadow-[0_2px_22px_oklch(0.2_0_0/0.08)] lg:hidden">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-[10px] px-3 py-2.5 text-[14px] leading-5 font-semibold text-muted-foreground/80 transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-border pt-3 sm:hidden">
            <Actions className="flex-1 [&>*]:flex-1" onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  )
}

function Brand() {
  return (
    <Link
      to="/"
      aria-label="Ir para o início"
      className="flex shrink-0 items-center rounded-[10px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <img src={logo} alt="AprovAI" className="h-[25px] w-auto max-md:h-[20px]" />
    </Link>
  )
}

function NavLinks({ className }: { className?: string }) {
  return (
    <nav className={cn("items-center lg:flex", className)}>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="rounded-[10px] px-3 py-3.5 text-[14px] leading-5 font-semibold text-muted-foreground/80 transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

function Actions({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  return (
    <div className={cn("items-center gap-2 sm:flex", className)}>
      <a
        href="#lista"
        onClick={onNavigate}
        className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-3.5 text-[14px] leading-5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.16),0_2px_4px_oklch(0.2_0_0/0.12)] transition-colors duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Entrar na lista
      </a>
    </div>
  )
}

function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      className="grid size-10 place-items-center rounded-[10px] border border-border bg-card text-foreground shadow-[0_2px_4px_oklch(0.2_0_0/0.04)] outline-none transition-colors duration-150 ease-out hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 lg:hidden"
    >
      {open ? <X size={18} /> : <List size={18} />}
    </button>
  )
}
