import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    icon: "bg-muted text-foreground",
  },
  success: {
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  warning: {
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  danger: {
    icon: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
};

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            styles.icon
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
