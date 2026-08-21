"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Zap } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { billCategories, getBillHistory } from "@/lib/mock-data";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";
import { apiPost } from "@/lib/api-client";
import { BillCategoryId } from "@/lib/types";
import { AirtimeForm } from "@/components/modules/bill-payment/AirtimeForm";
import { DataForm } from "@/components/modules/bill-payment/DataForm";
import { ElectricityForm } from "@/components/modules/bill-payment/ElectricityForm";
import { CableTvForm } from "@/components/modules/bill-payment/CableTvForm";
import { HospitalForm } from "@/components/modules/bill-payment/HospitalForm";
import { InternetForm } from "@/components/modules/bill-payment/InternetForm";
import { EducationForm } from "@/components/modules/bill-payment/EducationForm";
import { OtherForm } from "@/components/modules/bill-payment/OtherForm";
import { BillFormProps, BillSubmitPayload } from "@/components/modules/bill-payment/types";

// Each category renders its own purpose-built form (config-driven where the shape is
// shared, e.g. Data/Cable TV both reuse PricedOptionPicker) rather than one generic form
// forcing every category's identifier/amount into the same two fields.
const CATEGORY_FORMS: Record<BillCategoryId, ComponentType<BillFormProps>> = {
  airtime: AirtimeForm,
  data: DataForm,
  electricity: ElectricityForm,
  "cable-tv": CableTvForm,
  hospital: HospitalForm,
  internet: InternetForm,
  education: EducationForm,
  other: OtherForm,
};

export default function BillPaymentPage() {
  const allowed = useRequireAccess("billPayment");
  const { showToast } = useToast();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<BillCategoryId>(billCategories[0].id);
  const [submitting, setSubmitting] = useState(false);

  const visibleCategories = showAll ? billCategories : billCategories.filter((c) => c.primary);
  const selectedCategory = billCategories.find((c) => c.id === selected)!;
  const history = useMemo(() => getBillHistory(selected), [selected]);
  const FormComponent = CATEGORY_FORMS[selected];

  async function handleSubmit(payload: BillSubmitPayload): Promise<boolean> {
    setSubmitting(true);
    try {
      await apiPost("/api/bill-payment", {
        category: selected,
        accountNumber: payload.identifier,
        amount: payload.amount,
        network: payload.network,
      });
      showToast(`${selectedCategory.label} payment of ₦${payload.amount.toLocaleString()} successful.`);
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Payment failed. Please try again.", "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  if (!allowed) return null;

  return (
    <div>
      <PageHeader title="Bill Payment" description="Pay bills and track your recent payments by category." />

      <Card className="mb-5 p-5">
        <p className="mb-3 text-sm font-semibold text-ink-700">Select a category</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={clsx(
                "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-semibold transition-colors",
                selected === cat.id
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-surface-border text-ink-600 hover:border-brand-200"
              )}
            >
              <Zap size={20} />
              {cat.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-600"
        >
          {showAll ? "Show fewer categories" : "Show more categories"}
          <ChevronDown size={15} className={clsx("transition-transform", showAll && "rotate-180")} />
        </button>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-ink-700">Pay {selectedCategory.label}</p>
          {/* key={selected} remounts the form on category switch, so each form's own state
              resets for free instead of every form re-implementing the reset dance. */}
          <FormComponent key={selected} submitting={submitting} onSubmit={handleSubmit} />
        </Card>

        <TransactionsTable
          title={`${selectedCategory.label} History`}
          transactions={history}
          emptyMessage={`No ${selectedCategory.label.toLowerCase()} payments yet.`}
          onRowClick={(t) => router.push(`/transactions/${t.id}`)}
        />
      </div>
    </div>
  );
}
