import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { getCertsColumns } from "@/components/certs/certs-columns";
import { CertForm } from "@/components/certs/cert-form";
import { CertImportDialog } from "@/components/certs/cert-import-dialog";
import { CertExportDialog } from "@/components/certs/cert-export-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AwsSecretsStub } from "@/components/certs/aws-secrets-stub";
import {
  useCerts,
  useCreateCert,
  useImportCert,
  useUpdateCert,
  useDeleteCert,
  exportCert,
  type Cert,
} from "@/hooks/use-certs";

export default function CertsListPage() {
  const { data: certs, isLoading } = useCerts();
  const createCert = useCreateCert();
  const importCert = useImportCert();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingCert, setEditingCert] = useState<Cert | null>(null);
  const [deletingCert, setDeletingCert] = useState<Cert | null>(null);
  const [exportingCert, setExportingCert] = useState<Cert | null>(null);

  const updateCert = useUpdateCert(editingCert?.id ?? 0);
  const deleteCert = useDeleteCert(deletingCert?.id ?? 0);

  const columns = useMemo(
    () =>
      getCertsColumns({
        onEdit: (cert) => setEditingCert(cert),
        onDelete: (cert) => setDeletingCert(cert),
        onExport: (cert) => setExportingCert(cert),
      }),
    []
  );

  function handleCreate(data: Parameters<typeof createCert.mutate>[0]) {
    createCert.mutate(data, {
      onSuccess: () => {
        toast.success("Certificate created successfully");
        setShowCreateForm(false);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "Failed to create certificate";
        toast.error(msg);
      },
    });
  }

  function handleImport(data: FormData) {
    importCert.mutate(data, {
      onSuccess: () => {
        toast.success("Certificate imported successfully");
        setShowImport(false);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error || "Failed to import certificate";
        toast.error(msg);
      },
    });
  }

  function handleUpdate(data: Parameters<typeof updateCert.mutate>[0]) {
    updateCert.mutate(data, {
      onSuccess: () => {
        toast.success("Certificate updated");
        setEditingCert(null);
      },
      onError: () => toast.error("Failed to update certificate"),
    });
  }

  function handleDelete() {
    deleteCert.mutate(undefined, {
      onSuccess: () => {
        toast.success("Certificate deleted");
        setDeletingCert(null);
      },
      onError: () => toast.error("Failed to delete certificate"),
    });
  }

  async function handleExport(format: string) {
    if (!exportingCert) return;
    try {
      await exportCert(exportingCert.id, format, exportingCert.name);
      toast.success("Certificate exported");
      setExportingCert(null);
    } catch {
      toast.error("Failed to export certificate");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Certificates
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage SSL/TLS certificates and related credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="size-4" />
            Import
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="size-4" />
            New Certificate
          </Button>
        </div>
      </div>

      <AwsSecretsStub />

      <DataTable
        columns={columns}
        data={certs ?? []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search certificates..."
        emptyTitle="No certificates yet"
        emptyDescription="Add your first certificate by creating one or importing from a file."
        emptyAction={{
          label: "New Certificate",
          onClick: () => setShowCreateForm(true),
        }}
      />

      {/* Create form */}
      <CertForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreate}
        isLoading={createCert.isPending}
        mode="create"
      />

      {/* Import dialog */}
      <CertImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSubmit={handleImport}
        isLoading={importCert.isPending}
      />

      {/* Edit form */}
      {editingCert && (
        <CertForm
          open={!!editingCert}
          onOpenChange={(open) => {
            if (!open) setEditingCert(null);
          }}
          onSubmit={handleUpdate}
          initialData={editingCert}
          isLoading={updateCert.isPending}
          mode="edit"
        />
      )}

      {/* Export dialog */}
      {exportingCert && (
        <CertExportDialog
          open={!!exportingCert}
          onOpenChange={(open) => {
            if (!open) setExportingCert(null);
          }}
          onExport={handleExport}
          certName={exportingCert.name}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deletingCert}
        onOpenChange={(open) => {
          if (!open) setDeletingCert(null);
        }}
        title="Delete Certificate"
        description={`Are you sure you want to delete "${deletingCert?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteCert.isPending}
      />
    </div>
  );
}
