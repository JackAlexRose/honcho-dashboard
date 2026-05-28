const HONCHO_BASE = "http://localhost:8000/v3";
const WORKSPACE = "hermes";

async function honchoFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${HONCHO_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Honcho ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Types (actual API shapes) ─────────────────────────

export interface Peer {
  id: string;
  workspace_id: string;
  created_at: string;
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
}

export interface PeerCardResponse {
  peer_card: string[] | null;
}

export interface PeerContextResponse {
  peer_id: string;
  target_id: string;
  representation: string;
  peer_card: string[] | null;
}

export interface Conclusion {
  id: string;
  content: string;
  observer_id: string;
  observed_id: string;
  session_id: string | null;
  created_at: string;
}

export interface QueueStatus {
  total_work_units: number;
  completed_work_units: number;
  in_progress_work_units: number;
  pending_work_units: number;
  sessions: unknown;
}

export interface SessionMeta {
  id: string;
  workspace_id: string;
  is_active: boolean;
  created_at: string;
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
}

// ── Helpers ────────────────────────────────────────────

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

async function getList<T>(
  path: string,
  body?: Record<string, unknown>
): Promise<T[]> {
  const data = await honchoFetch<PaginatedResponse<T>>(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
  return data.items ?? [];
}

// ── API Functions ──────────────────────────────────────

export async function getPeers(): Promise<Peer[]> {
  return getList<Peer>(`/workspaces/${WORKSPACE}/peers/list`);
}

export async function getPeerCard(peerId: string): Promise<string[]> {
  const data = await honchoFetch<PeerCardResponse>(
    `/workspaces/${WORKSPACE}/peers/${peerId}/card`
  );
  return data.peer_card ?? [];
}

export async function getPeerContext(
  peerId: string
): Promise<PeerContextResponse> {
  return honchoFetch(
    `/workspaces/${WORKSPACE}/peers/${peerId}/context`
  );
}

export async function getConclusions(params?: {
  observer_id?: string;
  observed_id?: string;
  limit?: number;
}): Promise<Conclusion[]> {
  const body: Record<string, unknown> = { limit: params?.limit ?? 50 };
  if (params?.observer_id || params?.observed_id) {
    body.filter = {
      ...(params?.observer_id ? { observer_id: params.observer_id } : {}),
      ...(params?.observed_id ? { observed_id: params.observed_id } : {}),
    };
  }
  return getList<Conclusion>(
    `/workspaces/${WORKSPACE}/conclusions/list`,
    body
  );
}

export async function getQueueStatus(): Promise<QueueStatus> {
  return honchoFetch(`/workspaces/${WORKSPACE}/queue/status`);
}

export async function getSessions(): Promise<SessionMeta[]> {
  return getList<SessionMeta>(`/workspaces/${WORKSPACE}/sessions/list`);
}
