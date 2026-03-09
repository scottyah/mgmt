import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { CERT_TYPES } from "@/lib/constants";
import { useProjects } from "@/hooks/use-projects";
import type { Cert } from "@/hooks/use-certs";

interface CertFormData {
  name: string;
  description: string;
  cert_pem: string;
  private_key_pem: string;
  chain_pem: string;
  cert_type: string;
  notes: string;
  project_id: string;
}

interface CertFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    cert_pem: string;
    private_key_pem?: string;
    chain_pem?: string;
    cert_type?: string;
    notes?: string;
    project_id?: number | null;
  }) => void;
  initialData?: Partial<Cert>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function CertForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
  mode = "create",
}: CertFormProps) {
  const { data: projects } = useProjects();

  const [formData, setFormData] = useState<CertFormData>({
    name: "",
    description: "",
    cert_pem: "",
    private_key_pem: "",
    chain_pem: "",
    cert_type: "",
    notes: "",
    project_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
        cert_pem: "",
        private_key_pem: "",
        chain_pem: "",
        cert_type: initialData.cert_type ?? "",
        notes: initialData.notes ?? "",
        project_id: initialData.project_id?.toString() ?? "",
      });
    }
  }, [initialData]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (mode === "create" && !formData.cert_pem.trim())
      errs.cert_pem = "Certificate PEM is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const submitData: Record<string, unknown> = {
      name: formData.name,
    };
    if (formData.description) submitData.description = formData.description;
    if (formData.cert_pem) submitData.cert_pem = formData.cert_pem;
    if (formData.private_key_pem)
      submitData.private_key_pem = formData.private_key_pem;
    if (formData.chain_pem) submitData.chain_pem = formData.chain_pem;
    if (formData.cert_type) submitData.cert_type = formData.cert_type;
    if (formData.notes) submitData.notes = formData.notes;
    if (formData.project_id)
      submitData.project_id = parseInt(formData.project_id, 10);
    else submitData.project_id = null;

    onSubmit(submitData as Parameters<CertFormProps["onSubmit"]>[0]);
  }

  function updateField(field: keyof CertFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "New Certificate" : "Edit Certificate"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Paste PEM-encoded certificate data to add a new certificate."
                : "Update certificate details."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cert-name">Name *</Label>
                <Input
                  id="cert-name"
                  placeholder="Certificate name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={formData.cert_type}
                  onValueChange={(val) => updateField("cert_type", val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CERT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cert-desc">Description</Label>
              <Textarea
                id="cert-desc"
                placeholder="Brief description..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cert-pem">
                Certificate PEM {mode === "create" && "*"}
              </Label>
              <Textarea
                id="cert-pem"
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                value={formData.cert_pem}
                onChange={(e) => updateField("cert_pem", e.target.value)}
                rows={6}
                className="font-mono text-xs"
              />
              {errors.cert_pem && (
                <p className="text-xs text-red-500">{errors.cert_pem}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cert-key">Private Key PEM</Label>
              <Textarea
                id="cert-key"
                placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                value={formData.private_key_pem}
                onChange={(e) =>
                  updateField("private_key_pem", e.target.value)
                }
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cert-chain">CA Chain PEM</Label>
              <Textarea
                id="cert-chain"
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                value={formData.chain_pem}
                onChange={(e) => updateField("chain_pem", e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Project</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(val) => updateField("project_id", val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.key} - {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cert-notes">Notes</Label>
              <Textarea
                id="cert-notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={2}
              />
            </div>
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
              {mode === "create" ? "Create Certificate" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
