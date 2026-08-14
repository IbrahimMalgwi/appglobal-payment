import { delay, genId, ok, badRequest } from "@/lib/api-server";
import { TransferRecord } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    network?: "apppay" | "interbank";
    recipient?: string;
    bank?: string;
    amount?: number;
  };

  const recipient = body.recipient?.trim();
  const amount = Number(body.amount);
  const isApppay = body.network === "apppay";

  if (!recipient) return badRequest("Enter a recipient to continue.");
  if (!isApppay && !body.bank?.trim()) return badRequest("Enter a bank to continue.");
  if (!amount || amount <= 0) return badRequest("Enter a valid amount.");

  await delay();

  const record: TransferRecord = {
    id: genId(isApppay ? "ap" : "ib"),
    recipient: isApppay ? `${recipient} (AppPay)` : recipient,
    bank: isApppay ? "AppPay Wallet" : body.bank!.trim(),
    amount,
    date: new Date().toISOString(),
    status: "COMPLETED",
  };

  return ok(record);
}
