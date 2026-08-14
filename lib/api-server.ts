// Helpers shared by the mock API route handlers (app/api/**). Server-side only.

/** Simulated processing latency so mock mutations feel like real network calls. */
export function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

/** e.g. genRef("TRX") -> "TRX-482910" */
export function genRef(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export function ok<T>(data: T): Response {
  return Response.json(data);
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}
