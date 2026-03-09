import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Project {
  id: number;
  key: string;
  name: string;
  description: string;
  bfm: string;
  pm: string;
  admin: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectDetail extends Project {
  license_count: number;
  cert_count: number;
}

interface ProjectsParams {
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export function useProjects(params?: ProjectsParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () => {
      const res = await api.get("/projects", { params });
      return res.data.projects as Project[];
    },
  });
}

export function useProject(key: string | undefined) {
  return useQuery({
    queryKey: ["projects", key],
    queryFn: async () => {
      const res = await api.get(`/projects/${key}`);
      return {
        project: res.data.project as Project,
        license_count: res.data.license_count as number,
        cert_count: res.data.cert_count as number,
      } as { project: ProjectDetail; license_count: number; cert_count: number };
    },
    enabled: !!key,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await api.post("/projects", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProject(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await api.put(`/projects/${key}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteProject(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${key}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
