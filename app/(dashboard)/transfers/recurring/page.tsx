import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { TransfersTable } from "@/components/modules/TransfersTable";
import { recurringTransfers } from "@/lib/mock-data";

const tabs = [
  { href: "/transfers/instant", label: "Instant Transfer" },
  { href: "/transfers/recurring", label: "Recurring Transfer" },
  { href: "/transfers/bulk", label: "Bulk Transfer" },
];

export default function RecurringTransferPage() {
  return (
    <div>
      <PageHeader title="Transfers" description="Scheduled and repeating transfers." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <TransfersTable title="Recurring Transfers" records={recurringTransfers} ctaLabel="Schedule Transfer" />
    </div>
  );
}
