import { useEffect, useRef, useCallback, useState } from "react";
import type { NodeEvent, AuditReport } from "../types/backend";
import { SSE_PATH } from "../api/endpoints";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "dev-key";

type SSEStatus = "connecting" | "connected" | "disconnected" | "error";

interface SSEState {
  events: NodeEvent[];
  status: SSEStatus;
  report: AuditReport | null;
  error: string | null;
}

export function useAuditSSE(sessionId: string | null) {
  const [state, setState] = useState<SSEState>({
    events: [],
    status: "disconnected",
    report: null,
    error: null,
  });
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!sessionId) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setState((s) => ({ ...s, status: "connecting" }));

    const url = `${API_BASE}${SSE_PATH}/${sessionId}/stream?X-PromptEvo-Key=${API_KEY}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setState((s) => ({ ...s, status: "connected" }));
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "connected") {
          setState((s) => ({ ...s, status: "connected" }));
          return;
        }
        if (data.type === "complete") {
          setState((s) => ({
            ...s,
            status: "disconnected",
            report: data.report || null,
            error: data.error || null,
          }));
          es.close();
          return;
        }
        setState((s) => ({
          ...s,
          events: [...s.events, data as NodeEvent],
          status: "connected",
        }));
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setState((s) => ({ ...s, status: "error", error: "SSE connection lost" }));
      es.close();
    };
  }, [sessionId]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (retryRef.current) {
        clearTimeout(retryRef.current);
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((s) => ({ ...s, status: "disconnected" }));
  }, []);

  return { ...state, disconnect, reconnect: connect };
}
