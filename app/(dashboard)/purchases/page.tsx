import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions } from "@/lib/mock-data";

export default function PurchasesPage() {
  const purchases = transactions.filter((t) => t.kind === "PURCHASE");
  return (
    <div>
      <PageHeader title="Purchases" description="All purchases made on this account." />
      <TransactionsTable title="Purchases" transactions={purchases} emptyMessage="No purchases yet." />
    </div>
  );
}
