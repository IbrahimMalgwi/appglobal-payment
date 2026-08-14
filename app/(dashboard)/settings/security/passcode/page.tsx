import { SecurityResetForm } from "@/components/settings/SecurityResetForm";

export default function ResetPasscodePage() {
  return <SecurityResetForm kind="passcode" title="Reset Passcode" fieldLabel="Passcode" numeric maxLength={6} />;
}
