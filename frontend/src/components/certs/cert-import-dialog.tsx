import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/shared/file-upload";
import { Loader2, ShieldCheck } from "lucide-react";

interface CertImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function CertImportDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CertImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPkcs12 = file
    ? /\.(p12|pfx)$/i.test(file.name)
    : false;

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!file) errs.file = "Please select a certificate file";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name);
    if (passphrase) fd.append("passphrase", passphrase);
    onSubmit(fd);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Import Certificate
            </DialogTitle>
            <DialogDescription>
              Upload a certificate file. Supported formats: PEM, CRT, CER, DER,
              P12, PFX.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="import-name">Name *</Label>
              <Input
                id="import-name"
                placeholder="Certificate name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                }}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Certificate File *</Label>
              <FileUpload
                accept=".pem,.crt,.cer,.der,.p12,.pfx"
                onFileSelect={(f) => {
                  setFile(f);
                  if (errors.file)
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.file;
                      return next;
                    });
                }}
              />
              {errors.file && (
                <p className="text-xs text-red-500">{errors.file}</p>
              )}
            </div>

            {isPkcs12 && (
              <div className="grid gap-2">
                <Label htmlFor="import-pass">
                  Passphrase (for PKCS#12)
                </Label>
                <Input
                  id="import-pass"
                  type="password"
                  placeholder="Enter passphrase..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                />
              </div>
            )}

            {file && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Metadata will be extracted from the certificate after upload.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
