import { delay, ok, badRequest } from "@/lib/api-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { text?: string };
  if (!body.text?.trim()) return badRequest("Type a message before sending.");

  await delay();

  return ok({ success: true });
}
