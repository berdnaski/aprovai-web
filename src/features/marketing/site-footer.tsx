import { Link } from "react-router-dom"

import logo from "@/assets/aprovai.svg"

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "#alcadas" },
      { label: "Perfis", href: "#produto" },
      { label: "Com ou sem ERP", href: "#encaixe" },
      { label: "Segurança", href: "#seguranca" },
      { label: "Perguntas", href: "#faq" },
    ],
  },
  {
    title: "O fluxo",
    links: [
      { label: "Pedidos e alçadas", href: "#produto" },
      { label: "Aprovação por e-mail", href: "#alcadas" },
      { label: "Orçamento por centro de custo", href: "#alcadas" },
      { label: "Conferência de nota", href: "#alcadas" },
      { label: "Contas a pagar", href: "#alcadas" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-20 pt-16 pb-12 max-lg:px-10 max-md:px-6 max-md:pt-12 max-md:pb-10 max-sm:px-4">
      <div className="mx-auto w-full max-w-[1430px]">
        <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))_minmax(0,1.1fr)] gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-8">
          <div>
            <Link
              to="/"
              aria-label="Ir para o início"
              className="inline-flex rounded-[10px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <img src={logo} alt="AprovAI" className="h-[25px] w-auto" />
            </Link>
            <p className="mt-4 max-w-[280px] text-[14px] leading-6 text-muted-foreground">
              Todo pedido de compra andando sozinho até o pagamento, com a regra
              que o seu financeiro escreveu.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-overline text-muted-foreground">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="rounded-sm text-[14px] leading-5 text-foreground/70 transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-overline text-muted-foreground">Sua conta</h2>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              <a
                href="#lista"
                className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-3.5 text-[14px] leading-5 font-semibold text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.16),0_2px_4px_oklch(0.2_0_0/0.12)] transition-colors duration-150 ease-out outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Entrar na lista
              </a>
              <Link
                to="/entrar"
                className="rounded-sm text-[14px] leading-5 text-foreground/70 transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Entrar na minha conta
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between gap-4 border-t border-border pt-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <div className="flex items-center gap-4 max-sm:flex-wrap">
            <p className="text-[13px] leading-5 text-muted-foreground">
              © {new Date().getFullYear()} AprovAI. Feito no Brasil.
            </p>
            <Link
              to="/privacidade"
              className="rounded-sm text-[13px] leading-5 text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Privacidade
            </Link>
            <Link
              to="/termos"
              className="rounded-sm text-[13px] leading-5 text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
