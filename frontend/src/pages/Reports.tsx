import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, FileText, FileJson, File as FileIcon, ExternalLink } from "lucide-react";
import { PageHeader, Button, Card, EmptyState, Skeleton } from "../components/reusable";
import { reportsApi } from "../api/endpoints";
import { useUiStore } from "../store/uiStore";
import { downloadJSON, downloadCSV } from "../utils/export";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";
import type { ReportFileInfo } from "../types/backend";

export function Reports() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportFileInfo & { session_id: string } | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: reportsApi.list,
    refetchInterval: 30000,
  });

  const developerMode = useUiStore((s) => s.developerMode);

  const reports = data?.reports || [];
  const filtered = reports.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || (r.session_id || "").toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelect = async (r: ReportFileInfo & { session_id: string }) => {
    setSelectedReport(r);
    setPreviewLoading(true);
    setPreviewContent("");
    try {
      const res = await reportsApi.content(r.session_id, r.name);
      setPreviewContent(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch {
      setPreviewContent("Error loading report content");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Executive security audit reports"
        action={<Button variant="primary" size="sm" onClick={() => downloadJSON(reports, `reports-${new Date().toISOString().slice(0, 10)}`)}><Download size={14} /> Export All</Button>}
      />

      {developerMode && (
        <div style={{ marginBottom: 12, padding: "8px 14px", background: `${COLORS.primary.purple}12`, border: `1px solid ${COLORS.primary.purple}30`, borderRadius: 8, fontSize: 12, color: COLORS.text.secondary }}>
          <strong>Dev:</strong> {reports.length} report files · {filtered.length} after filter
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: 20 }}>
        <Card title="Report List">
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.text.muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." style={{ width: "100%", height: 40, paddingLeft: 36 }} />
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 52, background: COLORS.bg.surface, borderRadius: 8, animation: "shimmer 1.4s infinite" }} />)}
            </div>
          ) : reports.length === 0 ? (
            <EmptyState title="No reports available" description="Reports are generated after audits complete." action={<Button variant="primary" onClick={() => navigate("/new-audit")}>Start Audit</Button>} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: COLORS.text.muted, borderBottom: `1px solid ${COLORS.border.divider}` }}>
                    {["Name", "Session", "Type", "Size", "Modified", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={`${r.session_id}-${r.name}-${i}`} style={{ borderBottom: `1px solid ${COLORS.border.divider}`, cursor: "pointer", transition: `background ${MOTION.fast}` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg.hover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      onClick={() => handleSelect({ ...r, session_id: r.session_id || "" })}
                    >
                      <td style={{ padding: "12px", color: COLORS.text.primary, fontWeight: 500 }}>{r.name}</td>
                      <td style={{ padding: "12px", fontFamily: "monospace", fontSize: 11, color: COLORS.text.secondary }}>{(r.session_id || "").slice(0, 8)}...</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.text.secondary }}>
                          {r.type === "JSON" ? <FileJson size={14} /> : r.type === "MD" ? <FileText size={14} /> : <FileIcon size={14} />}
                          {r.type}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: COLORS.text.muted, fontSize: 12 }}>{(r.size / 1024).toFixed(1)} KB</td>
                      <td style={{ padding: "12px", color: COLORS.text.muted, fontSize: 12 }}>{r.modified ? new Date(r.modified).toLocaleDateString() : "—"}</td>
                      <td style={{ padding: "12px" }}>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSelect({ ...r, session_id: r.session_id || "" }); }}><Download size={14} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Report Preview" subtitle={selectedReport?.name || ""} height={600}>
          {!selectedReport ? (
            <EmptyState title="Select a report" description="Click a report to preview its contents here." />
          ) : previewLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 500 }}>
              <Skeleton height={400} />
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/session/${selectedReport.session_id}`)}>
                  <ExternalLink size={14} /> View Session
                </Button>
                <Button size="sm" variant="ghost"><Download size={14} /> Download</Button>
              </div>
              <pre style={{
                fontSize: 11, lineHeight: 1.5, color: COLORS.text.secondary,
                background: COLORS.bg.layer0, padding: 16, borderRadius: 12,
                maxHeight: 460, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {previewContent.slice(0, 10000)}
                {previewContent.length > 10000 && "\n\n… (truncated)"}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
