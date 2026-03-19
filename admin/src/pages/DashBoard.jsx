// import { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { formatDistanceToNow } from 'date-fns';
// import { useSocket } from '../hooks/useSocket';
// import { useSummary } from '../hooks/useSummary';
// import ConnectionStatus from '../components/ConnectionStatus';
// import StatCard from '../components/StatCard';
// import VotesBarChart from '../components/VotesBarChart';
// import VotesPieChart from '../components/VotesPieChart';
// import PartyLeaderboard from '../components/PartyLeaderBoard';
// import LiveFeed from '../components/LiveFeed';
// import ResultsTable from '../components/ResultsTable';

// export default function Dashboard() {
//   // Increment to trigger useSummary re-fetch on socket event
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [newestId,   setNewestId]   = useState(null);
//   const [flashStats, setFlashStats] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(null);
//   const flashTimer = useRef(null);

//   const { connected, newResult, updatedResult } = useSocket();
//   const { summary, results, loading, error }    = useSummary(refreshKey);

//   // React to incoming socket events
//   useEffect(() => {
//     if (!newResult) return;

//     setRefreshKey((k) => k + 1);
//     setNewestId(newResult.result?._id || null);
//     setLastUpdate(new Date());

//     // Flash stat cards green for 2 seconds
//     setFlashStats(true);
//     clearTimeout(flashTimer.current);
//     flashTimer.current = setTimeout(() => setFlashStats(false), 2000);
//   }, [newResult]);

//   useEffect(() => {
//     if (!updatedResult) return;
//     setRefreshKey((k) => k + 1);
//   }, [updatedResult]);

//   useEffect(() => () => clearTimeout(flashTimer.current), []);

//   const parties       = summary?.parties       || [];
//   const grandTotal    = summary?.grandTotal    || 0;
//   const reportingUnits = summary?.reportingUnits || 0;
//   const leader        = parties[0];

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* ── Top nav ──────────────────────────────────────────────── */}
//       <nav className="bg-ink-900 sticky top-0 z-30 border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="w-7 h-7 bg-vote-500 rounded-lg flex items-center justify-center shrink-0">
//               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
//               </svg>
//             </div>
//             <span className="font-display font-bold text-white">ElectTrack</span>
//             <span className="hidden sm:block text-white/20">·</span>
//             <span className="hidden sm:block text-white/50 text-sm font-body">Live Results</span>
//           </div>

//           {/* Right controls */}
//           <div className="flex items-center gap-3">
//             {lastUpdate && (
//               <span className="hidden sm:block text-xs text-white/30 tabular-nums">
//                 Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
//               </span>
//             )}
//             <ConnectionStatus connected={connected} />
           
//           </div>
//         </div>
//       </nav>

//       {/* ── Hero banner ──────────────────────────────────────────── */}
//       <div className="bg-ink-900 border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
//           <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
//             <div>
//               <p className="text-vote-500 text-xs font-mono font-bold uppercase tracking-widest mb-2">
//                 General Election · Real-time results
//               </p>
//               <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
//                 Election Results Dashboard
//               </h1>
//               {leader && (
//                 <p className="text-white/40 text-sm mt-2 font-body">
//                   Current leader:{' '}
//                   <span className="text-vote-400 font-mono font-bold">{leader.party}</span>
//                   {' '}with{' '}
//                   <span className="text-white font-mono">{leader.totalVotes.toLocaleString()}</span> votes
//                 </p>
//               )}
//             </div>

//             {/* Live ticker strip */}
//             {parties.length > 0 && (
//               <div className="flex gap-3 flex-wrap">
//                 {parties.slice(0, 4).map((p) => (
//                   <div key={p.party} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center">
//                     <p className="font-mono font-extrabold text-white text-lg tabular-nums">
//                       {p.totalVotes.toLocaleString()}
//                     </p>
//                     <p className="font-mono text-xs text-white/40 mt-0.5">{p.party}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         {/* ── Error state ──────────────────────────────────────────── */}
//         {error && (
//           <div className="mb-6 bg-alert-50 border border-alert-500/20 rounded-xl p-4 text-sm text-alert-500 flex items-center gap-2">
//             <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
//             </svg>
//             Failed to load results: {error}
//           </div>
//         )}

//         {/* ── Stat cards row ───────────────────────────────────────── */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <StatCard
//             label="Total votes cast"
//             value={grandTotal}
//             sub="across all polling units"
//             accent="#00C896"
//             flash={flashStats}
//           />
//           <StatCard
//             label="Units reporting"
//             value={reportingUnits}
//             sub="polling units submitted"
//             accent="#0D0D0D"
//             flash={flashStats}
//           />
//           <StatCard
//             label="Parties contesting"
//             value={parties.length}
//             sub="with votes recorded"
//             accent="#F5A623"
//           />
//           {leader ? (
//             <StatCard
//               label={`${leader.party} · leading`}
//               value={leader.totalVotes}
//               sub={`${grandTotal > 0 ? ((leader.totalVotes / grandTotal) * 100).toFixed(1) : 0}% of total votes`}
//               accent="#6366F1"
//               flash={flashStats}
//             />
//           ) : (
//             <StatCard label="Leader" value={0} sub="No results yet" />
//           )}
//         </div>

