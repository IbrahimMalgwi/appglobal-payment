"use client";

import { User, Building2, Headset, Check, LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { UserType } from "@/lib/types";

interface RoleOption {
  value: UserType;
  label: string;
  description: string;
  icon: LucideIcon;
}

const roles: RoleOption[] = [
  { value: "personal", label: "Personal", description: "Everyday payments and transfers.", icon: User },
  { value: "business", label: "Business", description: "Manage one or more business accounts.", icon: Building2 },
  { value: "aro", label: "Agent Relationship Officer", description: "Oversee and support your agent network.", icon: Headset },
];

interface RoleStepProps {
  value: UserType | null;
  onChange: (role: UserType) => void;
  onNext: () => void;
  onBack: () => void;
}

export function RoleStep({ value, onChange, onNext, onBack }: RoleStepProps) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink-900">Choose your account type</h2>
      <p className="mt-1 text-sm text-ink-500">Select how you&apos;ll be using AppGlobal Payment.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {roles.map((role) => {
          const selected = value === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={clsx(
                "relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-colors",
                selected
                  ? "border-brand-500 bg-brand-50"
                  : "border-surface-border bg-white hover:border-brand-200"
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Check size={13} />
                </span>
              )}
              <span
                className={clsx(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  selected ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600"
                )}
              >
                <role.icon size={20} />
              </span>
              <span className="font-display text-sm font-bold text-ink-900">{role.label}</span>
              <span className="text-xs leading-relaxed text-ink-500">{role.description}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-surface-border px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-surface-alt"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!value}
          className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
