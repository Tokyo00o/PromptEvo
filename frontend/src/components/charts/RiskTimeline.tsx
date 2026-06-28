import ReactEChartsCore from "echarts-for-react";
import { COLORS } from "../../constants/theme";

interface RiskPoint {
  turn: number;
  risk: number;
  confidence?: number;
  severity?: string;
  timestamp?: string;
}

export function RiskTimelineChart({ data, height = 280 }: { data: RiskPoint[]; height?: number }) {
  const option = {
    backgroundColor: "transparent",
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    tooltip: {
      trigger: "axis",
      backgroundColor: COLORS.bg.layer2,
      borderColor: COLORS.border.primary,
      borderWidth: 1,
      textStyle: { color: COLORS.text.primary, fontSize: 12 },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const d = p.data as RiskPoint;
        return `Turn ${d.turn}<br/>Risk: ${d.risk.toFixed(1)}${d.confidence ? `<br/>Confidence: ${d.confidence.toFixed(2)}` : ""}`;
      },
    },
    xAxis: {
      type: "category",
      data: data.map((d) => `T${d.turn}`),
      axisLine: { lineStyle: { color: COLORS.border.primary } },
      axisLabel: { color: COLORS.text.muted, fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: COLORS.text.muted, fontSize: 11 },
      splitLine: { lineStyle: { color: COLORS.border.divider } },
    },
    series: [
      {
        type: "line",
        data: data.map((d) => ({
          value: d.risk,
          ...d,
          itemStyle: {
            color: d.risk >= 75 ? COLORS.severity.critical : d.risk >= 50 ? COLORS.severity.high : d.risk >= 25 ? COLORS.severity.medium : COLORS.severity.low,
          },
        })),
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        lineStyle: { width: 2, color: COLORS.primary.purple },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${COLORS.primary.purple}40` },
              { offset: 1, color: `${COLORS.primary.purple}05` },
            ],
          },
        },
      },
    ],
  };

  return <ReactEChartsCore option={option} style={{ height }} />;
}

export function SeverityDonut({ data }: { data: { name: string; value: number; color: string }[] }) {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: COLORS.bg.layer2,
      borderColor: COLORS.border.primary,
      textStyle: { color: COLORS.text.primary, fontSize: 12 },
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "75%"],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: "bold", color: COLORS.text.primary },
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" },
        },
        data: data.map((d) => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
      },
    ],
  };

  return <ReactEChartsCore option={option} style={{ height: 200 }} />;
}
