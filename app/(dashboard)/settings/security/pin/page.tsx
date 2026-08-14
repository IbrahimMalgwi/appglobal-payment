import { SecurityResetForm } from "@/components/settings/SecurityResetForm";

export default function ResetPinPage() {
  return <SecurityResetForm kind="pin" title="Reset Transaction PIN" fieldLabel="PIN" numeric maxLength={4} />;
}
