"use client";

import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useRequireAccess } from "@/components/access/RequireAccess";

export default function CardPage() {
  const allowed = useRequireAccess("card");
  if (!allowed) return null;
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
