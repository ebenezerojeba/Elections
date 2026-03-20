// import {
//   PieChart, Pie, Cell, Tooltip,
//   ResponsiveContainer, Legend,
// } from 'recharts';
// import { partyBar, partyColor } from '../utils/partyColors.js';

// const CustomTooltip = ({ active, payload }) => {
//   if (!active || !payload?.length) return null;
//   const d = payload[0];
//   return (
//     <div className="bg-white border border-slate-100 rounded-xl shadow-lift px-4 py-3">
//       <p className="font-mono font-bold text-ink-900 text-sm">{d.name}</p>
//       <p className="font-mono text-sm mt-0.5" style={{ color: partyBar(d.name) }}>
//         {d.value.toLocaleString()} votes · {d.payload.pct}%
//       </p>
//     </div>
//   );
// };

// const renderLegend = ({ payload }) => (
//   <div className="flex flex-wrap justify-center gap-3 mt-4">
//     {payload.map((entry) => (
//       <div key={entry.value} className="flex items-center gap-1.5 text-xs">
//         <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
//         <span className="font-mono font-bold text-ink-700">{entry.value}</span>
//       </div>
//     ))}
//   </div>
// );

// export default function VotesPieChart({ parties = [], grandTotal = 0 }) {
//   const data = parties.map((p) => ({
//     name: p.party,
//     value: p.totalVotes,
//     pct: grandTotal > 0 ? ((p.totalVotes / grandTotal) * 100).toFixed(1) : '0.0',
//   }));

//   if (!data.length) return null;

//   return (
//     <div className="card">
//       <h2 className="font-display font-bold text-ink-900 mb-2">Vote share</h2>
//       <ResponsiveContainer width="100%" height={280}>
//         <PieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="45%"
//             innerRadius={64}
//             outerRadius={100}
//             paddingAngle={3}
//             dataKey="value"
//             animationBegin={0}
//             animationDuration={700}
//           >
//             {data.map((entry) => (
//               <Cell key={entry.name} fill={partyBar(entry.name)} stroke="none" />
//             ))}
//           </Pie>
//           <Tooltip content={<CustomTooltip />} />
//           <Legend content={renderLegend} />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }








import { useRef, useCallback, useId } from 'react';
import { partyBar } from '../utils/partyColors.js';

/* ─── Tooltip hook ─────────────────────────────────────────────────────────── */
function useTooltip() {
  const ref = useRef(null);

  const show = useCallback((e, html) => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    position(el, e);
  }, []);

  const move = useCallback((e) => {
    const el = ref.current;
    if (el?.style.opacity === '1') position(el, e);
  }, []);

  const hide = useCallback(() => {
    const el = ref.current;
    if (el) { el.style.opacity = '0'; el.style.visibility = 'hidden'; }
  }, []);

  return { ref, show, move, hide };
}

function position(el, e) {
  const { clientX: x, clientY: y } = e;
  const W = window.innerWidth, H = window.innerHeight;
  const w = el.offsetWidth, h = el.offsetHeight;
  el.style.left = (x + 14 + w > W ? x - w - 14 : x + 14) + 'px';
  el.style.top  = (y - 10 < 0 ? y + 10 : y + h > H ? y - h : y - 10) + 'px';
}

/* ─── Donut path math ─────────────────────────────────────────────────────── */
function slices(data, cx, cy, R, r) {
  let angle = -Math.PI / 2;
  return data.map((d) => {
    const sweep = d.pct > 0 ? (d.pct / 100) * 2 * Math.PI : 0;
    const sa = angle, ea = angle + sweep;
    angle = ea;
    const large = sweep > Math.PI ? 1 : 0;
    const cos = Math.cos, sin = Math.sin;
    return {
      ...d,
      path:
        `M${cx + R * cos(sa)} ${cy + R * sin(sa)}` +
        `A${R} ${R} 0 ${large} 1 ${cx + R * cos(ea)} ${cy + R * sin(ea)}` +
        `L${cx + r * cos(ea)} ${cy + r * sin(ea)}` +
        `A${r} ${r} 0 ${large} 0 ${cx + r * cos(sa)} ${cy + r * sin(sa)}Z`,
    };
  });
}

