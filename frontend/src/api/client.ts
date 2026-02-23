import axios from "axios";

const API_BASE = "/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
const failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (r?: unknown) => void }> = [];

const processQueue = (err: unknown, token?: string) => {
  failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  failedQueue.length = 0;
};

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const originalRequest = err.config;
    const isRefresh = originalRequest?.url?.includes("/auth/refresh");
    if (err.response?.status === 401 && !originalRequest?._retry && !isRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject })).then(() =>
          api(originalRequest)
        ).catch((e) => Promise.reject(e));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");
        if (data?.access_token) {
          sessionStorage.setItem("token", data.access_token);
          processQueue(null, data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        }
      } catch {
        processQueue(err, undefined);
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }
    if (err.response?.status === 401) {
      sessionStorage.removeItem("token");
      if (!originalRequest?._retry) window.location.href = "/login";
    } else if (err.response?.status >= 500) {
      err.message = "Что-то пошло не так, но мы уже чиним";
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (username: string, password: string) =>
  api.post("/auth/login", { username, password });

export const register = (data: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}) => api.post("/auth/register", data);

export const verifyMFA = (code: string) =>
  api.post("/auth/mfa/verify", { code });

export const logout = () => api.post("/auth/logout");

export const refreshToken = () => api.post("/auth/refresh");

// Users
export const getMe = () => api.get("/users/me");
export const updateMe = (data: { full_name?: string; password?: string }) =>
  api.put("/users/me", data);

// Monitoring
export const getDashboard = () => api.get("/monitoring/dashboard");

// Anomalies
export const getAnomalies = (params?: { limit?: number; resolved?: number }) =>
  api.get("/anomalies/", { params });
export const getRiskChart = (hours?: number) =>
  api.get("/anomalies/risk-chart", { params: { hours } });

// Family
export const getFamilyMembers = () => api.get("/family/members");
export const inviteFamilyMember = (data: { email: string; display_name?: string }) =>
  api.post("/family/invite", data);
export const removeFamilyMember = (memberId: number) =>
  api.delete(`/family/members/${memberId}`);

// Security score
export const getSecurityScore = () => api.get("/security-score/me");

// Check security (panic button)
export const checkSecurity = () => api.get("/check-security");

// Simple backup
export const getSimpleBackupStatus = () => api.get("/simple-backup/status");
export const triggerSimpleBackup = (data: {
  backup_photos?: boolean;
  backup_contacts?: boolean;
  backup_documents?: boolean;
}) => api.post("/simple-backup/trigger", data);
export const updateSimpleBackupPreferences = (data: {
  backup_photos?: boolean;
  backup_contacts?: boolean;
  backup_documents?: boolean;
}) => api.put("/simple-backup/preferences", data);

// Onboarding
export const getOnboardingStatus = () => api.get("/onboarding/status");
export const completeOnboarding = () => api.post("/onboarding/complete");

// Anomalies timeline (B2C)
export const getAnomaliesTimeline = (limit?: number) =>
  api.get("/anomalies/timeline", { params: { limit } });

// Password breach check (k-anonymity)
export const checkPasswordBreach = (hashPrefix: string) =>
  api.post<{ hash_prefix: string; suffixes: string[]; count: number; remaining_checks: number }>(
    "/password-check/check",
    { hash_prefix: hashPrefix }
  );
export const getPasswordCheckStats = () =>
  api.get<{ used_checks: number; total_checks: number; last_check: string | null }>(
    "/password-check/stats"
  );

// OSINT: username search (Sherlock), phone validation
export const searchUsername = (username: string) =>
  api.post<{ username: string; found: { site: string; url: string; status: string }[]; total: number }>(
    "/osint/username-search",
    { username }
  );
export const validatePhone = (phone: string) =>
  api.post<{ valid: boolean; formatted?: string; country_code?: number; country?: string; number_type?: string }>(
    "/osint/phone-validate",
    { phone }
  );

// Backup
export const getBackupConfigs = () => api.get("/backup/config");
export const createBackupConfig = (data: {
  name: string;
  endpoint: string;
  access_key: string;
  secret_key: string;
  bucket: string;
  prefix?: string;
  schedule_cron?: string;
}) => api.post("/backup/config", data);
export const triggerBackup = (config_id: number) =>
  api.post("/backup/trigger", { config_id });
export const getBackupLogs = () => api.get("/backup/logs");

// Fraud help
export const getFraudHelpConfig = () =>
  api.get<{ recaptcha_site_key: string }>("/fraud-help/config");
export const searchFraudReports = (q: string) =>
  api.get<{ found: boolean; count: number; message: string }>("/fraud-help/search", {
    params: { q },
  });
