import { delay, genRef, ok, badRequest } from "@/lib/api-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    category?: string;
    accountNumber?: string;
    amount?: number;
  };

  const amount = Number(body.amount);
  if (!body.accountNumber?.trim()) return badRequest("Enter an account, meter, or phone number.");
  if (!amount || amount <= 0) return badRequest("Enter a valid amount.");

  await delay();

  return ok({ reference: genRef("BIL"), amount, status: "COMPLETED" });
}
