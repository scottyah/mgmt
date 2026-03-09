import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { PROJECT_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { KeycloakStub } from "@/components/projects/keycloak-stub";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from "@/hooks/use-projects";

export default function ProjectDetailPage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useProject(key);
  const updateProject = useUpdateProject(key ?? "");
  const deleteProject = useDeleteProject(key ?? "");
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data?.project) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => navigate("/projects")} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const project = data.project;

  function startEdit(field: string, currentValue: string) {
    setEditField(field);
    setEditValue(currentValue);
  }

  function cancelEdit() {
    setEditField(null);
    setEditValue("");
  }

  function saveEdit(field: string) {
    updateProject.mutate(
      { [field]: editValue },
      {
        onSuccess: () => {
          toast.success("Project updated");
          setEditField(null);
        },
        onError: () => toast.error("Failed to update project"),
      }
    );
  }

  function handleDelete() {
    deleteProject.mutate(undefined, {
      onSuccess: () => {
        toast.success("Project deleted");
        navigate("/projects");
      },
      onError: () => toast.error("Failed to delete project"),
    });
  }

  const fields = [
    { key: "name", label: "Name", value: project.name },
    { key: "description", label: "Description", value: project.description },
    { key: "bfm", label: "BFM", value: project.bfm },
    { key: "bfm_email", label: "BFM Email", value: project.bfm_email },
    { key: "bfm_phone", label: "BFM Phone", value: project.bfm_phone },
    { key: "pm", label: "PM", value: project.pm },
    { key: "pm_email", label: "PM Email", value: project.pm_email },
    { key: "pm_phone", label: "PM Phone", value: project.pm_phone },
    { key: "admin", label: "Admin", value: project.admin },
    { key: "admin_email", label: "Admin Email", value: project.admin_email },
    { key: "admin_phone", label: "Admin Phone", value: project.admin_phone },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold">
                {project.key}
              </span>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keycloak">Keycloak</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {/* Key (not editable) */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">
                    Project Key
                  </span>
                  <span className="font-mono text-sm font-medium">
                    {project.key}
                  </span>
                </div>

                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {field.label}
                    </span>
                    {editField === field.key ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 w-64"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => saveEdit(field.key)}
                          disabled={updateProject.isPending}
                        >
                          {updateProject.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={cancelEdit}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {field.value || (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            startEdit(field.key, field.value ?? "")
                          }
                        >
                          <Pencil className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Status */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Select
                    value={project.status}
                    onValueChange={(val) => {
                      if (!val) return;
                      updateProject.mutate(
                        { status: val },
                        {
                          onSuccess: () => toast.success("Status updated"),
                          onError: () => toast.error("Failed to update status"),
                        }
                      );
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue>
                        <StatusBadge status={project.status} />
                      </SelectValue>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keycloak">
          <KeycloakStub />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Project"
        description={`Are you sure you want to delete project "${project.key}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
        onConfirm={handleDelete}
        isLoading={deleteProject.isPending}
      />
    </div>
  );
}