/* ─── Format large numbers ─────────────────────────────────────────────────── */
const fmt = (n) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M'
  : n >= 1_000   ? (n / 1_000).toFixed(0) + 'K'
  : String(n);

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function VotesPieChart({ parties = [], grandTotal = 0 }) {
  const tt = useTooltip();

  if (!parties.length) {
    return (
      <div className="card">
        <h2 className="font-display font-bold text-ink-900 mb-1">Vote share</h2>
        <div className="py-10 text-center text-slate-400 text-sm">No data yet</div>
      </div>
    );
  }

  const sorted = [...parties].sort((a, b) => b.totalVotes - a.totalVotes);
  const CX = 100, CY = 100, R = 80, r = 50;

  const data = sorted.map((p) => ({
    party:  p.party,
    votes:  p.totalVotes,
    pct:    grandTotal > 0 ? (p.totalVotes / grandTotal) * 100 : 0,
    color:  partyBar(p.party),
  }));

  const arcs = slices(data, CX, CY, R, r);

  const ttHTML = (d) =>
    `<p style="font-weight:500;font-size:13px;margin-bottom:3px">${d.party}</p>` +
    `<p style="font-size:12px;color:var(--color-text-secondary)"><strong style="color:var(--color-text-primary)">${d.votes.toLocaleString()}</strong> votes</p>` +
    `<p style="font-size:12px;color:var(--color-text-secondary)"><strong style="color:var(--color-text-primary)">${d.pct.toFixed(1)}%</strong> of total</p>`;

  return (
    <>
      {/* Fixed tooltip — lives outside card stacking context */}
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
            Vote share
          </h2>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {grandTotal.toLocaleString()} total
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">{parties.length} parties</p>

        {/* Responsive layout: stacked on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">

          {/* Donut */}
          <div className="flex justify-center sm:flex-shrink-0">
            <svg
              width="200" height="200"
              viewBox="0 0 200 200"
              role="img"
              aria-label="Vote share donut chart"
              style={{ overflow: 'visible', maxWidth: '100%' }}
            >
              {arcs.map((s) => (
                <path
                  key={s.party}
                  d={s.path}
                  fill={s.color}
                  stroke="var(--color-background-primary)"
                  strokeWidth={2.5}
                  style={{
                    cursor: 'pointer',
                    transformOrigin: `${CX}px ${CY}px`,
                    transition: 'transform .15s, opacity .15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.045)';
                    tt.show(e, ttHTML(s));
                  }}
                  onMouseMove={tt.move}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    tt.hide();
                  }}
                />
              ))}
              {/* Center label */}
              <text
                x={CX} y={CY - 9}
                textAnchor="middle"
                style={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontFamily: 'inherit' }}
              >
                Total
              </text>
              <text
                x={CX} y={CY + 13}
                textAnchor="middle"
                style={{ fontSize: 22, fontWeight: 500, fill: 'var(--color-text-primary)', fontFamily: 'inherit' }}
              >
                {fmt(grandTotal)}
              </text>
            </svg>
          </div>

          {/* Legend — wraps on mobile, column on sm */}
          <div className="flex flex-row flex-wrap sm:flex-col justify-center sm:justify-start gap-2 mt-3 sm:mt-0 sm:flex-1">
            {data.map((d) => (
              <button
                key={d.party}
                type="button"
                className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg
                           hover:bg-slate-50 transition-colors text-left"
                onMouseEnter={(e) => tt.show(e, ttHTML(d))}
                onMouseMove={tt.move}
                onMouseLeave={tt.hide}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color }}
                />
                <span className="font-mono font-bold text-ink-900">{d.party}</span>
                <span className="text-slate-400 tabular-nums ml-auto sm:ml-0">{d.pct.toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}