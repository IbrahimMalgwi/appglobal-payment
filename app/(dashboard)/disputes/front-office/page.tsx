import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { DisputesTable } from "@/components/modules/DisputesTable";
import { disputes } from "@/lib/mock-data";

const tabs = [
  { href: "/disputes/pos", label: "POS Disputes" },
  { href: "/disputes/front-office", label: "Front Office Disputes" },
  { href: "/disputes/card", label: "Card Disputes" },
];

export default function FrontOfficeDisputesPage() {
  return (
    <div>
      <PageHeader title="Disputes" description="Disputes escalated to customer care." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <DisputesTable title="Front Office Disputes" records={disputes.frontOffice} />
    </div>
  );
}
