import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { posDevices } from "@/lib/mock-data";
import { PosDevice } from "@/lib/types";
import { formatDate } from "@/lib/format";

const tabs = [
  { href: "/channels/pos", label: "POS" },
  { href: "/channels/network", label: "Network" },
];

const columns: Column<PosDevice>[] = [
  { header: "Serial No.", render: (d) => <span className="font-semibold text-ink-900">{d.serial}</span> },
  { header: "Location", render: (d) => <span className="text-ink-600">{d.location}</span> },
  { header: "Last Transaction", render: (d) => <span className="text-ink-500">{formatDate(d.lastTransactionDate)}</span> },
  { header: "Status", render: (d) => <Badge tone={statusTone(d.status)}>{d.status}</Badge> },
];

export default function ChannelsPosPage() {
  return (
    <div>
      <PageHeader title="Channels" description="POS devices linked to your business." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Linked POS Devices</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={posDevices} emptyMessage="No POS devices linked yet." />
        </div>
      </Card>
    </div>
  );
}
