export interface PaginationMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}
