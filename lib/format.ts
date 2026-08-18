export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const aroTxnTypeLabels: Record<string, string> = {
  TransferIn: "Transfer",
  CardWithdrawal: "Card",
  BillPayment: "Bill Payment",
};

export function formatTxnType(type: string): string {
  return aroTxnTypeLabels[type] ?? type;
}

export function userTypeLabel(userType: "personal" | "business" | "aro" | "bdo"): string {
  if (userType === "aro") return "ARO";
  if (userType === "bdo") return "BDO";
  return userType === "business" ? "Business" : "Personal";
}
