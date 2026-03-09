import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { getLicensesColumns } from "@/components/licenses/licenses-columns";
import { LicenseForm } from "@/components/licenses/license-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useLicenses,
  useCreateLicense,
  useUpdateLicense,
  useDeleteLicense,
  downloadLicenseFile,
  type License,
} from "@/hooks/use-licenses";

export default function LicensesListPage() {
  const { data: licenses, isLoading } = useLicenses();
  const createLicense = useCreateLicense();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<License | null>(null);

  // These hooks need a stable id, so we use the editing/deleting license id
  const updateLicense = useUpdateLicense(editingLicense?.id ?? 0);
  const deleteLicense = useDeleteLicense(deletingLicense?.id ?? 0);

  const columns = useMemo(
    () =>
      getLicensesColumns({
        onEdit: (lic) => setEditingLicense(lic),
        onDelete: (lic) => setDeletingLicense(lic),
        onDownload: async (lic) => {
          try {
            await downloadLicenseFile(lic.id, lic.file_name ?? "license");
            toast.success("File downloaded");
          } catch {
            toast.error("Failed to download file");
          }
        },
      }),
    []
  );

  function handleCreate(data: FormData) {
    createLicense.mutate(data, {
      onSuccess: () => {
        toast.success("License created successfully");
        setShowCreateForm(false);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "Failed to create license";
        toast.error(msg);
      },
    });
  }

  function handleUpdate(data: FormData) {
    updateLicense.mutate(data, {
      onSuccess: () => {
        toast.success("License updated successfully");
        setEditingLicense(null);
      },
      onError: () => toast.error("Failed to update license"),
    });
  }

  function handleDelete() {
    deleteLicense.mutate(undefined, {
      onSuccess: () => {
        toast.success("License deleted");
        setDeletingLicense(null);
      },
      onError: () => toast.error("Failed to delete license"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Licenses</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage software licenses.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="size-4" />
          New License
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={licenses ?? []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search licenses..."
        emptyTitle="No licenses yet"
        emptyDescription="Add your first license to start tracking software assets."
        emptyAction={{
          label: "New License",
          onClick: () => setShowCreateForm(true),
        }}
      />

      {/* Create form */}
      <LicenseForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreate}
        isLoading={createLicense.isPending}
        mode="create"
      />

      {/* Edit form */}
      {editingLicense && (
        <LicenseForm
          open={!!editingLicense}
          onOpenChange={(open) => {
            if (!open) setEditingLicense(null);
          }}
          onSubmit={handleUpdate}
          initialData={editingLicense}
          isLoading={updateLicense.isPending}
          mode="edit"
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deletingLicense}
        onOpenChange={(open) => {
          if (!open) setDeletingLicense(null);
        }}
        title="Delete License"
        description={`Are you sure you want to delete "${deletingLicense?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteLicense.isPending}
      />
    </div>
  );
}
