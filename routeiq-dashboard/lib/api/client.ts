import type { ApiResult } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

let _authToken: string | null = null

/** Set the auth token (called from Clerk session hooks). */
export function setAuthToken(token: string | null): void {
  _authToken = token
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Typed fetch wrapper for the RouteIQ REST API.
 * - Adds Authorization header from Clerk session
 * - Returns ApiResult<T> discriminated union — never throws
 * - Adds request_id header for distributed tracing
 * - Retries 503 with exponential backoff (1s/2s/4s, max 3 attempts)
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': generateRequestId(),
    ...(options.headers as Record<string, string>),
  }

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    })

    // Retry on 503 with exponential backoff
    if (res.status === 503 && retryCount < 3) {
      await sleep(1000 * Math.pow(2, retryCount))
      return apiFetch<T>(path, options, retryCount + 1)
    }

    // On 401 — token may be expired; caller should refresh
    if (res.status === 401) {
      return {
        success: false,
        error: { code: 'unauthorized', message: 'Session expired. Please sign in again.' },
      }
    }

    if (!res.ok) {
      let errorBody: { error?: { code?: string; message?: string } } = {}
      try {
        errorBody = await res.json()
      } catch {
        // Response body may not be JSON
      }
      return {
        success: false,
        error: {
          code: errorBody.error?.code ?? `http_${res.status}`,
          message: errorBody.error?.message ?? `Request failed with status ${res.status}`,
        },
      }
    }

    if (res.status === 204) {
      return { success: true, data: undefined as T }
    }

    const data = (await res.json()) as T
    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'network_error',
        message: err instanceof Error ? err.message : 'Network request failed',
      },
    }
  }
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
}
