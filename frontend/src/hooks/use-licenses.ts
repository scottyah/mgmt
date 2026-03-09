import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface License {
  id: number;
  name: string;
  description: string;
  product: string;
  vendor: string;
  license_type: string;
  seat_count: number | null;
  expiration_date: string | null;
  purchase_date: string | null;
  cost: string | null;
  license_key: string;
  notes: string;
  file_name: string | null;
  project_id: number | null;
  project_key: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface LicensesParams {
  search?: string;
  status?: string;
  project_id?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export function useLicenses(params?: LicensesParams) {
  return useQuery({
    queryKey: ["licenses", params],
    queryFn: async () => {
      const res = await api.get("/licenses", { params });
      return res.data.licenses as License[];
    },
  });
}

export function useLicense(id: number | undefined) {
  return useQuery({
    queryKey: ["licenses", id],
    queryFn: async () => {
      const res = await api.get(`/licenses/${id}`);
      return res.data as License;
    },
    enabled: !!id,
  });
}

export function useCreateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post("/licenses", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateLicense(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.put(`/licenses/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteLicense(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/licenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export async function downloadLicenseFile(id: number, fileName: string) {
  const res = await api.get(`/licenses/${id}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
