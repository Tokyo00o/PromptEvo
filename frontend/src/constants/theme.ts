export const COLORS = {
  bg: {
    layer0: "#09090B",
    layer1: "#0F172A",
    layer2: "#111827",
    surface: "#1E293B",
    sidebar: "#0B1120",
    header: "#111827",
    hover: "#1F2937",
    selected: "#312E81",
  },
  border: {
    primary: "#27272A",
    secondary: "#374151",
    divider: "rgba(255,255,255,0.08)",
  },
  primary: {
    purple: "#7C3AED",
    blue: "#3B82F6",
    cyan: "#06B6D4",
  },
  status: {
    success: "#22C55E",
    warning: "#F59E0B",
    critical: "#EF4444",
    info: "#38BDF8",
    neutral: "#9CA3AF",
  },
  severity: {
    critical: "#DC2626",
    high: "#F97316",
    medium: "#EAB308",
    low: "#22C55E",
    info: "#60A5FA",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#9CA3AF",
    muted: "#6B7280",
  },
} as const;

export const TYPOGRAPHY = {
  fontFamily: "Inter, 'Segoe UI', Roboto, sans-serif",
  sizes: {
    dashboardTitle: { size: 36, weight: 700, lineHeight: 44, letter: -1 },
    pageTitle: { size: 30, weight: 700 },
    sectionTitle: { size: 24, weight: 700 },
    cardTitle: { size: 18, weight: 600 },
    body: { size: 14, weight: 400 },
    table: { size: 13, weight: 500 },
    caption: { size: 12, weight: 400 },
    micro: { size: 10, weight: 600 },
  },
} as const;

export const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const;

export const BORDER_RADIUS = {
  buttons: 10,
  cards: 18,
  modal: 22,
  input: 12,
  charts: 18,
  tables: 16,
  sidebar: 24,
} as const;

export const ELEVATION = {
  level0: "none",
  level1: "0 1px 3px rgba(0,0,0,0.3)",
  level2: "0 4px 12px rgba(0,0,0,0.4)",
  level3: "0 8px 24px rgba(0,0,0,0.5)",
  level4: "0 12px 40px rgba(0,0,0,0.6)",
} as const;

export const MOTION = {
  default: "220ms ease-out",
  fast: "120ms ease-out",
  slow: "350ms ease-out",
  hoverScale: 1.02,
  cardLift: "translateY(-4px)",
  buttonPress: "scale(0.98)",
  progress: "800ms ease-out",
  counter: "600ms ease-out",
  skeleton: "1.4s",
} as const;

export const GLOW = {
  success: "0 0 16px rgba(34,197,94,0.25)",
  warning: "0 0 18px rgba(245,158,11,0.25)",
  critical: "0 0 20px rgba(239,68,68,0.30)",
  primary: "0 0 22px rgba(124,58,237,0.35)",
} as const;

export const GRID = {
  columns: 12,
  gap: 24,
  maxWidth: 1600,
} as const;

export const SIDEBAR = {
  width: 280,
  collapsed: 84,
  headerHeight: 76,
  navItemHeight: 48,
  navRadius: 12,
} as const;
