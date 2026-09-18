import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addItem,
  cancelRequest,
  createDraft,
  decideRequest,
  deleteDraft,
  deleteFile,
  deleteItem,
  duplicateRequest,
  getExtraction,
  getPurchaseRequest,
  getRequestAllocations,
  getRequestBudget,
  getTimeline,
  listFiles,
  listItems,
  listPurchaseRequests,
  reassignStep,
  replaceRequestAllocations,
  requestExtraction,
  submitRequest,
  updateDraft,
  updateItem,
  uploadFile,
  type AllocationLinePayload,
  type CreateDraftPayload,
  type DecidePayload,
  type ExtractionPayload,
  type ItemPayload,
  type ListRequestsQuery,
} from "@/api/purchase-requests"

export const requestKeys = {
  all: ["purchase-requests"] as const,
  list: (query: ListRequestsQuery) =>
    ["purchase-requests", "list", query] as const,
  detail: (id: string) => ["purchase-requests", id] as const,
  items: (id: string) => ["purchase-requests", id, "items"] as const,
  files: (id: string) => ["purchase-requests", id, "files"] as const,
  timeline: (id: string) => ["purchase-requests", id, "timeline"] as const,
  budget: (id: string) => ["purchase-requests", id, "budget"] as const,
  allocations: (id: string) =>
    ["purchase-requests", id, "allocations"] as const,
  extraction: (id: string) => ["purchase-requests", id, "extract"] as const,
}

export function usePurchaseRequests(query: ListRequestsQuery = {}) {
  return useQuery({
    queryKey: requestKeys.list(query),
    queryFn: () => listPurchaseRequests(query),
    placeholderData: (previous) => previous,
  })
}

export function usePurchaseRequest(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.detail(id ?? ""),
    queryFn: () => getPurchaseRequest(id as string),
    enabled: Boolean(id),
  })
}

export function useRequestItems(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.items(id ?? ""),
    queryFn: () => listItems(id as string),
    enabled: Boolean(id),
  })
}

export function useRequestFiles(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.files(id ?? ""),
    queryFn: () => listFiles(id as string),
    enabled: Boolean(id),
  })
}

export function useRequestTimeline(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.timeline(id ?? ""),
    queryFn: () => getTimeline(id as string),
    enabled: Boolean(id),
  })
}

export function useRequestBudget(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: requestKeys.budget(id ?? ""),
    queryFn: () => getRequestBudget(id as string),
    enabled: Boolean(id) && enabled,
  })
}

export function useRequestAllocations(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.allocations(id ?? ""),
    queryFn: () => getRequestAllocations(id as string),
    enabled: Boolean(id),
  })
}

export function useReplaceRequestAllocations(id: string) {
  const invalidate = useInvalidateRequest(id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lines: AllocationLinePayload[]) =>
      replaceRequestAllocations(id, lines),
    onSuccess: () => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: requestKeys.budget(id) })
    },
  })
}

function useInvalidateRequest(id?: string) {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: requestKeys.all })

    if (id) {
      void queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) })
    }
  }
}

export function useCreateDraft() {
  const invalidate = useInvalidateRequest()

  return useMutation({
    mutationFn: (payload: CreateDraftPayload) => createDraft(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateDraft(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (payload: Partial<CreateDraftPayload>) =>
      updateDraft(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteDraft() {
  const invalidate = useInvalidateRequest()

  return useMutation({ mutationFn: deleteDraft, onSuccess: invalidate })
}

export function useDuplicateRequest() {
  const invalidate = useInvalidateRequest()

  return useMutation({ mutationFn: duplicateRequest, onSuccess: invalidate })
}

export function useSubmitRequest(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (confirmDuplicate: boolean) =>
      submitRequest(id, confirmDuplicate),
    onSuccess: invalidate,
  })
}

export function useDecideRequest(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (payload: DecidePayload) => decideRequest(id, payload),
    onSuccess: invalidate,
  })
}

export function useCancelRequest(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (reason: string) => cancelRequest(id, reason),
    onSuccess: invalidate,
  })
}

export function useReassignStep(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (toMemberId: string) => reassignStep(id, toMemberId),
    onSuccess: invalidate,
  })
}

export function useAddItem(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (payload: ItemPayload) => addItem(id, payload),
    onSuccess: invalidate,
  })
}

export function useUpdateItem(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: ItemPayload }) =>
      updateItem(id, itemId, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteItem(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (itemId: string) => deleteItem(id, itemId),
    onSuccess: invalidate,
  })
}

export function useUploadFile(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (file: File) => uploadFile(id, file),
    onSuccess: invalidate,
  })
}

export function useDeleteFile(id: string) {
  const invalidate = useInvalidateRequest(id)

  return useMutation({
    mutationFn: (fileId: string) => deleteFile(id, fileId),
    onSuccess: invalidate,
  })
}

export function useRequestExtraction(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ExtractionPayload) => requestExtraction(id, payload),
    onSuccess: (result) => {
      queryClient.setQueryData(requestKeys.extraction(id), result)
    },
  })
}

export function useExtraction(id: string | undefined, polling: boolean) {
  return useQuery({
    queryKey: requestKeys.extraction(id ?? ""),
    queryFn: () => getExtraction(id as string),
    enabled: Boolean(id) && polling,
    refetchInterval: (query) =>
      query.state.data?.status === "QUEUED" ? 2500 : false,
  })
}
