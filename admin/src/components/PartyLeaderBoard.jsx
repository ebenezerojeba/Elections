import { useAnimatedCount } from '../hooks/useAnimatedCount.js';
import { partyColor } from '../utils/partyColors.js';
import clsx from 'clsx';

function PartyRow({ party, votes, totalVotes, rank, isLeader }) {
  const animatedVotes = useAnimatedCount(votes);
  const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  const color = partyColor(party);

  return (
    <div className={clsx('group', isLeader && 'animate-fade-up')}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2.5">
          {/* Rank badge */}
          <span
            className={clsx(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0',
              rank === 1 ? 'bg-gold-500 text-white' : 'bg-slate-100 text-slate-400'
            )}
          >
            {rank}
          </span>

          {/* Party pill */}
          <span
            className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg"
            style={{ background: color.light, color: color.bg }}
          >
            {party}
          </span>

          {isLeader && (
            <span className="text-xs bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full font-medium">
              Leading
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="font-mono font-bold text-ink-900 text-sm tabular-nums">
            {animatedVotes.toLocaleString()}
          </span>
          <span className="text-slate-400 text-xs ml-1.5">
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color.bar }}
        />
      </div>
    </div>
  );
}

export default function PartyLeaderboard({ parties = [], grandTotal = 0 }) {
  if (!parties.length) {
    return (
      <div className="card">
        <h2 className="font-display font-bold text-ink-900 mb-6">Party standings</h2>
        <div className="py-12 text-center text-slate-400 text-sm">
          No results submitted yet
        </div>
      </div>
    );
  }

  const sorted = [...parties].sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-ink-900">Party standings</h2>
        <span className="text-xs text-slate-400 font-mono">
          {grandTotal.toLocaleString()} total votes
        </span>
      </div>

      <div className="space-y-5">
        {sorted.map((p, i) => (
          <PartyRow
            key={p.party}
            party={p.party}
            votes={p.totalVotes}
            totalVotes={grandTotal}
            rank={i + 1}
            isLeader={i === 0}
          />
        ))}
      </div>
    </div>
  );
}