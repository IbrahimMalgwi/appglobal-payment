import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Card } from "@/components/ui/Card";
import { networkSuccessRates } from "@/lib/mock-data";

const tabs = [
  { href: "/channels/pos", label: "POS" },
  { href: "/channels/network", label: "Network" },
];

export default function ChannelsNetworkPage() {
  return (
    <div>
      <PageHeader title="Channels" description="Transaction success rates across networks." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {networkSuccessRates.map((rate) => (
          <Card key={rate.label} className="p-5">
            <p className="text-sm font-semibold text-ink-500">{rate.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink-900">{rate.successRate}%</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${rate.successRate}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-400">{rate.totalRequests.toLocaleString()} requests</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
