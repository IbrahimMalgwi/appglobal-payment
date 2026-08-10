import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { topFiveTransactions } from "@/lib/mock-data";

export default function TopFiveTransactionsPage() {
  return (
    <div>
      <PageHeader title="Payments" description="Your five most recent payment transactions." />
      <div className="mb-5">
        <RouteTabs
          tabs={[
            { href: "/payments/all-transactions", label: "All Transactions" },
            { href: "/payments/top-five", label: "Top 5 Transactions" },
          ]}
        />
      </div>
      <TransactionsTable title="Top 5 Transactions" transactions={topFiveTransactions} />
    </div>
  );
}
