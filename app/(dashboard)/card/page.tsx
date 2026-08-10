import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions } from "@/lib/mock-data";

export default function CardPage() {
  const cardTransactions = transactions.filter((t) => t.kind === "CARD");
  return (
    <div>
      <PageHeader title="Card" description="Card-based transactions for this business account." />
      <TransactionsTable
        title="Card Transactions"
        transactions={cardTransactions}
        emptyMessage="No card transactions yet."
      />
    </div>
  );
}
