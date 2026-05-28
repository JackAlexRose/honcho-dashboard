"use client";

import Link from "next/link";
import type { Peer, Conclusion, SessionMeta, QueueStatus } from "@/lib/honcho";

interface DashboardData {
  peers: Peer[];
  queue: QueueStatus | null;
  conclusions: Conclusion[];
  sessions: SessionMeta[];
  peerCards: { peerId: string; facts: number }[];
  error: string | null;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  const hrs = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${mon} ${hrs}:${min}`;
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { peers, queue, conclusions, sessions, peerCards } = data;
  const pending = queue?.pending_work_units ?? 0;
  const inProgress = queue?.in_progress_work_units ?? 0;
  const totalWork = queue?.total_work_units ?? 0;

  return (
    <>
      {/* ── Ticker Row ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        <div className="card py-3 px-3 sm:py-4 sm:px-4">
          <p className="ticker text-xl sm:text-2xl" style={{ color: "var(--running)" }}>
            {pending}
          </p>
          <p className="ticker-label text-[0.6rem] sm:text-[0.6875rem]">Pending</p>
        </div>
        <div className="card py-3 px-3 sm:py-4 sm:px-4">
          <p className="ticker text-xl sm:text-2xl" style={{ color: "var(--success)" }}>
            {inProgress}
          </p>
          <p className="ticker-label text-[0.6rem] sm:text-[0.6875rem]">In Progress</p>
        </div>
        <div className="card py-3 px-3 sm:py-4 sm:px-4">
          <p className="ticker text-xl sm:text-2xl">{peers.length}</p>
          <p className="ticker-label text-[0.6rem] sm:text-[0.6875rem]">Peers</p>
        </div>
        <div className="card py-3 px-3 sm:py-4 sm:px-4">
          <p className="ticker text-xl sm:text-2xl">{conclusions.length}</p>
          <p className="ticker-label text-[0.6rem] sm:text-[0.6875rem]">Conclusions</p>
        </div>
      </div>

      {/* ── Queue Detail ───────────────────────────── */}
      {queue && (
        <div className="card mb-4 sm:mb-6 py-3 px-3 sm:py-4 sm:px-4">
          <div className="card-header">Deriver Queue</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="truncate">
              <span className="text-[var(--muted)]">Pending: </span>
              <span style={{ color: "var(--running)" }}>{pending}</span>
            </div>
            <div className="truncate">
              <span className="text-[var(--muted)]">In Progress: </span>
              <span style={{ color: "var(--success)" }}>{inProgress}</span>
            </div>
            <div className="truncate">
              <span className="text-[var(--muted)]">Completed: </span>
              <span>{queue.completed_work_units}</span>
            </div>
            <div className="truncate">
              <span className="text-[var(--muted)]">Total: </span>
              <span>{totalWork}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Peers + Conclusions (stack on mobile) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Peers */}
        <div className="card py-3 px-3 sm:py-4 sm:px-4 overflow-x-auto">
          <div className="card-header">Peers</div>
          {peers.length === 0 ? (
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              No peers yet.
            </p>
          ) : (
            <table className="data-table text-[0.7rem] sm:text-[0.8125rem]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hidden sm:table-cell">Facts</th>
                  <th className="hidden sm:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {peers.map((p) => {
                  const card = peerCards.find((c) => c.peerId === p.id);
                  const factCount = card?.facts ?? 0;
                  return (
                    <tr key={p.id}>
                      <td className="max-w-[120px] sm:max-w-none truncate">
                        <Link href={`/peers/${p.id}`} className="text-xs sm:text-sm">
                          {p.id}
                        </Link>
                        <span className="sm:hidden ml-2">
                          <span
                            className="tag text-[0.55rem]"
                            style={
                              factCount > 0
                                ? { borderColor: "var(--success)", color: "var(--success)" }
                                : undefined
                            }
                          >
                            {factCount}f
                          </span>
                        </span>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span
                          className="tag"
                          style={
                            factCount > 0
                              ? { borderColor: "var(--success)", color: "var(--success)" }
                              : undefined
                          }
                        >
                          {factCount}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell text-[var(--muted)]">
                        {formatTime(p.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Conclusions */}
        <div className="card py-3 px-3 sm:py-4 sm:px-4">
          <div className="card-header">Recent Conclusions</div>
          {conclusions.length === 0 ? (
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              No conclusions yet. The deriver extracts these from conversations.
            </p>
          ) : (
            <ul
              className="fact-list"
              style={{ maxHeight: 400, overflow: "auto" }}
            >
              {conclusions.slice(0, 15).map((c) => (
                <li key={c.id} className="text-[0.7rem] sm:text-[0.8125rem]">
                  <span className="text-[var(--muted)] text-[0.6rem] sm:text-[0.6875rem] block sm:inline sm:mr-2">
                    [{c.observer_id} → {c.observed_id}]
                  </span>
                  <span className="break-words">{c.content}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Sessions ────────────────────────────────── */}
      <div className="card py-3 px-3 sm:py-4 sm:px-4 overflow-x-auto">
        <div className="card-header">Sessions</div>
        {sessions.length === 0 ? (
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            No sessions recorded.
          </p>
        ) : (
          <table className="data-table text-[0.7rem] sm:text-[0.8125rem]">
            <thead>
              <tr>
                <th>ID</th>
                <th className="hidden sm:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-[0.65rem] sm:text-[0.75rem] max-w-[180px] sm:max-w-none truncate">
                    {s.id}
                  </td>
                  <td className="hidden sm:table-cell text-[var(--muted)]">
                    {formatTime(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
