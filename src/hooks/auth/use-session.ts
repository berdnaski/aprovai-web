import { useQuery, useQueryClient } from "@tanstack/react-query"

import { me, type AuthResponse } from "@/api/auth"

export const authKeys = {
  session: ["auth", "session"] as const,
}

export function useSession() {
  const query = useQuery<AuthResponse | null>({
    queryKey: authKeys.session,
    queryFn: () => me().catch(() => null),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return {
    user: query.data?.user ?? null,
    membership: query.data?.membership ?? null,
    isAuthenticated: Boolean(query.data?.user),
    isLoading: query.isPending,
  }
}

export function useSessionActions() {
  const queryClient = useQueryClient()

  return {
    setSession: (session: AuthResponse) => {
      queryClient.setQueryData(authKeys.session, session)
    },
    clearSession: () => {
      queryClient.setQueryData(authKeys.session, null)
      queryClient.removeQueries({ queryKey: ["companies"] })
      queryClient.removeQueries({ queryKey: ["onboarding"] })
    },
  }
}
