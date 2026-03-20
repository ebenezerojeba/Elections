import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { partyColor } from '../utils/partyColors';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE   = 10;
const STATUS_TABS = ['all', 'pending', 'verified', 'rejected'];

const STATUS_META = {
  verified: { bg: 'rgba(26,107,58,0.18)',  border: 'rgba(26,107,58,0.45)',  color: '#4ADE80' },
  pending:  { bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.35)', color: '#C9A84C' },
  rejected: { bg: 'rgba(220,38,38,0.12)',  border: 'rgba(220,38,38,0.35)',  color: '#F87171' },
};

// Breakpoints measured against the component's own container, not the window.
// xs  < 480  — phone / narrow sidebar    → card list, no table
// sm  480–767 — tablet / mid-width panel → table, fewer cols
// lg  768+   — full desktop panel        → table, all cols
const BP = { SM: 480, LG: 768 };

// ─── useContainerBreakpoint ───────────────────────────────────────────────────
// Attaches a ResizeObserver to `ref` and returns 'xs' | 'sm' | 'lg'.
// Initial value 'lg' prevents a flash on SSR / first paint.

function useContainerBreakpoint(ref) {
  const [bp, setBp] = useState('lg');

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setBp(w < BP.SM ? 'xs' : w < BP.LG ? 'sm' : 'lg');
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);

  return bp;
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const TH_BASE = {
  padding: '10px 12px',
  fontFamily: 'var(--mono)',
  fontSize: 9,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 500,
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border-2)',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

const TD_BASE = {
  padding: '11px 12px',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s    = (status || 'pending').toLowerCase();
  const meta = STATUS_META[s] || STATUS_META.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      border: `1px solid ${meta.border}`,
      background: meta.bg,
      color: meta.color,
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {s}
    </span>
  );
}

// ─── PartyPill ────────────────────────────────────────────────────────────────

function PartyPill({ party, votes, compact = false }) {
  const { bar, label } = partyColor(party, 0);
  const displayVotes   = compact && votes >= 1000
    ? `${(votes / 1000).toFixed(1)}k`
    : votes.toLocaleString();
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: compact ? 3 : 5,
      padding: compact ? '2px 6px' : '2px 8px',
      borderRadius: 4,
      background: `${bar}22`,
      border: `1px solid ${bar}55`,
      fontFamily: 'var(--mono)',
      fontSize: compact ? 9 : 10,
      whiteSpace: 'nowrap',
      color: label,
    }}>
      <span style={{ fontWeight: 600 }}>{party}</span>
      <span style={{ opacity: 0.72 }}>{displayVotes}</span>
    </span>
  );
}

// ─── SortIcon ─────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }) {
  return (
    <span style={{
      marginLeft: 4,
      fontSize: 10,
      color: active ? 'var(--apc-gold)' : 'rgba(184,223,200,0.22)',
      transition: 'color 0.2s',
    }}>
      {active ? (dir === 'asc' ? '↑' : '↓') : '⇅'}
    </span>
  );
}

// ─── Chevron ──────────────────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 4, flexShrink: 0,
      border: '1px solid var(--border)',
      color: open ? 'var(--apc-gold)' : 'var(--muted)',
      background: open ? 'rgba(201,168,76,0.1)' : 'transparent',
      fontSize: 11,
      transition: 'all 0.18s',
      transform: open ? 'rotate(180deg)' : 'none',
    }}>
      ▾
    </span>
  );
}

// ─── PartyBars — shared between ExpandedRow + MobileCard ─────────────────────

