"use client";

import { useState } from "react";
import { Tv, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { businessPosDevices } from "@/lib/mock-data";
import { PosDevice } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";
import { apiPost } from "@/lib/api-client";

const posTabs = [
  { href: "/pos/transfer", label: "POS Transfer" },
  { href: "/pos/withdrawal", label: "POS Withdrawal" },
  { href: "/pos/terminal-request", label: "Request for POS" },
];

const columns: Column<PosDevice>[] = [
  { header: "Serial", render: (d) => <span className="font-semibold text-ink-900">{d.serial}</span> },
  { header: "Location", render: (d) => <span className="text-ink-600">{d.location}</span> },
  {
    header: "Last transaction",
    hideOnMobile: true,
    render: (d) => <span className="text-ink-500">{formatDate(d.lastTransactionDate)}</span>,
  },
  { header: "Status", render: (d) => <Badge tone={statusTone(d.status)}>{d.status}</Badge> },
];

export default function PosTerminalRequestPage() {
  const allowed = useRequireAccess("pos");
  const { showToast } = useToast();
  const [devices, setDevices] = useState<PosDevice[]>(businessPosDevices);
  const [requesting, setRequesting] = useState(false);

  if (!allowed) return null;

  async function handleRequest() {
    setRequesting(true);
    try {
      const device = await apiPost<PosDevice>("/api/pos/terminals", { count: devices.length });
      setDevices((prev) => [device, ...prev]);
      showToast(`Demo terminal ${device.serial} provisioned to your account.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't request a terminal. Please try again.", "error");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div>
      <PageHeader title="POS" description="Request and manage POS terminals linked to your business." />
      <div className="mb-5">
        <RouteTabs tabs={posTabs} />
      </div>

      <Card className="mb-5 flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
          <Tv size={26} />
        </span>
        <p className="font-display text-lg font-bold text-ink-900">Request for POS</p>
        <p className="max-w-sm text-sm text-ink-500">
          Tap below to simulate a POS request. Demo terminals will be provisioned to your account.
        </p>
        <button
          onClick={handleRequest}
          disabled={requesting}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
        >
          {requesting && <Loader2 size={16} className="animate-spin" />}
          {requesting ? "Requesting..." : "Request for POS"}
        </button>
      </Card>

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Your Terminals</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={devices} emptyMessage="No POS terminals yet." />
        </div>
      </Card>
    </div>
  );
}
