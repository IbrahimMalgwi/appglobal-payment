import { delay, genRef, ok, badRequest } from "@/lib/api-server";
import { aroPayoutBank } from "@/lib/mock-data";
import { Transaction } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { amount?: number; available?: number };
  const amount = Number(body.amount);
  const available = Number(body.available);

  if (!amount || amount <= 0) return badRequest("Enter a valid amount to withdraw.");
  if (Number.isFinite(available) && amount > available) {
    return badRequest("Amount exceeds your available settlement balance.");
  }

  await delay();

  const transaction: Transaction = {
    id: genRef("stl-wd"),
    date: new Date().toISOString(),
    kind: "WITHDRAWAL",
    description: `Payout to bank — ${aroPayoutBank.bankName}`,
    reference: genRef("STL-WD"),
    amount,
    direction: "DEBIT",
    status: "COMPLETED",
  };

  return ok({ transaction, destination: aroPayoutBank });
}
