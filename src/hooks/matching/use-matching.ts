import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getMatchResult,
  listMatchResults,
  overrideMatch,
  runMatch,
  type ListMatchResultsQuery,
} from "@/api/matching"

export const matchKeys = {
  all: ["match-results"] as const,
  list: (query: ListMatchResultsQuery) =>
    ["match-results", "list", query] as const,
  detail: (id: string) => ["match-results", id] as const,
}

export function useMatchResults(query: ListMatchResultsQuery = {}) {
  return useQuery({
    queryKey: matchKeys.list(query),
    queryFn: () => listMatchResults(query),
    placeholderData: (previous) => previous,
  })
}

export function useMatchResult(id: string | undefined) {
  return useQuery({
    queryKey: matchKeys.detail(id ?? ""),
    queryFn: () => getMatchResult(id as string),
    enabled: Boolean(id),
  })
}

function useInvalidateMatching() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: matchKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["invoices"] })
    void queryClient.invalidateQueries({ queryKey: ["payables"] })
  }
}

export function useOverrideMatch(id: string) {
  const invalidate = useInvalidateMatching()

  return useMutation({
    mutationFn: (note: string) => overrideMatch(id, note),
    onSuccess: invalidate,
  })
}

export function useRunMatch() {
  const invalidate = useInvalidateMatching()

  return useMutation({ mutationFn: runMatch, onSuccess: invalidate })
}
