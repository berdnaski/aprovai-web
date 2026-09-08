import { ArrowLeft } from "@phosphor-icons/react"
import { Link } from "react-router-dom"

import logo from "@/assets/aprovai.svg"

export function LegalLayout({
  title,
  updatedAt,
  summary,
  children,
}: {
  title: string
  updatedAt: string
  summary: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 w-full max-w-[880px] items-center justify-between gap-6 px-6 sm:px-8">
          <Link
            to="/"
            aria-label="Ir para o início"
            className="flex shrink-0 items-center rounded-[10px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <img src={logo} alt="AprovAI" className="h-[25px] w-auto" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[14px] leading-5 font-medium text-muted-foreground transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft size={14} weight="bold" />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[880px] px-6 pt-14 pb-24 sm:px-8">
        <p className="text-overline text-muted-foreground">
          Atualizado em {updatedAt}
        </p>
        <h1 className="mt-4 text-[clamp(1.75rem,3.2vw,2.25rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        <p className="mt-4 text-[17px] leading-7 text-muted-foreground">
          {summary}
        </p>

        <div className="mt-12 flex flex-col gap-10">{children}</div>
      </main>
    </div>
  )
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[19px] leading-6 font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[15.5px] leading-7 text-foreground/80">
        {children}
      </div>
    </section>
  )
}

export function LegalTable({
  head,
  rows,
}: {
  head: string[]
  rows: string[][]
}) {
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {head.map((cell) => (
              <th
                key={cell}
                className="px-4 py-2.5 text-[11.5px] leading-4 font-medium tracking-[0.04em] text-muted-foreground uppercase"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-border/60 last:border-0">
              {row.map((cell, index) => (
                <td
                  key={index}
                  className="px-4 py-3 align-top text-[14px] leading-6 text-foreground/80"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LegalNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-[14px] leading-6 text-foreground/80">
      {children}
    </p>
  )
}
