import { Badge } from "@/components/ui/badge";
import { Cloud } from "lucide-react";

export function AwsSecretsStub() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2">
      <Cloud className="size-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        AWS Secrets Manager
      </span>
      <Badge variant="secondary" className="text-[10px]">
        Coming Soon
      </Badge>
    </div>
  );
}
