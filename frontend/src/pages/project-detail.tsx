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
import { DataTable } from "@/components/shared/data-table";
import { KeycloakStub } from "@/components/projects/keycloak-stub";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from "@/hooks/use-projects";
import { useLicenses } from "@/hooks/use-licenses";
import { useCerts } from "@/hooks/use-certs";
import { getLicensesColumns } from "@/components/licenses/licenses-columns";
import { getCertsColumns } from "@/components/certs/certs-columns";

export default function ProjectDetailPage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useProject(key);
  const updateProject = useUpdateProject(key ?? "");
  const deleteProject = useDeleteProject(key ?? "");
  const { data: licenses, isLoading: licensesLoading } = useLicenses({
    project_id: data?.project?.id,
  });
  const { data: certs, isLoading: certsLoading } = useCerts({
    project_id: data?.project?.id,
  });

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
    { key: "pm", label: "PM", value: project.pm },
    { key: "admin", label: "Admin", value: project.admin },
  ];

  // Columns for sub-tables (simplified - no actions in project detail view)
  const licenseColumns = getLicensesColumns({
    onEdit: () => {},
    onDelete: () => {},
    onDownload: () => {},
  });

  const certColumns = getCertsColumns({
    onEdit: () => {},
    onDelete: () => {},
    onExport: () => {},
  });

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
          <TabsTrigger value="licenses">
            Licenses ({data.license_count})
          </TabsTrigger>
          <TabsTrigger value="certs">
            Certificates ({data.cert_count})
          </TabsTrigger>
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

        <TabsContent value="licenses">
          <DataTable
            columns={licenseColumns}
            data={licenses ?? []}
            isLoading={licensesLoading}
            searchKey="name"
            searchPlaceholder="Search licenses..."
            emptyTitle="No licenses"
            emptyDescription="No licenses associated with this project yet."
          />
        </TabsContent>

        <TabsContent value="certs">
          <DataTable
            columns={certColumns}
            data={certs ?? []}
            isLoading={certsLoading}
            searchKey="name"
            searchPlaceholder="Search certificates..."
            emptyTitle="No certificates"
            emptyDescription="No certificates associated with this project yet."
          />
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
