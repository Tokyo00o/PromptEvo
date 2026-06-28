import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bot, Activity, Clock, CheckCircle, XCircle, BarChart3, ExternalLink } from "lucide-react";
import { PageHeader, Card, StatCard, AgentStatusBadge, EmptyState, Button, RiskGauge } from "../components/reusable";
import { agentsApi } from "../api/endpoints";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";
import type { AgentMetricNode } from "../types/backend";

const AGENTS_META: { key: string; title: string; stage: string; role: string; techniques: string[] }[] = [
  { key: "scout_planner", title: "Scout Planner", stage: "recon", role: "Offline preparation pass before conversation starts.", techniques: ["Domain detection", "Vulnerability profiling", "MCTS ranking"] },
  { key: "scout", title: "Scout", stage: "recon", role: "Conversational warm-up to raise cooperation score.", techniques: ["MCTS-guided strategy", "Epistemic debt", "Role inversion"] },
  { key: "memory_retriever", title: "Memory Retriever", stage: "strategy", role: "Hydrates the strategy layer with prior learning.", techniques: ["TLTM vector recall", "Recommend/avoid hints"] },
  { key: "analyst", title: "Analyst", stage: "strategy", role: "Primary router and brain of the loop.", techniques: ["TAP pruning", "PAP rotation", "Route selection"] },
  { key: "decomposer", title: "Decomposer", stage: "attack", role: "Splits objectives into sub-questions.", techniques: ["Multi-turn decomposition", "Sub-goal planning"] },
  { key: "inquiry_swarm", title: "Inquiry Swarm (HIVE-MIND)", stage: "attack", role: "Generates persuasive messages using the active PAP technique.", techniques: ["40 PAP techniques", "Hybrid LLM + rule generation"] },
  { key: "target", title: "Target", stage: "delivery", role: "The model under test.", techniques: ["Response collection", "Latency tracking"] },
  { key: "combiner", title: "Combiner", stage: "delivery", role: "Synthesizes sub-answers into a final message.", techniques: ["Sub-answer merging", "Context assembly"] },
  { key: "judge", title: "Red Debate Judge Swarm", stage: "evaluation", role: "Evaluates responses using Prometheus judge.", techniques: ["Multi-perspective scoring", "Red team debate"] },
  { key: "rahs_scorer", title: "RAHS Scorer", stage: "evaluation", role: "Calculates Risk-Adjusted Harm Score.", techniques: ["Severity banding", "Risk aggregation"] },
  { key: "experience_pool", title: "Experience Pool", stage: "learning", role: "Records execution results for future reference.", techniques: ["Success/failure logging", "Pattern storage"] },
  { key: "self_play_remediation", title: "Self-Play Remediation", stage: "output", role: "Generates defense patches for successful attacks.", techniques: ["Patch generation", "Blueprint synthesis"] },
  { key: "reporter", title: "Reporter", stage: "output", role: "Generates final audit reports.", techniques: ["Report generation", "Transcript writing"] },
];

const STAGE_COLORS: Record<string, string> = {
  recon: COLORS.primary.cyan, strategy: COLORS.primary.purple, attack: COLORS.severity.high,
  delivery: COLORS.status.warning, evaluation: COLORS.primary.blue, learning: COLORS.status.success,
  output: COLORS.status.neutral,
};

