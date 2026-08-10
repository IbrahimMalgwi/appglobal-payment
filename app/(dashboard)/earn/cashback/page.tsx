import { Gift } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Card } from "@/components/ui/Card";
import { cashbackBalance } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";

const tabs = [
  { href: "/earn/cashback", label: "Cashback" },
  { href: "/earn/referrals", label: "Referrals" },
];

export default function CashbackPage() {
  return (
    <div>
      <PageHeader title="Earn Money" description="Cashback earned from your transactions." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <Card className="max-w-md p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
          <Gift size={22} className="text-accent-500" />
        </div>
        <p className="text-sm text-ink-400">Cashback balance</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-ink-900">{formatNaira(cashbackBalance)}</p>
        <p className="mt-4 text-sm text-ink-500">
          Earn cashback automatically every time you make a qualifying transaction. Cashback is credited to
          this balance and can be withdrawn to your main account.
        </p>
      </Card>
    </div>
  );
}
