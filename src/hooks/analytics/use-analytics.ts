import { useMutation, useQuery } from "@tanstack/react-query"

import {
  exportRequests,
  getDashboard,
  getDre,
  type DashboardQuery,
  type ExportFormat,
} from "@/api/analytics"

export const analyticsKeys = {
  dashboard: (query: DashboardQuery) =>
    ["analytics", "dashboard", query] as const,
  dre: (from: string, to: string) => ["analytics", "dre", from, to] as const,
}

export function useDre(range: { from: string; to: string }) {
  return useQuery({
    queryKey: analyticsKeys.dre(range.from, range.to),
    queryFn: () => getDre(range),
    placeholderData: (previous) => previous,
  })
}

export function useDashboard(query: DashboardQuery = {}) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(query),
    queryFn: () => getDashboard(query),
    placeholderData: (previous) => previous,
  })
}

export function useExportRequests() {
  return useMutation({
    mutationFn: ({
      format,
      query,
    }: {
      format: ExportFormat
      query: DashboardQuery
    }) => exportRequests(format, query),
  })
}
