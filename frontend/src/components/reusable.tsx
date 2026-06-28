import { COLORS, BORDER_RADIUS, MOTION, GLOW, SPACING } from "../constants/theme";
import type { SeverityBand, SessionStatus, AgentStatus, ModelStatus } from "../types/backend";
import { Loader2 } from "lucide-react";

/* ── PAGE HEADERS ── */

export function PageHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
    }}>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: COLORS.text.primary, letterSpacing: "-0.5px" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: COLORS.text.secondary, marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action && <div style={{ display: "flex", gap: 8 }}>{action}</div>}
    </div>
  );
}

/* ── STAT CARDS ── */

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  color?: string;
  subtitle?: string;
}

export function StatCard({ label, value, icon, trend, color, subtitle }: StatCardProps) {
  return (
    <div style={{
      background: COLORS.bg.layer2,
      borderRadius: BORDER_RADIUS.cards,
      padding: 24,
      border: `1px solid ${COLORS.border.divider}`,
      transition: `all ${MOTION.default}`,
      cursor: "default",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = COLORS.bg.surface + "40 0 8px 24px"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: COLORS.text.secondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </span>
        {icon && <span style={{ color: color || COLORS.primary.purple }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || COLORS.text.primary, lineHeight: 1.1 }}>
        {value}
      </div>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, color: trend.positive ? COLORS.status.success : COLORS.status.critical }}>
          {trend.value}
        </div>
      )}
      {subtitle && (
        <div style={{ fontSize: 12, color: COLORS.text.muted, marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}

/* ── BADGES ── */

const severityColors: Record<SeverityBand, string> = {
  Critical: COLORS.severity.critical,
  High: COLORS.severity.high,
  Medium: COLORS.severity.medium,
  Low: COLORS.severity.low,
  None: COLORS.status.neutral,
};

const statusColors: Record<SessionStatus, string> = {
  running: COLORS.status.success,
  complete: COLORS.primary.blue,
  error: COLORS.status.critical,
  queued: COLORS.status.warning,
  cancelled: COLORS.status.neutral,
  paused: COLORS.status.warning,
};

export function SeverityBadge({ severity }: { severity: SeverityBand }) {
  const color = severityColors[severity] || COLORS.status.neutral;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}` }} />
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: SessionStatus }) {
  const color = statusColors[status] || COLORS.status.neutral;
  const isRunning = status === "running";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: color,
        boxShadow: isRunning ? `0 0 6px ${color}` : undefined,
        animation: isRunning ? "pulse 1.4s infinite" : undefined,
      }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, string> = {
    idle: COLORS.status.neutral,
    running: COLORS.status.success,
    waiting: COLORS.status.warning,
    completed: COLORS.primary.blue,
    failed: COLORS.status.critical,
  };
  const color = map[status] || COLORS.status.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: `${color}18`, color,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: color,
        animation: status === "running" ? "pulse 1.4s infinite" : undefined,
      }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function ModelStatusBadge({ status }: { status: ModelStatus }) {
  const map: Record<ModelStatus, string> = {
    online: COLORS.status.success,
    loading: COLORS.status.warning,
    unavailable: COLORS.status.critical,
    idle: COLORS.status.neutral,
  };
  const color = map[status] || COLORS.status.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: `${color}18`, color,
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ── LOADING SKELETON ── */

export function Skeleton({ width, height, radius }: { width?: number | string; height?: number; radius?: number }) {
  return (
    <div style={{
      width: width || "100%",
      height: height || 20,
      borderRadius: radius || 8,
      background: `linear-gradient(90deg, ${COLORS.bg.layer2} 25%, ${COLORS.bg.surface} 50%, ${COLORS.bg.layer2} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

export function CardSkeleton() {
  return (
    <div style={{ background: COLORS.bg.layer2, borderRadius: BORDER_RADIUS.cards, padding: 24, border: `1px solid ${COLORS.border.divider}` }}>
      <Skeleton width="60%" height={12} />
      <div style={{ marginTop: 16 }}><Skeleton width="40%" height={32} /></div>
      <div style={{ marginTop: 8 }}><Skeleton width="80%" height={10} /></div>
    </div>
  );
}

/* ── EMPTY STATE ── */

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "64px 24px", textAlign: "center",
    }}>
      {icon && <div style={{ color: COLORS.text.muted, marginBottom: 16, opacity: 0.5 }}>{icon}</div>}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.text.primary, marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ fontSize: 14, color: COLORS.text.secondary, maxWidth: 400, marginBottom: 24 }}>{description}</p>}
      {action}
    </div>
  );
}

/* ── BUTTONS ── */

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
}

export function Button({ children, variant = "primary", onClick, disabled, loading, fullWidth, size = "md", type = "button" }: ButtonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: COLORS.primary.purple,
      color: "#fff",
      boxShadow: GLOW.primary,
    },
    secondary: {
      background: COLORS.bg.surface,
      color: COLORS.text.primary,
      border: `1px solid ${COLORS.border.primary}`,
    },
    danger: {
      background: COLORS.status.critical,
      color: "#fff",
    },
    ghost: {
      background: "transparent",
      color: COLORS.text.secondary,
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { height: 32, padding: "0 12px", fontSize: 12 },
    md: { height: 40, padding: "0 16px", fontSize: 13 },
    lg: { height: 48, padding: "0 24px", fontSize: 14 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: BORDER_RADIUS.buttons,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: `all ${MOTION.fast}`,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(fullWidth ? { width: "100%" } : {}),
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.transform = MOTION.hoverScale.toString(); e.currentTarget.style.filter = "brightness(1.1)"; }}}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
    >
      {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
      {children}
    </button>
  );
}

/* ── CARD WRAPPER ── */

export function Card({ children, title, subtitle, action, height }: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  height?: number | string;
}) {
  return (
    <div style={{
      background: COLORS.bg.layer2,
      borderRadius: BORDER_RADIUS.cards,
      border: `1px solid ${COLORS.border.divider}`,
      padding: 24,
      height: height || "auto",
      overflow: "hidden",
    }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: subtitle ? 4 : 20 }}>
          <div>
            {title && <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.text.primary }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: 12, color: COLORS.text.muted, marginTop: 2 }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── GAUGE ── */

export function RiskGauge({ value, size = 80 }: { value: number; size?: number }) {
  const color = value >= 75 ? COLORS.severity.critical : value >= 50 ? COLORS.severity.high : value >= 25 ? COLORS.severity.medium : COLORS.severity.low;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={COLORS.bg.surface} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 800ms ease-out" }}
        />
      </svg>
      <span style={{ position: "absolute", fontSize: size * 0.28, fontWeight: 700, color }}>{value.toFixed(0)}</span>
    </div>
  );
}
