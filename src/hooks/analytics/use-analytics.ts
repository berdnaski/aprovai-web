import { useMutation, useQuery } from "@tanstack/react-query"

import {
  exportRequests,
  getDashboard,
  type DashboardQuery,
  type ExportFormat,
} from "@/api/analytics"

export const analyticsKeys = {
  dashboard: (query: DashboardQuery) =>
    ["analytics", "dashboard", query] as const,
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
