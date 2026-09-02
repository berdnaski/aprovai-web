import { useQuery } from "@tanstack/react-query"

import { getSubscription, listAvailablePlans } from "@/api/billing"

export const billingKeys = {
  subscription: ["billing", "subscription"] as const,
  plans: ["billing", "plans"] as const,
}

export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription,
    queryFn: getSubscription,
  })
}

export function useAvailablePlans() {
  return useQuery({ queryKey: billingKeys.plans, queryFn: listAvailablePlans })
}
