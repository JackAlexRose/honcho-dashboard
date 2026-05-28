import {
  getPeers,
  getQueueStatus,
  getConclusions,
  getSessions,
  getPeerCard,
} from "@/lib/honcho";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  async function fetchAll() {
    try {
      const [peers, queue, conclusions, sessions] = await Promise.all([
        getPeers(),
        getQueueStatus(),
        getConclusions({ limit: 20 }),
        getSessions(),
      ]);

      // Fetch peer cards in parallel
      const peerCards = await Promise.all(
        peers.map(async (p) => {
          try {
            const facts = await getPeerCard(p.id);
            return { peerId: p.id, facts: facts.length };
          } catch {
            return { peerId: p.id, facts: 0 };
          }
        })
      );

      return {
        peers,
        queue,
        conclusions,
        sessions,
        peerCards,
        error: null as string | null,
      };
    } catch (e) {
      return {
        peers: [] as Awaited<ReturnType<typeof getPeers>>,
        queue: null as Awaited<ReturnType<typeof getQueueStatus>> | null,
        conclusions: [] as Awaited<ReturnType<typeof getConclusions>>,
        sessions: [] as Awaited<ReturnType<typeof getSessions>>,
        peerCards: [] as { peerId: string; facts: number }[],
        error: e instanceof Error ? e.message : "Failed to fetch",
      };
    }
  }

  const data = await fetchAll();

  return (
    <div className="min-h-screen p-3 sm:p-6">
      {/* Header */}
      <header className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[var(--muted)] mb-1">
              HONCHO
            </h1>
            <p className="text-base sm:text-lg font-bold">Memory Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-[0.6rem] sm:text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--muted)]">
              Workspace
            </p>
            <p className="text-xs sm:text-sm">hermes</p>
          </div>
        </div>
      </header>

      {data.error && (
        <div className="card mb-4 sm:mb-6" style={{ borderColor: "var(--failure)" }}>
          <p className="text-xs sm:text-sm" style={{ color: "var(--failure)" }}>
            CONNECTION ERROR: {data.error}
          </p>
        </div>
      )}

      <DashboardClient data={data} />
    </div>
  );
}
