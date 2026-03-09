import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { projectsColumns } from "@/components/projects/projects-columns";
import { ProjectForm } from "@/components/projects/project-form";
import { useProjects, useCreateProject, type Project } from "@/hooks/use-projects";

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const [showCreateForm, setShowCreateForm] = useState(false);

  function handleCreate(data: Partial<Project>) {
    createProject.mutate(data, {
      onSuccess: () => {
        toast.success("Project created successfully");
        setShowCreateForm(false);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "Failed to create project";
        toast.error(msg);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your projects and their associated resources.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      <DataTable
        columns={projectsColumns}
        data={projects ?? []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search projects..."
        onRowClick={(project) => navigate(`/projects/${project.key}`)}
        emptyTitle="No projects yet"
        emptyDescription="Create your first project to start organizing licenses and certificates."
        emptyAction={{
          label: "New Project",
          onClick: () => setShowCreateForm(true),
        }}
      />

      <ProjectForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreate}
        isLoading={createProject.isPending}
        mode="create"
      />
    </div>
  );
}
