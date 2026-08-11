import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/ui/ComingSoon";

export default function CardPage() {
  return (
    <div>
      <PageHeader title="Card" description="Card-based transactions for this account." />
      <ComingSoon
        icon={CreditCard}
        title="Card is coming soon"
        description="We're building card issuance and card transaction tracking. This will be available shortly."
      />
    </div>
  );
}
