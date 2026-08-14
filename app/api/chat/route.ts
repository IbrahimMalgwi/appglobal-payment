import { delay, ok } from "@/lib/api-server";

// Placeholder assistant — replace this branching with a real model/backend call later.
function botReply(userText: string): string {
  const text = userText.toLowerCase();
  if (text.includes("transfer")) {
    return "You can send money under Transfers → AppPay Transfer (instant, in-network) or Interbank Transfer (any other bank).";
  }
  if (text.includes("dispute")) {
    return "You can raise or track a dispute under the Dispute page — it covers both POS and Withdrawal issues.";
  }
  if (text.includes("bill") || text.includes("airtime") || text.includes("data")) {
    return "Bill Payment now covers Airtime, Data, Electricity, Cable TV, and more — just pick a category and pay.";
  }
  return "Thanks for your message — a real support agent isn't connected yet, but this is where that reply will appear.";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = body.message ?? "";

  await delay(600);

  return ok({ reply: botReply(message) });
}