//         {/* ── Loading skeleton ─────────────────────────────────────── */}
//         {loading && (
//           <div className="flex flex-col gap-6">
//             {[1, 2].map((i) => (
//               <div key={i} className="card animate-pulse">
//                 <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
//                 <div className="h-48 bg-slate-50 rounded-xl" />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── Main content grid ────────────────────────────────────── */}
//         {!loading && (
//           <div className="space-y-6">
//             {/* Charts + leaderboard row */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2 space-y-6">
//                 <VotesBarChart parties={parties} />
//                 <VotesPieChart parties={parties} grandTotal={grandTotal} />
//               </div>
//               <div className="space-y-6">
//                 <PartyLeaderboard parties={parties} grandTotal={grandTotal} />
//               </div>
//             </div>

//             {/* Live feed + table row */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-1">
//                 <LiveFeed results={results} newestId={newestId} />
//               </div>
//               <div className="lg:col-span-2">
//                 <ResultsTable results={results} newestId={newestId} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Empty state ──────────────────────────────────────────── */}
//         {!loading && results.length === 0 && !error && (
//           <div className="card text-center py-20 mt-6">
//             <div className="text-5xl mb-4">🗳</div>
//             <h3 className="font-display font-bold text-ink-900 text-xl mb-2">
//               Waiting for results
//             </h3>
//             <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
//               As agents submit results from their polling units, they'll appear here in real-time.
//             </p>
           
//           </div>
//         )}
//       </div>

//       {/* ── Footer ───────────────────────────────────────────────── */}
//       <footer className="border-t border-slate-100 mt-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
//           <div className="flex items-center gap-2">
//             <span className="font-display font-bold text-ink-900 text-sm">ElectTrack</span>
//             <span className="text-slate-300">·</span>
//             <span className="text-slate-400 text-xs">Real-time election monitoring</span>
//           </div>
//           <div className="flex items-center gap-4 text-xs text-slate-400">
//             <ConnectionStatus connected={connected} />
//             <span className="tabular-nums">
//               {reportingUnits} unit{reportingUnits !== 1 ? 's' : ''} reporting
//             </span>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../hooks/useSocket';
import { useSummary } from '../hooks/useSummary';
import ConnectionStatus from '../components/ConnectionStatus';
import StatCard from '../components/StatCard';
import VotesBarChart from '../components/VotesBarChart';
import VotesPieChart from '../components/VotesPieChart';
import PartyLeaderboard from '../components/PartyLeaderBoard';
import LiveFeed from '../components/LiveFeed';
import ResultsTable from '../components/ResultsTable';

