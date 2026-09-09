import { HeroVideo } from "@/features/marketing/hero-video"
import { WaitlistForm } from "@/features/marketing/waitlist-form"

const CAPABILITIES = [
  "Pedidos",
  "Alçadas",
  "Orçamento",
  "Aprovação por e\u2011mail",
  "Fornecedores",
  "Ordens de compra",
  "Conferência de nota",
  "Contas a pagar",
]

const TITLE_GRADIENT =
  "linear-gradient(347deg, var(--foreground) 46%, color-mix(in oklab, var(--foreground) 44%, oklch(1 0 0)) 92%)"

export function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-x-clip pb-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-6 pt-16 sm:px-8">
        <h1
          className="rise-in max-w-[780px] pb-2.5 text-center text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.11] font-semibold tracking-[-0.02em] text-balance text-transparent max-lg:max-w-[700px]"
          style={{
            backgroundImage: TITLE_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Todo pedido de compra anda{" "}

          <br className="max-md:hidden" />
          sozinho até o pagamento.
        </h1>

        <div className="mt-10 flex w-full flex-col items-center gap-8 max-md:mt-8">
          <WaitlistForm source="landing-hero" inputId="hero-email" />

          <ul className="flex max-w-[700px] flex-wrap justify-center gap-2.5 max-sm:gap-1.5">
            {CAPABILITIES.map((capability, index) => (
              <li
                key={capability}
                className="rise-in rounded-full border border-border bg-card px-4 py-2.5 text-[14px] leading-5 font-semibold text-foreground/85 shadow-[0_2px_4px_oklch(0.2_0_0/0.04)] transition-[transform,border-color] duration-150 ease-out hover:-translate-y-px hover:border-muted-foreground/25 max-sm:px-2.5 max-sm:py-1.5 max-sm:text-[12.5px]"
                style={{ animationDelay: `${80 + index * 40}ms` }}
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[84px] w-full max-md:mt-14">
          <HeroVideo
            src="/video/aprovai.mp4"
            poster="/video/aprovai-poster.jpg"
          />
        </div>
      </div>
    </section>
  )
}
