import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;

    if (error.response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.response?.status === 403) return 'You do not have permission to perform this action.';
    if (error.response?.status === 404) return 'The requested resource was not found.';
    if (error.response?.status === 409) return 'This record already exists or conflicts with existing data.';
    if (error.response?.status === 422) return 'Please check the form and try again.';
    if (error.code === 'ECONNABORTED') return 'The request timed out. Check your connection and try again.';
    if (!error.response) return 'Unable to reach the server. Check that the API is running.';
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function logApiError(context: string, error: unknown): void {
  if (isAxiosError(error)) {
    console.error(
      `[API] ${context}`,
      error.response?.status ?? 'network',
      error.response?.data ?? error.message
    );
    return;
  }
  console.error(`[API] ${context}`, error);
}

export function unwrapListPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}
