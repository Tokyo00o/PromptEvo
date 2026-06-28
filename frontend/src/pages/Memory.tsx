import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Brain, Database, Archive, Search, ExternalLink, Clock, RefreshCw } from "lucide-react";
import { PageHeader, Button, Card, StatCard, EmptyState, Skeleton } from "../components/reusable";
import { memoryApi } from "../api/endpoints";
import { COLORS, BORDER_RADIUS, MOTION } from "../constants/theme";

export function Memory() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["memory"],
    queryFn: memoryApi.get,
    refetchInterval: 10000,
  });

  const entries = data?.entries || [];
  const writes = entries.filter((e) => e.operation === "write").length;
  const reads = entries.filter((e) => e.operation === "read" || e.operation === "retrieve").length;
  const sessionIds = [...new Set(entries.map((e) => e.session_id).filter(Boolean))];

  return (
    <div>
      <PageHeader title="Memory" subtitle="PromptEvo memory subsystem visualization"
        action={<Button variant="ghost" size="sm" onClick={() => window.location.reload()}><RefreshCw size={14} /> Refresh</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Memory Entries" value={data?.total || 0} icon={<Brain size={20} />} color={COLORS.primary.purple} />
        <StatCard label="Writes" value={writes} icon={<Database size={20} />} color={COLORS.primary.blue} />
        <StatCard label="Reads" value={reads} icon={<Archive size={20} />} color={COLORS.primary.cyan} />
        <StatCard label="Sessions" value={sessionIds.length} icon={<Search size={20} />} color={COLORS.status.info} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card title="Working Memory" subtitle="Current audit context" height={300}>
          {entries.length === 0 ? (
            <EmptyState title="No active session" description="Active session memory will appear here." />
          ) : (
            <div style={{ maxHeight: 220, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {entries.filter((e) => e.type === "working" || !e.type).slice(0, 10).map((e, i) => (
                <MemoryRow key={e.id || i} entry={e} navigate={navigate} />
              ))}
            </div>
          )}
        </Card>
        <Card title="Session Memory" subtitle="Current session conversation" height={300}>
          {entries.length === 0 ? (
            <EmptyState title="No session data" description="Session memory will appear during audits." />
          ) : (
            <div style={{ maxHeight: 220, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {entries.filter((e) => e.type === "session").slice(0, 10).map((e, i) => (
                <MemoryRow key={e.id || i} entry={e} navigate={navigate} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card title="Long-Term Memory" subtitle="Stored patterns and learned behaviors" height={300}>
          <EmptyState title="No long-term memory" description="LTM entries will accumulate over time." />
        </Card>
        <Card title="Memory Timeline" subtitle={`${entries.length} operations in chronological order`} height={300}>
          {entries.length === 0 ? (
            <EmptyState title="No memory operations" description="Memory events will appear during execution." />
          ) : (
            <div style={{ maxHeight: 220, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {[...entries].reverse().slice(0, 30).map((e, i) => (
                <div key={e.id || i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
                  <span style={{ color: COLORS.text.muted, fontFamily: "monospace", fontSize: 10, flexShrink: 0 }}>
                    {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ""}
                  </span>
                  <span style={{
                    padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: e.operation === "write" ? `${COLORS.primary.blue}18` : `${COLORS.status.info}18`,
                    color: e.operation === "write" ? COLORS.primary.blue : COLORS.status.info,
                  }}>
                    {e.operation}
                  </span>
                  <span style={{ color: COLORS.text.secondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.content?.slice(0, 60) || e.session_id?.slice(0, 12) || "—"}
                  </span>
                  {e.session_id && (
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/session/${e.session_id}`)}><ExternalLink size={12} /></Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Memory Explorer" subtitle="Tree view of memory structure" height={400}>
        {entries.length === 0 ? (
          <EmptyState title="No memory structure" description="Run an audit to populate memory." />
        ) : (
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {sessionIds.map((sid) => (
              <div key={sid} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: COLORS.bg.surface, borderRadius: 8, marginBottom: 4 }}>
                  <Brain size={14} color={COLORS.primary.purple} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary, fontFamily: "monospace", fontSize: 11 }}>{sid?.slice(0, 12)}...</span>
                  <span style={{ fontSize: 11, color: COLORS.text.muted }}>{entries.filter((e) => e.session_id === sid).length} entries</span>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/session/${sid}`)}><ExternalLink size={12} /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function MemoryRow({ entry, navigate }: { entry: any; navigate: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
      <Clock size={10} color={COLORS.text.muted} />
      <span style={{
        padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, flexShrink: 0,
        background: entry.operation === "write" ? `${COLORS.primary.blue}18` : `${COLORS.status.info}18`,
        color: entry.operation === "write" ? COLORS.primary.blue : COLORS.status.info,
      }}>
        {entry.operation}
      </span>
      <span style={{ color: COLORS.text.secondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {entry.content?.slice(0, 80) || "—"}
      </span>
      {entry.score != null && (
        <span style={{ fontSize: 10, color: COLORS.text.muted }}>{(entry.score as number).toFixed(2)}</span>
      )}
    </div>
  );
}
