import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Users, Shield } from "lucide-react";

export function KeycloakStub() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-4" />
          Keycloak Integration
          <Badge variant="secondary" className="ml-2 text-xs">
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <Shield className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-medium">
              Identity & Access Management
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Keycloak integration will provide single sign-on, role-based
              access control, and user management for this project.
            </p>

            {/* Placeholder UI */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 opacity-50">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm">Realm</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Not configured
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 opacity-50">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-muted-foreground" />
                  <span className="text-sm">Client ID</span>
                </div>
                <span className="text-sm text-muted-foreground">--</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 opacity-50">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm">Users Synced</span>
                </div>
                <span className="text-sm text-muted-foreground">0</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
