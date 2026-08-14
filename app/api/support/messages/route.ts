import { delay, genId, ok, badRequest } from "@/lib/api-server";
import { SupportMessage } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { text?: string };
  const text = body.text?.trim();

  if (!text) return badRequest("Type a message before sending.");

  await delay();

  const message: SupportMessage = {
    id: genId("msg"),
    text,
    date: new Date().toISOString(),
  };

  return ok(message);
}
