import { formatDistanceToNow, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyRound, ShieldCheck } from "lucide-react";

interface ExpiringLicense {
  id: number;
  name: string;
  product: string;
  expiration_date: string | null;
  status: string;
}

interface ExpiringCert {
  id: number;
  name: string;
  common_name: string;
  not_valid_after: string | null;
  status: string;
}

interface ExpiringItemsProps {
  licenses?: ExpiringLicense[];
  certs?: ExpiringCert[];
  isLoading: boolean;
}

export function ExpiringItems({
  licenses,
  certs,
  isLoading,
}: ExpiringItemsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Expiring Licenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!licenses || licenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No licenses expiring soon
            </p>
          ) : (
            <div className="space-y-3">
              {licenses.map((lic) => (
                <div
                  key={lic.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{lic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lic.product}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {lic.expiration_date
                        ? formatDistanceToNow(parseISO(lic.expiration_date), {
                            addSuffix: true,
                          })
                        : "No date"}
                    </span>
                    <StatusBadge status={lic.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Expiring Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!certs || certs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No certificates expiring soon
            </p>
          ) : (
            <div className="space-y-3">
              {certs.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cert.common_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {cert.not_valid_after
                        ? formatDistanceToNow(parseISO(cert.not_valid_after), {
                            addSuffix: true,
                          })
                        : "No date"}
                    </span>
                    <StatusBadge status={cert.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
