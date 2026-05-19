import { api } from "./api";
import type {
  PageResponse, Customer, Account, Transaction, Alert, STR, CTR,
  DormantAccount, LoanApplication, DataCatalogueEntry, CatalogueGroup,
  EtlJob, DataQualityIssue, AuditEntry, DashboardSummary, TrendPoint,
  CategoryValue, LineageGraph, AppUser, Role, LoginResponse, UserInfo,
} from "../types";

/* -------------------- Auth -------------------- */
export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { username, password }).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post<LoginResponse>("/auth/refresh-token", { refreshToken }).then((r) => r.data),
  me: () => api.get<UserInfo>("/auth/me").then((r) => r.data),
};

/* -------------------- Dashboard -------------------- */
export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary").then((r) => r.data),
  alertTrend: () => api.get<TrendPoint[]>("/dashboard/alert-trend").then((r) => r.data),
  strTrend: () => api.get<TrendPoint[]>("/dashboard/str-trend").then((r) => r.data),
  branchAlerts: () => api.get<CategoryValue[]>("/dashboard/branch-alerts").then((r) => r.data),
  dataQualityScore: () =>
    api.get<TrendPoint[]>("/dashboard/data-quality-score").then((r) => r.data),
};

/* -------------------- Customer -------------------- */
export const customerApi = {
  search: (params: Record<string, any> = {}) =>
    api.get<PageResponse<Customer>>("/customers", { params }).then((r) => r.data),
  get360: (id: string) => api.get(`/customers/${id}`).then((r) => r.data),
  accounts: (id: string) => api.get<Account[]>(`/customers/${id}/accounts`).then((r) => r.data),
  transactions: (id: string) =>
    api.get<Transaction[]>(`/customers/${id}/transactions`).then((r) => r.data),
  alerts: (id: string) => api.get<Alert[]>(`/customers/${id}/alerts`).then((r) => r.data),
  strs: (id: string) => api.get<STR[]>(`/customers/${id}/strs`).then((r) => r.data),
};

/* -------------------- Account -------------------- */
export const accountApi = {
  search: (params: Record<string, any> = {}) =>
    api.get<PageResponse<Account>>("/accounts", { params }).then((r) => r.data),
  get360: (acc: string) => api.get(`/accounts/${acc}`).then((r) => r.data),
  transactions: (acc: string) =>
    api.get<Transaction[]>(`/accounts/${acc}/transactions`).then((r) => r.data),
  alerts: (acc: string) => api.get<Alert[]>(`/accounts/${acc}/alerts`).then((r) => r.data),
};

/* -------------------- Transaction -------------------- */
export const transactionApi = {
  search: (params: Record<string, any> = {}) =>
    api.get<PageResponse<Transaction>>("/transactions", { params }).then((r) => r.data),
  highValue: (params = {}) =>
    api.get<PageResponse<Transaction>>("/transactions/high-value", { params }).then((r) => r.data),
  cash: (params = {}) =>
    api.get<PageResponse<Transaction>>("/transactions/cash", { params }).then((r) => r.data),
  crossBorder: (params = {}) =>
    api.get<PageResponse<Transaction>>("/transactions/cross-border", { params }).then((r) => r.data),
};

/* -------------------- Alerts -------------------- */
export const alertApi = {
  search: (params: Record<string, any> = {}) =>
    api.get<PageResponse<Alert>>("/alerts", { params }).then((r) => r.data),
  get: (id: string) => api.get<Alert>(`/alerts/${id}`).then((r) => r.data),
  assign: (id: string, body: { comments?: string; assignee: string }) =>
    api.post<Alert>(`/alerts/${id}/assign`, body).then((r) => r.data),
  escalate: (id: string, body: { comments?: string }) =>
    api.post<Alert>(`/alerts/${id}/escalate`, body).then((r) => r.data),
  close: (id: string, body: { comments: string }) =>
    api.post<Alert>(`/alerts/${id}/close`, body).then((r) => r.data),
  convertToCase: (id: string) => api.post<Alert>(`/alerts/${id}/convert-to-case`).then((r) => r.data),
  convertToStr: (id: string) => api.post<Alert>(`/alerts/${id}/convert-to-str`).then((r) => r.data),
};

export const positiveAlertApi = {
  list: (params = {}) =>
    api.get<PageResponse<Alert>>("/positive-alerts", { params }).then((r) => r.data),
  review: (id: string, body: { comments?: string; assignee: string }) =>
    api.post<Alert>(`/positive-alerts/${id}/review`, body).then((r) => r.data),
};

export const negativeAlertApi = {
  list: (params = {}) =>
    api.get<PageResponse<Alert>>("/negative-alerts", { params }).then((r) => r.data),
  close: (id: string, body: { comments: string }) =>
    api.post<Alert>(`/negative-alerts/${id}/close`, body).then((r) => r.data),
};

/* -------------------- STR / CTR -------------------- */
export const strApi = {
  list: (params = {}) => api.get<PageResponse<STR>>("/str", { params }).then((r) => r.data),
  get: (id: string) => api.get<STR>(`/str/${id}`).then((r) => r.data),
  create: (body: Partial<STR>) => api.post<STR>("/str", body).then((r) => r.data),
  update: (id: string, body: Partial<STR>) => api.put<STR>(`/str/${id}`, body).then((r) => r.data),
  submit: (id: string) => api.post<STR>(`/str/${id}/submit`).then((r) => r.data),
  approve: (id: string) => api.post<STR>(`/str/${id}/approve`).then((r) => r.data),
  return: (id: string) => api.post<STR>(`/str/${id}/return`).then((r) => r.data),
  file: (id: string, authority = "FIU-IND") =>
    api.post<STR>(`/str/${id}/file`, null, { params: { authority } }).then((r) => r.data),
  exportUrl: (id: string) => `${api.defaults.baseURL}/str/${id}/export`,
};

