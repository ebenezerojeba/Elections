import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useSocket } from '../hooks/useSocket';
import { useSummary } from '../hooks/useSummary';
import VotesBarChart from '../components/VotesBarChart';
import VotesPieChart from '../components/VotesPieChart';
import LiveFeed from '../components/LiveFeed';
import ResultsTable from '../components/ResultsTable';

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES — APC Nigeria War Room
   Palette:
     --apc-green:  #1A6B3A  (party primary — forest green)
     --apc-dark:   #0D3D20  (deep forest — surfaces)
     --apc-gold:   #C9A84C  (wheat/broom motif accent)
     --bg:         #060E09  (near-black, green undertone)
   Fonts: Bricolage Grotesque (display) + DM Mono (data)
───────────────────────────────────────────────────────────────────────────── */
const STYLE_ID = 'apc-warroom-v3';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --apc-green:  #1A6B3A;
      --apc-mid:    #145730;
      --apc-dark:   #0D3D20;
      --apc-gold:   #C9A84C;
      --apc-gold2:  #E8C76A;
      --apc-light:  #B8DFC8;
      --bg:         #060E09;
      --surface:    #0C1A10;
      --surface-2:  #112016;
      --surface-3:  #162B1C;
      --border:     rgba(26,107,58,0.22);
      --border-2:   rgba(26,107,58,0.42);
      --muted:      rgba(184,223,200,0.42);
      --text:       #D4EDE0;
      --mono:       'DM Mono', monospace;
      --display:    'Bricolage Grotesque', sans-serif;
    }

    body::after {
      content: '';
      position: fixed; inset: 0; z-index: 9999; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.025'/%3E%3C/svg%3E");
    }

    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.9; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes bar-in {
      from { width: 0; }
      to   { width: var(--w); }
    }
    @keyframes count-flash {
      0%,100% { color: var(--text); }
      50%     { color: var(--apc-gold2); }
    }
    @keyframes border-flash {
      0%,100% { border-color: var(--border); }
      45%     { border-color: var(--apc-gold); box-shadow: 0 0 24px rgba(201,168,76,0.18); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes ticker-scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes blink {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.25; }
    }
    @keyframes new-row {
      from { background: rgba(201,168,76,0.1); }
      to   { background: transparent; }
    }

    .apc-slide-up  { animation: slide-up 0.48s cubic-bezier(0.22,1,0.36,1) both; }
    .apc-bar       { animation: bar-in 1.2s cubic-bezier(0.22,1,0.36,1) both; animation-delay: var(--delay,0ms); }
    .apc-flash     { animation: border-flash 0.7s ease 2; }
    .apc-count-pop { animation: count-flash 0.5s ease; }
    .apc-new-row   { animation: new-row 3.5s ease forwards; }

    ::-webkit-scrollbar             { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track       { background: var(--surface); }
    ::-webkit-scrollbar-thumb       { background: var(--apc-mid); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--apc-green); }

    .ticker-track {
      display: flex;
      animation: ticker-scroll 35s linear infinite;
      width: max-content;
    }
    .ticker-track:hover { animation-play-state: paused; }
  `;
  document.head.appendChild(s);
}

/* ── Party colour map ──────────────────────────────────────────────── */
const PARTY_PALETTE = {
  APC:  { bar: '#1A6B3A', glow: 'rgba(26,107,58,0.55)',  label: '#4ADE80' },
  PDP:  { bar: '#1d4ed8', glow: 'rgba(29,78,216,0.45)',  label: '#93C5FD' },
  LP:   { bar: '#b45309', glow: 'rgba(180,83,9,0.45)',   label: '#FCD34D' },
  NNPP: { bar: '#7c3aed', glow: 'rgba(124,58,237,0.45)', label: '#C4B5FD' },
};
const FALLBACKS = [
  { bar: '#0e7490', glow: 'rgba(14,116,144,0.4)',  label: '#67E8F9' },
  { bar: '#be185d', glow: 'rgba(190,24,93,0.4)',   label: '#F9A8D4' },
  { bar: '#4d7c0f', glow: 'rgba(77,124,15,0.4)',   label: '#BEF264' },
  { bar: '#92400e', glow: 'rgba(146,64,14,0.4)',   label: '#FDE68A' },
];
const partyColor = (party, rank) =>
  PARTY_PALETTE[(party || '').toUpperCase().trim()] || FALLBACKS[rank % FALLBACKS.length];

/* ── SVG broom mark ───────────────────────────────────────────────── */
function APCMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="7" fill="#1A6B3A" />
      <line x1="16" y1="5" x2="16" y2="24" stroke="#C9A84C" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 21 Q12 17 16 25 Q20 17 24 21" stroke="#C9A84C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[10,13,16,19,22].map((x, i) => (
        <line key={i} x1={x} y1={21 + (i===2?0:1)} x2={x - 1 + (i > 2 ? 2 : 0)} y2={26}
          stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/* ── Live pulse ───────────────────────────────────────────────────── */
function LivePulse({ active }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span style={{ position: 'relative', width: 9, height: 9, flexShrink: 0 }}>
        <span style={{
          display: 'block', width: 9, height: 9, borderRadius: '50%',
          background: active ? '#4ADE80' : '#374151',
          boxShadow: active ? '0 0 8px #4ADE8099' : 'none',
        }} />
        {active && (
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1.5px solid #4ADE80',
            animation: 'pulse-ring 1.7s ease-out infinite',
          }} />
        )}
      </span>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
        textTransform: 'uppercase', fontWeight: 500,
        color: active ? '#4ADE80' : '#4B5563',
      }}>
        {active ? 'Live' : 'Offline'}
      </span>
    </span>
  );
}

/* ── Section header ───────────────────────────────────────────────── */
function SectionHeader({ label, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{
          display: 'block', width: 3, height: 13, borderRadius: 2,
          background: 'var(--apc-gold)',
          boxShadow: '0 0 8px rgba(201,168,76,0.45)',
        }} />
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--apc-gold)', fontWeight: 500,
        }}>
          {label}
        </span>
      </div>
      {right && (
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
          {right}
        </span>
      )}
    </div>
  );
}

/* ── Stat block ───────────────────────────────────────────────────── */
function StatBlock({ label, value, sub, accent, flash, index = 0 }) {
  const fmt = typeof value === 'number' ? value.toLocaleString() : (value ?? '—');
  return (
    <div
      className={`apc-slide-up${flash ? ' apc-flash' : ''}`}
      style={{
        animationDelay: `${index * 80}ms`,
        padding: '22px 24px 20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.4s, box-shadow 0.4s',
      }}
    >
      <span style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent || 'var(--apc-green)',
        borderRadius: '14px 14px 0 0',
      }} />
      <span style={{
        position: 'absolute', right: 14, top: 10,
        fontFamily: 'var(--mono)', fontSize: 52,
        color: 'rgba(26,107,58,0.07)', fontWeight: 800,
        lineHeight: 1, userSelect: 'none', transform: 'rotate(-6deg)',
      }}>
        {typeof value === 'number' ? String(value).slice(0, 2) : ''}
      </span>
      <p style={{
        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10,
      }}>
        {label}
      </p>
      <p
        className={flash ? 'apc-count-pop' : ''}
        style={{
          fontFamily: 'var(--display)', fontSize: 'clamp(24px, 3vw, 34px)',
          fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.03em',
        }}
      >
        {fmt}
      </p>
      {sub && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Vote share bar ───────────────────────────────────────────────── */
function VoteBar({ party, votes, total, rank, delay, isLeader }) {
  const pct = total > 0 ? (votes / total) * 100 : 0;
  const { bar, glow, label } = partyColor(party, rank);
  return (
    <div className="apc-slide-up" style={{ animationDelay: `${delay}ms`, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isLeader && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
              background: 'var(--apc-gold)', color: '#060E09',
              padding: '2px 7px', borderRadius: 3, fontWeight: 600,
              textTransform: 'uppercase',
            }}>Leading</span>
          )}
          <span style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {party}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 500, color: label }}>
            {votes.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          className="apc-bar"
          style={{
            '--w': `${pct}%`, '--delay': `${delay + 200}ms`,
            width: `${pct}%`, height: '100%', background: bar,
            borderRadius: 3, boxShadow: `0 0 10px ${glow}`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Leaderboard row ──────────────────────────────────────────────── */
function LeaderRow({ rank, party, votes, total, delay }) {
  const pct = total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
  const { bar, label } = partyColor(party, rank - 1);
  return (
    <div
      className="apc-slide-up"
      style={{
        animationDelay: `${delay}ms`,
        display: 'grid', gridTemplateColumns: '26px 1fr auto',
        alignItems: 'center', gap: 12,
        padding: '10px 0', borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11, textAlign: 'center',
        color: rank === 1 ? 'var(--apc-gold)' : 'var(--muted)',
        fontWeight: rank === 1 ? 600 : 400,
      }}>
        {rank === 1 ? '◆' : `#${rank}`}
      </span>
      <div>
        <p style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 700, color: rank === 1 ? label : 'var(--text)' }}>
          {party}
        </p>
        <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div className="apc-bar" style={{ '--w': `${pct}%`, '--delay': `${delay + 300}ms`, width: `${pct}%`, height: '100%', background: bar }} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: label, fontWeight: 500 }}>
          {votes.toLocaleString()}
        </p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
          {pct}%
        </p>
      </div>
    </div>
  );
}