function PartyBars({ results = [], total = 0 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '10px 20px',
      marginBottom: 14,
    }}>
      {results.map((p, i) => {
        const pct            = total > 0 ? (p.votes / total) * 100 : 0;
        const { bar, label } = partyColor(p.party, i);
        return (
          <div key={p.party}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: 11, fontWeight: 700, color: label }}>
                {p.party}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                {p.votes.toLocaleString()} · {pct.toFixed(1)}%
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: bar, borderRadius: 2,
                transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MetaRow — shared between ExpandedRow + MobileCard ───────────────────────

function MetaRow({ result }) {
  const items = [
    ['State',     result.state],
    ['LGA',       result.lga],
    ['Ward',      result.ward],
    ['Agent',     result.agentName],
  ].filter(([, v]) => v);

  return (
    <div style={{
      paddingTop: 10, borderTop: '1px solid var(--border)',
      display: 'flex', flexWrap: 'wrap', gap: '5px 18px',
      fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)',
    }}>
      {items.map(([k, v]) => (
        <span key={k}>{k}: <span style={{ color: 'var(--text)' }}>{v}</span></span>
      ))}
      {result.submittedAt && (
        <span>{formatDistanceToNow(new Date(result.submittedAt), { addSuffix: true })}</span>
      )}
    </div>
  );
}

// ─── ExpandedRow (table variant) ──────────────────────────────────────────────

function ExpandedRow({ result, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '0 0 2px', background: 'var(--surface-3)' }}>
        <div style={{
          margin: '0 0 6px',
          padding: '16px 18px',
          borderLeft: '3px solid var(--apc-gold)',
          background: 'rgba(201,168,76,0.04)',
          animation: 'slide-up 0.22s ease both',
        }}>
          <PartyBars results={result.results} total={result.totalVotes} />
          <MetaRow result={result} />
        </div>
      </td>
    </tr>
  );
}

// ─── MobileCard (xs layout) ───────────────────────────────────────────────────

