export type ApiResponse<TData> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: TData;
};

export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type QueryParams = Record<string, string | number | boolean | undefined>;
