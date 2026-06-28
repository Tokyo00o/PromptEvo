import { useQuery } from "@tanstack/react-query";
import { Search, Bell, Settings, Circle, ChevronDown } from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { COLORS, SIDEBAR, BORDER_RADIUS, MOTION } from "../../constants/theme";
import { systemApi } from "../../api/endpoints";

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: SIDEBAR.headerHeight,
    background: COLORS.bg.header,
    borderBottom: `1px solid ${COLORS.border.divider}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    gap: 16,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  breadcrumb: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
  search: {
    flex: 1,
    maxWidth: 480,
    position: "relative" as const,
  },
  searchInput: {
    width: "100%",
    height: 40,
    background: COLORS.bg.layer2,
    border: `1px solid ${COLORS.border.primary}`,
    borderRadius: BORDER_RADIUS.input,
    padding: "0 16px 0 40px",
    color: COLORS.text.primary,
    fontSize: 13,
    outline: "none",
  },
  searchIcon: {
    position: "absolute" as const,
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: COLORS.text.muted,
    width: 16,
    height: 16,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  statusText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: COLORS.text.secondary,
    cursor: "pointer",
    transition: `all ${MOTION.fast}`,
  },
};

export function Header() {
  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: systemApi.health,
    refetchInterval: 5000,
  });

  const statusColor = !health
    ? COLORS.status.critical
    : health.active_sessions > 0
      ? COLORS.status.warning
      : COLORS.status.success;

  const statusLabel = !health
    ? "Disconnected"
    : health.active_sessions > 0
      ? `${health.active_sessions} active`
      : "Connected";

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <span style={styles.breadcrumb}>Command Center</span>
      </div>

      <div style={styles.search}>
        <Search style={styles.searchIcon} />
        <input
          style={styles.searchInput}
          placeholder="Search sessions, models, findings..."
        />
      </div>

      <div style={styles.right}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: COLORS.bg.layer2 }}>
          <div style={{ ...styles.statusDot, background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          <span style={styles.statusText}>{statusLabel}</span>
        </div>

        <button style={styles.iconBtn} title="Notifications">
          <Bell size={18} />
        </button>
        <button style={styles.iconBtn} title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
