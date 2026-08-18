import logo from "@/assets/aprovai.svg"

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-9 flex flex-col items-center text-center">
          <img src={logo} alt="AprovAI" className="mb-8 h-7 w-auto" />
          <h1 className="text-display text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-subhead text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  )
}
