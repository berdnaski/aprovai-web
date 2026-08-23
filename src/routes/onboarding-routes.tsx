import { Route } from "react-router-dom"

import { CreateCompanyPage } from "@/features/onboarding/create-company-page"
import { OnboardingPage } from "@/features/onboarding/onboarding-page"
import { RequireNoCompany } from "@/routes/guards"

export function createCompanyRoutes() {
  return (
    <Route element={<RequireNoCompany />}>
      <Route path="/onboarding/empresa" element={<CreateCompanyPage />} />
    </Route>
  )
}

export function onboardingRoutes() {
  return <Route path="/onboarding" element={<OnboardingPage />} />
}
