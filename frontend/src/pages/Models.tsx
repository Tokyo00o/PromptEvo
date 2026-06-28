import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Cpu, Wifi, WifiOff, Download, ExternalLink, Clock, Activity } from "lucide-react";
import { PageHeader, Card, StatCard, ModelStatusBadge, EmptyState, CardSkeleton, Button, SeverityBadge } from "../components/reusable";
import { systemApi, findingsApi } from "../api/endpoints";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#74AA9C", ollama: "#000", anthropic: "#D4A574",
  groq: "#F97316", gemini: "#4285F4", openrouter: "#8B5CF6",
};

export function Models() {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const { data: topology, isLoading } = useQuery({
    queryKey: ["topology"],
    queryFn: systemApi.topology,
    refetchInterval: 10000,
  });

  const { data: findingsData } = useQuery({
    queryKey: ["findings"],
    queryFn: findingsApi.list,
    refetchInterval: 15000,
  });

  const models = topology?.allowed_targets || [];
  const providers = [...new Set(models.map((m: string) => m.split("/")[0] || "unknown"))];
  const findings = findingsData?.findings || [];

  const modelStats = (model: string) => {
    const modelFindings = findings.filter((f) => f.model === model || model.endsWith(f.model?.split("/").pop() || ""));
    return {
      findings: modelFindings.length,
      critical: modelFindings.filter((f) => f.severity === "Critical").length,
      high: modelFindings.filter((f) => f.severity === "High").length,
    };
  };

  const selectedStats = selectedModel ? modelStats(selectedModel) : null;
  const selectedProvider = selectedModel ? (selectedModel.split("/")[0] || "unknown") : "";
  const selectedName = selectedModel ? selectedModel.split("/").slice(1).join("/") || selectedModel : "";

  return (
    <div>
      <PageHeader title="Models" subtitle={`${models.length} configured models across ${providers.length} providers`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Configured" value={models.length} icon={<Cpu size={20} />} color={COLORS.primary.blue} />
        <StatCard label="Providers" value={providers.length} icon={<Wifi size={20} />} color={COLORS.primary.cyan} />
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : models.length === 0 ? (
        <EmptyState title="No models configured" description="Configure models in the backend .env file." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {models.map((model: string) => {
            const provider = model.split("/")[0] || "unknown";
            const name = model.split("/").slice(1).join("/") || model;
            const stats = modelStats(model);
            return (
              <div key={model} style={{
                background: COLORS.bg.layer2, borderRadius: BORDER_RADIUS.cards,
                border: `1px solid ${selectedModel === model ? COLORS.primary.purple : COLORS.border.divider}`,
                padding: 20, cursor: "pointer", transition: `all ${MOTION.default}`,
              }}
                onClick={() => setSelectedModel(selectedModel === model ? null : model)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = COLORS.bg.surface + "40 0 8px 24px"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: PROVIDER_COLORS[provider] || COLORS.bg.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#fff",
                  }}>
                    {provider.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text.primary }}>{name}</div>
                    <div style={{ fontSize: 11, color: COLORS.text.muted, textTransform: "capitalize" }}>{provider}</div>
                  </div>
                  <ModelStatusBadge status="online" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: COLORS.text.muted }}>Role: </span><span style={{ color: COLORS.text.secondary }}>Target</span></div>
                  <div><span style={{ color: COLORS.text.muted }}>Findings: </span><span style={{ color: stats.critical > 0 ? COLORS.severity.critical : stats.high > 0 ? COLORS.severity.high : COLORS.text.secondary }}>{stats.findings}</span></div>
                  <div><span style={{ color: COLORS.text.muted }}>Critical/High: </span><span>{stats.critical > 0 ? <SeverityBadge severity="Critical" /> : stats.high > 0 ? <SeverityBadge severity="High" /> : <span style={{ color: COLORS.text.muted }}>—</span>}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Model Detail Drawer */}
      {selectedModel && selectedStats && (
        <div style={{
          position: "fixed", right: 0, top: 0, width: 480, height: "100vh",
          background: COLORS.bg.layer1, borderLeft: `1px solid ${COLORS.border.divider}`,
          zIndex: 1000, padding: 24, overflow: "auto",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{selectedName}</h3>
              <span style={{ fontSize: 13, color: COLORS.text.muted, textTransform: "capitalize" }}>{selectedProvider}</span>
            </div>
            <button onClick={() => setSelectedModel(null)} style={{ background: "none", color: COLORS.text.secondary, fontSize: 20, cursor: "pointer", border: "none", padding: 4 }}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <DetailSection label="Model ID" value={selectedModel} mono />
            <DetailSection label="Provider" value={selectedProvider} />
            <DetailSection label="Status" value="Online" />
            <DetailSection label="Total Findings" value={String(selectedStats.findings)} />
            <DetailSection label="Critical" value={String(selectedStats.critical)} />
            <DetailSection label="High" value={String(selectedStats.high)} />

            {selectedStats.findings > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.text.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Recent Findings</div>
                {findings.filter((f) => f.model === selectedModel || selectedModel.endsWith(f.model?.split("/").pop() || "")).slice(0, 5).map((f, i) => (
                  <div key={f.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, marginBottom: 4, background: COLORS.bg.surface, cursor: "pointer" }}
                    onClick={() => navigate("/findings")}>
                    <SeverityBadge severity={f.severity} />
                    <span style={{ fontSize: 12, color: COLORS.text.secondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.description?.slice(0, 60) || f.category}</span>
                  </div>
                ))}
              </div>
            )}
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
