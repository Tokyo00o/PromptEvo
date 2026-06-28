import { api } from "./client";
import type {
  AuditRequest,
  AuditStatusResponse,
  HealthResponse,
  SessionListResponse,
  SystemTopology,
  GraphTopology,
  MetricsResponse,
  FindingsListResponse,
  ReportsListResponse,
  SessionReportsResponse,
  ReportContentResponse,
  SessionDetailResponse,
  MemoryResponse,
  AgentMetricsResponse,
  SessionRoutingResponse,
} from "../types/backend";

export const auditApi = {
  launch: (req: AuditRequest) =>
    api.post<AuditStatusResponse>("/api/v1/audit", req),
  get: (sessionId: string) =>
    api.get<AuditStatusResponse>(`/api/v1/audit/${sessionId}`),
};

export const sessionsApi = {
  list: () => api.get<SessionListResponse>("/api/v1/sessions"),
  detail: (sessionId: string) =>
    api.get<SessionDetailResponse>(`/api/v1/sessions/${sessionId}/detail`),
  findings: (sessionId: string) =>
    api.get<FindingsListResponse>(`/api/v1/sessions/${sessionId}/findings`),
};

export const findingsApi = {
  list: () => api.get<FindingsListResponse>("/api/v1/findings"),
};

export const reportsApi = {
  list: () => api.get<ReportsListResponse>("/api/v1/reports"),
  sessionReports: (sessionId: string) =>
    api.get<SessionReportsResponse>(`/api/v1/reports/${sessionId}`),
  content: (sessionId: string, reportName: string) =>
    api.get<ReportContentResponse>(`/api/v1/reports/${sessionId}/${reportName}`),
};

export const memoryApi = {
  get: () => api.get<MemoryResponse>("/api/v1/memory"),
};

export const agentsApi = {
  metrics: () => api.get<AgentMetricsResponse>("/api/v1/agents/metrics"),
};

export const systemApi = {
  health: () => api.get<HealthResponse>("/api/v1/health"),
  metrics: () => api.get<MetricsResponse>("/api/v1/metrics"),
  topology: () => api.get<SystemTopology>("/api/v1/sys/topology"),
  graphTopology: () => api.get<GraphTopology>("/api/v1/graph-topology"),
  sessionRouting: (sessionId: string) =>
    api.get<SessionRoutingResponse>(`/api/v1/sessions/${sessionId}/routing`),
};

export const SSE_PATH = "/api/v1/audit";