/* ─────────────────────────────────────────────────────────────
   Inject fonts + global base styles once at module level.
   Uses DM Mono (data/tabular) + Syne (display/headings).
───────────────────────────────────────────────────────────── */
const STYLE_ID = 'electtrack-global';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #0a0a0b;
      --surface:  #111114;
      --border:   rgba(255,255,255,0.07);
      --amber:    #f5a623;
      --amber-dim: rgba(245,166,35,0.12);
      --green:    #00e5a0;
      --green-dim: rgba(0,229,160,0.10);
      --muted:    rgba(255,255,255,0.28);
      --text:     rgba(255,255,255,0.88);
      --mono:     'DM Mono', monospace;
      --display:  'Syne', sans-serif;
    }

    /* Noise grain overlay */
    body::after {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
    }

    /* Horizontal scan-line texture */
    .et-scanlines::before {
      content: '';
      position: absolute; inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255,255,255,0.012) 2px,
        rgba(255,255,255,0.012) 4px
      );
      pointer-events: none;
    }

    /* Pulse ring for live dot */
    @keyframes liveRing {
      0%   { transform: scale(1);   opacity: 0.8; }
      100% { transform: scale(2.4); opacity: 0;   }
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes barFill {
      from { width: 0%; }
      to   { width: var(--bar-w); }
    }
    @keyframes flashBorder {
      0%,100% { border-color: rgba(255,255,255,0.07); }
      50%     { border-color: #00e5a0; }
    }
    .et-flash { animation: flashBorder 0.6s ease 2; }

    .et-fade-up { animation: fadeSlideUp 0.45s ease both; }

    .et-bar {
      animation: barFill 1.1s cubic-bezier(0.22,1,0.36,1) both;
      animation-delay: var(--bar-delay, 0ms);
    }
  `;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────────
   Sub-components (self-contained, no extra files needed)
───────────────────────────────────────────────────────────── */

/** Blinking LIVE badge */
function LiveDot({ active }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ position: 'relative', width: 8, height: 8 }}>
        <span style={{
          display: 'block', width: 8, height: 8, borderRadius: '50%',
          background: active ? 'var(--green)' : '#444',
          boxShadow: active ? '0 0 6px var(--green)' : 'none',
        }} />
        {active && (
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1.5px solid var(--green)',
            animation: 'liveRing 1.4s ease-out infinite',
          }} />
        )}
      </span>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: active ? 'var(--green)' : '#555',
      }}>
        {active ? 'Live' : 'Offline'}
      </span>
    </span>
  );
}

/** Thin amber divider with label */
function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--amber)',
      }}>
        {children}
      </span>
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

/** Numeric stat block — editorial style, not a "card" */
function StatBlock({ label, value, sub, accent = 'var(--text)', flash }) {
  const formatted = typeof value === 'number' ? value.toLocaleString() : value ?? '—';
  return (
    <div className={flash ? 'et-flash' : ''} style={{
      padding: '20px 24px',
      border: '1px solid var(--border)',
      borderRadius: 12,
      background: 'var(--surface)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.3s',
    }}>
      {/* accent glow strip */}
      <span style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent, borderRadius: '12px 12px 0 0',
      }} />
      <p style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8,
      }}>{label}</p>
      <p style={{
        fontFamily: 'var(--display)', fontSize: 32, fontWeight: 800,
        color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em',
      }}>{formatted}</p>
      {sub && (
        <p style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
          marginTop: 6,
        }}>{sub}</p>
      )}
    </div>
  );
}

/** Inline vote-share bar row */
function VoteShareBar({ party, votes, total, rank, delay }) {
  const pct = total > 0 ? (votes / total) * 100 : 0;
  const COLORS = ['var(--amber)', 'var(--green)', '#7c6af7', '#e85d75', '#38bdf8'];
  const color = COLORS[rank % COLORS.length];

  return (
    <div style={{ marginBottom: 14 }} className="et-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)', fontWeight: 500,
        }}>{party}</span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 12, color: color, fontWeight: 500,
        }}>
          {votes.toLocaleString()} <span style={{ color: 'var(--muted)', fontSize: 10 }}>({pct.toFixed(1)}%)</span>
        </span>
      </div>
      <div style={{
        height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div
          className="et-bar"
          style={{
            '--bar-w': `${pct}%`,
            '--bar-delay': `${delay + 200}ms`,
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [newestId,   setNewestId]   = useState(null);
  const [flashStats, setFlashStats] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const flashTimer = useRef(null);

  const { connected, newResult, updatedResult } = useSocket();
  const { summary, results, loading, error }    = useSummary(refreshKey);

  useEffect(() => {
    if (!newResult) return;
    setRefreshKey((k) => k + 1);
    setNewestId(newResult.result?._id || null);
    setLastUpdate(new Date());
    setFlashStats(true);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashStats(false), 2000);
  }, [newResult]);

  useEffect(() => {
    if (!updatedResult) return;
    setRefreshKey((k) => k + 1);
  }, [updatedResult]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const parties        = summary?.parties        || [];
  const grandTotal     = summary?.grandTotal     || 0;
  const reportingUnits = summary?.reportingUnits || 0;
  const leader         = parties[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--mono)' }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="et-scanlines" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,11,0.92)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto',
          padding: '0 24px',
          height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Mark */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect width="22" height="22" rx="5" fill="var(--amber)" />
              <rect x="6" y="11" width="3" height="7" fill="#0a0a0b" />
              <rect x="10" y="7"  width="3" height="11" fill="#0a0a0b" />
              <rect x="14" y="4"  width="3" height="14" fill="#0a0a0b" />
            </svg>
            <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>
              ElectTrack
            </span>
            <span style={{ color: 'var(--border)', fontSize: 18, lineHeight: 1 }}>|</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              General Election 2025
            </span>
          </div>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {lastUpdate && (
              <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em' }}>
                ↻ {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            )}
            <LiveDot active={connected} />
          </div>
        </div>
      </header>

      {/* ── Hero strip ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #111114 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px 32px',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          {/* Eyebrow */}
          <p style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--amber)', marginBottom: 10,
          }}>
            ◆ Real-time national results · Live
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 32, justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--display)', fontSize: 'clamp(26px, 4vw, 48px)',
                fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
              }}>
                Election Results<br />
                <span style={{ color: 'var(--amber)' }}>Dashboard</span>
              </h1>
              {leader && (
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
                  Current leader —{' '}
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{leader.party}</span>
                  {' '}with{' '}
                  <span style={{ color: 'var(--amber)' }}>{leader.totalVotes.toLocaleString()}</span> votes
                  {grandTotal > 0 && (
                    <span style={{ color: 'var(--muted)' }}>
                      {' '}({((leader.totalVotes / grandTotal) * 100).toFixed(1)}%)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Top-4 ticker boxes */}
            {parties.length > 0 && (
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {parties.slice(0, 4).map((p, i) => {
                  const COLORS = ['var(--amber)', 'var(--green)', '#7c6af7', '#e85d75'];
                  return (
                    <div key={p.party} style={{
                      padding: '12px 18px',
                      background: i === 0 ? 'var(--amber-dim)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${i === 0 ? 'rgba(245,166,35,0.3)' : 'var(--border)'}`,
                      borderRadius: i === 0 ? '10px 0 0 10px' : i === 3 ? '0 10px 10px 0' : '0',
                      textAlign: 'center', minWidth: 80,
                    }}>
                      <p style={{
                        fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 500,
                        color: COLORS[i], letterSpacing: '-0.02em',
                      }}>
                        {p.totalVotes.toLocaleString()}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.1em' }}>
                        {p.party}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 24, padding: '12px 16px',
            background: 'rgba(232,93,117,0.08)',
            border: '1px solid rgba(232,93,117,0.25)',
            borderRadius: 8, fontSize: 12, color: '#e85d75',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ⚠ Failed to load results: {error}
          </div>
        )}

        {/* ── Stat row ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12, marginBottom: 32,
        }}>
          <StatBlock
            label="Total votes cast"
            value={grandTotal}
            sub={`${reportingUnits} unit${reportingUnits !== 1 ? 's' : ''} reporting`}
            accent="var(--green)"
            flash={flashStats}
          />
          <StatBlock
            label="Polling units"
            value={reportingUnits}
            sub="results submitted"
            accent="var(--amber)"
            flash={flashStats}
          />
          <StatBlock
            label="Parties contesting"
            value={parties.length}
            sub="with votes on record"
            accent="#7c6af7"
          />
          {leader ? (
            <StatBlock
              label={`${leader.party} leading`}
              value={leader.totalVotes}
              sub={`${grandTotal > 0 ? ((leader.totalVotes / grandTotal) * 100).toFixed(1) : 0}% vote share`}
              accent="var(--amber)"
              flash={flashStats}
            />
          ) : (
            <StatBlock label="Leader" value="—" sub="No results yet" />
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: 120, borderRadius: 12,
                background: 'linear-gradient(90deg, var(--surface) 25%, rgba(255,255,255,0.03) 50%, var(--surface) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.6s infinite',
              }} />
            ))}
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>

            {/* ── Row 1: Vote share breakdown + pie side-by-side ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>

              {/* Party vote bars */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 28px',
              }}>
                <SectionLabel>Vote share breakdown</SectionLabel>
                {parties.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>No data yet.</p>
                ) : (
                  parties.map((p, i) => (
                    <VoteShareBar
                      key={p.party}
                      party={p.party}
                      votes={p.totalVotes}
                      total={grandTotal}
                      rank={i}
                      delay={i * 80}
                    />
                  ))
                )}
              </div>

              {/* Existing PieChart — wrapped */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 28px',
              }}>
                <SectionLabel>Distribution</SectionLabel>
                <VotesPieChart parties={parties} grandTotal={grandTotal} />
              </div>
            </div>

            {/* ── Row 2: Bar chart full width ── */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '24px 28px',
            }}>
              <SectionLabel>Votes by party</SectionLabel>
              <VotesBarChart parties={parties} />
            </div>

            {/* ── Row 3: Live feed + leaderboard + table ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.6fr', gap: 16 }}>

              {/* Live feed */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 20px',
              }}>
                <SectionLabel>Live feed</SectionLabel>
                <LiveFeed results={results} newestId={newestId} />
              </div>

              {/* Leaderboard */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 20px',
              }}>
                <SectionLabel>Leaderboard</SectionLabel>
                <PartyLeaderboard parties={parties} grandTotal={grandTotal} />
              </div>

              {/* Results table */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 20px',
              }}>
                <SectionLabel>All results</SectionLabel>
                <ResultsTable results={results} newestId={newestId} />
              </div>
            </div>

          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && !error && (
          <div style={{
            marginTop: 32, padding: '80px 24px', textAlign: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗳</div>
            <h3 style={{
              fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700,
              marginBottom: 8,
            }}>Awaiting results</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 300, margin: '0 auto' }}>
              Results from polling units will appear here the moment agents submit them.
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13 }}>
            ElectTrack
            <span style={{ fontFamily: 'var(--mono)', fontWeight: 400, fontSize: 11, color: 'var(--muted)', marginLeft: 10 }}>
              Real-time election monitoring
            </span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 11, color: 'var(--muted)' }}>
            <LiveDot active={connected} />
            <span>{reportingUnits} unit{reportingUnits !== 1 ? 's' : ''} reporting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}