function MobileCard({ r, isNewest, isExpanded, onToggle }) {
  const topParties = r.results?.slice(0, 3) || [];
  const overflow   = (r.results?.length || 0) - 3;

  return (
    <div
      onClick={onToggle}
      style={{
        marginBottom: 8,
        borderRadius: 10,
        border: `1px solid ${isNewest
          ? 'rgba(201,168,76,0.45)'
          : isExpanded
          ? 'var(--border-2)'
          : 'var(--border)'}`,
        background: isNewest
          ? 'rgba(201,168,76,0.06)'
          : isExpanded
          ? 'var(--surface-2)'
          : 'var(--surface-3)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 8,
        padding: '11px 14px 8px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            {isNewest && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: '#4ADE80', boxShadow: '0 0 6px #4ADE8099',
              }} />
            )}
            <span style={{
              fontFamily: 'var(--display)', fontSize: 13, fontWeight: 700,
              color: isNewest ? 'var(--apc-gold2)' : 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {r.pollingUnit}
            </span>
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '2px 8px',
            fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)',
          }}>
            {r.state && <span>{r.state}</span>}
            {r.lga   && <span>{r.lga}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500,
              color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 4,
            }}>
              {(r.totalVotes || 0).toLocaleString()}
            </div>
            <StatusBadge status={r.status} />
          </div>
          <Chevron open={isExpanded} />
        </div>
      </div>

      {/* Party pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 14px 10px' }}>
        {topParties.map(p => (
          <PartyPill key={p.party} party={p.party} votes={p.votes} compact />
        ))}
        {overflow > 0 && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', alignSelf: 'center' }}>
            +{overflow}
          </span>
        )}
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div style={{
          padding: '12px 14px 14px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(201,168,76,0.03)',
          animation: 'slide-up 0.2s ease both',
        }}>
          <PartyBars results={r.results} total={r.totalVotes} />
          <MetaRow result={r} />
        </div>
      )}
    </div>
  );
}

// ─── PageBtn ──────────────────────────────────────────────────────────────────

function PageBtn({ label, onClick, disabled = false, active = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 30, height: 28, padding: '0 8px', borderRadius: 6,
        border: `1px solid ${active ? 'var(--apc-gold)' : 'var(--border)'}`,
        background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
        color: active ? 'var(--apc-gold)' : disabled ? 'rgba(184,223,200,0.18)' : 'var(--muted)',
        fontFamily: 'var(--mono)', fontSize: 10,
        fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function buildPageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  for (let n = Math.max(2, current - 1); n <= Math.min(total - 1, current + 1); n++) pages.push(n);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResultsTable({ results = [], newestId = null }) {
  const containerRef = useRef(null);
  const bp           = useContainerBreakpoint(containerRef); // 'xs' | 'sm' | 'lg'

  const [search,    setSearch]    = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [sortKey,   setSortKey]   = useState('submittedAt');
  const [sortDir,   setSortDir]   = useState('desc');
  const [page,      setPage]      = useState(1);
  const [expanded,  setExpanded]  = useState(null);

  // ── Status counts for tab badges
  const statusCounts = useMemo(() => {
    const c = { all: results.length, pending: 0, verified: 0, rejected: 0 };
    results.forEach(r => {
      const s = (r.status || 'pending').toLowerCase();
      if (c[s] !== undefined) c[s]++;
    });
    return c;
  }, [results]);

  // ── Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results.filter(r => {
      const matchSearch =
        r.pollingUnit?.toLowerCase().includes(q) ||
        r.agentName?.toLowerCase().includes(q)   ||
        r.state?.toLowerCase().includes(q)       ||
        r.lga?.toLowerCase().includes(q)         ||
        r.results?.some(p => p.party.toLowerCase().includes(q));
      const matchStatus =
        statusTab === 'all' ||
        (r.status || 'pending').toLowerCase() === statusTab;
      return matchSearch && matchStatus;
    });
  }, [results, search, statusTab]);

  // ── Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'submittedAt') { va = new Date(va); vb = new Date(vb); }
      if (sortKey === 'totalVotes')  { va = Number(va);   vb = Number(vb);   }
      if (va === vb) return 0;
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [filtered, sortKey, sortDir]);

  // ── Paginate
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage  = Math.min(page, pageCount);
  const paged     = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = useCallback((key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }, [sortKey]);

  const handleTabChange = useCallback((tab) => {
    setStatusTab(tab); setPage(1); setExpanded(null);
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => prev === id ? null : id);
  }, []);

  // ── Which columns to show per breakpoint
  const showLocation  = bp === 'lg';
  const showAgent     = bp === 'lg';
  const showStatus    = bp === 'sm' || bp === 'lg';
  const showSubmitted = bp === 'lg';

  // Total col count — used for ExpandedRow colSpan
  const colCount = 3 // unit + parties + total (always present)
    + (showLocation  ? 1 : 0)
    + (showAgent     ? 1 : 0)
    + (showStatus    ? 1 : 0)
    + (showSubmitted ? 1 : 0)
    + 1; // chevron

  // ── How many party pills to show in table rows
  const pillMax = bp === 'lg' ? 3 : 2;

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}
    >

      {/* ── Search ───────────────────────────────────────────────────── */}
      <input
        type="search"
        placeholder={bp === 'xs' ? 'Search…' : 'Search unit, agent, state, party…'}
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 12px', marginBottom: 10,
          background: 'var(--surface-2)',
          border: '1px solid var(--border-2)', borderRadius: 8,
          color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12,
          outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--apc-gold)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border-2)'}
      />

      {/* ── Status tabs ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 5, flexWrap: 'wrap',
        alignItems: 'center', marginBottom: 14,
      }}>
        {STATUS_TABS.map(tab => {
          const active = statusTab === tab;
          const meta   = STATUS_META[tab];
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              style={{
                display: 'inline-flex', alignItems: 'center',
                gap: 5, padding: bp === 'xs' ? '4px 9px' : '5px 12px',
                borderRadius: 6,
                border: `1px solid ${active ? (meta ? meta.border : 'var(--apc-gold)') : 'var(--border)'}`,
                background: active ? (meta ? meta.bg : 'rgba(201,168,76,0.1)') : 'transparent',
                color: active ? (meta ? meta.color : 'var(--apc-gold)') : 'var(--muted)',
                fontFamily: 'var(--mono)', fontSize: bp === 'xs' ? 9 : 10,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
              }}
            >
              {tab}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 16, height: 15, padding: '0 3px', borderRadius: 3,
                background: active
                  ? (meta ? `${meta.color}22` : 'rgba(201,168,76,0.15)')
                  : 'rgba(255,255,255,0.05)',
                color: active ? (meta ? meta.color : 'var(--apc-gold)') : 'var(--muted)',
                fontSize: 9, fontWeight: 600,
              }}>
                {statusCounts[tab] ?? 0}
              </span>
            </button>
          );
        })}
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)',
        }}>
          {filtered.length} rec{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ══ xs: Card list ═════════════════════════════════════════════ */}
      {bp === 'xs' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {paged.length === 0 ? (
            <div style={{
              padding: '40px 0', textAlign: 'center',
              fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)',
            }}>
              {search || statusTab !== 'all' ? 'No results match your filter' : 'No results yet'}
            </div>
          ) : (
            paged.map(r => (
              <MobileCard
                key={r._id}
                r={r}
                isNewest={r._id === newestId}
                isExpanded={expanded === r._id}
                onToggle={() => toggleExpand(r._id)}
              />
            ))
          )}
        </div>
      )}

      {/* ══ sm + lg: Table ════════════════════════════════════════════ */}
      {bp !== 'xs' && (
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 0 }}>

            <thead>
              <tr>
                {/* Unit — always */}
                <th
                  style={{ ...TH_BASE, cursor: 'pointer' }}
                  onClick={() => toggleSort('pollingUnit')}
                >
                  Unit <SortIcon active={sortKey === 'pollingUnit'} dir={sortDir} />
                </th>

                {/* Location — lg only */}
                {showLocation && <th style={TH_BASE}>Location</th>}

                {/* Agent — lg only */}
                {showAgent && <th style={TH_BASE}>Agent</th>}

                {/* Parties — always */}
                <th style={TH_BASE}>Parties</th>

                {/* Total — always */}
                <th
                  style={{ ...TH_BASE, cursor: 'pointer' }}
                  onClick={() => toggleSort('totalVotes')}
                >
                  Total <SortIcon active={sortKey === 'totalVotes'} dir={sortDir} />
                </th>

                {/* Status — sm + lg */}
                {showStatus && (
                  <th
                    style={{ ...TH_BASE, cursor: 'pointer' }}
                    onClick={() => toggleSort('status')}
                  >
                    Status <SortIcon active={sortKey === 'status'} dir={sortDir} />
                  </th>
                )}

                {/* Submitted — lg only */}
                {showSubmitted && (
                  <th
                    style={{ ...TH_BASE, cursor: 'pointer' }}
                    onClick={() => toggleSort('submittedAt')}
                  >
                    Submitted <SortIcon active={sortKey === 'submittedAt'} dir={sortDir} />
                  </th>
                )}

                {/* Chevron — always */}
                <th style={{ ...TH_BASE, width: 36, padding: '10px 8px' }} />
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={colCount} style={{
                    ...TD_BASE,
                    textAlign: 'center', padding: '48px 24px',
                    fontFamily: 'var(--mono)', fontSize: 12,
                    color: 'var(--muted)', border: 'none',
                  }}>
                    {search || statusTab !== 'all' ? 'No results match your filter' : 'No results yet'}
                  </td>
                </tr>
              ) : (
                paged.map(r => {
                  const isNewest   = r._id === newestId;
                  const isExpanded = expanded === r._id;
                  const topParties = r.results?.slice(0, pillMax) || [];
                  const overflow   = (r.results?.length || 0) - pillMax;

                  const rowBg = isNewest
                    ? 'rgba(201,168,76,0.06)'
                    : isExpanded ? 'var(--surface-2)' : 'transparent';

                  // When expanded, suppress bottom border on data row so it merges
                  // visually with the expanded panel below
                  const tdX = {
                    ...TD_BASE,
                    borderBottom: isExpanded
                      ? '1px solid transparent'
                      : TD_BASE.borderBottom,
                  };

                  return (
                    <>
                      <tr
                        key={r._id}
                        onClick={() => toggleExpand(r._id)}
                        style={{ cursor: 'pointer', background: rowBg, transition: 'background 0.18s' }}
                        onMouseEnter={e => {
                          if (!isNewest && !isExpanded)
                            e.currentTarget.style.background = 'var(--surface-3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = rowBg;
                        }}
                      >
                        {/* Unit */}
                        <td style={{ ...tdX, maxWidth: bp === 'sm' ? 140 : 220 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            {isNewest && (
                              <span style={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                background: '#4ADE80', boxShadow: '0 0 6px #4ADE8099',
                              }} />
                            )}
                            <span style={{
                              fontFamily: 'var(--display)',
                              fontSize: bp === 'sm' ? 11 : 12,
                              fontWeight: 700,
                              color: isNewest ? 'var(--apc-gold2)' : 'var(--text)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {r.pollingUnit}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        {showLocation && (
                          <td style={tdX}>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', lineHeight: 1.8 }}>
                              {r.state && <div>{r.state}</div>}
                              {r.lga   && <div style={{ opacity: 0.7 }}>{r.lga}</div>}
                            </div>
                          </td>
                        )}

                        {/* Agent */}
                        {showAgent && (
                          <td style={{ ...tdX, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                            {r.agentName || '—'}
                          </td>
                        )}

                        {/* Parties */}
                        <td style={tdX}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {topParties.map(p => (
                              <PartyPill
                                key={p.party}
                                party={p.party}
                                votes={p.votes}
                                compact={bp === 'sm'}
                              />
                            ))}
                            {overflow > 0 && (
                              <span style={{
                                fontFamily: 'var(--mono)', fontSize: 10,
                                color: 'var(--muted)', alignSelf: 'center',
                              }}>
                                +{overflow}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td style={tdX}>
                          <span style={{
                            fontFamily: 'var(--mono)',
                            fontSize: bp === 'sm' ? 12 : 13,
                            fontWeight: 500, color: 'var(--text)',
                            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                          }}>
                            {(r.totalVotes || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Status */}
                        {showStatus && (
                          <td style={tdX}><StatusBadge status={r.status} /></td>
                        )}

                        {/* Submitted */}
                        {showSubmitted && (
                          <td style={{
                            ...tdX, fontFamily: 'var(--mono)',
                            fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap',
                          }}>
                            {r.submittedAt
                              ? formatDistanceToNow(new Date(r.submittedAt), { addSuffix: true })
                              : '—'}
                          </td>
                        )}

                        {/* Chevron */}
                        <td style={{ ...tdX, textAlign: 'right', padding: '11px 8px' }}>
                          <Chevron open={isExpanded} />
                        </td>
                      </tr>

                      {isExpanded && (
                        <ExpandedRow
                          key={`${r._id}-exp`}
                          result={r}
                          colSpan={colCount}
                        />
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {pageCount > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 14, marginTop: 10,
          borderTop: '1px solid var(--border)',
          gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            color: 'var(--muted)', whiteSpace: 'nowrap',
          }}>
            {bp === 'xs'
              ? `${safePage} / ${pageCount}`
              : `Page ${safePage} of ${pageCount} · ${filtered.length} results`}
          </span>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <PageBtn
              label="← Prev"
              disabled={safePage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            />

            {/* Page number pills hidden on xs — prev/next is enough */}
            {bp !== 'xs' && buildPageWindow(safePage, pageCount).map((n, i) =>
              n === '…' ? (
                <span key={`e${i}`} style={{
                  padding: '0 3px',
                  fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)',
                }}>…</span>
              ) : (
                <PageBtn
                  key={n}
                  label={String(n)}
                  active={n === safePage}
                  onClick={() => setPage(n)}
                />
              )
            )}

            <PageBtn
              label="Next →"
              disabled={safePage === pageCount}
              onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
}