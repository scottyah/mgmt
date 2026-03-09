import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Download, ShieldCheck } from "lucide-react";
import { EXPORT_FORMATS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CertExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string) => void;
  certName: string;
  isLoading?: boolean;
}

export function CertExportDialog({
  open,
  onOpenChange,
  onExport,
  certName,
  isLoading = false,
}: CertExportDialogProps) {
  const [selected, setSelected] = useState("pem");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Export Certificate
          </DialogTitle>
          <DialogDescription>
            Select an export format for &ldquo;{certName}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt.value}
              type="button"
              onClick={() => setSelected(fmt.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                selected === fmt.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/50"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{fmt.label}</p>
                  {fmt.warning && (
                    <AlertTriangle className="size-3.5 text-amber-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {fmt.description}
                </p>
              </div>
              <div
                className={cn(
                  "size-4 rounded-full border-2",
                  selected === fmt.value
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                )}
              >
                {selected === fmt.value && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="size-1.5 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {selected === "private_key" && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Warning: Exporting the private key is a sensitive operation. Ensure
              this file is stored securely and never shared publicly.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={() => onExport(selected)} disabled={isLoading}>
            <Download className="size-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
