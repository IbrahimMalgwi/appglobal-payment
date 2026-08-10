import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions } from "@/lib/mock-data";

export default function PaymentsAllTransactionsPage() {
  return (
    <div>
      <PageHeader title="Payments" description="Every payment made from this account." />
      <div className="mb-5">
        <RouteTabs
          tabs={[
            { href: "/payments/all-transactions", label: "All Transactions" },
            { href: "/payments/top-five", label: "Top 5 Transactions" },
          ]}
        />
      </div>
      <TransactionsTable title="All Transactions" transactions={transactions} />
    </div>
  );
}
