import { delay, ok, badRequest } from "@/lib/api-server";
import { getTierByLevel } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { level?: number };
  const level = Number(body.level);
  const tier = getTierByLevel(level);

  if (!tier) return badRequest("Unknown tier.");

  await delay();

  return ok({ level: tier.level, name: tier.name, status: "requested" });
}
