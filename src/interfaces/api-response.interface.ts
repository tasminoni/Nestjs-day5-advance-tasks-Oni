export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface BulkCreateResult {
  insertedCount: number;
  skipped: Array<{
    email: string;
    reason: string;
  }>;
}
