import { clsx } from "clsx";

type Tone = "success" | "pending" | "danger" | "neutral" | "info";

const toneStyles: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  pending: "bg-amber-500/10 text-amber-500",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-ink-400/10 text-ink-500",
  info: "bg-brand-500/10 text-brand-600",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status.toLowerCase()) {
    case "completed":
    case "accepted":
    case "resolved":
    case "active":
      return "success";
    case "pending":
    case "open":
      return "pending";
    case "failed":
    case "declined":
    case "rejected":
    case "inactive":
      return "danger";
    default:
      return "neutral";
  }
}
