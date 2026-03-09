import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Cert {
  id: number;
  name: string;
  description: string;
  common_name: string;
  issuer: string;
  cert_type: string;
  serial_number: string;
  not_valid_before: string | null;
  not_valid_after: string | null;
  notes: string;
  project_id: number | null;
  project_key: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CertsParams {
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  project_id?: number;
}

export function useCerts(params?: CertsParams) {
  return useQuery({
    queryKey: ["certs", params],
    queryFn: async () => {
      const res = await api.get("/certs", { params });
      return res.data.certs as Cert[];
    },
  });
}

export function useCert(id: number | undefined) {
  return useQuery({
    queryKey: ["certs", id],
    queryFn: async () => {
      const res = await api.get(`/certs/${id}`);
      return res.data as Cert;
    },
    enabled: !!id,
  });
}

export function useCreateCert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      cert_pem: string;
      private_key_pem?: string;
      chain_pem?: string;
      cert_type?: string;
      notes?: string;
      project_id?: number | null;
    }) => {
      const res = await api.post("/certs", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useImportCert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post("/certs/import", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateCert(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Cert> & { cert_pem?: string; private_key_pem?: string; chain_pem?: string }) => {
      const res = await api.put(`/certs/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteCert(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/certs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export async function exportCert(id: number, format: string, name: string) {
  const res = await api.get(`/certs/${id}/export`, {
    params: { format },
    responseType: "blob",
  });
  const extensions: Record<string, string> = {
    pem: ".pem",
    der: ".der",
    pkcs12: ".p12",
    pem_bundle: ".pem",
    private_key: ".key",
  };
  const ext = extensions[format] || ".pem";
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${name}${ext}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data as {
        projects_count: number;
        total_users: number;
        active_users: number;
        licenses_count: number;
        certs_count: number;
        expiring_licenses_30d: number;
        expiring_certs_30d: number;
        expired_licenses: number;
        expired_certs: number;
      };
    },
  });
}

export function useDashboardExpiring() {
  return useQuery({
    queryKey: ["dashboard", "expiring"],
    queryFn: async () => {
      const res = await api.get("/dashboard/expiring");
      return res.data as { licenses: License[]; certs: Cert[] };
    },
  });
}

interface ActivityEntry {
  id: number;
  action: string;
  entity_type: string;
  entity_name: string;
  user: string;
  timestamp: string;
  details: Record<string, unknown> | null;
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => {
      const res = await api.get("/dashboard/activity");
      return res.data.entries as ActivityEntry[];
    },
  });
}

// Re-export the License type for the dashboard expiring view
interface License {
  id: number;
  name: string;
  expiration_date: string | null;
  status: string;
  product: string;
}
