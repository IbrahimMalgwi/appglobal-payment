import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { transactions } from "@/lib/mock-data";

export default function AllTransactionsPage() {
  return (
    <div>
      <PageHeader title="Accounts" description="A complete history of activity on this account." />
      <div className="mb-5">
        <RouteTabs
          tabs={[
            { href: "/accounts/all-transactions", label: "All Transactions" },
            { href: "/accounts/daily-summary", label: "Daily Summary" },
          ]}
        />
      </div>
      <TransactionsTable title="All Transactions" transactions={transactions} />
    </div>
  );
}
