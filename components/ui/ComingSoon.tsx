import { LucideIcon, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function ComingSoon({
  icon: Icon = Sparkles,
  title = "Coming soon",
  description = "We're working on this feature. Check back soon.",
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon size={26} />
      </span>
      <p className="font-display text-lg font-bold text-ink-900">{title}</p>
      <p className="max-w-sm text-sm text-ink-500">{description}</p>
    </Card>
  );
}
