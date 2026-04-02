
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Party colour config (matches Dashboard palette) ────────────────────────
const PARTY_META = {
  APC:  { bg: '#006B35', text: '#4ADE80', badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' },
  PDP:  { bg: '#1D4ED8', text: '#93C5FD', badge: 'bg-blue-900/60 text-blue-300 border-blue-700/50' },
  LP:   { bg: '#B45309', text: '#FCD34D', badge: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
  NNPP: { bg: '#7C3AED', text: '#C4B5FD', badge: 'bg-purple-900/60 text-purple-300 border-purple-700/50' },
};
const FALLBACK_BADGE = 'bg-slate-800/60 text-slate-300 border-slate-600/50';

function partyMeta(party) {
  return PARTY_META[(party || '').toUpperCase().trim()] || { bg: '#475569', text: '#CBD5E1', badge: FALLBACK_BADGE };
}

const fmt = (n) => (n ?? 0).toLocaleString();
const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) : '0.0');

// ─── Tiny inline bar ─────────────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-1" style={{ minWidth: 48 }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${w}%`, background: color }}
      />
    </div>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────
const STATUS = {
  verified: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/40',
  pending:  'bg-amber-900/50  text-amber-300  border-amber-700/40',
  rejected: 'bg-red-900/50   text-red-300    border-red-700/40',
};
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider border ${STATUS[status] || STATUS.pending}`}>
      {status}
    </span>
  );
}

// ─── Ward row (inside expanded LGA panel) ───────────────────────────────────
function WardRow({ ward, result, isNewest, maxApc, rank }) {
  const isNew = isNewest;
  const hasResult = !!result;
  const apcVotes   = result?.results?.find((r) => r.party === 'APC')?.votes ?? 0;
  const pdpVotes   = result?.results?.find((r) => r.party === 'PDP')?.votes ?? 0;
  const lpVotes    = result?.results?.find((r) => r.party === 'LP')?.votes  ?? 0;
  const totalVotes = result?.totalVotes ?? 0;

  return (
    <tr
      className={`
        border-b border-white/5 transition-colors duration-300
        ${isNew ? 'animate-[new-ward_3s_ease_forwards]' : ''}
        ${hasResult ? 'hover:bg-white/[0.03]' : 'opacity-50'}
      `}
    >
      {/* Rank + Ward name */}
      <td className="pl-10 pr-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`
              flex-shrink-0 w-5 h-5 rounded flex items-center justify-center
              text-[9px] font-mono font-bold border
              ${rank <= 3
                ? 'bg-amber-900/30 text-amber-400 border-amber-700/40'
                : 'bg-white/5 text-slate-500 border-white/10'}
            `}
          >
            {rank}
          </span>
          <div>
            <p className="text-[11px] font-semibold text-slate-200 leading-tight">{ward.name}</p>
            <p className="text-[9px] text-slate-600 font-mono mt-0.5">{ward.code}</p>
          </div>
        </div>
      </td>

      {/* APC */}
      <td className="px-3 py-2.5 text-right">
        {hasResult ? (
          <div>
            <span className="text-[12px] font-bold text-emerald-400 font-mono">{fmt(apcVotes)}</span>
            <MiniBar value={apcVotes} max={maxApc} color="#006B35" />
          </div>
        ) : <span className="text-slate-600 text-[10px]">—</span>}
      </td>

      {/* APC % */}
      <td className="px-3 py-2.5 text-right">
        {hasResult
          ? <span className="text-[11px] font-mono text-amber-400">{pct(apcVotes, totalVotes)}%</span>
          : <span className="text-slate-600 text-[10px]">—</span>}
      </td>

      {/* PDP */}
      <td className="px-3 py-2.5 text-right hidden sm:table-cell">
        {hasResult
          ? <span className="text-[11px] font-mono text-blue-400">{fmt(pdpVotes)}</span>
          : <span className="text-slate-600 text-[10px]">—</span>}
      </td>

      {/* LP */}
      <td className="px-3 py-2.5 text-right hidden md:table-cell">
        {hasResult
          ? <span className="text-[11px] font-mono text-amber-300">{fmt(lpVotes)}</span>
          : <span className="text-slate-600 text-[10px]">—</span>}
      </td>

      {/* Total */}
      <td className="px-3 py-2.5 text-right hidden lg:table-cell">
        {hasResult
          ? <span className="text-[11px] font-mono text-slate-400">{fmt(totalVotes)}</span>
          : <span className="text-slate-600 text-[10px]">—</span>}
      </td>

      {/* Status */}
      <td className="px-3 py-2.5 text-right">
        {hasResult
          ? <StatusBadge status={result.status} />
          : (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />
              Awaiting
            </span>
          )}
      </td>
    </tr>
  );
}

// ─── LGA Totals row (pinned at bottom of expanded ward list) ─────────────────
function LGATotalsRow({ results, wardCount }) {
  const apc   = results.reduce((s, r) => s + (r.results?.find(p => p.party === 'APC')?.votes ?? 0), 0);
  const pdp   = results.reduce((s, r) => s + (r.results?.find(p => p.party === 'PDP')?.votes ?? 0), 0);
  const lp    = results.reduce((s, r) => s + (r.results?.find(p => p.party === 'LP')?.votes  ?? 0), 0);
  const total = results.reduce((s, r) => s + (r.totalVotes ?? 0), 0);

  return (
    <tr className="border-t border-emerald-900/40 bg-emerald-950/20">
      <td className="pl-10 pr-3 py-2.5">
        <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-500 uppercase">
          LGA Total · {results.length}/{wardCount} wards
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[12px] font-bold text-emerald-400 font-mono">{fmt(apc)}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[11px] font-mono text-amber-400">{pct(apc, total)}%</span>
      </td>
      <td className="px-3 py-2.5 text-right hidden sm:table-cell">
        <span className="text-[11px] font-mono text-blue-400">{fmt(pdp)}</span>
      </td>
      <td className="px-3 py-2.5 text-right hidden md:table-cell">
        <span className="text-[11px] font-mono text-amber-300">{fmt(lp)}</span>
      </td>
      <td className="px-3 py-2.5 text-right hidden lg:table-cell">
        <span className="text-[11px] font-mono text-slate-400">{fmt(total)}</span>
      </td>
      <td className="px-3 py-2.5 text-right" />
    </tr>
  );
}

// ─── Expanded ward panel (lazy-fetched) ──────────────────────────────────────
function WardPanel({ lga, backendUrl, newestWardId }) {
  const [wards,   setWards]   = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [wRes, rRes] = await Promise.all([
        fetch(`${backendUrl}/results/lcdas/${lga._id}/wards`).then(r => r.json()),
        fetch(`${backendUrl}/results?scope=lcda&id=${lga._id}&limit=200`).then(r => r.json()),
      ]);
      setWards(wRes.wards ?? []);
      setResults(rRes.results ?? []);
    } catch (e) {
      setError('Failed to load ward data');
    } finally {
      setLoading(false);
    }
  }, [lga._id, backendUrl]);

  // Re-fetch when a new result lands for this LGA
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!newestWardId) return;
    const affected = results.find(r => String(r.ward?._id ?? r.ward) === newestWardId);
    const inScope  = wards.find(w => String(w._id) === newestWardId);
    if (inScope || affected) load();
  }, [newestWardId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <tr>
        <td colSpan={7} className="py-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="w-4 h-4 border border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
            Loading ward results…
          </div>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={7} className="py-4 text-center text-xs text-red-400 font-mono">{error}</td>
      </tr>
    );
  }

  // Map results by ward id for O(1) lookup
  const resultByWard = {};
  results.forEach(r => { resultByWard[String(r.ward?._id ?? r.ward)] = r; });

  // Sort wards: those with results first (by APC votes desc), then pending alphabetically
  const withResults    = wards.filter(w => resultByWard[String(w._id)]).sort((a, b) => {
    const aApc = resultByWard[String(a._id)]?.results?.find(r => r.party === 'APC')?.votes ?? 0;
    const bApc = resultByWard[String(b._id)]?.results?.find(r => r.party === 'APC')?.votes ?? 0;
    return bApc - aApc;
  });
  const withoutResults = wards.filter(w => !resultByWard[String(w._id)]).sort((a, b) => a.name.localeCompare(b.name));
  const sortedWards    = [...withResults, ...withoutResults];
  const maxApc         = withResults.length > 0
    ? Math.max(...withResults.map(w => resultByWard[String(w._id)]?.results?.find(r => r.party === 'APC')?.votes ?? 0))
    : 1;

  return (
    <>
      {/* Column sub-headers */}
      <tr className="bg-slate-900/60">
        <td className="pl-10 pr-3 py-1.5 text-[8px] font-mono tracking-widest text-slate-600 uppercase">Ward</td>
        <td className="px-3 py-1.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase">APC</td>
        <td className="px-3 py-1.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase">APC %</td>
        <td className="px-3 py-1.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase hidden sm:table-cell">PDP</td>
        <td className="px-3 py-1.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase hidden md:table-cell">LP</td>
        <td className="px-3 py-1.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase hidden lg:table-cell">Total</td>
        <td className="px-3 py-1.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase">Status</td>
      </tr>

      {sortedWards.map((ward, i) => (
        <WardRow
          key={ward._id}
          ward={ward}
          result={resultByWard[String(ward._id)] ?? null}
          isNewest={String(ward._id) === newestWardId}
          maxApc={maxApc}
          rank={i + 1}
        />
      ))}

      {results.length > 0 && (
        <LGATotalsRow results={results} wardCount={wards.length} />
      )}

      {wards.length === 0 && (
        <tr>
          <td colSpan={7} className="py-6 text-center text-xs text-slate-600 font-mono">
            No wards found for this LGA.
          </td>
        </tr>
      )}
    </>
  );
}

// ─── LGA Row (collapsed) ─────────────────────────────────────────────────────
// lgaSummary is now passed as a prop from LGATable — no internal fetch.
function LGARow({ lga, rank, isOpen, onToggle, lgaSummary, newestWardId, backendUrl }) {
  const apcData    = lgaSummary?.parties?.find(p => p.party === 'APC');
  const apcVotes   = apcData?.totalVotes ?? 0;
  const total      = lgaSummary?.grandTotal ?? 0;
  const apcPct     = pct(apcVotes, total);
  const reporting  = lgaSummary?.reportingUnits ?? 0;

  return (
    <>
      {/* ── Collapsed LGA header row ── */}
      <tr
        className={`
          cursor-pointer select-none border-b transition-all duration-150
          ${isOpen
            ? 'bg-emerald-950/40 border-emerald-900/50'
            : 'border-white/5 hover:bg-white/[0.025]'}
        `}
        onClick={onToggle}
      >
        {/* Rank */}
        <td className="pl-4 pr-2 py-3 w-10">
          <span className="text-[10px] font-mono text-slate-600">{rank}</span>
        </td>

        {/* LGA name + reporting badge */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Chevron */}
            <svg
              className={`w-3 h-3 flex-shrink-0 transition-transform duration-250 ${isOpen ? 'rotate-90 text-amber-400' : 'text-slate-600'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>

            <div>
              <p className={`text-[13px] font-bold leading-tight ${isOpen ? 'text-white' : 'text-slate-200'}`}>
                {lga.name}
              </p>
              <p className="text-[9px] font-mono text-slate-600 mt-0.5">{lga.code}</p>
            </div>

            {reporting > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono font-semibold border bg-emerald-950/60 text-emerald-400 border-emerald-800/50">
                <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-pulse" />
                {reporting} ward{reporting !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </td>

        {/* APC Votes */}
        <td className="px-3 py-3 text-right">
          <div>
            <span className="text-[13px] font-bold text-emerald-400 font-mono">
              {lgaSummary ? (apcVotes ? fmt(apcVotes) : '—') : (
                <span className="inline-block w-12 h-3 rounded bg-white/5 animate-pulse" />
              )}
            </span>
            {apcVotes > 0 && (
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <div className="h-0.5 rounded-full bg-emerald-700/40" style={{ width: 40 }}>
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(parseFloat(apcPct), 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </td>

        {/* APC % */}
        <td className="px-3 py-3 text-right">
          {lgaSummary
            ? <span className={`text-[12px] font-mono font-semibold ${apcVotes ? 'text-amber-400' : 'text-slate-600'}`}>
                {apcVotes ? `${apcPct}%` : '—'}
              </span>
            : <span className="inline-block w-8 h-3 rounded bg-white/5 animate-pulse" />
          }
        </td>

        {/* PDP */}
        <td className="px-3 py-3 text-right hidden sm:table-cell">
          {lgaSummary
            ? <span className="text-[11px] font-mono text-blue-400">
                {fmt(lgaSummary.parties?.find(p => p.party === 'PDP')?.totalVotes ?? 0)}
              </span>
            : <span className="inline-block w-10 h-3 rounded bg-white/5 animate-pulse" />
          }
        </td>

        {/* LP */}
        <td className="px-3 py-3 text-right hidden md:table-cell">
          {lgaSummary
            ? <span className="text-[11px] font-mono text-amber-300">
                {fmt(lgaSummary.parties?.find(p => p.party === 'LP')?.totalVotes ?? 0)}
              </span>
            : <span className="inline-block w-10 h-3 rounded bg-white/5 animate-pulse" />
          }
        </td>

        {/* Total */}
        <td className="px-3 py-3 text-right hidden lg:table-cell">
          {lgaSummary
            ? <span className="text-[11px] font-mono text-slate-500">{total ? fmt(total) : '—'}</span>
            : <span className="inline-block w-12 h-3 rounded bg-white/5 animate-pulse" />
          }
        </td>

        {/* Expand icon */}
        <td className="px-3 py-3 text-right">
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${isOpen ? 'border-amber-700/50 text-amber-400 bg-amber-950/30' : 'border-white/10 text-slate-600'}`}>
            {isOpen ? 'Close' : 'View'}
          </span>
        </td>
      </tr>

      {/* ── Expanded ward panel ── */}
      {isOpen && (
        <WardPanel
          lga={lga}
          backendUrl={backendUrl}
          newestWardId={newestWardId}
        />
      )}
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function LGATable({ lcdas, summary, newestWardId, backendUrl }) {
  const [openId,     setOpenId]     = useState(null);
  const [search,     setSearch]     = useState('');
  const [sortKey,    setSortKey]    = useState('apc-desc');
  // FIX: All LGA summaries fetched here, staggered, passed down as props.
  const [summaryMap, setSummaryMap] = useState({});
  const tbodyRef = useRef(null);

  // Staggered fetch — 80 ms between requests keeps us under any sane rate limit.
  // Rows populate progressively as each summary arrives.
  // If your backend supports a bulk endpoint, replace this with a single
  // fetch(`${backendUrl}/results/summaries?scope=lcda&ids=${lcdas.map(l=>l._id).join(',')}`)
  // that returns { summaries: { [id]: summaryObject } }.
  useEffect(() => {
    if (!lcdas.length) return;

    let cancelled = false;

    const fetchStaggered = async () => {
      const map = {};
      for (let i = 0; i < lcdas.length; i++) {
        if (cancelled) break;
        try {
          const data = await fetch(
            `${backendUrl}/results/summary?scope=lcda&id=${lcdas[i]._id}`
          ).then(r => r.json());
          map[lcdas[i]._id] = data;
          if (!cancelled) setSummaryMap(prev => ({ ...prev, [lcdas[i]._id]: data }));
        } catch (_) {
          // swallow per-LGA errors; row just shows skeletons
        }
        if (i < lcdas.length - 1) {
          await new Promise(r => setTimeout(r, 80));
        }
      }
    };

    fetchStaggered();
    return () => { cancelled = true; };
  }, [lcdas, backendUrl]);

  const filtered = lcdas
    .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'name-asc') return a.name.localeCompare(b.name);
      if (sortKey === 'apc-desc') {
        // Sort by APC votes descending using already-fetched summary data
        const aApc = summaryMap[a._id]?.parties?.find(p => p.party === 'APC')?.totalVotes ?? -1;
        const bApc = summaryMap[b._id]?.parties?.find(p => p.party === 'APC')?.totalVotes ?? -1;
        return bApc - aApc;
      }
      return 0;
    });

  const toggle = useCallback((id) => {
    setOpenId(prev => (prev === id ? null : id));
    setTimeout(() => {
      const el = document.getElementById(`lga-row-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }, []);

  return (
    <div className="rounded-xl border border-white/8 bg-[#081210] overflow-hidden">
      {/* ── Table toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-white/8 bg-[#0a1a12]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-0.5 h-3.5 rounded-full bg-amber-500 flex-shrink-0" style={{ boxShadow: '0 0 6px #C9A84C88' }} />
          <span className="text-[10px] font-mono font-semibold tracking-widest text-amber-500 uppercase">
            LGA / LCDA Results
          </span>
          <span className="text-[10px] font-mono text-slate-600 ml-1">
            {filtered.length} area{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search LGA…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-[11px] font-mono bg-white/5 border border-white/10 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-600/50 w-40"
          />
        </div>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value)}
          className="text-[10px] font-mono bg-white/5 border border-white/10 rounded-lg text-slate-400 px-2 py-1.5 focus:outline-none focus:border-amber-600/50 cursor-pointer"
          style={{ appearance: 'none' }}
        >
          <option value="apc-desc">Sort: APC votes ↓</option>
          <option value="name-asc">Sort: A – Z</option>
        </select>

        {/* Loading indicator — shows while summaries are still trickling in */}
        {Object.keys(summaryMap).length < lcdas.length && lcdas.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-slate-600">
            <span className="w-3 h-3 border border-slate-700 border-t-amber-600/60 rounded-full animate-spin" />
            {Object.keys(summaryMap).length}/{lcdas.length}
          </span>
        )}

        {/* Click-to-expand hint */}
        <span className="text-[9px] font-mono text-slate-600 hidden sm:block">
          ↓ Click any row to expand wards
        </span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" ref={tbodyRef}>
          {/* Column headers */}
          <thead>
            <tr className="border-b border-white/8">
              <th className="pl-4 pr-2 py-2.5 text-left text-[8px] font-mono tracking-widest text-slate-600 uppercase w-10">#</th>
              <th className="px-3 py-2.5 text-left text-[8px] font-mono tracking-widest text-slate-600 uppercase">LGA / LCDA</th>
              <th className="px-3 py-2.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase" style={{ minWidth: 100 }}>APC Votes</th>
              <th className="px-3 py-2.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase" style={{ minWidth: 70 }}>APC %</th>
              <th className="px-3 py-2.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase hidden sm:table-cell" style={{ minWidth: 80 }}>PDP</th>
              <th className="px-3 py-2.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase hidden md:table-cell" style={{ minWidth: 70 }}>LP</th>
              <th className="px-3 py-2.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase hidden lg:table-cell" style={{ minWidth: 90 }}>Total</th>
              <th className="px-3 py-2.5 text-right text-[8px] font-mono tracking-widest text-slate-600 uppercase" style={{ width: 60 }} />
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-slate-600 font-mono">
                  No LGAs match "{search}"
                </td>
              </tr>
            )}
            {filtered.map((lga, i) => (
              <LGARow
                key={lga._id}
                id={`lga-row-${lga._id}`}
                lga={lga}
                rank={i + 1}
                isOpen={openId === lga._id}
                onToggle={() => toggle(lga._id)}
                lgaSummary={summaryMap[lga._id] ?? null}
                newestWardId={newestWardId}
                backendUrl={backendUrl}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



/**
 * components/LGATable.jsx
 *
 * Excel-style results table matching the CHAIRMANSHIP RESULT COLLATION sheet.
 *
 * Layout per LGA:
 *  - Header row: LGA name, code, APC total, PDP, LP, total votes, net votes, ranking
 *  - Ward sub-rows: all wards expanded inline (no click needed), ranked by APC votes
 *  - Inline mini bar chart showing each party's share per LGA
 *  - Inline donut showing APC % share
 *
 * All LGA summaries are fetched once in this component (staggered 80ms apart)
 * to avoid 429 rate limiting. Ward data is fetched lazily but in parallel once
 * the summary map is populated.
 *
 * Props:
 *   lcdas        : [{ _id, name, code }]
 *   newestWardId : string | null          — from socket, for flash highlight
 *   backendUrl   : string
 */

// import { useState, useEffect, useCallback, useRef } from 'react';

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmt  = n  => (n ?? 0).toLocaleString();
// const pct  = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) : '0.0');
// const sign = n  => n > 0 ? `+${fmt(n)}` : fmt(n);

// // ─── Party config ─────────────────────────────────────────────────────────────
// const PARTIES = {
//   APC:  { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
//   PDP:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd' },
//   LP:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  text: '#fcd34d' },
//   NNPP: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)',  text: '#c4b5fd' },
// };
// const partyColor = p => PARTIES[(p||'').toUpperCase().trim()] || { color:'#64748b', bg:'rgba(100,116,139,0.15)', text:'#94a3b8' };

// // ─── Rank medal ───────────────────────────────────────────────────────────────
// function RankBadge({ rank }) {
//   const medals = { 1:'🥇', 2:'🥈', 3:'🥉' };
//   if (medals[rank]) return <span style={{ fontSize:13 }}>{medals[rank]}</span>;
//   return (
//     <span style={{
//       fontFamily:'var(--mono)', fontSize:9, fontWeight:600,
//       color: rank <= 10 ? '#f59e0b' : 'rgba(180,220,200,0.3)',
//       minWidth:18, textAlign:'center',
//     }}>{rank}</span>
//   );
// }

// // ─── Inline horizontal bar chart (per-party stacked) ─────────────────────────
// function PartyBarChart({ parties, total }) {
//   if (!parties.length || !total) return null;
//   return (
//     <div style={{ display:'flex', height:6, borderRadius:3, overflow:'hidden', gap:1 }}>
//       {parties.map(({ party, totalVotes }) => {
//         const w = pct(totalVotes, total);
//         const c = partyColor(party);
//         if (parseFloat(w) < 0.5) return null;
//         return (
//           <div key={party} title={`${party}: ${fmt(totalVotes)} (${w}%)`} style={{
//             width:`${w}%`, background:c.color,
//             transition:'width 0.8s cubic-bezier(0.22,1,0.36,1)',
//             minWidth:2,
//           }}/>
//         );
//       })}
//     </div>
//   );
// }

// // ─── SVG Donut (APC % share) ─────────────────────────────────────────────────
// function DonutChart({ apcVotes, total, size = 44 }) {
//   const r    = 16;
//   const circ = 2 * Math.PI * r;
//   const apcPct  = total > 0 ? apcVotes / total : 0;
//   const dash    = apcPct * circ;
//   const gap     = circ - dash;

//   return (
//     <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink:0 }}>
//       <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
//       <circle cx="20" cy="20" r={r} fill="none" stroke="#22c55e" strokeWidth="5"
//         strokeDasharray={`${dash} ${gap}`}
//         strokeLinecap="round"
//         transform="rotate(-90 20 20)"
//         style={{ transition:'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }}
//       />
//       <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
//         fill="#4ade80" fontSize="7.5" fontWeight="700" fontFamily="monospace">
//         {(apcPct*100).toFixed(0)}%
//       </text>
//     </svg>
//   );
// }

// // ─── Ward row ─────────────────────────────────────────────────────────────────
// function WardRow({ ward, result, rank, isNewest, maxApc }) {
//   const hasResult = !!result;
//   const apc   = result?.results?.find(r => r.party === 'APC')?.votes ?? 0;
//   const pdp   = result?.results?.find(r => r.party === 'PDP')?.votes ?? 0;
//   const lp    = result?.results?.find(r => r.party === 'LP')?.votes  ?? 0;
//   const total = result?.totalVotes ?? 0;
//   const net   = apc - pdp - lp;
//   const barW  = maxApc > 0 ? Math.round((apc / maxApc) * 100) : 0;

//   return (
//     <tr style={{
//       borderBottom:'1px solid rgba(0,107,53,0.08)',
//       background: isNewest
//         ? 'rgba(201,168,76,0.07)'
//         : rank % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
//       transition:'background 2s ease',
//       opacity: hasResult ? 1 : 0.45,
//     }}>
//       {/* Rank */}
//       <td style={{ paddingLeft:36, paddingRight:8, paddingTop:7, paddingBottom:7, width:52 }}>
//         <div style={{ display:'flex', alignItems:'center', gap:5 }}>
//           <RankBadge rank={rank}/>
//         </div>
//       </td>

//       {/* Ward name */}
//       <td style={{ padding:'7px 8px', minWidth:160 }}>
//         <div>
//           <p style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text)',
//             fontWeight:500, lineHeight:1.2 }}>{ward.name}</p>
//           <p style={{ fontFamily:'var(--mono)', fontSize:9, color:'rgba(180,220,200,0.35)',
//             marginTop:2 }}>Ward {ward.code} · {result?.pollingUnits ?? '—'} PUs</p>
//         </div>
//       </td>

//       {/* APC with mini bar */}
//       <td style={{ padding:'7px 10px', textAlign:'right', minWidth:110 }}>
//         {hasResult ? (
//           <div>
//             <span style={{ fontFamily:'var(--mono)', fontSize:12, fontWeight:700, color:'#4ade80' }}>
//               {fmt(apc)}
//             </span>
//             <div style={{ marginTop:3, height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
//               <div style={{
//                 width:`${barW}%`, height:'100%', background:'#22c55e', borderRadius:2,
//                 transition:'width 0.8s cubic-bezier(0.22,1,0.36,1)',
//               }}/>
//             </div>
//           </div>
//         ) : <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.2)' }}>—</span>}
//       </td>

//       {/* PDP */}
//       <td style={{ padding:'7px 10px', textAlign:'right', minWidth:80 }}>
//         {hasResult
//           ? <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'#93c5fd' }}>{fmt(pdp)}</span>
//           : <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.2)' }}>—</span>}
//       </td>

//       {/* LP */}
//       <td style={{ padding:'7px 10px', textAlign:'right', minWidth:80 }}>
//         {hasResult
//           ? <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'#fcd34d' }}>{fmt(lp)}</span>
//           : <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.2)' }}>—</span>}
//       </td>

//       {/* Total votes */}
//       <td style={{ padding:'7px 10px', textAlign:'right', minWidth:90 }}>
//         {hasResult
//           ? <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'rgba(180,220,200,0.6)' }}>{fmt(total)}</span>
//           : <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.2)' }}>—</span>}
//       </td>

//       {/* Net votes (APC - others) */}
//       <td style={{ padding:'7px 10px', textAlign:'right', minWidth:90 }}>
//         {hasResult
//           ? <span style={{ fontFamily:'var(--mono)', fontSize:11, fontWeight:600,
//               color: net >= 0 ? '#86efac' : '#fca5a5' }}>
//               {sign(net)}
//             </span>
//           : <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.2)' }}>—</span>}
//       </td>

//       {/* APC % */}
//       <td style={{ padding:'7px 10px', textAlign:'right', minWidth:60 }}>
//         {hasResult
//           ? <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'#f59e0b' }}>
//               {pct(apc, total)}%
//             </span>
//           : <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.2)' }}>—</span>}
//       </td>

//       {/* Status */}
//       <td style={{ padding:'7px 12px', textAlign:'right' }}>
//         {hasResult ? (
//           <span style={{
//             fontFamily:'var(--mono)', fontSize:8, fontWeight:600,
//             textTransform:'uppercase', letterSpacing:'0.08em',
//             padding:'2px 6px', borderRadius:3,
//             background: result.status === 'verified' ? 'rgba(34,197,94,0.15)'
//               : result.status === 'rejected' ? 'rgba(239,68,68,0.15)'
//               : 'rgba(245,158,11,0.15)',
//             color: result.status === 'verified' ? '#4ade80'
//               : result.status === 'rejected' ? '#fca5a5'
//               : '#fcd34d',
//           }}>
//             {result.status ?? 'pending'}
//           </span>
//         ) : (
//           <span style={{ fontFamily:'var(--mono)', fontSize:8, color:'rgba(180,220,200,0.2)' }}>
//             awaiting
//           </span>
//         )}
//       </td>
//     </tr>
//   );
// }

// // ─── LGA subtotal row (pinned above ward rows) ────────────────────────────────
// function LGAHeaderRow({ lga, summary, wards, results, rank, isNew }) {
//   const apc   = summary?.parties?.find(p => p.party === 'APC')?.totalVotes ?? 0;
//   const pdp   = summary?.parties?.find(p => p.party === 'PDP')?.totalVotes ?? 0;
//   const lp    = summary?.parties?.find(p => p.party === 'LP')?.totalVotes  ?? 0;
//   const total = summary?.grandTotal ?? 0;
//   const net   = apc - pdp - lp;
//   const reporting = summary?.reportingUnits ?? 0;
//   const wardCount = wards.length;

//   return (
//     <tr style={{
//       background: isNew
//         ? 'rgba(201,168,76,0.12)'
//         : 'rgba(0,107,53,0.18)',
//       borderTop:'1px solid rgba(0,107,53,0.35)',
//       borderBottom:'1px solid rgba(0,107,53,0.2)',
//       transition:'background 2s ease',
//     }}>
//       {/* Rank */}
//       <td style={{ padding:'10px 8px 10px 16px', width:52 }}>
//         <RankBadge rank={rank}/>
//       </td>

//       {/* LGA name + donut + bar */}
//       <td style={{ padding:'10px 8px', minWidth:200 }}>
//         <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//           <DonutChart apcVotes={apc} total={total}/>
//           <div style={{ minWidth:0 }}>
//             <p style={{ fontFamily:'var(--display)', fontSize:13, fontWeight:700,
//               color:'var(--text)', lineHeight:1.1 }}>{lga.name}</p>
//             <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
//               <span style={{ fontFamily:'var(--mono)', fontSize:8,
//                 color:'rgba(180,220,200,0.4)' }}>{lga.code}</span>
//               <span style={{
//                 fontFamily:'var(--mono)', fontSize:8, fontWeight:600,
//                 letterSpacing:'0.08em', padding:'1px 5px', borderRadius:2,
//                 background: reporting === wardCount
//                   ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)',
//                 color: reporting === wardCount ? '#4ade80' : '#fcd34d',
//               }}>
//                 {reporting}/{wardCount} wards
//               </span>
//             </div>
//             {total > 0 && (
//               <div style={{ marginTop:5 }}>
//                 <PartyBarChart
//                   parties={summary?.parties ?? []}
//                   total={total}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </td>

//       {/* APC */}
//       <td style={{ padding:'10px', textAlign:'right' }}>
//         <span style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:800, color:'#4ade80' }}>
//           {total ? fmt(apc) : '—'}
//         </span>
//       </td>

//       {/* PDP */}
//       <td style={{ padding:'10px', textAlign:'right' }}>
//         <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'#93c5fd' }}>
//           {total ? fmt(pdp) : '—'}
//         </span>
//       </td>

//       {/* LP */}
//       <td style={{ padding:'10px', textAlign:'right' }}>
//         <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'#fcd34d' }}>
//           {total ? fmt(lp) : '—'}
//         </span>
//       </td>

//       {/* Total */}
//       <td style={{ padding:'10px', textAlign:'right' }}>
//         <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'rgba(180,220,200,0.7)', fontWeight:600 }}>
//           {total ? fmt(total) : '—'}
//         </span>
//       </td>

//       {/* Net */}
//       <td style={{ padding:'10px', textAlign:'right' }}>
//         <span style={{ fontFamily:'var(--mono)', fontSize:12, fontWeight:700,
//           color: net >= 0 ? '#86efac' : '#fca5a5' }}>
//           {total ? sign(net) : '—'}
//         </span>
//       </td>

//       {/* APC% */}
//       <td style={{ padding:'10px', textAlign:'right' }}>
//         <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'#f59e0b', fontWeight:600 }}>
//           {total ? `${pct(apc,total)}%` : '—'}
//         </span>
//       </td>

//       {/* Spacer for status column */}
//       <td/>
//     </tr>
//   );
// }

// // ─── Ward panel (fetches wards + results for one LGA) ────────────────────────
// function LGASection({ lga, summary, rank, backendUrl, newestWardId, isNew }) {
//   const [wards,   setWards]   = useState([]);
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const loadedRef = useRef(false);

//   const load = useCallback(async () => {
//     try {
//       const [wRes, rRes] = await Promise.all([
//         fetch(`${backendUrl}/results/lcdas/${lga._id}/wards`).then(r => r.json()),
//         fetch(`${backendUrl}/results?scope=lcda&id=${lga._id}&limit=500`).then(r => r.json()),
//       ]);
//       setWards(wRes.wards   ?? []);
//       setResults(rRes.results ?? []);
//     } catch (_) {}
//     finally { setLoading(false); }
//   }, [lga._id, backendUrl]);

//   useEffect(() => {
//     load();
//     loadedRef.current = true;
//   }, [load]);

//   // Re-fetch when a socket event touches a ward in this LGA
//   useEffect(() => {
//     if (!newestWardId || !loadedRef.current) return;
//     const affected = results.find(r => String(r.ward?._id ?? r.ward) === newestWardId);
//     const inScope  = wards.find(w => String(w._id) === newestWardId);
//     if (affected || inScope) load();
//   }, [newestWardId]); // eslint-disable-line react-hooks/exhaustive-deps

//   const resultByWard = {};
//   results.forEach(r => { resultByWard[String(r.ward?._id ?? r.ward)] = r; });

//   // Sort: wards with results first (by APC desc), then pending alpha
//   const withRes    = wards.filter(w => resultByWard[String(w._id)])
//     .sort((a, b) => {
//       const av = resultByWard[String(a._id)]?.results?.find(r=>r.party==='APC')?.votes ?? 0;
//       const bv = resultByWard[String(b._id)]?.results?.find(r=>r.party==='APC')?.votes ?? 0;
//       return bv - av;
//     });
//   const withoutRes = wards.filter(w => !resultByWard[String(w._id)])
//     .sort((a, b) => a.name.localeCompare(b.name));
//   const sorted = [...withRes, ...withoutRes];

//   const maxApc = withRes.length > 0
//     ? Math.max(...withRes.map(w => resultByWard[String(w._id)]?.results?.find(r=>r.party==='APC')?.votes ?? 0))
//     : 1;

//   return (
//     <>
//       <LGAHeaderRow
//         lga={lga} summary={summary} wards={wards}
//         results={results} rank={rank} isNew={isNew}
//       />

//       {/* Ward column sub-headers */}
//       <tr style={{ background:'rgba(0,0,0,0.3)' }}>
//         {['#','Ward · Code · PUs','APC ▼','PDP','LP','Total','Net','APC%','Status'].map((h,i) => (
//           <td key={i} style={{
//             padding: i===0 ? '4px 8px 4px 36px' : '4px 10px',
//             fontFamily:'var(--mono)', fontSize:8, fontWeight:600,
//             textTransform:'uppercase', letterSpacing:'0.14em',
//             color:'rgba(180,220,200,0.3)',
//             textAlign: i <= 1 ? 'left' : i === 8 ? 'right' : 'right',
//           }}>{h}</td>
//         ))}
//       </tr>

//       {loading ? (
//         <tr>
//           <td colSpan={9} style={{ padding:'12px 36px' }}>
//             <div style={{ display:'flex', alignItems:'center', gap:8,
//               fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.3)' }}>
//               <span style={{
//                 width:12, height:12, borderRadius:'50%',
//                 border:'1.5px solid rgba(0,107,53,0.4)', borderTopColor:'#4ade80',
//                 animation:'spin 0.8s linear infinite', display:'inline-block',
//               }}/>
//               Loading wards…
//             </div>
//           </td>
//         </tr>
//       ) : sorted.length === 0 ? (
//         <tr>
//           <td colSpan={9} style={{ padding:'10px 36px',
//             fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.2)' }}>
//             No wards configured for this LGA.
//           </td>
//         </tr>
//       ) : (
//         sorted.map((ward, i) => (
//           <WardRow
//             key={ward._id}
//             ward={ward}
//             result={resultByWard[String(ward._id)] ?? null}
//             rank={i + 1}
//             isNewest={String(ward._id) === newestWardId}
//             maxApc={maxApc}
//           />
//         ))
//       )}

//       {/* LGA ward total row */}
//       {results.length > 0 && (() => {
//         const tApc   = results.reduce((s,r) => s+(r.results?.find(p=>p.party==='APC')?.votes??0),0);
//         const tPdp   = results.reduce((s,r) => s+(r.results?.find(p=>p.party==='PDP')?.votes??0),0);
//         const tLp    = results.reduce((s,r) => s+(r.results?.find(p=>p.party==='LP')?.votes??0),0);
//         const tTotal = results.reduce((s,r) => s+(r.totalVotes??0),0);
//         const tNet   = tApc - tPdp - tLp;
//         return (
//           <tr style={{ background:'rgba(0,107,53,0.1)', borderTop:'1px solid rgba(0,107,53,0.2)' }}>
//             <td colSpan={2} style={{ padding:'6px 8px 6px 36px',
//               fontFamily:'var(--mono)', fontSize:9, fontWeight:700,
//               letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(34,197,94,0.6)' }}>
//               Subtotal · {results.length}/{wards.length} wards reporting
//             </td>
//             <td style={{ padding:'6px 10px', textAlign:'right', fontFamily:'var(--mono)', fontSize:12, fontWeight:700, color:'#4ade80' }}>{fmt(tApc)}</td>
//             <td style={{ padding:'6px 10px', textAlign:'right', fontFamily:'var(--mono)', fontSize:11, color:'#93c5fd' }}>{fmt(tPdp)}</td>
//             <td style={{ padding:'6px 10px', textAlign:'right', fontFamily:'var(--mono)', fontSize:11, color:'#fcd34d' }}>{fmt(tLp)}</td>
//             <td style={{ padding:'6px 10px', textAlign:'right', fontFamily:'var(--mono)', fontSize:11, color:'rgba(180,220,200,0.6)', fontWeight:600 }}>{fmt(tTotal)}</td>
//             <td style={{ padding:'6px 10px', textAlign:'right', fontFamily:'var(--mono)', fontSize:11, fontWeight:700, color: tNet>=0?'#86efac':'#fca5a5' }}>{sign(tNet)}</td>
//             <td style={{ padding:'6px 10px', textAlign:'right', fontFamily:'var(--mono)', fontSize:10, color:'#f59e0b' }}>{pct(tApc,tTotal)}%</td>
//             <td/>
//           </tr>
//         );
//       })()}
//     </>
//   );
// }

// // ─── Main export ──────────────────────────────────────────────────────────────
// export default function LGATable({ lcdas, newestWardId, backendUrl }) {
//   const [summaryMap,  setSummaryMap]  = useState({});   // { [lga._id]: summaryData }
//   const [newLgaIds,   setNewLgaIds]   = useState(new Set());
//   const [search,      setSearch]      = useState('');
//   const [sortKey,     setSortKey]     = useState('apc-desc');

//   // ── Staggered summary fetch ────────────────────────────────────────────────
//   // 80ms between each request — fills rows progressively, never 429s
//   useEffect(() => {
//     if (!lcdas.length) return;
//     let cancelled = false;

//     const run = async () => {
//       for (let i = 0; i < lcdas.length; i++) {
//         if (cancelled) break;
//         try {
//           const data = await fetch(
//             `${backendUrl}/results/summary?scope=lcda&id=${lcdas[i]._id}`
//           ).then(r => r.json());
//           const s = data.data ?? data;
//           if (!cancelled) setSummaryMap(prev => ({
//             ...prev,
//             [lcdas[i]._id]: {
//               parties:        (s.parties ?? []).sort((a,b) => b.totalVotes - a.totalVotes),
//               grandTotal:     s.grandTotal     ?? 0,
//               reportingUnits: s.reportingUnits ?? s.reportingWards ?? 0,
//             },
//           }));
//         } catch (_) {}
//         if (i < lcdas.length - 1) await new Promise(r => setTimeout(r, 80));
//       }
//     };

//     run();
//     return () => { cancelled = true; };
//   }, [lcdas, backendUrl]);

//   // Flash LGA when newestWardId belongs to it (detected by LGASection re-fetching)
//   useEffect(() => {
//     if (!newestWardId) return;
//     // We flash all LGAs optimistically — LGASection will re-fetch to confirm
//     // which one actually changed, so this is a no-op visual only
//   }, [newestWardId]);

//   // ── Sort ──────────────────────────────────────────────────────────────────
//   const sorted = [...lcdas]
//     .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => {
//       const sa = summaryMap[a._id];
//       const sb = summaryMap[b._id];
//       if (sortKey === 'apc-desc') {
//         const av = sa?.parties?.find(p=>p.party==='APC')?.totalVotes ?? -1;
//         const bv = sb?.parties?.find(p=>p.party==='APC')?.totalVotes ?? -1;
//         return bv - av;
//       }
//       if (sortKey === 'total-desc') {
//         return (sb?.grandTotal ?? 0) - (sa?.grandTotal ?? 0);
//       }
//       if (sortKey === 'net-desc') {
//         const netOf = s => {
//           if (!s) return -Infinity;
//           const apc = s.parties?.find(p=>p.party==='APC')?.totalVotes ?? 0;
//           const pdp = s.parties?.find(p=>p.party==='PDP')?.totalVotes ?? 0;
//           const lp  = s.parties?.find(p=>p.party==='LP')?.totalVotes  ?? 0;
//           return apc - pdp - lp;
//         };
//         return netOf(sb) - netOf(sa);
//       }
//       return a.name.localeCompare(b.name);
//     });

//   const totalFetched = Object.keys(summaryMap).length;

//   return (
//     <div style={{
//       background:'var(--surface)',
//       border:'1px solid var(--border)',
//       borderRadius:14, overflow:'hidden',
//     }}>
//       {/* ── Toolbar ── */}
//       <div style={{
//         display:'flex', flexWrap:'wrap', alignItems:'center', gap:12,
//         padding:'12px 18px',
//         background:'var(--surface-3)',
//         borderBottom:'1px solid var(--border)',
//       }}>
//         {/* Title */}
//         <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
//           <span style={{ width:3, height:14, borderRadius:2, background:'var(--gold)',
//             boxShadow:'0 0 8px rgba(201,168,76,0.4)', flexShrink:0 }}/>
//           <span style={{ fontFamily:'var(--mono)', fontSize:10, fontWeight:600,
//             letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--gold)' }}>
//             LGA / LCDA Results
//           </span>
//           <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'rgba(180,220,200,0.35)' }}>
//             {sorted.length} areas
//           </span>
//           {totalFetched < lcdas.length && (
//             <span style={{ display:'inline-flex', alignItems:'center', gap:5,
//               fontFamily:'var(--mono)', fontSize:9, color:'rgba(180,220,200,0.3)' }}>
//               <span style={{
//                 width:10, height:10, borderRadius:'50%',
//                 border:'1.5px solid rgba(0,107,53,0.4)', borderTopColor:'#4ade80',
//                 animation:'spin 0.8s linear infinite', display:'inline-block',
//               }}/>
//               {totalFetched}/{lcdas.length}
//             </span>
//           )}
//         </div>

//         {/* Search */}
//         <div style={{ position:'relative' }}>
//           <svg style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)',
//             width:12, height:12, color:'rgba(180,220,200,0.4)' }}
//             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//             <path strokeLinecap="round" strokeLinejoin="round"
//               d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
//           </svg>
//           <input
//             value={search} onChange={e => setSearch(e.target.value)}
//             placeholder="Search LGA…"
//             style={{
//               paddingLeft:28, paddingRight:10, paddingTop:6, paddingBottom:6,
//               fontFamily:'var(--mono)', fontSize:11,
//               background:'rgba(255,255,255,0.05)', border:'1px solid rgba(0,107,53,0.3)',
//               borderRadius:8, color:'var(--text)', outline:'none', width:150,
//             }}
//           />
//         </div>

//         {/* Sort */}
//         <select
//           value={sortKey} onChange={e => setSortKey(e.target.value)}
//           className="scope-select"
//           style={{ fontSize:10 }}
//         >
//           <option value="apc-desc">Sort: APC Votes ↓</option>
//           <option value="net-desc">Sort: Net Margin ↓</option>
//           <option value="total-desc">Sort: Total Votes ↓</option>
//           <option value="name-asc">Sort: A – Z</option>
//         </select>
//       </div>

//       {/* ── Global column headers ── */}
//       <div style={{ overflowX:'auto' }}>
//         <table style={{ width:'100%', borderCollapse:'collapse', minWidth:760 }}>
//           <thead>
//             <tr style={{ borderBottom:'2px solid rgba(0,107,53,0.3)', background:'rgba(0,0,0,0.4)' }}>
//               {[
//                 { label:'Rank',        w:52,  align:'left'  },
//                 { label:'LGA / LCDA',  w:220, align:'left'  },
//                 { label:'APC',         w:110, align:'right' },
//                 { label:'PDP',         w:80,  align:'right' },
//                 { label:'LP',          w:80,  align:'right' },
//                 { label:'Total Votes', w:90,  align:'right' },
//                 { label:'Net Margin',  w:90,  align:'right' },
//                 { label:'APC %',       w:60,  align:'right' },
//                 { label:'Status',      w:80,  align:'right' },
//               ].map((col, i) => (
//                 <th key={i} style={{
//                   padding: i===0 ? '10px 8px 10px 16px' : '10px',
//                   fontFamily:'var(--mono)', fontSize:8, fontWeight:700,
//                   letterSpacing:'0.16em', textTransform:'uppercase',
//                   color:'rgba(180,220,200,0.45)', textAlign:col.align,
//                   minWidth:col.w,
//                 }}>{col.label}</th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {sorted.map((lga, i) => (
//               <LGASection
//                 key={lga._id}
//                 lga={lga}
//                 summary={summaryMap[lga._id] ?? null}
//                 rank={i + 1}
//                 backendUrl={backendUrl}
//                 newestWardId={newestWardId}
//                 isNew={newLgaIds.has(lga._id)}
//               />
//             ))}

//             {sorted.length === 0 && (
//               <tr>
//                 <td colSpan={9} style={{ padding:'48px 24px', textAlign:'center',
//                   fontFamily:'var(--mono)', fontSize:12, color:'rgba(180,220,200,0.25)' }}>
//                   No LGAs match "{search}"
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>
//     </div>
//   );
// }