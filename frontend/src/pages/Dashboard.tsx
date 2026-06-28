import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle, AlertTriangle, Shield, Cpu, Target, Clock, FileText, Play, ExternalLink } from "lucide-react";
import { PageHeader, StatCard, CardSkeleton, Card, StatusBadge, SeverityBadge, EmptyState, Button, RiskGauge } from "../components/reusable";
import { RiskTimelineChart } from "../components/charts/RiskTimeline";
import { auditApi, sessionsApi, systemApi, findingsApi } from "../api/endpoints";
import type { AuditStatusResponse } from "../types/backend";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";
import { useUiStore } from "../store/uiStore";
import { useEffect, useState } from "react";

export function Dashboard() {
  const navigate = useNavigate();
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["health"],
    queryFn: systemApi.health,
    refetchInterval: 5000,
  });
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsApi.list,
    refetchInterval: 10000,
  });
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: systemApi.metrics,
    refetchInterval: 5000,
  });
  const { data: topology } = useQuery({
    queryKey: ["topology"],
    queryFn: systemApi.topology,
    refetchInterval: 30000,
  });
  const { data: findingsData } = useQuery({
    queryKey: ["findings"],
    queryFn: findingsApi.list,
    refetchInterval: 15000,
  });

  const runningSessions = sessionsData?.sessions.filter((s) => s.status === "running") || [];
  const completedSessions = sessionsData?.sessions.filter((s) => s.status === "complete") || [];
  const failedSessions = sessionsData?.sessions.filter((s) => s.status === "error") || [];
  const totalSessions = sessionsData?.total || 0;
  const findings = findingsData?.findings || [];
  const criticalFindings = findings.filter((f) => f.severity === "Critical").length;
  const highFindings = findings.filter((f) => f.severity === "High").length;

  return (
    <div>
      <PageHeader
        title="Command Center"
        subtitle="Real-time AI Security Validation Platform"
        action={
          <Button variant="primary" onClick={() => navigate("/new-audit")}>
            <Play size={16} /> New Audit
          </Button>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        {healthLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Running Audits" value={runningSessions.length} icon={<Activity size={20} />} color={COLORS.status.success} subtitle={runningSessions.length > 0 ? "Active now" : "No active audits"} />
            <StatCard label="Completed Audits" value={completedSessions.length} icon={<CheckCircle size={20} />} color={COLORS.primary.blue} subtitle={`${((completedSessions.length / Math.max(totalSessions, 1)) * 100).toFixed(0)}% of total`} />
            <StatCard label="Critical Findings" value={criticalFindings} icon={<AlertTriangle size={20} />} color={COLORS.severity.critical} subtitle="Requires immediate attention" />
            <StatCard label="High Findings" value={highFindings} icon={<AlertTriangle size={20} />} color={COLORS.severity.high} subtitle="Needs review" />
            <StatCard label="Models Tested" value={topology?.allowed_targets?.length || metrics?.["models.tested"] || 0}
              icon={<Cpu size={20} />} color={COLORS.primary.cyan} subtitle="Unique target models" />
            <StatCard label="Failed Sessions" value={failedSessions.length} icon={<Shield size={20} />} color={failedSessions.length > 0 ? COLORS.severity.high : COLORS.status.success} subtitle={failedSessions.length > 0 ? `${((failedSessions.length / Math.max(totalSessions, 1)) * 100).toFixed(0)}% failure rate` : "All clear"} />
          </>
        )}
      </div>

      {/* Live Audit + Risk Timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <LiveAuditPreview sessions={runningSessions} />
        <Card title="Risk Timeline" subtitle="Risk score evolution across sessions" height={420}>
          <RiskTimelineChart data={[]} />
          {findings.length === 0 ? (
            <EmptyState title="No risk data yet" description="Risk scores will appear as audits are executed." />
          ) : (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary, marginBottom: 8 }}>Findings Summary</div>
              <div style={{ display: "flex", gap: 8 }}>
                <SeverityBadge severity="Critical" /> <span style={{ fontSize: 12, color: COLORS.text.secondary }}>{criticalFindings}</span>
                <SeverityBadge severity="High" /> <span style={{ fontSize: 12, color: COLORS.text.secondary }}>{highFindings}</span>
                <SeverityBadge severity="Medium" /> <span style={{ fontSize: 12, color: COLORS.text.secondary }}>{findings.filter((f) => f.severity === "Medium").length}</span>
                <SeverityBadge severity="Low" /> <span style={{ fontSize: 12, color: COLORS.text.secondary }}>{findings.filter((f) => f.severity === "Low").length}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Findings Preview + Agent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card title="Recent Findings" subtitle={`Latest 5 of ${findings.length} findings`}
          action={findings.length > 0 ? <Button variant="ghost" size="sm" onClick={() => navigate("/findings")}>View All</Button> : undefined}
          height={340}
        >
          {findings.length === 0 ? (
            <EmptyState title="No findings generated" description="Run an audit to generate findings." action={<Button variant="secondary" onClick={() => navigate("/new-audit")}>Start Audit</Button>} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflow: "auto" }}>
              {findings.slice(0, 5).map((f, i) => (
                <div key={f.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, cursor: "pointer", transition: `background ${MOTION.fast}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => navigate("/findings")}
                >
                  <SeverityBadge severity={f.severity} />
                  <span style={{ fontSize: 12, color: COLORS.text.secondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.description?.slice(0, 80) || f.category || "Finding"}
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.text.muted }}>{f.model?.split("/").pop() || ""}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Agent Activity" subtitle="Current orchestration status" height={340}>
          <AgentActivityPanel />
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card title="Recent Sessions" subtitle="Last 10 audit sessions" height={400}>
        {sessionsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 48, background: COLORS.bg.surface, borderRadius: 8, animation: "shimmer 1.4s infinite" }} />)}
          </div>
        ) : totalSessions === 0 ? (
          <EmptyState title="No audits yet" description="Start your first security audit." action={<Button variant="primary" onClick={() => navigate("/new-audit")}>Start Audit</Button>} />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: COLORS.text.muted, borderBottom: `1px solid ${COLORS.border.divider}` }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500 }}>Session</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500 }}>Status</th>
                <th style={{ textAlign: "right", padding: "8px 12px", fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessionsData?.sessions.slice(0, 10).map((s) => (
                <tr key={s.session_id} style={{ borderBottom: `1px solid ${COLORS.border.divider}`, cursor: "pointer", transition: `background ${MOTION.fast}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => navigate(`/session/${s.session_id}`)}
                >
                  <td style={{ padding: "10px 12px", color: COLORS.text.primary, fontFamily: "monospace", fontSize: 12 }}>{s.session_id.slice(0, 8)}...</td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/session/${s.session_id}`); }}>View</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function LiveAuditPreview({ sessions }: { sessions: { session_id: string; status: string }[] }) {
  const navigate = useNavigate();
  return (
    <Card title="Live Audit" subtitle={sessions.length > 0 ? "Currently executing" : "No active audit"} height={420} action={sessions.length > 0 ? <StatusBadge status="running" /> : null}>
      {sessions.length === 0 ? (
        <EmptyState title="No active audit" description="Launch an audit to see live execution." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map((s) => (
            <div key={s.session_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: COLORS.bg.surface, borderRadius: 12, cursor: "pointer" }}
              onClick={() => navigate(`/session/${s.session_id}/live`)}>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.text.secondary }}>{s.session_id.slice(0, 12)}...</span>
              <StatusBadge status={s.status as never} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AgentActivityPanel() {
  const agents = [
    { name: "Scout", status: "idle" as const },
    { name: "Analyst", status: "idle" as const },
    { name: "Attacker", status: "idle" as const },
    { name: "Injector", status: "idle" as const },
    { name: "Judge", status: "idle" as const },
    { name: "Reporter", status: "idle" as const },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {agents.map((a) => (
        <div key={a.name} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", background: COLORS.bg.surface, borderRadius: 8,
        }}>
          <span style={{ fontSize: 13, color: COLORS.text.primary, fontWeight: 500 }}>{a.name}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
            color: COLORS.status.neutral, background: `${COLORS.status.neutral}18`,
          }}>
            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
