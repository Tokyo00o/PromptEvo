import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Download, Pause, Square, Terminal, Brain } from "lucide-react";
import { PageHeader, Button, Card, StatusBadge, SeverityBadge, RiskGauge, AgentStatusBadge, Skeleton } from "../components/reusable";
import { useAuditSSE } from "../hooks/useAuditSSE";
import { auditApi, memoryApi } from "../api/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useUiStore } from "../store/uiStore";
import { downloadJSON } from "../utils/export";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";
import { RiskTimelineChart } from "../components/charts/RiskTimeline";

const PIPELINE_STAGES = [
  "scout_planner", "scout", "analyst", "decomposer", "inquiry_swarm",
  "target", "combiner", "red_debate_judge_swarm", "rahs_scorer",
  "experience_pool", "self_play_remediation", "reporter",
];

export function SessionLive() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const sse = useAuditSSE(sessionId || null);

  const { data: statusData } = useQuery({
    queryKey: ["audit", sessionId],
    queryFn: () => auditApi.get(sessionId!),
    refetchInterval: sse.status === "connected" ? false : 2000,
    enabled: !!sessionId,
  });

  const developerMode = useUiStore((s) => s.developerMode);

  const events = sse.events;
  const lastEvent = events[events.length - 1];
  const status = statusData?.status || "queued";

  return (
    <div>
      <PageHeader
        title={`Session ${sessionId?.slice(0, 8)}...`}
        subtitle={status === "running" ? "Audit in progress" : status === "complete" ? "Audit completed" : "Queued"}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <StatusBadge status={status as never} />
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</Button>
          </div>
        }
      />

      {/* Execution Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <OverviewCard label="Session ID" value={sessionId?.slice(0, 12) || "—"} mono />
        <OverviewCard label="Status" value={status} badge />
        <OverviewCard label="Current Agent" value={lastEvent?.node_name || "—"} />
        <OverviewCard label="Turn" value={lastEvent ? `${lastEvent.turn}` : "—"} />
        <OverviewCard label="Elapsed" value={statusData?.report?.duration_seconds ? `${statusData.report.duration_seconds.toFixed(0)}s` : "—"} />
        <OverviewCard label="Risk Score" value={lastEvent?.rahs_score ? `${(lastEvent.rahs_score * 10).toFixed(1)}` : statusData?.report?.rahs_score?.toFixed(1) || "—"} gauge />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Pipeline Visualization */}
        <Card title="Pipeline" subtitle="Execution pipeline stages" height={360}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PIPELINE_STAGES.map((stage) => {
              const stageEvent = events.find((e) => e.node_name === stage);
              const isRunning = stageEvent && !events.find((e) => e.node_name !== stage && e.turn > stageEvent.turn);
              const stageStatus = isRunning ? "running" : stageEvent ? "completed" : "waiting";
              return (
                <div key={stage} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 10px", borderRadius: 8,
                  background: stageStatus === "running" ? `${COLORS.status.success}12` : "transparent",
                  border: `1px solid ${stageStatus === "running" ? `${COLORS.status.success}30` : "transparent"}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: stageStatus === "running" ? COLORS.status.success : stageStatus === "completed" ? COLORS.primary.blue : COLORS.text.muted,
                    animation: stageStatus === "running" ? "pulse 1.4s infinite" : undefined,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: stageStatus === "waiting" ? COLORS.text.muted : COLORS.text.primary, flex: 1 }}>
                    {stage.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.text.muted }}>
                    {stageStatus.charAt(0).toUpperCase() + stageStatus.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Current Prompt */}
        <Card title="Current Prompt" subtitle={lastEvent?.last_role ? `Role: ${lastEvent.last_role}` : "Waiting..."} height={360}
          action={lastEvent?.last_message ? <Button size="sm" variant="ghost"><Copy size={14} /> Copy</Button> : undefined}
        >
          {lastEvent?.last_message ? (
            <pre style={{
              fontSize: 12, lineHeight: 1.6, color: COLORS.text.primary,
              background: COLORS.bg.layer0, padding: 16, borderRadius: 12,
              maxHeight: 260, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}>
              {lastEvent.last_message}
            </pre>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260, color: COLORS.text.muted, fontSize: 13 }}>
              Awaiting prompt...
            </div>
          )}
        </Card>
      </div>

      {/* Agent Timeline + Risk Evolution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card title="Agent Timeline" subtitle="Execution events" height={360}>
          {events.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280, color: COLORS.text.muted, fontSize: 13 }}>
              Waiting for events...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 280, overflow: "auto" }}>
              {[...events].reverse().slice(0, 50).map((ev, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
                  <span style={{ color: COLORS.text.muted, fontFamily: "monospace", fontSize: 11, flexShrink: 0 }}>
                    T{ev.turn}
                  </span>
                  <span style={{
                    padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, flexShrink: 0,
                    background: `${COLORS.primary.purple}18`, color: COLORS.primary.purple,
                  }}>
                    {ev.node_name}
                  </span>
                  <span style={{ color: COLORS.text.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ev.inquiry_status || ev.active_technique || "executed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Risk Evolution" height={360}>
          {events.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280, color: COLORS.text.muted, fontSize: 13 }}>
              Risk data will appear during execution...
            </div>
          ) : (
            <RiskTimelineChart
              data={events.filter((e) => e.rahs_score != null).map((e) => ({
                turn: e.turn,
                risk: (e.rahs_score || 0) * 10,
                confidence: e.cooperation_score,
              }))}
              height={280}
            />
          )}
        </Card>
      </div>

      {/* Memory Monitor */}
      <div style={{ marginBottom: 20 }}>
        <MemoryMonitor />
      </div>

      {/* Console */}
      <Card title="Console" subtitle="Developer event stream" height={300}
        action={
          <div style={{ display: "flex", gap: 4 }}>
            <Button size="sm" variant="ghost"><Terminal size={14} /> Auto-scroll</Button>
            <Button size="sm" variant="ghost" onClick={() => downloadJSON(events, `session-${sessionId?.slice(0, 8)}-events`)}><Download size={14} /></Button>
          </div>
        }
      >
        <div style={{ maxHeight: 200, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.6 }}>
          {events.length === 0 ? (
            <span style={{ color: COLORS.text.muted }}>Waiting for events...</span>
          ) : (
            events.map((ev, i) => (
              <div key={i} style={{ color: COLORS.text.secondary, padding: "1px 0" }}>
                <span style={{ color: COLORS.text.muted }}>{ev.timestamp?.split("T")[1]?.slice(0, 8) || ""} </span>
                <span style={{ color: COLORS.primary.purple }}>[{ev.node_name}]</span>{" "}
                <span>{ev.inquiry_status || ev.active_technique || "→ executed"}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {developerMode && (
        <div style={{ marginTop: 16 }}>
          <Card title="Developer: Raw Events" subtitle={`${events.length} events · SSE status: ${sse.status}`} height={240}>
            <pre style={{ fontSize: 10, lineHeight: 1.4, color: COLORS.text.secondary, background: COLORS.bg.layer0, padding: 12, borderRadius: 8, maxHeight: 160, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {events.length === 0 ? "No events yet" : JSON.stringify(events.slice(-5), null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}

function MemoryMonitor() {
  const { data } = useQuery({
    queryKey: ["memory-live"],
    queryFn: memoryApi.get,
    refetchInterval: 3000,
  });
  const recent = (data?.entries || []).slice(-10).reverse();

  return (
    <Card title="Memory Monitor" subtitle="Real-time memory operations" height={220}
      action={<Brain size={16} color={COLORS.primary.purple} />}
    >
      {recent.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 140, color: COLORS.text.muted, fontSize: 13 }}>
          No memory operations yet...
        </div>
      ) : (
        <div style={{ maxHeight: 140, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {recent.map((e, i) => (
            <div key={e.id || i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>
              <span style={{ color: COLORS.text.muted, fontFamily: "monospace", fontSize: 10, flexShrink: 0 }}>
                {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ""}
              </span>
              <span style={{
                padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 600, flexShrink: 0,
                background: e.operation === "write" ? `${COLORS.primary.blue}18` : `${COLORS.status.info}18`,
                color: e.operation === "write" ? COLORS.primary.blue : COLORS.status.info,
              }}>
                {e.operation}
              </span>
              <span style={{ color: COLORS.text.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.content?.slice(0, 80) || "—"}
              </span>
              {e.score != null && (
                <span style={{ fontSize: 10, color: COLORS.text.muted, flexShrink: 0 }}>{(e.score as number).toFixed(2)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function OverviewCard({ label, value, mono, badge, gauge }: { label: string; value: string; mono?: boolean; badge?: boolean; gauge?: boolean }) {
  return (
    <div style={{ background: COLORS.bg.layer2, borderRadius: 14, padding: "14px 16px", border: `1px solid ${COLORS.border.divider}` }}>
      <div style={{ fontSize: 11, color: COLORS.text.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</div>
      {badge ? <StatusBadge status={value as never} /> : gauge ? <RiskGauge value={Number(value) || 0} size={40} /> : (
        <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text.primary, fontFamily: mono ? "monospace" : undefined }}>
          {value}
        </div>
      )}
    </div>
  );
}
