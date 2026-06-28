import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Activity,
  List,
  FileText,
  Shield,
  Bot,
  Cpu,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { COLORS, SIDEBAR, GLOW, BORDER_RADIUS, MOTION } from "../../constants/theme";

const NAV_ITEMS = [
  { path: "/", label: "Command Center", icon: LayoutDashboard },
  { path: "/new-audit", label: "New Audit", icon: PlusCircle },
  { path: "/sessions", label: "Sessions", icon: List },
  { path: "/findings", label: "Findings", icon: AlertTriangle },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/models", label: "Models", icon: Cpu },
  { path: "/agents", label: "Agents", icon: Bot },
  { path: "/memory", label: "Memory", icon: Brain },
  { path: "/settings", label: "Settings", icon: Settings },
];

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: SIDEBAR.width,
    minWidth: SIDEBAR.width,
    height: "100vh",
    background: COLORS.bg.sidebar,
    borderRight: `1px solid ${COLORS.border.divider}`,
    display: "flex",
    flexDirection: "column",
    transition: `width ${MOTION.default}, min-width ${MOTION.default}`,
    overflow: "hidden",
    position: "relative",
    zIndex: 100,
  },
  collapsed: {
    width: SIDEBAR.collapsed,
    minWidth: SIDEBAR.collapsed,
  },
  logo: {
    height: SIDEBAR.headerHeight,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 20px",
    borderBottom: `1px solid ${COLORS.border.divider}`,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${COLORS.primary.purple}, ${COLORS.primary.blue})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.text.primary,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  logoSpan: {
    color: COLORS.primary.purple,
  },
  nav: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
  },
  navItem: (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: SIDEBAR.navItemHeight,
    padding: "0 12px",
    borderRadius: SIDEBAR.navRadius,
    color: active ? COLORS.text.primary : COLORS.text.secondary,
    background: active ? COLORS.bg.selected : "transparent",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    position: "relative" as const,
    overflow: "hidden",
    transition: `all ${MOTION.fast}`,
    cursor: "pointer",
  }),
  navItemHover: {
    background: COLORS.bg.hover,
  },
  activeIndicator: {
    position: "absolute" as const,
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 3,
    height: 24,
    borderRadius: "0 3px 3px 0",
    background: COLORS.primary.purple,
    boxShadow: GLOW.primary,
  },
  navIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
  },
  navLabel: {
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },
  toggle: {
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTop: `1px solid ${COLORS.border.divider}`,
    color: COLORS.text.muted,
    cursor: "pointer",
    transition: `color ${MOTION.fast}`,
  },
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const location = useLocation();

  return (
    <div style={{ ...styles.sidebar, ...(sidebarCollapsed ? styles.collapsed : {}) }}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>P</div>
        {!sidebarCollapsed && (
          <span style={styles.logoText}>
            Prompt<span style={styles.logoSpan}>Evo</span>
          </span>
        )}
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={styles.navItem(active)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {active && !sidebarCollapsed && <div style={styles.activeIndicator} />}
              <Icon style={styles.navIcon} />
              {!sidebarCollapsed && <span style={styles.navLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div style={styles.toggle} onClick={toggleSidebar}>
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </div>
    </div>
  );
}
