export interface AuditRequest {
  objective: string;
  target_model: string;
  inquiryer_provider?: string;
  inquiryer_model?: string;
  target_provider?: string;
  block_threshold?: number;
  dry_run?: boolean;
}

export interface AuditReport {
  session_id: string;
  objective: string;
  target_model: string;
  inquiry_status: string;
  prometheus_score: number;
  rahs_score: number;
  severity_band: string;
  cooperation_score: number;
  total_turns: number;
  tap_depth: number;
  active_technique: string;
  pruned_techniques: string[];
  decomposition_used: boolean;
  defense_patch: string;
  debate_turns: number;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  ci_cd_gate_passed?: boolean;
}

export interface AuditStatusResponse {
  session_id: string;
  status: "queued" | "running" | "complete" | "error";
  report?: AuditReport;
  error?: string;
}

export interface NodeEvent {
  session_id: string;
  node_name: string;
  turn: number;
  cooperation_score?: number;
  prometheus_score?: number;
  inquiry_status?: string;
  active_technique?: string;
  rahs_score?: number;
  timestamp: string;
  last_message?: string;
  last_role?: string;
}

export interface SessionSummary {
  session_id: string;
  status: "running" | "complete" | "error";
}

export interface SessionListResponse {
  sessions: SessionSummary[];
  total: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  graph_ok: boolean;
  timestamp: string;
  active_sessions: number;
}

export interface MetricsResponse {
  [key: string]: number;
}

export interface SystemTopology {
  allowed_targets: string[];
  observability: { [key: string]: unknown };
}

export interface GraphTopology {
  mermaid: string;
}

export type SeverityBand = "Critical" | "High" | "Medium" | "Low" | "None";
export type SessionStatus = "running" | "complete" | "error" | "queued" | "cancelled" | "paused";
export type AgentStatus = "idle" | "running" | "waiting" | "completed" | "failed";
export type ModelStatus = "online" | "loading" | "unavailable" | "idle";

export interface Finding {
  id: string;
  severity: SeverityBand;
  category: string;
  model: string;
  scenario: string;
  evaluator: string;
  confidence: number;
  status: string;
  created: string;
  session_id: string;
  description?: string;
  evidence?: string;
  affected_prompt?: string;
  target_response?: string;
  judge_output?: string;
  analyst_notes?: string;
  recommendation?: string;
}

export interface AgentInfo {
  key: string;
  title: string;
  stage: string;
  role: string;
  status: AgentStatus;
  techniques: string[];
  inputs: string;
  outputs: string;
  current_action?: string;
  duration?: number;
  last_run?: string;
}

export interface MemoryEntry {
  id: string;
  type: "working" | "session" | "long_term";
  operation: "read" | "write" | "update" | "retrieve" | "delete";
  component: string;
  content?: string;
  score?: number;
  timestamp: string;
  execution_time?: number;
}

export interface ModelInfo {
  name: string;
  provider: string;
  version?: string;
  role: string;
  status: ModelStatus;
  latency?: number;
  sessions?: number;
  risk?: number;
  health?: string;
  memory_usage?: number;
  token_usage?: number;
}

export interface PipelineStage {
  name: string;
  status: AgentStatus;
  duration?: number;
  output_size?: number;
  dependencies: string[];
}

export interface ProviderOption {
  value: string;
  label: string;
  models: string[];
}

export interface GoalOption {
  id: string;
  domain: string;
  category: string;
  weakness: string;
  goal: string;
  description: string;
}

export interface ScenarioOption {
  id: string;
  goal_id: string;
  scenario: string;
  description: string;
}

/* ── Findings API ── */

export interface FindingsListResponse {
  findings: Finding[];
  total: number;
}

/* ── Reports API ── */

export interface ReportFileInfo {
  name: string;
  type: string;
  size: number;
  modified: string;
  session_id?: string;
}

export interface ReportsListResponse {
  reports: ReportFileInfo[];
  total: number;
}

export interface SessionReportsResponse {
  session_id: string;
  files: ReportFileInfo[];
}

export interface ReportContentResponse {
  filename: string;
  content: string;
  content_type: string;
}

/* ── Session Detail API ── */

export interface SessionTurn {
  turn: number | null;
  agent: string;
  prompt: string;
  response: string;
}

export interface SessionDetailResponse {
  session_id: string;
  target_model: string;
  objective: string;
  turns: SessionTurn[];
  findings: Finding[];
  report_files: ReportFileInfo[];
  raw: {
    robustness: Record<string, unknown>;
    structured_log: Record<string, unknown>;
    summary: Record<string, unknown>;
  };
}

/* ── Memory API ── */

export interface MemoryEntryRaw {
  id: string;
  type: "working" | "session" | "long_term";
  operation: "read" | "write" | "update" | "retrieve" | "delete";
  component: string;
  content?: string;
  score?: number | null;
  timestamp: string;
  session_id: string;
}

export interface MemoryResponse {
  entries: MemoryEntryRaw[];
  total: number;
  working: Record<string, unknown>;
  session: Record<string, unknown>;
  long_term: Record<string, unknown>;
}

/* ── Agent Metrics API ── */

export interface AgentMetricNode {
  name: string;
  calls: number;
  session_count: number;
}

export interface AgentMetricsResponse {
  agents: AgentMetricNode[];
  inquiry_effectiveness: Record<string, unknown>[];
  total_sessions: number;
  total_llm_calls: number;
}

export interface RoutingEntry {
  ts: string;
  session_id: string;
  from_node: string;
  to_node: string;
  reason: string;
}

export interface SessionRoutingResponse {
  session_id: string;
  routing: RoutingEntry[];
  total: number;
}
