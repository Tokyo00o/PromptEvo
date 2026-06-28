import { Settings as SettingsIcon, Shield, Bell, Sliders, Info } from "lucide-react";
import { PageHeader, Card } from "../components/reusable";
import { useUiStore } from "../store/uiStore";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";

export function SettingsPage() {
  const developerMode = useUiStore((s) => s.developerMode);
  const toggleDeveloperMode = useUiStore((s) => s.toggleDeveloperMode);

  return (
    <div>
      <PageHeader title="Settings" subtitle="System configuration" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 20 }}>
        <Card title="General Settings">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SettingRow label="API URL" value={import.meta.env.VITE_API_URL || "http://localhost:8000"} />
            <SettingRow label="Auto-refresh" value="Enabled (5s intervals)" />
            <SettingRow label="Developer Mode" value={developerMode ? "Enabled" : "Disabled"} toggle checked={developerMode} onToggle={toggleDeveloperMode} />
            <SettingRow label="Theme" value="Dark" />
          </div>
        </Card>

        <Card title="Notifications">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SettingRow label="Audit Complete" value="Enabled" toggle checked />
            <SettingRow label="Critical Findings" value="Enabled" toggle checked />
            <SettingRow label="Session Errors" value="Enabled" toggle checked />
            <SettingRow label="Daily Summary" value="Disabled" toggle />
          </div>
        </Card>

        <Card title="About">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SettingRow label="Product" value="PromptEvo" />
            <SettingRow label="Version" value="2.0.0" />
            <SettingRow label="Backend" value="FastAPI + LangGraph" />
            <SettingRow label="Frontend" value="React 19 + TypeScript" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({ label, value, toggle, checked, onToggle }: {
  label: string; value: string; toggle?: boolean; checked?: boolean; onToggle?: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border.divider}` }}>
      <span style={{ fontSize: 13, color: COLORS.text.primary }}>{label}</span>
      {toggle ? (
        <div onClick={onToggle} style={{
          width: 40, height: 22, borderRadius: 11, cursor: onToggle ? "pointer" : "default",
          background: checked ? COLORS.primary.purple : COLORS.bg.surface,
          border: `1px solid ${COLORS.border.primary}`,
          position: "relative", transition: `all ${MOTION.fast}`,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            position: "absolute", top: 1,
            left: checked ? 20 : 1,
            transition: `all ${MOTION.fast}`,
          }} />
        </div>
      ) : (
        <span style={{ fontSize: 12, color: COLORS.text.muted }}>{value}</span>
      )}
    </div>
  );
}
