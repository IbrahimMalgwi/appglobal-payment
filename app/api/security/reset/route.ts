import { delay, ok, badRequest } from "@/lib/api-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    kind?: "pin" | "passcode";
    current?: string;
    next?: string;
    confirm?: string;
  };

  if (body.kind !== "pin" && body.kind !== "passcode") return badRequest("Unknown reset type.");
  if (!body.current?.trim() || !body.next?.trim() || !body.confirm?.trim()) {
    return badRequest("Fill in all fields to continue.");
  }
  if (body.next !== body.confirm) return badRequest("New entry and confirmation don't match.");

  await delay();

  return ok({ success: true, kind: body.kind });
}
