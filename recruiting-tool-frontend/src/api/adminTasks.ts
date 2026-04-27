import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

export type AdminTaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type AdminTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface AdminTaskUser {
  uid: string;
  name: string;
  email: string;
}

export interface AdminTaskCompany {
  uid: string;
  name: string;
}

export interface AdminTask {
  uid: string;
  title: string;
  description?: string;
  status: AdminTaskStatus;
  priority: AdminTaskPriority;
  dueDate?: string;
  labels: string[];
  assignedTo?: AdminTaskUser;
  linkedCompany?: AdminTaskCompany;
  createdBy: AdminTaskUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminTaskPayload {
  title: string;
  description?: string;
  status?: AdminTaskStatus;
  priority?: AdminTaskPriority;
  dueDate?: string;
  labels?: string[];
  assignedToUid?: string;
  linkedCompanyUid?: string;
}

export type UpdateAdminTaskPayload = Partial<CreateAdminTaskPayload>;

const QK = ["admin-tasks"];

export function useAdminTasks() {
  return useQuery<AdminTask[]>({
    queryKey: QK,
    queryFn: async () => {
      const res = await api.get<AdminTask[]>("/admin-tasks");
      return res.data;
    },
  });
}

export function useCreateAdminTask() {
  const qc = useQueryClient();
  return useMutation<AdminTask, Error, CreateAdminTaskPayload>({
    mutationFn: async (p) => {
      const res = await api.post<AdminTask>("/admin-tasks", p);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateAdminTask() {
  const qc = useQueryClient();
  return useMutation<
    AdminTask,
    Error,
    { uid: string } & UpdateAdminTaskPayload
  >({
    mutationFn: async ({ uid, ...p }) => {
      const res = await api.patch<AdminTask>(`/admin-tasks/${uid}`, p);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteAdminTask() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (uid) => {
      await api.delete(`/admin-tasks/${uid}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