/* ── Event feed item ──────────────────────────────────────────────── */
function EventItem({ result, isNew }) {
  return (
    <div
      className={isNew ? 'apc-new-row' : ''}
      style={{
        padding: '10px 14px', marginBottom: 8,
        borderLeft: `3px solid ${isNew ? 'var(--apc-gold)' : 'var(--border-2)'}`,
        background: 'var(--surface-3)',
        borderRadius: '0 8px 8px 0',
        transition: 'border-color 0.4s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
          {result?.pollingUnit || result?.ward || 'Polling Unit'}
        </span>
        {isNew && (
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em',
            background: 'rgba(201,168,76,0.12)', color: 'var(--apc-gold)',
            border: '1px solid rgba(201,168,76,0.28)',
            padding: '1px 6px', borderRadius: 3,
            animation: 'blink 1s ease 4',
          }}>
            NEW
          </span>
        )}
      </div>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
        {result?.state && <span>{result.state} · </span>}
        {result?.lga && <span>{result.lga} · </span>}
        <span style={{ color: 'var(--apc-light)' }}>
          {(result?.totalVotes || 0).toLocaleString()} votes
        </span>
      </p>
    </div>
  );
}

/* ── Ticker ───────────────────────────────────────────────────────── */
function Ticker({ parties, grandTotal }) {
  if (!parties.length) return null;
  const items = [...parties, ...parties];
  return (
    <div style={{ overflow: 'hidden', background: 'var(--apc-dark)', borderBottom: '1px solid var(--border)' }}>
      <div className="ticker-track" style={{ padding: '7px 0' }}>
        {items.map((p, i) => {
          const pct = grandTotal > 0 ? ((p.totalVotes / grandTotal) * 100).toFixed(1) : '0.0';
          const { label } = partyColor(p.party, i % parties.length);
          return (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '0 24px', borderRight: '1px solid var(--border)',
              fontFamily: 'var(--mono)', fontSize: 11, whiteSpace: 'nowrap',
            }}>
              <span style={{ fontWeight: 600, color: label }}>{p.party}</span>
              <span style={{ color: 'var(--text)' }}>{p.totalVotes.toLocaleString()}</span>
              <span style={{ color: 'var(--muted)' }}>({pct}%)</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */
function Skeleton({ h = 120, delay = 0 }) {
  return (
    <div style={{
      height: h, borderRadius: 14,
      background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%)',
      backgroundSize: '200% 100%',
      animation: `shimmer 1.9s ease infinite`,
      animationDelay: `${delay}ms`,
    }} />
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [newestId,   setNewestId]   = useState(null);
  const [flashStats, setFlashStats] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [eventLog,   setEventLog]   = useState([]);
  const [clock,      setClock]      = useState(new Date());
  const flashTimer = useRef(null);

  const { connected, newResult, updatedResult } = useSocket();
  const { summary, results, loading, error }    = useSummary(refreshKey);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!newResult) return;
    setRefreshKey(k => k + 1);
    setNewestId(newResult.result?._id || null);
    setLastUpdate(new Date());
    setFlashStats(true);
    setEventLog(log => [newResult.result, ...log].slice(0, 25));
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashStats(false), 2500);
  }, [newResult]);

  useEffect(() => {
    if (!updatedResult) return;
    setRefreshKey(k => k + 1);
  }, [updatedResult]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const parties        = summary?.parties        || [];
  const grandTotal     = summary?.grandTotal     || 0;
  const reportingUnits = summary?.reportingUnits || 0;
  const leader         = parties[0];
  const apcData        = parties.find(p => (p.party || '').toUpperCase() === 'APC');
  const apcPct         = grandTotal > 0 && apcData
    ? ((apcData.totalVotes / grandTotal) * 100).toFixed(1) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--mono)' }}>

      {/* ═══ HEADER ═══════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,14,9,0.96)',
        borderBottom: '1px solid var(--border-2)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          maxWidth: 1600, margin: '0 auto', padding: '0 24px',
          height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <APCMark size={32} />
            <div>
              <p style={{
                fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16,
                color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.1,
              }}>
                APC Results Centre
              </p>
              <p style={{
                fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)',
                letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 1,
              }}>
                All Progressives Congress
              </p>
            </div>
          </div>

          {/* APC headline stat */}
          {apcData && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
              padding: '8px 20px',
              background: 'rgba(26,107,58,0.1)',
              border: '1px solid rgba(26,107,58,0.28)',
              borderRadius: 10,
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--display)', fontSize: 21, fontWeight: 800,
                  color: '#4ADE80', letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  {apcData.totalVotes.toLocaleString()}
                </p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', marginTop: 2 }}>
                  APC VOTES
                </p>
              </div>
              {apcPct && (
                <>
                  <span style={{ width: 1, height: 28, background: 'var(--border-2)', flexShrink: 0 }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontFamily: 'var(--display)', fontSize: 21, fontWeight: 800,
                      color: 'var(--apc-gold)', letterSpacing: '-0.03em', lineHeight: 1,
                    }}>
                      {apcPct}%
                    </p>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', marginTop: 2 }}>
                      VOTE SHARE
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Clock + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                {format(clock, 'HH:mm:ss')}
              </p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>
                {format(clock, 'dd MMM yyyy')}
              </p>
            </div>
            <span style={{ width: 1, height: 28, background: 'var(--border)' }} />
            <LivePulse active={connected} />
          </div>
        </div>
      </header>

      {/* ═══ TICKER ═══════════════════════════════════════════════════ */}
      <Ticker parties={parties} grandTotal={grandTotal} />

      {/* ═══ HERO BAND ════════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '36px 24px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Watermark */}
        <span style={{
          position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--display)', fontWeight: 800, fontSize: '13vw',
          color: 'rgba(26,107,58,0.05)', lineHeight: 1,
          userSelect: 'none', letterSpacing: '-0.04em', pointerEvents: 'none',
        }}>
          APC
        </span>

        <div style={{ maxWidth: 1600, margin: '0 auto', position: 'relative' }}>
          <p style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--apc-gold)',
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 1, background: 'var(--apc-gold)' }} />
            General Election 
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--display)',
                fontSize: 'clamp(28px, 4vw, 52px)',
                fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em',
                color: 'var(--text)',
              }}>
                Live Election<br />
                <span style={{ color: 'var(--apc-gold)', textShadow: '0 0 40px rgba(201,168,76,0.22)' }}>
                  Results Dashboard
                </span>
              </h1>
              {leader && (
                <p style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
                  Current leader —{' '}
                  <span style={{ color: partyColor(leader.party, 0).label, fontWeight: 500 }}>{leader.party}</span>
                  {' · '}
                  <span style={{ color: 'var(--text)' }}>{leader.totalVotes.toLocaleString()} votes</span>
                  {grandTotal > 0 && (
                    <span> ({((leader.totalVotes / grandTotal) * 100).toFixed(1)}%)</span>
                  )}
                  {lastUpdate && (
                    <span style={{ marginLeft: 16 }}>
                      · Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Top-5 party pills */}
            {parties.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {parties.slice(0, 5).map((p, i) => {
                  const { bar, label } = partyColor(p.party, i);
                  const isAPC = (p.party || '').toUpperCase() === 'APC';
                  return (
                    <div key={p.party} style={{
                      padding: '14px 20px', textAlign: 'center', minWidth: 88,
                      background: isAPC ? 'rgba(26,107,58,0.18)' : 'var(--surface)',
                      border: `1px solid ${isAPC ? 'rgba(26,107,58,0.55)' : 'var(--border)'}`,
                      borderTop: `3px solid ${bar}`,
                      borderRadius: 12,
                    }}>
                      <p style={{
                        fontFamily: 'var(--display)', fontSize: 19, fontWeight: 800,
                        color: label, letterSpacing: '-0.03em', lineHeight: 1,
                      }}>
                        {p.totalVotes.toLocaleString()}
                      </p>
                      <p style={{
                        fontFamily: 'var(--mono)', fontSize: 10, marginTop: 5, letterSpacing: '0.1em',
                        color: isAPC ? 'var(--apc-light)' : 'var(--muted)',
                        fontWeight: isAPC ? 500 : 400,
                      }}>
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

      {/* ═══ MAIN CONTENT ═════════════════════════════════════════════ */}
      <main style={{ maxWidth: 1600, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 16px',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 10, fontSize: 12, color: '#FCA5A5',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            ⚠ Failed to load results — {error}
          </div>
        )}

        {/* Stat row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 12, marginBottom: 24,
        }}>
          <StatBlock label="Total votes cast" value={grandTotal}
            sub={`${reportingUnits} unit${reportingUnits !== 1 ? 's' : ''} reporting`}
            accent="var(--apc-green)" flash={flashStats} index={0} />
          <StatBlock label="Units reporting" value={reportingUnits}
            sub="Results submitted" accent="var(--apc-gold)" flash={flashStats} index={1} />
          <StatBlock label="Parties on record" value={parties.length}
            sub="Contested parties" accent="#3b82f6" index={2} />
          {leader ? (
            <StatBlock label="Current leader" value={leader.party}
              sub={`${leader.totalVotes.toLocaleString()} votes · ${grandTotal > 0 ? ((leader.totalVotes / grandTotal) * 100).toFixed(1) : 0}%`}
              accent={partyColor(leader.party, 0).bar} flash={flashStats} index={3} />
          ) : (
            <StatBlock label="Current leader" value="—" sub="Awaiting results" index={3} />
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[180, 240, 160].map((h, i) => <Skeleton key={i} h={h} delay={i * 120} />)}
          </div>
        )}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Row 1: Vote share + Leaderboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 14 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 28px' }}>
                <SectionHeader label="Vote share breakdown" right={`${parties.length} parties`} />
                {parties.length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--muted)', padding: '20px 0' }}>No data yet.</p>
                  : parties.map((p, i) => (
                    <VoteBar key={p.party} party={p.party} votes={p.totalVotes}
                      total={grandTotal} rank={i} delay={i * 90} isLeader={i === 0} />
                  ))
                }
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 24px' }}>
                <SectionHeader label="Party standings" />
                {parties.length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--muted)', padding: '20px 0' }}>No data yet.</p>
                  : parties.slice(0, 8).map((p, i) => (
                    <LeaderRow key={p.party} rank={i + 1} party={p.party}
                      votes={p.totalVotes} total={grandTotal} delay={i * 70} />
                  ))
                }
              </div>
            </div>

            {/* Row 2: Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 14 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 28px' }}>
                <SectionHeader label="Votes by party" right="Bar chart" />
                <VotesBarChart parties={parties} />
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 28px' }}>
                <SectionHeader label="Vote distribution" right="Pie chart" />
                <VotesPieChart parties={parties} grandTotal={grandTotal} />
              </div>
            </div>

            {/* Row 3: Activity + Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 14 }}>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px 20px',
                maxHeight: 480, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                <SectionHeader label="Live activity" right={connected ? '● Receiving' : '○ Paused'} />
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
                  {(eventLog.length > 0 ? eventLog : results.slice(0, 12)).map((r, i) => (
                    <EventItem key={r?._id || i} result={r || {}} isNew={i === 0 && flashStats} />
                  ))}
                  {!eventLog.length && !results.length && (
                    <p style={{ fontSize: 12, color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>
                      Waiting for submissions…
                    </p>
                  )}
                </div>
              </div>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px 20px',
                maxHeight: 480, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}>
                <SectionHeader label="All submitted results" right={`${results.length} records`} />
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  <ResultsTable results={results} newestId={newestId} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && !error && (
          <div style={{
            marginTop: 28, padding: '80px 24px', textAlign: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          }}>
            <div style={{ marginBottom: 20, display: 'inline-block' }}><APCMark size={52} /></div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Awaiting First Results
            </h3>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', maxWidth: 340, margin: '0 auto', lineHeight: 1.8 }}>
              As field agents submit results from their polling units, they will appear here in real-time.
            </p>
            <div style={{ marginTop: 20 }}><LivePulse active={connected} /></div>
          </div>
        )}
      </main>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '14px 24px' }}>
        <div style={{
          maxWidth: 1600, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <APCMark size={20} />
            <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
              APC Results Centre
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
              All Progressives Congress · Nigeria
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
            <LivePulse active={connected} />
            <span>{reportingUnits} unit{reportingUnits !== 1 ? 's' : ''} reporting</span>
            <span>{format(clock, 'HH:mm · dd MMM yyyy')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}