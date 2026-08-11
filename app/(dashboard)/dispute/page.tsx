"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { DisputesTable } from "@/components/modules/DisputesTable";
import { disputes } from "@/lib/mock-data";
import { DisputeCategory } from "@/lib/types";

function DisputeContent() {
  const searchParams = useSearchParams();
  const category = (searchParams.get("tab") ?? "pos") as DisputeCategory;

  const filtered = useMemo(() => disputes.filter((d) => d.category === category), [category]);
  const counts = {
    pos: disputes.filter((d) => d.category === "pos").length,
    withdrawal: disputes.filter((d) => d.category === "withdrawal").length,
  };

  return (
    <div>
      <PageHeader title="Dispute" description="Issues related to failed POS transactions or withdrawals." />
      <div className="mb-5">
        <Tabs
          tabs={[
            { key: "pos", label: "POS", badge: counts.pos },
            { key: "withdrawal", label: "Withdrawal", badge: counts.withdrawal },
          ]}
          defaultTab="pos"
        />
      </div>
      <DisputesTable
        title={category === "pos" ? "POS Disputes" : "Withdrawal Disputes"}
        records={filtered}
      />
    </div>
  );
}

export default function DisputePage() {
  return (
    <Suspense fallback={null}>
      <DisputeContent />
    </Suspense>
  );
}
