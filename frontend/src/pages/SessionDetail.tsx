import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, Download, FileJson, Clock, Activity, MessageSquare, ScrollText, Brain, Terminal } from "lucide-react";
import { PageHeader, Button, Card, StatusBadge, SeverityBadge, RiskGauge, Skeleton, AgentStatusBadge, EmptyState } from "../components/reusable";
import { sessionsApi } from "../api/endpoints";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";
import { RiskTimelineChart } from "../components/charts/RiskTimeline";
import type { SessionTurn, Finding, ReportFileInfo } from "../types/backend";

type TabKey = "overview" | "prompts" | "responses" | "timeline" | "findings" | "memory" | "logs" | "files" | "raw";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: null },
  { key: "prompts", label: "Prompts", icon: <MessageSquare size={14} /> },
  { key: "responses", label: "Responses", icon: <ScrollText size={14} /> },
  { key: "timeline", label: "Timeline", icon: <Activity size={14} /> },
  { key: "findings", label: "Findings", icon: <SeverityBadge severity="High" /> },
  { key: "files", label: "Report Files", icon: <FileJson size={14} /> },
  { key: "raw", label: "Raw JSON", icon: <Terminal size={14} /> },
];

export function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const { data, isLoading, error } = useQuery({
    queryKey: ["session-detail", sessionId],
    queryFn: () => sessionsApi.detail(sessionId!),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={80} radius={14} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <PageHeader
        title="Session Not Found"
        subtitle="The requested session could not be found."
        action={<Button variant="secondary" size="sm" onClick={() => navigate("/sessions")}><ArrowLeft size={16} /> Back to Sessions</Button>}
      />
    );
  }

  const findings = data.findings || [];
  const turns = data.turns || [];
  const files = data.report_files || [];
  const criticalFindings = findings.filter((f) => f.severity === "Critical").length;
  const highFindings = findings.filter((f) => f.severity === "High").length;

  return (
    <div>
      <PageHeader
        title={`Session ${sessionId?.slice(0, 8)}...`}
        subtitle={data.target_model ? `Target: ${data.target_model}` : ""}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/session/${sessionId}/live`)}>
              <Activity size={14} /> Live View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</Button>
          </div>
        }
      />

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${COLORS.border.divider}`, paddingBottom: 0, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", fontSize: 13, fontWeight: 500,
            background: "transparent", color: activeTab === tab.key ? COLORS.primary.purple : COLORS.text.secondary,
            border: "none", borderBottom: activeTab === tab.key ? `2px solid ${COLORS.primary.purple}` : "2px solid transparent",
            cursor: "pointer", transition: `all ${MOTION.fast}`, whiteSpace: "nowrap",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab data={data} findings={findings} criticalFindings={criticalFindings} highFindings={highFindings} />}
      {activeTab === "prompts" && <PromptsTab turns={turns} />}
      {activeTab === "responses" && <ResponsesTab turns={turns} />}
      {activeTab === "timeline" && <TimelineTab turns={turns} />}
      {activeTab === "findings" && <SessionFindingsTab findings={findings} sessionId={sessionId!} navigate={navigate} />}
      {activeTab === "files" && <FilesTab files={files} sessionId={sessionId!} />}
      {activeTab === "raw" && <RawTab data={data} />}
    </div>
  );
}

function OverviewTab({ data, findings, criticalFindings, highFindings }: { data: any; findings: Finding[]; criticalFindings: number; highFindings: number }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <OverviewCard label="Target" value={data.target_model || "—"} />
        <OverviewCard label="Objective" value={data.objective?.slice(0, 60) || "—"} />
        <OverviewCard label="Turns" value={String(data.turns?.length || 0)} />
        <OverviewCard label="Findings" value={String(findings.length)} />
        <OverviewCard label="Critical" value={String(criticalFindings)} severity="Critical" />
        <OverviewCard label="High" value={String(highFindings)} severity="High" />
      </div>
      <Card title="Agent Decisions">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <DecisionRow agent="Objective" value={data.objective || "—"} />
          <DecisionRow agent="Target Model" value={data.target_model || "—"} />
          <DecisionRow agent="Total Turns" value={String(data.turns?.length || 0)} />
          <DecisionRow agent="Total Findings" value={String(findings.length)} />
        </div>
      </Card>
    </>
  );
}

function PromptsTab({ turns }: { turns: SessionTurn[] }) {
  if (turns.length === 0) return <EmptyState title="No prompts available" description="There are no prompt records for this session." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {turns.map((t) => (
        <Card key={t.turn} title={`Turn ${t.turn}`} subtitle={t.agent ? `Agent: ${t.agent}` : ""}>
          <pre style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.text.primary, background: COLORS.bg.layer0, padding: 16, borderRadius: 12, maxHeight: 300, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {t.prompt || "No prompt recorded"}
          </pre>
        </Card>
      ))}
    </div>
  );
}

