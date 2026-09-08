import { AudienceSection } from "@/features/marketing/audience-section"
import { FeatureMarquee } from "@/features/marketing/feature-marquee"
import { HeroSection } from "@/features/marketing/hero-section"
import { PageBackdrop } from "@/features/marketing/page-backdrop"
import { ErpFitSection } from "@/features/marketing/erp-fit-section"
import { FaqSection } from "@/features/marketing/faq-section"
import { FinalCtaSection } from "@/features/marketing/final-cta-section"
import { PlansSection } from "@/features/marketing/plans-section"
import { SecuritySection } from "@/features/marketing/security-section"
import { SolutionSection } from "@/features/marketing/solution-section"
import { SiteFooter } from "@/features/marketing/site-footer"
import { SiteHeader } from "@/features/marketing/site-header"

export function LandingPage() {
  return (

    <div className="relative isolate min-h-svh bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-label focus:text-background"
      >
        Pular para o conteúdo
      </a>

      <PageBackdrop />

      <SiteHeader />

      <main id="conteudo">
        <HeroSection />
        <FeatureMarquee />
        <AudienceSection />
        <SolutionSection />
        <ErpFitSection />
        <SecuritySection />
        <PlansSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <SiteFooter />
    </div>
  )
}
