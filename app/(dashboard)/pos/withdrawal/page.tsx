import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { posWithdrawals } from "@/lib/mock-data";
import { PosWithdrawalRecord } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";

const posTabs = [
  { href: "/pos/transfer", label: "POS Transfer" },
  { href: "/pos/withdrawal", label: "POS Withdrawal" },
];

const columns: Column<PosWithdrawalRecord>[] = [
  { header: "Date", render: (r) => <span className="text-ink-500">{formatDate(r.date)}</span> },
  { header: "Terminal", render: (r) => <span className="font-semibold text-ink-900">{r.terminalId}</span> },
  { header: "Location", hideOnMobile: true, render: (r) => <span className="text-ink-600">{r.location}</span> },
  { header: "Reference", hideOnMobile: true, render: (r) => <span className="text-xs text-ink-400">{r.reference}</span> },
  { header: "Amount", align: "right", render: (r) => <span className="font-semibold">{formatNaira(r.amount)}</span> },
  { header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
];

export default function PosWithdrawalPage() {
  return (
    <div>
      <PageHeader title="POS" description="Withdrawals made through POS devices attached to your business account." />
      <div className="mb-5">
        <RouteTabs tabs={posTabs} />
      </div>
      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">POS Withdrawals</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={posWithdrawals} emptyMessage="No POS withdrawals yet." />
        </div>
      </Card>
    </div>
  );
}