function ResponsesTab({ turns }: { turns: SessionTurn[] }) {
  if (turns.length === 0) return <EmptyState title="No responses available" description="There are no response records for this session." />;
  const hasAnyResponse = turns.some((t) => t.response);
  if (!hasAnyResponse) return <EmptyState title="No target responses captured" description="The target may have refused or the session ended before collecting responses." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {turns.map((t) => (
        <Card key={t.turn} title={`Turn ${t.turn} — Response`}>
          <pre style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.text.primary, background: COLORS.bg.layer0, padding: 16, borderRadius: 12, maxHeight: 300, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {t.response || "(target did not respond)"}
          </pre>
        </Card>
      ))}
    </div>
  );
}

function TimelineTab({ turns }: { turns: SessionTurn[] }) {
  if (turns.length === 0) return <EmptyState title="No timeline data" description="No turn data is available for this session." />;
  return (
    <Card title="Turn Timeline" height={500}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 420, overflow: "auto" }}>
        {turns.map((t) => (
          <div key={t.turn} style={{ display: "flex", gap: 12, padding: "8px 12px", borderRadius: 6, fontSize: 13, alignItems: "flex-start" }}>
            <div style={{ minWidth: 60, fontFamily: "monospace", fontSize: 12, color: COLORS.primary.purple, fontWeight: 600 }}>T{t.turn}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: COLORS.text.muted, fontSize: 11 }}>{t.agent || "Unknown"}</div>
              <div style={{ color: COLORS.text.secondary, fontSize: 12, marginTop: 2 }}>{t.prompt?.slice(0, 120) || "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SessionFindingsTab({ findings, sessionId, navigate }: { findings: Finding[]; sessionId: string; navigate: any }) {
  if (findings.length === 0) return <EmptyState title="No findings" description="No findings were recorded for this session." />;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ color: COLORS.text.muted, borderBottom: `1px solid ${COLORS.border.divider}` }}>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500 }}>Severity</th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500 }}>Category</th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500 }}>Description</th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500 }}>Technique</th>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500 }}>Evidence</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr key={f.id || i} style={{ borderBottom: `1px solid ${COLORS.border.divider}`, cursor: "pointer", transition: `background ${MOTION.fast}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg.hover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <td style={{ padding: "12px" }}><SeverityBadge severity={f.severity} /></td>
              <td style={{ padding: "12px", color: COLORS.text.secondary }}>{f.category || "—"}</td>
              <td style={{ padding: "12px", color: COLORS.text.primary }}>{f.description?.slice(0, 80) || "—"}</td>
              <td style={{ padding: "12px", color: COLORS.text.secondary }}>{f.scenario || "—"}</td>
              <td style={{ padding: "12px", color: COLORS.text.muted, fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.evidence || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilesTab({ files, sessionId }: { files: ReportFileInfo[]; sessionId: string }) {
  const navigate = useNavigate();
  if (files.length === 0) return <EmptyState title="No report files" description="No report files were generated for this session." />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
      {files.map((f) => (
        <div key={f.name} style={{ background: COLORS.bg.layer2, borderRadius: BORDER_RADIUS.cards, border: `1px solid ${COLORS.border.divider}`, padding: 16, cursor: "pointer", transition: `all ${MOTION.default}` }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = COLORS.primary.purple; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = COLORS.border.divider; }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text.primary, marginBottom: 4 }}>{f.name}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: COLORS.text.muted }}>
            <span>{(f.size / 1024).toFixed(1)} KB</span>
            <span>{f.type}</span>
            <span>{f.modified ? new Date(f.modified).toLocaleDateString() : ""}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RawTab({ data }: { data: any }) {
  return (
    <Card title="Raw Session Data" subtitle="Full backend detail response"
      action={<Button size="sm" variant="ghost"><Download size={14} /> Download JSON</Button>}
    >
      <pre style={{
        fontSize: 11, lineHeight: 1.5, color: COLORS.text.secondary,
        background: COLORS.bg.layer0, padding: 16, borderRadius: 12,
        maxHeight: 600, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </Card>
  );
}

function OverviewCard({ label, value, mono, severity }: { label: string; value: string; mono?: boolean; severity?: string }) {
  return (
    <div style={{ background: COLORS.bg.layer2, borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.border.divider}` }}>
      <div style={{ fontSize: 11, color: COLORS.text.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</div>
      {severity ? <SeverityBadge severity={severity as any} /> :
        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text.primary, fontFamily: mono ? "monospace" : undefined }}>{value}</div>}
    </div>
  );
}

function DecisionRow({ agent, value }: { agent: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 12px", background: COLORS.bg.surface, borderRadius: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary.purple, minWidth: 120, flexShrink: 0 }}>{agent}</span>
      <span style={{ fontSize: 12, color: COLORS.text.secondary }}>{value}</span>
    </div>
  );
}
