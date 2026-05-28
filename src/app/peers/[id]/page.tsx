import { getPeerCard, getPeerContext, getConclusions } from "@/lib/honcho";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatTime(iso: string) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  const hrs = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${mon} ${hrs}:${min}`;
}

export default async function PeerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  async function fetchPeer() {
    try {
      const [peerCard, context, aboutPeer] = await Promise.all([
        getPeerCard(id),
        getPeerContext(id).catch(() => null),
        getConclusions({ observed_id: id, limit: 50 }),
      ]);

      return { peerCard, context, aboutPeer, error: null as string | null };
    } catch (e) {
      return {
        peerCard: [] as string[],
        context: null as Awaited<ReturnType<typeof getPeerContext>> | null,
        aboutPeer: [] as Awaited<ReturnType<typeof getConclusions>>,
        error: e instanceof Error ? e.message : "Failed to fetch",
      };
    }
  }

  const data = await fetchPeer();

  if (data.error) {
    return (
      <div className="min-h-screen p-3 sm:p-6">
        <div
          className="card mb-4 sm:mb-6"
          style={{ borderColor: "var(--failure)" }}
        >
          <p className="text-xs sm:text-sm" style={{ color: "var(--failure)" }}>
            ERROR: {data.error}
          </p>
        </div>
        <Link href="/" className="text-xs sm:text-sm">← BACK</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6">
      {/* Header */}
      <header className="mb-4 sm:mb-8">
        <Link href="/" className="text-[var(--muted)] text-xs sm:text-sm">
          ← DASHBOARD
        </Link>
        <h1 className="text-base sm:text-lg font-bold mt-2 break-all">
          PEER: {id}
        </h1>
      </header>

      {/* Card + Context (stack on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Peer Card */}
        <div className="card py-3 px-3 sm:py-4 sm:px-4">
          <div className="card-header">
            Peer Card
            <span className="tag tag-success ml-2 text-[0.6rem] sm:text-[0.6875rem]">
              {data.peerCard.length} FACTS
            </span>
          </div>
          {data.peerCard.length === 0 ? (
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              No facts yet. The deriver builds this from conversations.
            </p>
          ) : (
            <ul className="fact-list">
              {data.peerCard.map((fact, i) => (
                <li key={i} className="text-[0.7rem] sm:text-[0.8125rem] break-words">
                  {fact}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Representation */}
        <div className="card py-3 px-3 sm:py-4 sm:px-4">
          <div className="card-header">Representation</div>
          {data.context?.representation ? (
            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
              {data.context.representation}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              No representation built yet.
            </p>
          )}
        </div>
      </div>

      {/* Conclusions */}
      <div className="card py-3 px-3 sm:py-4 sm:px-4 mb-4 sm:mb-6 overflow-x-auto">
        <div className="card-header">
          Conclusions About {id}
          <span className="tag tag-muted ml-2 text-[0.6rem] sm:text-[0.6875rem]">
            {data.aboutPeer.length} TOTAL
          </span>
        </div>
        {data.aboutPeer.length === 0 ? (
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            No conclusions yet.
          </p>
        ) : (
          <table className="data-table text-[0.7rem] sm:text-[0.8125rem]">
            <thead>
              <tr>
                <th className="hidden sm:table-cell">Observer</th>
                <th>Content</th>
                <th className="hidden sm:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.aboutPeer.map((c) => (
                <tr key={c.id}>
                  <td className="hidden sm:table-cell">
                    <span className="tag tag-muted">{c.observer_id}</span>
                  </td>
                  <td className="break-words">
                    <span className="sm:hidden text-[var(--muted)] text-[0.55rem] mr-1">
                      [{c.observer_id}]
                    </span>
                    {c.content}
                  </td>
                  <td className="hidden sm:table-cell text-[var(--muted)] text-[0.75rem]">
                    {formatTime(c.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
