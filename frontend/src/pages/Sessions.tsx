import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, RefreshCw, ExternalLink, Copy, Trash2 } from "lucide-react";
import { PageHeader, Button, Card, StatCard, StatusBadge, CardSkeleton, EmptyState } from "../components/reusable";
import { sessionsApi } from "../api/endpoints";
import { COLORS, MOTION } from "../constants/theme";

export function Sessions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsApi.list,
    refetchInterval: 10000,
  });

  const sessions = data?.sessions || [];
  const filtered = sessions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.session_id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const running = sessions.filter((s) => s.status === "running").length;
  const completed = sessions.filter((s) => s.status === "complete").length;
  const failed = sessions.filter((s) => s.status === "error").length;

  return (
    <div>
      <PageHeader
        title="Sessions"
        subtitle={`${sessions.length} total audits`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm"><RefreshCw size={14} /> Refresh</Button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total" value={sessions.length} color={COLORS.primary.blue} />
        <StatCard label="Running" value={running} color={COLORS.status.success} />
        <StatCard label="Completed" value={completed} color={COLORS.primary.blue} />
        <StatCard label="Failed" value={failed} color={failed > 0 ? COLORS.severity.high : COLORS.status.neutral} />
      </div>

      {/* Search + Filters */}
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.text.muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by session ID..." style={{ width: "100%", height: 40, paddingLeft: 36 }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140, height: 40 }}>
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="complete">Completed</option>
            <option value="error">Failed</option>
          </select>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 52, background: COLORS.bg.surface, borderRadius: 8, animation: "shimmer 1.4s infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No sessions found" description={search ? "Try a different search term." : "No audits have been executed yet."} action={<Button variant="primary" onClick={() => navigate("/new-audit")}>Start Audit</Button>} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: COLORS.text.muted, borderBottom: `1px solid ${COLORS.border.divider}` }}>
                  {["Session ID", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.session_id} style={{ borderBottom: `1px solid ${COLORS.border.divider}`, cursor: "pointer", transition: `background ${MOTION.fast}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg.hover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    onClick={() => navigate(`/session/${s.session_id}`)}
                  >
                    <td style={{ padding: "12px", fontFamily: "monospace", fontSize: 12, color: COLORS.text.primary }}>{s.session_id.slice(0, 12)}...</td>
                    <td style={{ padding: "12px" }}><StatusBadge status={s.status} /></td>
                    <td style={{ padding: "12px", color: COLORS.text.secondary }}>—</td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/session/${s.session_id}`)}><ExternalLink size={14} /></Button>
                        <Button size="sm" variant="ghost"><Copy size={14} /></Button>
                        <Button size="sm" variant="ghost"><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
