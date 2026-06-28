import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, ChevronRight, X, ExternalLink } from "lucide-react";
import { PageHeader, Button, Card, StatCard, SeverityBadge, EmptyState } from "../components/reusable";
import { SeverityDonut } from "../components/charts/RiskTimeline";
import { findingsApi } from "../api/endpoints";
import { useUiStore } from "../store/uiStore";
import { downloadCSV, downloadJSON } from "../utils/export";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";
import type { Finding } from "../types/backend";

export function Findings() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Finding | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["findings"],
    queryFn: findingsApi.list,
    refetchInterval: 15000,
  });

  const developerMode = useUiStore((s) => s.developerMode);

  const allFindings = data?.findings || [];
  const filtered = allFindings.filter((f) => {
    if (severityFilter !== "all" && f.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.description?.toLowerCase().includes(q) && !f.category?.toLowerCase().includes(q) && !f.session_id?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    critical: allFindings.filter((f) => f.severity === "Critical").length,
    high: allFindings.filter((f) => f.severity === "High").length,
    medium: allFindings.filter((f) => f.severity === "Medium").length,
    low: allFindings.filter((f) => f.severity === "Low").length,
    total: allFindings.length,
  };

  return (
    <div>
      <PageHeader title="Findings" subtitle={`${stats.total} total findings`}
        action={<Button variant="ghost" size="sm" onClick={() => downloadJSON(allFindings, `findings-${new Date().toISOString().slice(0, 10)}`)}><Download size={14} /> Export</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total" value={stats.total} color={COLORS.primary.blue} />
        <StatCard label="Critical" value={stats.critical} color={COLORS.severity.critical} />
        <StatCard label="High" value={stats.high} color={COLORS.severity.high} />
        <StatCard label="Medium" value={stats.medium} color={COLORS.severity.medium} />
        <StatCard label="Low" value={stats.low} color={COLORS.severity.low} />
      </div>

      {developerMode && (
        <div style={{ marginBottom: 12, padding: "8px 14px", background: `${COLORS.primary.purple}12`, border: `1px solid ${COLORS.primary.purple}30`, borderRadius: 8, fontSize: 12, color: COLORS.text.secondary }}>
          <strong>Dev:</strong> {allFindings.length} findings loaded · {filtered.length} after filters · query timer: {data?.total || 0} total from API
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
        <Card title="Severity Distribution">
          {stats.total === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.text.muted, fontSize: 13 }}>No findings yet</div>
          ) : (
            <SeverityDonut data={[
              { name: "Critical", value: stats.critical, color: COLORS.severity.critical },
              { name: "High", value: stats.high, color: COLORS.severity.high },
              { name: "Medium", value: stats.medium, color: COLORS.severity.medium },
              { name: "Low", value: stats.low, color: COLORS.severity.low },
            ]} />
          )}
        </Card>

        <Card title="Findings List">
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.text.muted }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search findings..." style={{ width: "100%", height: 40, paddingLeft: 36 }} />
            </div>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={{ width: 140, height: 40 }}>
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 52, background: COLORS.bg.surface, borderRadius: 8, animation: "shimmer 1.4s infinite" }} />)}
            </div>
          ) : stats.total === 0 ? (
            <EmptyState title="No findings generated" description="Run an audit to generate security findings." action={<Button variant="primary" onClick={() => navigate("/new-audit")}>Start Audit</Button>} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: COLORS.text.muted, borderBottom: `1px solid ${COLORS.border.divider}` }}>
                    {["ID", "Severity", "Category", "Model", "Evaluator", "Confidence", "Created"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id} style={{ borderBottom: `1px solid ${COLORS.border.divider}`, cursor: "pointer", transition: `background ${MOTION.fast}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg.hover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      onClick={() => setSelected(f)}
                    >
                      <td style={{ padding: "12px", fontFamily: "monospace", fontSize: 11, color: COLORS.text.primary }}>{f.id}</td>
                      <td style={{ padding: "12px" }}><SeverityBadge severity={f.severity} /></td>
                      <td style={{ padding: "12px", color: COLORS.text.secondary }}>{f.category || "—"}</td>
                      <td style={{ padding: "12px", color: COLORS.text.secondary }}>{f.model || "—"}</td>
                      <td style={{ padding: "12px", color: COLORS.text.secondary }}>{f.evaluator}</td>
                      <td style={{ padding: "12px", color: COLORS.text.secondary }}>{(f.confidence * 100).toFixed(0)}%</td>
                      <td style={{ padding: "12px", color: COLORS.text.muted, fontSize: 12 }}>{f.created || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Evidence Drawer */}
      {selected && (
        <div style={{
          position: "fixed", right: 0, top: 0, width: 520, height: "100vh",
          background: COLORS.bg.layer1, borderLeft: `1px solid ${COLORS.border.divider}`,
          zIndex: 1000, padding: 24, overflow: "auto",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Finding Details</h3>
              <SeverityBadge severity={selected.severity} />
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", color: COLORS.text.secondary, fontSize: 20, cursor: "pointer", border: "none", padding: 4 }}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <DetailSection label="ID" value={selected.id} mono />
            <DetailSection label="Description" value={selected.description || "—"} />
            <DetailSection label="Category" value={selected.category || "—"} />
            <DetailSection label="Technique" value={selected.scenario || "—"} />
            <DetailSection label="Model" value={selected.model || "—"} />
            <DetailSection label="Evaluator" value={selected.evaluator} />
            <DetailSection label="Confidence" value={`${(selected.confidence * 100).toFixed(0)}%`} />
            <DetailSection label="Status" value={selected.status} />

            {selected.affected_prompt && (
              <div>
                <div style={{ fontSize: 11, color: COLORS.text.muted, fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Affected Prompt</div>
                <pre style={{ fontSize: 12, background: COLORS.bg.surface, padding: 12, borderRadius: 8, maxHeight: 150, overflow: "auto", whiteSpace: "pre-wrap" }}>{selected.affected_prompt}</pre>
              </div>
            )}

            {selected.evidence && (
              <div>
                <div style={{ fontSize: 11, color: COLORS.text.muted, fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Evidence</div>
                <pre style={{ fontSize: 12, background: COLORS.bg.surface, padding: 12, borderRadius: 8, maxHeight: 200, overflow: "auto", whiteSpace: "pre-wrap", color: COLORS.severity.high }}>{selected.evidence}</pre>
              </div>
            )}

            {selected.judge_output && (
              <div>
                <div style={{ fontSize: 11, color: COLORS.text.muted, fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Judge Verdict</div>
                <div style={{ fontSize: 13, background: COLORS.bg.surface, padding: 12, borderRadius: 8, color: COLORS.text.secondary }}>{selected.judge_output}</div>
              </div>
            )}

            {selected.analyst_notes && (
              <DetailSection label="Analyst Notes" value={selected.analyst_notes} />
            )}

            {selected.recommendation && (
              <DetailSection label="Recommendation" value={selected.recommendation} />
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/session/${selected.session_id}`)}>
                <ExternalLink size={14} /> View Session
              </Button>
              <Button size="sm" variant="ghost" onClick={() => downloadJSON(selected, `finding-${selected.id}`)}><Download size={14} /> Export</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ padding: "8px 12px", background: COLORS.bg.surface, borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: COLORS.text.muted, fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 13, color: COLORS.text.primary, fontFamily: mono ? "monospace" : undefined }}>{value}</div>
    </div>
  );
}
