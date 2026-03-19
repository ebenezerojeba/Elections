import { formatDistanceToNow } from 'date-fns';

import clsx from 'clsx';
import { partyColor } from '../utils/partyColors';

function FeedItem({ result, isNew }) {
  const topParty = [...(result.results || [])]
    .sort((a, b) => b.votes - a.votes)[0];

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-3 rounded-xl border transition-all duration-500',
        isNew
          ? 'bg-vote-50 border-vote-200 animate-slide-in'
          : 'bg-white border-slate-100'
      )}
    >
      {/* Party color dot */}
      {topParty && (
        <div
          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ background: partyColor(topParty.party).bar }}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono font-bold text-ink-900 text-xs truncate">
            {result.pollingUnit}
          </p>
          <span className="text-xs text-slate-400 shrink-0 tabular-nums">
            {formatDistanceToNow(new Date(result.submittedAt), { addSuffix: true })}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {result.results?.slice(0, 4).map((r) => (
            <span
              key={r.party}
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                background: partyColor(r.party).light,
                color:      partyColor(r.party).bg,
              }}
            >
              {r.party} {r.votes.toLocaleString()}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          by {result.agentName}
        </p>
      </div>
    </div>
  );
}

export default function LiveFeed({ results = [], newestId = null }) {
  const sorted = [...results].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-ink-900">Live feed</h2>
        <div className="flex items-center gap-1.5 text-xs text-vote-600 font-medium">
          <span className="live-dot" />
          Live
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[520px]
                      scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {sorted.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-3xl mb-3">📡</div>
            <p className="text-slate-400 text-sm">Waiting for results…</p>
          </div>
        ) : (
          sorted.map((r) => (
            <FeedItem
              key={r._id}
              result={r}
              isNew={r._id === newestId}
            />
          ))
        )}
      </div>

      <p className="text-xs text-slate-300 text-center mt-3 pt-3 border-t border-slate-50">
        {sorted.length} unit{sorted.length !== 1 ? 's' : ''} reported
      </p>
    </div>
  );
}