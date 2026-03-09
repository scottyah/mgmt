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
import { FileUpload } from "@/components/shared/file-upload";
import { Loader2 } from "lucide-react";
import { LICENSE_TYPES } from "@/lib/constants";
import { useProjects } from "@/hooks/use-projects";
import type { License } from "@/hooks/use-licenses";

interface LicenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  initialData?: Partial<License>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function LicenseForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
  mode = "create",
}: LicenseFormProps) {
  const { data: projects } = useProjects();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    product: "",
    vendor: "",
    license_type: "",
    seat_count: "",
    expiration_date: "",
    purchase_date: "",
    cost: "",
    license_key: "",
    notes: "",
    project_id: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
        product: initialData.product ?? "",
        vendor: initialData.vendor ?? "",
        license_type: initialData.license_type ?? "",
        seat_count: initialData.seat_count?.toString() ?? "",
        expiration_date: initialData.expiration_date?.split("T")[0] ?? "",
        purchase_date: initialData.purchase_date?.split("T")[0] ?? "",
        cost: initialData.cost ?? "",
        license_key: initialData.license_key ?? "",
        notes: initialData.notes ?? "",
        project_id: initialData.project_id?.toString() ?? "",
      });
    }
  }, [initialData]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.product.trim()) errs.product = "Product is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "" && value != null) {
        fd.append(key, value);
      }
    });
    if (file) {
      fd.append("file", file);
    }
    onSubmit(fd);
  }

  function updateField(field: string, value: string) {
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
              {mode === "create" ? "New License" : "Edit License"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new software license to track."
                : "Update the license details."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lic-name">Name *</Label>
                <Input
                  id="lic-name"
                  placeholder="License name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lic-product">Product *</Label>
                <Input
                  id="lic-product"
                  placeholder="Product name"
                  value={formData.product}
                  onChange={(e) => updateField("product", e.target.value)}
                />
                {errors.product && (
                  <p className="text-xs text-red-500">{errors.product}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lic-desc">Description</Label>
              <Textarea
                id="lic-desc"
                placeholder="Brief description..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lic-vendor">Vendor</Label>
                <Input
                  id="lic-vendor"
                  placeholder="Vendor name"
                  value={formData.vendor}
                  onChange={(e) => updateField("vendor", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>License Type</Label>
                <Select
                  value={formData.license_type}
                  onValueChange={(val) => updateField("license_type", val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lic-seats">Seat Count</Label>
                <Input
                  id="lic-seats"
                  type="number"
                  placeholder="0"
                  value={formData.seat_count}
                  onChange={(e) => updateField("seat_count", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lic-cost">Cost</Label>
                <Input
                  id="lic-cost"
                  placeholder="$0.00"
                  value={formData.cost}
                  onChange={(e) => updateField("cost", e.target.value)}
                />
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lic-purchase">Purchase Date</Label>
                <Input
                  id="lic-purchase"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => updateField("purchase_date", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lic-expiry">Expiration Date</Label>
                <Input
                  id="lic-expiry"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) =>
                    updateField("expiration_date", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lic-key">License Key</Label>
              <Textarea
                id="lic-key"
                placeholder="Paste license key here..."
                value={formData.license_key}
                onChange={(e) => updateField("license_key", e.target.value)}
                rows={3}
                className="font-mono text-xs"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lic-notes">Notes</Label>
              <Textarea
                id="lic-notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label>Attachment</Label>
              <FileUpload onFileSelect={setFile} />
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
              {mode === "create" ? "Create License" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
