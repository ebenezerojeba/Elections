// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, Cell,
// } from 'recharts';
// import { partyBar } from '../utils/partyColors.js';

// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-white border border-slate-100 rounded-xl shadow-lift px-4 py-3">
//       <p className="font-mono font-bold text-ink-900 text-sm">{label}</p>
//       <p className="text-vote-600 font-mono text-sm mt-0.5">
//         {payload[0].value.toLocaleString()} votes
//       </p>
//     </div>
//   );
// };

// export default function VotesBarChart({ parties = [] }) {
//   const data = [...parties]
//     .sort((a, b) => b.totalVotes - a.totalVotes)
//     .map((p) => ({ name: p.party, votes: p.totalVotes }));

//   if (!data.length) return null;

//   return (
//     <div className="card">
//       <h2 className="font-display font-bold text-ink-900 mb-6">Vote distribution</h2>
//       <ResponsiveContainer width="100%" height={240}>
//         <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
//           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
//           <XAxis
//             dataKey="name"
//             axisLine={false}
//             tickLine={false}
//             tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, fill: '#677489' }}
//           />
//           <YAxis
//             axisLine={false}
//             tickLine={false}
//             width={56}
//             tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
//             tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#9aa5b4' }}
//           />
//           <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fb' }} />
//           <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
//             {data.map((entry) => (
//               <Cell key={entry.name} fill={partyBar(entry.name)} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }


import { useRef, useCallback } from 'react';
import { partyBar } from '../utils/partyColors.js';

function useTooltip() {
  const ref = useRef(null);
  const show = useCallback((e, html) => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    pos(el, e);
  }, []);
  const move = useCallback((e) => {
    const el = ref.current;
    if (el?.style.opacity === '1') pos(el, e);
  }, []);
  const hide = useCallback(() => {
    const el = ref.current;
    if (el) { el.style.opacity = '0'; el.style.visibility = 'hidden'; }
  }, []);
  return { ref, show, move, hide };
}

function pos(el, e) {
  const { clientX: x, clientY: y } = e;
  const W = window.innerWidth, H = window.innerHeight;
  const w = el.offsetWidth, h = el.offsetHeight;
  el.style.left = (x + 14 + w > W ? x - w - 14 : x + 14) + 'px';
  el.style.top  = (y + h + 10 > H ? y - h - 10 : y + 10) + 'px';
}

/* ─── Single bar row ───────────────────────────────────────────────────────── */
function BarRow({ party, votes, pctOfMax, sharePct, color, delay, onHover, onLeave }) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Party label */}
      <span
        className="font-mono font-bold text-xs text-slate-500 shrink-0 text-right tabular-nums"
        style={{ width: 40 }}
      >
        {party}
      </span>

      {/* Track */}
      <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
        <div
          className="h-full rounded-md flex items-center justify-end pr-2"
          style={{
            width: `${pctOfMax}%`,
            background: color,
            transition: 'width .7s cubic-bezier(.25,.46,.45,.94)',
          }}
          onMouseEnter={onHover}
          onMouseMove={onHover}
          onMouseLeave={onLeave}
        >
          {/* Inline % — only when bar is wide enough to hold it */}
          {pctOfMax > 18 && (
            <span className="text-xs font-medium text-white/90 tabular-nums whitespace-nowrap">
              {sharePct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Vote count — abbreviated on mobile */}
      <span className="font-mono text-xs text-slate-400 shrink-0 tabular-nums" style={{ width: 52, textAlign: 'right' }}>
        <span className="hidden sm:inline">{votes.toLocaleString()}</span>
        <span className="sm:hidden">
          {votes >= 1_000_000 ? `${(votes / 1_000_000).toFixed(1)}M`
            : votes >= 1_000 ? `${(votes / 1_000).toFixed(0)}k`
            : votes}
        </span>
      </span>
    </div>
  );
}

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function VotesBarChart({ parties = [], grandTotal = 0 }) {
  const tt = useTooltip();

  if (!parties.length) {
    return (
      <div className="card">
        <h2 className="font-display font-bold text-ink-900 mb-1">Vote distribution</h2>
        <div className="py-10 text-center text-slate-400 text-sm">No data yet</div>
      </div>
    );
  }

  const sorted = [...parties].sort((a, b) => b.totalVotes - a.totalVotes);
  const max = sorted[0].totalVotes;

  const ttHTML = (p, sharePct) =>
    `<p style="font-weight:500;font-size:13px;margin-bottom:3px">${p.party}</p>` +
    `<p style="font-size:12px;color:var(--color-text-secondary)"><strong style="color:var(--color-text-primary)">${p.totalVotes.toLocaleString()}</strong> votes</p>` +
    `<p style="font-size:12px;color:var(--color-text-secondary)"><strong style="color:var(--color-text-primary)">${sharePct.toFixed(1)}%</strong> share</p>`;

  return (
    <>
      <div
        ref={tt.ref}
        style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9999,
          opacity: 0, visibility: 'hidden', transition: 'opacity .1s',
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-secondary)',
          borderRadius: 8, padding: '8px 12px',
          boxShadow: '0 2px 12px rgba(0,0,0,.1)',
          minWidth: 130,
        }}
      />

      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-bold text-ink-900 text-base sm:text-lg">
            Vote distribution
          </h2>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {grandTotal.toLocaleString()} total
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-5">Sorted by votes · bars relative to leader</p>

        {/* Bar rows */}
        <div className="flex flex-col gap-2.5">
          {sorted.map((p, i) => {
            const pctOfMax  = max > 0 ? (p.totalVotes / max) * 100 : 0;
            const sharePct  = grandTotal > 0 ? (p.totalVotes / grandTotal) * 100 : 0;
            const color     = partyBar(p.party);
            return (
              <BarRow
                key={p.party}
                party={p.party}
                votes={p.totalVotes}
                pctOfMax={pctOfMax}
                sharePct={sharePct}
                color={color}
                delay={i * 80}
                onHover={(e) => tt.show(e, ttHTML(p, sharePct))}
                onLeave={tt.hide}
              />
            );
          })}
        </div>

        {/* Summary legend row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5 pt-4 border-t border-slate-100">
          {sorted.map((p) => (
            <div key={p.party} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: partyBar(p.party) }}
              />
              <span className="font-mono text-xs text-slate-500">{p.party}</span>
              <span className="font-mono text-xs font-bold text-ink-900 tabular-nums">
                {grandTotal > 0 ? ((p.totalVotes / grandTotal) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}