export const ctrApi = {
  list: (params = {}) => api.get<PageResponse<CTR>>("/ctr", { params }).then((r) => r.data),
  generate: (body: { reportDate: string; thresholdAmount?: number }) =>
    api.post<CTR>("/ctr/generate", body).then((r) => r.data),
  approve: (id: string) => api.post<CTR>(`/ctr/${id}/approve`).then((r) => r.data),
};

/* -------------------- Dormant -------------------- */
export const dormantApi = {
  list: (params = {}) =>
    api.get<PageResponse<DormantAccount>>("/dormant-accounts", { params }).then((r) => r.data),
  generateAlert: (acc: string) =>
    api.post<DormantAccount>(`/dormant-accounts/${acc}/generate-alert`).then((r) => r.data),
};

/* -------------------- LOS -------------------- */
export const losApi = {
  all: (params = {}) =>
    api.get<PageResponse<LoanApplication>>("/los/applications", { params }).then((r) => r.data),
  byType: (type: "al" | "ml" | "cc" | "pl", params = {}) =>
    api.get<PageResponse<LoanApplication>>(`/los/${type}`, { params }).then((r) => r.data),
};

/* -------------------- Catalogue -------------------- */
export const catalogueApi = {
  search: (params = {}) =>
    api.get<PageResponse<DataCatalogueEntry>>("/data-catalogue", { params }).then((r) => r.data),
  grouped: () => api.get<CatalogueGroup[]>("/data-catalogue/grouped").then((r) => r.data),
  exportUrl: () => `${api.defaults.baseURL}/data-catalogue/export`,
};

/* -------------------- AI / Query Builder -------------------- */
export const aiApi = {
  query: (prompt: string, context?: string) =>
    api.post("/ai/query", { prompt, context }).then((r) => r.data),
  generateSql: (prompt: string) =>
    api.post("/ai/generate-sql", { prompt, context: "QUERY_BUILDER" }).then((r) => r.data),
  strNarrative: (body: Record<string, any>) =>
    api.post<{ narrative: string }>("/ai/str-narrative", body).then((r) => r.data),
  alertExplanation: (body: Record<string, any>) =>
    api.post<{ explanation: string }>("/ai/alert-explanation", body).then((r) => r.data),
};

export const queryBuilderApi = {
  execute: (body: Record<string, any>) =>
    api.post("/query-builder/execute", body).then((r) => r.data),
  save: (body: Record<string, any>) =>
    api.post("/query-builder/save", body).then((r) => r.data),
  templates: () => api.get("/query-builder/templates").then((r) => r.data),
};

/* -------------------- Data quality -------------------- */
export const dataQualityApi = {
  summary: () => api.get("/data-quality").then((r) => r.data),
  issues: (params = {}) =>
    api.get<PageResponse<DataQualityIssue>>("/data-quality/issues", { params }).then((r) => r.data),
  assign: (id: number, assignee: string) =>
    api.post(`/data-quality/issues/${id}/assign`, null, { params: { assignee } }).then((r) => r.data),
  resolve: (id: number) =>
    api.post(`/data-quality/issues/${id}/resolve`).then((r) => r.data),
};

/* -------------------- Lineage / ETL -------------------- */
export const lineageApi = {
  full: () => api.get<LineageGraph>("/lineage").then((r) => r.data),
  byTable: (table: string) => api.get<LineageGraph>(`/lineage/table/${table}`).then((r) => r.data),
};

export const etlApi = {
  list: (params = {}) =>
    api.get<PageResponse<EtlJob>>("/etl/jobs", { params }).then((r) => r.data),
  rerun: (id: string) => api.post(`/etl/jobs/${id}/rerun`).then((r) => r.data),
  logs: (id: string) => api.get<string[]>(`/etl/jobs/${id}/logs`).then((r) => r.data),
};

/* -------------------- Reports -------------------- */
export const reportApi = {
  list: () => api.get("/reports").then((r) => r.data),
  generate: (body: Record<string, any>) =>
    api.post("/reports/generate", body).then((r) => r.data),
  schedule: (body: Record<string, any>) =>
    api.post("/reports/schedule", body).then((r) => r.data),
  exportUrl: (id: string) => `${api.defaults.baseURL}/reports/${id}/export`,
};

/* -------------------- Audit -------------------- */
export const auditApi = {
  all: (params = {}) =>
    api.get<PageResponse<AuditEntry>>("/audit", { params }).then((r) => r.data),
  byUser: (user: string, params = {}) =>
    api.get<PageResponse<AuditEntry>>(`/audit/user/${user}`, { params }).then((r) => r.data),
  byModule: (module: string, params = {}) =>
    api.get<PageResponse<AuditEntry>>(`/audit/module/${module}`, { params }).then((r) => r.data),
};

/* -------------------- User mgmt -------------------- */
export const userApi = {
  list: () => api.get<AppUser[]>("/users").then((r) => r.data),
  create: (body: any) => api.post<AppUser>("/users", body).then((r) => r.data),
  update: (id: number, body: any) => api.put<AppUser>(`/users/${id}`, body).then((r) => r.data),
  roles: () => api.get<Role[]>("/roles").then((r) => r.data),
};
