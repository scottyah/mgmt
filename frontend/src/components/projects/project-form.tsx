import { useState } from "react";
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
import { PROJECT_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { Project } from "@/hooks/use-projects";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Project>) => void;
  initialData?: Partial<Project>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function ProjectForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
  mode = "create",
}: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    key: "",
    name: "",
    description: "",
    bfm: "",
    pm: "",
    admin: "",
    status: "active",
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.key?.trim()) errs.key = "Key is required";
    else if (!/^[A-Z0-9-]+$/.test(formData.key))
      errs.key = "Key must be uppercase alphanumeric with hyphens";
    if (!formData.name?.trim()) errs.name = "Name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  }

  function updateField(field: keyof Project, value: string) {
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
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "New Project" : "Edit Project"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new project to organize licenses and certificates."
                : "Update the project details."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="key">Project Key</Label>
              <Input
                id="key"
                placeholder="e.g. PROJ-001"
                value={formData.key ?? ""}
                onChange={(e) =>
                  updateField("key", e.target.value.toUpperCase())
                }
                disabled={mode === "edit"}
                className="font-mono"
              />
              {errors.key && (
                <p className="text-xs text-red-500">{errors.key}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Project name"
                value={formData.name ?? ""}
                onChange={(e) => updateField("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief project description..."
                value={formData.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bfm">BFM</Label>
                <Input
                  id="bfm"
                  placeholder="BFM name"
                  value={formData.bfm ?? ""}
                  onChange={(e) => updateField("bfm", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pm">PM</Label>
                <Input
                  id="pm"
                  placeholder="PM name"
                  value={formData.pm ?? ""}
                  onChange={(e) => updateField("pm", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin">Admin</Label>
                <Input
                  id="admin"
                  placeholder="Admin name"
                  value={formData.admin ?? ""}
                  onChange={(e) => updateField("admin", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={formData.status ?? "active"}
                onValueChange={(val) => updateField("status", val ?? "active")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
