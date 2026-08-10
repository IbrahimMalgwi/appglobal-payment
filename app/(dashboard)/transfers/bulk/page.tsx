import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { TransfersTable } from "@/components/modules/TransfersTable";
import { bulkTransfers } from "@/lib/mock-data";

const tabs = [
  { href: "/transfers/instant", label: "Instant Transfer" },
  { href: "/transfers/recurring", label: "Recurring Transfer" },
  { href: "/transfers/bulk", label: "Bulk Transfer" },
];

export default function BulkTransferPage() {
  return (
    <div>
      <PageHeader title="Transfers" description="Large-volume, batched transfers." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <TransfersTable title="Bulk Transfers" records={bulkTransfers} ctaLabel="New Bulk Transfer" />
    </div>
  );
}
