export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-px w-6 bg-border" />
      <span className="text-overline text-muted-foreground">{children}</span>
      <span aria-hidden className="h-px w-6 bg-border" />
    </div>
  )
}
