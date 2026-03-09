import { formatDistanceToNow, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
} from "lucide-react";

interface ActivityEntry {
  id: number;
  action: string;
  entity_type: string;
  entity_name: string;
  user: string;
  timestamp: string;
  details: Record<string, unknown> | null;
}

interface RecentActivityProps {
  entries?: ActivityEntry[];
  isLoading: boolean;
}

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  export: Download,
  import: Upload,
};

const actionColors: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  export: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  import: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

export function RecentActivity({ entries, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!entries || entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <div className="relative space-y-0">
            {entries.map((entry, i) => {
              const Icon = actionIcons[entry.action] ?? Activity;
              const color =
                actionColors[entry.action] ??
                "bg-muted text-muted-foreground";

              return (
                <div key={entry.id} className="flex gap-3 pb-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full ${color}`}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    {i < entries.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm">
                      <span className="font-medium">{entry.user}</span>{" "}
                      <span className="text-muted-foreground">
                        {entry.action}d
                      </span>{" "}
                      <span className="font-medium">{entry.entity_type}</span>{" "}
                      <span className="text-muted-foreground">
                        &ldquo;{entry.entity_name}&rdquo;
                      </span>
                    </p>
                    {entry.details && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {formatDistanceToNow(parseISO(entry.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