export function Agents() {
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState<(typeof AGENTS_META)[0] | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<AgentMetricNode | null>(null);

  const { data: metricsData, isLoading } = useQuery({
    queryKey: ["agent-metrics"],
    queryFn: agentsApi.metrics,
    refetchInterval: 15000,
  });

  const agentMetrics = metricsData?.agents || [];
  const totalCalls = agentMetrics.reduce((s, a) => s + a.calls, 0);
  const activeCount = agentMetrics.filter((a) => a.session_count > 0).length;

  return (
    <div>
      <PageHeader title="Agents" subtitle={`${AGENTS_META.length} agents configured · ${activeCount} active in runtime`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Agents" value={AGENTS_META.length} icon={<Bot size={20} />} color={COLORS.primary.purple} />
        <StatCard label="Active in Runtime" value={activeCount} icon={<Activity size={20} />} color={COLORS.status.success} subtitle="Has session activity" />
        <StatCard label="Total LLM Calls" value={metricsData?.total_llm_calls || 0} icon={<BarChart3 size={20} />} color={COLORS.primary.blue} />
        <StatCard label="Total Sessions" value={metricsData?.total_sessions || 0} icon={<Clock size={20} />} color={COLORS.primary.cyan} />
      </div>

      {/* Pipeline Visualization */}
      <Card title="Execution Pipeline" subtitle="Agent orchestration flow" height={200}>
        <div style={{ display: "flex", gap: 0, alignItems: "center", overflowX: "auto", padding: "12px 0" }}>
          {["scout_planner", "scout", "analyst", "inquiry_swarm", "target", "judge", "reporter"].map((key, i) => {
            const meta = AGENTS_META.find((a) => a.key === key);
            const metric = agentMetrics.find((m) => m.name === key);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <div style={{
                  padding: "8px 14px", borderRadius: 10, whiteSpace: "nowrap", fontSize: 12, fontWeight: 600,
                  background: metric ? `${COLORS.status.success}20` : COLORS.bg.surface,
                  border: `1px solid ${metric ? COLORS.status.success : COLORS.border.primary}`,
                  color: metric ? COLORS.status.success : COLORS.text.secondary,
                  cursor: "pointer", transition: `all ${MOTION.fast}`,
                }}
                  onClick={() => { setSelectedAgent(meta || null); setSelectedMetric(metric || null); }}>
                  {meta?.title || key}
                </div>
                {i < 6 && <div style={{ width: 24, height: 2, background: COLORS.border.divider, margin: "0 4px" }} />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Agent Cards */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 120, background: COLORS.bg.surface, borderRadius: BORDER_RADIUS.cards, animation: "shimmer 1.4s infinite" }} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 20 }}>
          {AGENTS_META.map((agent) => {
            const metric = agentMetrics.find((m) => m.name === agent.key);
            return (
              <div key={agent.key} style={{
                background: COLORS.bg.layer2, borderRadius: BORDER_RADIUS.cards,
                border: `1px solid ${COLORS.border.divider}`, padding: 16,
                cursor: "pointer", transition: `all ${MOTION.default}`,
              }}
                onClick={() => { setSelectedAgent(agent); setSelectedMetric(metric || null); }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = STAGE_COLORS[agent.stage] || COLORS.border.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = COLORS.border.divider; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLORS[agent.stage] || COLORS.status.neutral, flexShrink: 0 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text.primary, flex: 1 }}>{agent.title}</div>
                  {metric && <span style={{ fontSize: 11, color: COLORS.status.success, fontWeight: 600 }}>{metric.calls} calls</span>}
                </div>
                <div style={{ fontSize: 12, color: COLORS.text.secondary, lineHeight: 1.5, marginBottom: 8 }}>
                  {agent.role}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {agent.techniques.slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${STAGE_COLORS[agent.stage]}15`, color: STAGE_COLORS[agent.stage] || COLORS.text.muted }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agent Detail Drawer */}
      {selectedAgent && (
        <div style={{
          position: "fixed", right: 0, top: 0, width: 520, height: "100vh",
          background: COLORS.bg.layer1, borderLeft: `1px solid ${COLORS.border.divider}`,
          zIndex: 1000, padding: 24, overflow: "auto",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>{selectedAgent.title}</h3>
            <button onClick={() => { setSelectedAgent(null); setSelectedMetric(null); }} style={{ background: "none", color: COLORS.text.secondary, fontSize: 20, cursor: "pointer", border: "none" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <DetailRow label="Key" value={selectedAgent.key} />
            <DetailRow label="Stage" value={selectedAgent.stage} />
            {selectedMetric && (
              <>
                <DetailRow label="Runtime Calls" value={String(selectedMetric.calls)} />
                <DetailRow label="Session Count" value={String(selectedMetric.session_count)} />
              </>
            )}
            <DetailRow label="Status" value={selectedMetric ? "active" : "inactive"} />
            <DetailRow label="Role" value={selectedAgent.role} />
            <div>
              <div style={{ fontSize: 12, color: COLORS.text.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Techniques</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {selectedAgent.techniques.map((t) => (
                  <span key={t} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: COLORS.bg.surface, color: COLORS.text.secondary }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: COLORS.bg.surface, borderRadius: 8, fontSize: 13 }}>
      <span style={{ color: COLORS.text.muted }}>{label}</span>
      <span style={{ color: COLORS.text.primary, fontWeight: 500, textTransform: "capitalize" }}>{value}</span>
    </div>
  );
}
