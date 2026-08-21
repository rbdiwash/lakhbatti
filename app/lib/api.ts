import axios from "axios";
import type {
  CreateJobPayload,
  EmployeeDetailRecord,
  EmployeeListParams,
  EmployeeListResponse,
  EmployeeRegistration,
  JobRecord,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL.replace(/\/$/, ""),
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function submitRegistration(
  data: EmployeeRegistration,
): Promise<{ id: string; message: string }> {
  const response = await apiClient.post("/api/employee/register", data);
  return response.data;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const response = await apiClient.get("/api/employee/check", {
    params: { email },
  });
  return Boolean(response.data.exists);
}

export async function listEmployees(
  params: EmployeeListParams = {},
): Promise<EmployeeListResponse> {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === "" || value === undefined || value === null) return false;
      return true;
    }),
  );

  const response = await apiClient.get("/api/employee/list", {
    params: cleaned,
  });

  return {
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    total: Number(response.data?.total ?? 0),
    page: Number(response.data?.page ?? 1),
    pageSize: Number(response.data?.pageSize ?? 10),
    totalPages: Number(response.data?.totalPages ?? 1),
    message: response.data?.message,
  };
}

export async function getEmployee(id: string): Promise<EmployeeDetailRecord> {
  const response = await apiClient.get(`/api/employee/${id}`);
  return response.data.data;
}

export async function updateEmployee(
  id: string,
  data: Record<string, unknown>,
) {
  const response = await apiClient.put(`/api/employee/${id}`, data);
  return response.data.data;
}

export async function deleteEmployee(id: string) {
  const response = await apiClient.delete(`/api/employee/${id}`);
  return response.data;
}

export async function listJobs(): Promise<JobRecord[]> {
  const response = await apiClient.get("/api/jobs");
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function createJob(data: CreateJobPayload): Promise<JobRecord> {
  const response = await apiClient.post("/api/jobs", data);
  return response.data.data;
}
