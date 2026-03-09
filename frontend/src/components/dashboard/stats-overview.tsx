import { FolderKanban, Users, KeyRound, ShieldCheck, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsOverviewProps {
  stats?: {
    projects_count: number;
    total_users: number;
    active_users: number;
    licenses_count: number;
    certs_count: number;
    expiring_licenses_30d: number;
    expiring_certs_30d: number;
    expired_licenses: number;
    expired_certs: number;
  };
  isLoading: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const attentionCount =
    stats.expiring_licenses_30d +
    stats.expiring_certs_30d +
    stats.expired_licenses +
    stats.expired_certs;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        icon={FolderKanban}
        title="Projects"
        value={stats.projects_count}
        variant="default"
      />
      <StatCard
        icon={Users}
        title="Users"
        value={stats.total_users}
        subtitle={`${stats.active_users} active now`}
        variant="default"
      />
      <StatCard
        icon={KeyRound}
        title="Active Licenses"
        value={stats.licenses_count}
        variant="success"
      />
      <StatCard
        icon={ShieldCheck}
        title="Valid Certificates"
        value={stats.certs_count}
        variant="success"
      />
      <StatCard
        icon={AlertTriangle}
        title="Attention Needed"
        value={attentionCount}
        subtitle={
          attentionCount > 0
            ? `${stats.expired_licenses + stats.expired_certs} expired, ${stats.expiring_licenses_30d + stats.expiring_certs_30d} expiring`
            : "All items healthy"
        }
        variant={attentionCount > 0 ? "warning" : "success"}
      />
    </div>
  );
}
