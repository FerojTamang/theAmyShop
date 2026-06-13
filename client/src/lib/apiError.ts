import axios from "axios";

export type ApiErrorShape = {
  message: string;
  statusCode?: number;
  errors?: unknown[];
};

export function normalizeApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; statusCode?: number; errors?: unknown[] }
      | undefined;

    return {
      message: responseData?.message ?? error.message ?? "Request failed",
      statusCode: responseData?.statusCode ?? error.response?.status,
      errors: responseData?.errors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Something went wrong" };
}
