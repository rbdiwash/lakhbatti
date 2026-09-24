import axios from "axios";
import type {
  AdminProfile,
  BillingSettings,
  BusinessHoursSettings,
  CallOutFeeSettings,
  ChangePasswordPayload,
  CompanyProfileSettings,
  CreateJobPayload,
  CreateQuotePayload,
  EmailConfigSettings,
  EmployeeDetailRecord,
  EmployeeListParams,
  EmployeeListResponse,
  EmployeeRegistration,
  IntegrationSettings,
  JobRecord,
  NotificationSettings,
  PricingConfig,
  PricingSettings,
  QuoteDetailRecord,
  QuoteRecord,
  QuoteStatus,
  RegionalSettings,
  SecuritySettings,
  UpdateAdminProfilePayload,
  UpdateCallOutFeePayload,
  UpdateEmailConfigPayload,
  UpdateQuotePayload,
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

// ─── Quotes ──────────────────────────────────────────────────────────────────

export async function submitQuote(
  data: CreateQuotePayload,
): Promise<{ id: string; message: string }> {
  // Photos make this payload larger than most, so allow extra time.
  const response = await apiClient.post("/api/quotes", data, {
    timeout: 60_000,
  });
  return response.data;
}

export async function listQuotes(
  params: { status?: QuoteStatus | ""; category?: string; search?: string } = {},
): Promise<QuoteRecord[]> {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, value]) => Boolean(value)),
  );
  const response = await apiClient.get("/api/quotes", { params: cleaned });
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function getQuote(id: string): Promise<QuoteDetailRecord> {
  const response = await apiClient.get(`/api/quotes/${id}`);
  return response.data.data;
}

export async function updateQuote(
  id: string,
  data: UpdateQuotePayload,
): Promise<QuoteDetailRecord> {
  const response = await apiClient.patch(`/api/quotes/${id}`, data);
  return response.data.data;
}

export async function convertQuoteToJob(
  id: string,
): Promise<QuoteDetailRecord> {
  const response = await apiClient.post(`/api/quotes/${id}/convert`);
  return response.data.data;
}

export async function deleteQuote(id: string) {
  const response = await apiClient.delete(`/api/quotes/${id}`);
  return response.data;
}

// ─── Settings (admin) — implement matching routes on the backend ─────────────
// GET/PUT  /api/settings/profile
// PUT      /api/settings/password
// GET/PUT  /api/settings/company
// GET/PUT  /api/settings/call-out-fee
// GET/PUT  /api/settings/email
// GET/PUT  /api/settings/notifications
// GET/PUT  /api/settings/business-hours
// GET/PUT  /api/settings/regional
// GET/PUT  /api/settings/security
// GET      /api/settings/billing
// GET/PUT  /api/settings/integrations

async function getSettings<T>(path: string): Promise<T> {
  const response = await apiClient.get(path);
  return response.data.data;
}

async function putSettings<T>(path: string, data: unknown): Promise<T> {
  const response = await apiClient.put(path, data);
  return response.data.data;
}

export async function getAdminProfile(): Promise<AdminProfile> {
  return getSettings("/api/settings/profile");
}

export async function updateAdminProfile(
  data: UpdateAdminProfilePayload,
): Promise<AdminProfile> {
  return putSettings("/api/settings/profile", data);
}

export async function changeAdminPassword(
  data: ChangePasswordPayload,
): Promise<{ message: string }> {
  const response = await apiClient.put("/api/settings/password", data);
  return response.data;
}

export async function getCompanyProfile(): Promise<CompanyProfileSettings> {
  return getSettings("/api/settings/company");
}

export async function updateCompanyProfile(
  data: CompanyProfileSettings,
): Promise<CompanyProfileSettings> {
  return putSettings("/api/settings/company", data);
}

export async function getCallOutFee(): Promise<CallOutFeeSettings> {
  return getSettings("/api/settings/call-out-fee");
}

export async function updateCallOutFee(
  data: UpdateCallOutFeePayload,
): Promise<CallOutFeeSettings> {
  const response = await apiClient.post(
    "/api/settings/call-out-fee/create",
    data,
  );
  return response.data.data;
}

export async function getPricing(): Promise<PricingSettings> {
  return getSettings("/api/settings/pricing");
}

export async function getDefaultPricing(): Promise<PricingConfig> {
  const response = await apiClient.get("/api/settings/pricing/defaults");
  return response.data.data.config;
}

export async function updatePricing(
  config: PricingConfig,
): Promise<PricingSettings> {
  return putSettings("/api/settings/pricing", { config });
}

export async function getEmailConfig(): Promise<EmailConfigSettings> {
  return getSettings("/api/settings/email");
}

export async function updateEmailConfig(
  data: UpdateEmailConfigPayload,
): Promise<EmailConfigSettings> {
  return putSettings("/api/settings/email", data);
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return getSettings("/api/settings/notifications");
}

export async function updateNotificationSettings(
  data: NotificationSettings,
): Promise<NotificationSettings> {
  return putSettings("/api/settings/notifications", data);
}

export async function getBusinessHours(): Promise<BusinessHoursSettings> {
  return getSettings("/api/settings/business-hours");
}

export async function updateBusinessHours(
  data: BusinessHoursSettings,
): Promise<BusinessHoursSettings> {
  return putSettings("/api/settings/business-hours", data);
}

export async function getRegionalSettings(): Promise<RegionalSettings> {
  return getSettings("/api/settings/regional");
}

export async function updateRegionalSettings(
  data: RegionalSettings,
): Promise<RegionalSettings> {
  return putSettings("/api/settings/regional", data);
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  return getSettings("/api/settings/security");
}

export async function updateSecuritySettings(
  data: SecuritySettings,
): Promise<SecuritySettings> {
  return putSettings("/api/settings/security", data);
}

export async function getBillingSettings(): Promise<BillingSettings> {
  return getSettings("/api/settings/billing");
}

export async function getIntegrationSettings(): Promise<IntegrationSettings> {
  return getSettings("/api/settings/integrations");
}

export async function updateIntegrationSettings(
  data: IntegrationSettings,
): Promise<IntegrationSettings> {
  return putSettings("/api/settings/integrations", data);
}
