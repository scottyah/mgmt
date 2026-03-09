import { useDashboardStats, useDashboardExpiring, useDashboardActivity } from "@/hooks/use-certs";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { ExpiringItems } from "@/components/dashboard/expiring-items";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: expiring, isLoading: expiringLoading } =
    useDashboardExpiring();
  const { data: activity, isLoading: activityLoading } =
    useDashboardActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your projects, licenses, and certificates.
        </p>
      </div>

      <StatsOverview stats={stats} isLoading={statsLoading} />

      <ExpiringItems
        licenses={expiring?.licenses}
        certs={expiring?.certs}
        isLoading={expiringLoading}
      />

      <RecentActivity entries={activity} isLoading={activityLoading} />
    </div>
  );
}
