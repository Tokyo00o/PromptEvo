const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "dev-key";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-PromptEvo-Key": API_KEY,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = await res.text().catch(() => null);
    }
    throw new ApiError(
      res.status,
      typeof data === "object" && data && "detail" in data
        ? (typeof (data as { detail: unknown }).detail === "string"
            ? (data as { detail: string }).detail
            : JSON.stringify((data as { detail: unknown }).detail))
        : `HTTP ${res.status}`,
      data,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};

export function createEventSource(
  path: string,
): EventSource {
  const url = `${API_BASE}${path}`;
  return new EventSource(url);
}
