import { delay, genId, ok, badRequest } from "@/lib/api-server";
import { DisputeCategory, DisputeRecord } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    category?: DisputeCategory;
    reference?: string;
    amount?: number;
    reason?: string;
  };

  const reference = body.reference?.trim();
  const reason = body.reason?.trim();
  const amount = Number(body.amount);

  if (body.category !== "pos" && body.category !== "withdrawal") {
    return badRequest("Choose a dispute type.");
  }
  if (!reference) return badRequest("Enter the transaction reference.");
  if (!amount || amount <= 0) return badRequest("Enter a valid amount.");
  if (!reason) return badRequest("Add a short description of the issue.");

  await delay();

  const record: DisputeRecord = {
    id: genId("d"),
    category: body.category,
    reference,
    amount,
    date: new Date().toISOString(),
    reason,
    status: "open",
  };

  return ok(record);
}
