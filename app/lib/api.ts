import axios from "axios";
import type { EmployeeRegistration } from "./types";

// ─── Axios Instance ──────────────────────────────────────────────────────────
// BASE_URL can be swapped for a real API once the backend is ready.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://jsonplaceholder.typicode.com";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Optional: attach auth token if needed later
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * Submit a completed employee registration.
 * Currently posts to JSONPlaceholder as a dummy endpoint.
 * Replace "/posts" with your real route, e.g. "/api/employees/register".
 */
export async function submitRegistration(
  data: EmployeeRegistration,
): Promise<{ id: number; message: string }> {
  const response = await apiClient.post("/posts", data);
  // JSONPlaceholder echoes the body back; return a shaped response.
  return { id: response.data.id ?? 1, message: "Registration submitted successfully." };
}

/**
 * Check if an email is already registered (dummy — always returns false).
 * Replace with a real duplicate-check endpoint.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  // In production: const r = await apiClient.get(`/api/employees/check?email=${email}`);
  void email;
  return false;
}
