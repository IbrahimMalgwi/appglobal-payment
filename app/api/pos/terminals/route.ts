import { delay, genId, ok } from "@/lib/api-server";
import { PosDevice } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { count?: number };
  const count = Number.isFinite(body.count) ? Number(body.count) : 0;

  await delay();

  const device: PosDevice = {
    id: genId("pd"),
    serial: `POS-${5000 + count + 1}`,
    location: "Awaiting assignment",
    status: "inactive",
    lastTransactionDate: new Date().toISOString(),
  };

  return ok(device);
}
