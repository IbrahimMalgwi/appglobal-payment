"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TransactionsTable } from "@/components/modules/TransactionsTable";
import { billCategories, getBillHistory } from "@/lib/mock-data";
import { detectNetwork, lookupHospital, NETWORK_OPTIONS } from "@/lib/smart-lookup";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";
import { apiPost } from "@/lib/api-client";

export default function BillPaymentPage() {
  const allowed = useRequireAccess("billPayment");
  const { showToast } = useToast();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(billCategories[0].id);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Airtime/Data network: manualNetwork is only ever set by clicking a network button —
  // otherwise the network shown/used is purely derived from the phone number below.
  const [phoneNumber, setPhoneNumber] = useState("");
  const [manualNetwork, setManualNetwork] = useState<string | null>(null);

  // Hospital ID lookup state.
  const [hospitalId, setHospitalId] = useState("");

  const visibleCategories = showAll ? billCategories : billCategories.filter((c) => c.primary);
  const selectedCategory = billCategories.find((c) => c.id === selected)!;
  const history = useMemo(() => getBillHistory(selected), [selected]);
  const isAirtimeOrData = selected === "airtime" || selected === "data";
  const isHospital = selected === "hospital";

  // Fresh form per category — a phone number typed for Airtime shouldn't linger when the user
  // switches to Electricity, etc. Adjusted during render (React's recommended pattern for
  // resetting state when a value changes) rather than in an effect.
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    setAccountNumber("");
    setAmount("");
    setPhoneNumber("");
    setManualNetwork(null);
    setHospitalId("");
  }

  // Purely derived from phoneNumber — no effect needed, and never goes stale.
  const detectedNetwork = isAirtimeOrData && phoneNumber.length === 11 ? detectNetwork(phoneNumber) : null;
  const network = manualNetwork ?? detectedNetwork;
  const autoDetected = !manualNetwork && !!detectedNetwork;

  const hospitalLookup = useMemo(() => (isHospital ? lookupHospital(hospitalId) : null), [hospitalId, isHospital]);

  async function handleSubmit() {
    const identifier = isAirtimeOrData ? phoneNumber : isHospital ? hospitalId : accountNumber;
    if (!identifier.trim()) {
      showToast(
        isAirtimeOrData ? "Enter a phone number." : isHospital ? "Enter a hospital ID or account number." : "Enter an account or meter number.",
        "error"
      );
      return;
    }
    if (isAirtimeOrData && !network) {
      showToast("Select a network to continue.", "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/api/bill-payment", {
        category: selected,
        accountNumber: identifier,
        amount: parsedAmount,
        network: isAirtimeOrData ? network : undefined,
      });
      setAccountNumber("");
      setAmount("");
      setPhoneNumber("");
      setHospitalId("");
      setManualNetwork(null);
      showToast(`${selectedCategory.label} payment of ₦${parsedAmount.toLocaleString()} successful.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Payment failed. Please try again.", "error");
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
          <div className="space-y-4">
            {isAirtimeOrData ? (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">Phone number</label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                    placeholder="08012345678"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </div>

                {network && autoDetected && (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span className="flex-1">
                      Detected network: <span className="font-semibold">{network}</span>
                    </span>
                    <span className="text-xs text-success/70">Pick a different network below to change it.</span>
                  </div>
                )}
                {phoneNumber.length === 11 && !network && (
                  <p className="flex items-center gap-1.5 text-xs text-ink-400">
                    <AlertCircle size={13} /> We couldn&apos;t detect a network — please select one below.
                  </p>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">Network</label>
                  <div className="grid grid-cols-4 gap-2">
                    {NETWORK_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setManualNetwork(n)}
                        className={clsx(
                          "rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors",
                          network === n
                            ? "border-brand-500 bg-brand-50 text-brand-600"
                            : "border-surface-border text-ink-600 hover:border-brand-200"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : isHospital ? (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Hospital ID or Account Number</label>
                <input
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  placeholder="e.g. H-2291"
                  className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                />
                {hospitalId.trim() && (
                  <p
                    className={clsx(
                      "mt-1.5 flex items-center gap-1.5 text-xs",
                      hospitalLookup ? "text-success" : "text-ink-400"
                    )}
                  >
                    {hospitalLookup ? (
                      <>
                        <CheckCircle2 size={13} /> Resolved: {hospitalLookup.hospitalName}
                      </>
                    ) : (
                      <>
                        <AlertCircle size={13} /> Hospital not found, please verify the ID.
                      </>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Account / meter number</label>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter number"
                  className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Processing..." : `Pay ${selectedCategory.label}`}
            </button>
          </div>
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
