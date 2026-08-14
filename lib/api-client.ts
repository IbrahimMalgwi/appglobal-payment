// Thin client-side wrapper around fetch for the app's mock API routes (app/api/**).
// Pages call these instead of inline setTimeout blocks; the network round-trip provides
// the async, and the route handler returns the canonical, server-shaped record.

export class ApiError extends Error {}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Something went wrong. Please try again.";
    throw new ApiError(message);
  }
  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}
