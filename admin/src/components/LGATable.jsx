
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';

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
function LGARow({ lga, rank, isOpen, onToggle, lgaSummary, newestWardId, backendUrl, highlight }) {
  const apcData    = lgaSummary?.parties?.find(p => p.party === 'APC');
  const apcVotes   = apcData?.totalVotes ?? 0;
  const total      = lgaSummary?.grandTotal ?? 0;
  const apcPct     = pct(apcVotes, total);
  const reporting  = lgaSummary?.reportingUnits ?? 0;

  return (
    <>
      <tr
        className={`
          cursor-pointer select-none border-b transition-all duration-150
          ${isOpen
            ? 'bg-emerald-950/40 border-emerald-900/50'
            : 'border-white/5 hover:bg-white/[0.025]'}
          ${highlight ? 'animate-[border-flash_0.7s_ease_2]' : ''}
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
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('apc-desc');
  const [summaryMap, setSummaryMap] = useState({});
  const [pendingUpdates, setPendingUpdates] = useState(new Map()); // Track pending LGA updates
  const tbodyRef = useRef(null);
  
  // Connect to real-time updates
  const { connected, newResult, updatedResult } = useSocket();

  // ─── INITIAL DATA LOAD (ONE BATCH REQUEST - NO POLLING!) ───────────────────
 useEffect(() => {
  if (!lcdas.length) return;

  const fetchAllSummaries = async () => {
    try {
      const ids = lcdas.map(l => l._id).join(',');
      // Use the new batch endpoint
      const response = await fetch(`${backendUrl}/results/summaries/batch?ids=${ids}`);
      const data = await response.json();
      
      if (data.success) {
        setSummaryMap(data.summaries);
      }
    } catch (error) {
      console.error('Failed to fetch batch summaries:', error);
    }
  };


    fetchAllSummaries();
  }, [lcdas, backendUrl]); // Only runs when lcdas changes, NOT on every refreshKey

  // ─── REAL-TIME UPDATE HANDLER ──────────────────────────────────────────────
  useEffect(() => {
    if (!newResult) return;

    const result = newResult.result;
    const affectedLgaId = result.lcda || result.lgaId;
    
    if (!affectedLgaId) return;
    
    // Mark this LGA for update
    setPendingUpdates(prev => new Map(prev).set(affectedLgaId, Date.now()));
    
    // Fetch just this LGA's updated summary
    const fetchUpdatedLga = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/results/summary?scope=lcda&id=${affectedLgaId}`
        );
        
        if (response.status === 429) {
          // If rate limited, retry after delay
          setTimeout(() => fetchUpdatedLga(), 1000);
          return;
        }
        
        const updatedSummary = await response.json();
        
        setSummaryMap(prev => ({
          ...prev,
          [affectedLgaId]: updatedSummary
        }));
        
        // Clear pending update after 2 seconds
        setTimeout(() => {
          setPendingUpdates(prev => {
            const newMap = new Map(prev);
            newMap.delete(affectedLgaId);
            return newMap;
          });
        }, 2000);
        
      } catch (error) {
        console.error('Failed to fetch updated LGA summary:', error);
      }
    };
    
    fetchUpdatedLga();
    
  }, [newResult, backendUrl]);

  // Handle result status updates (verified/rejected)
  useEffect(() => {
    if (!updatedResult) return;
    
    const result = updatedResult.result;
    const affectedLgaId = result.lcda || result.lgaId;
    
    if (affectedLgaId) {
      // Refresh the affected LGA summary
      fetch(`${backendUrl}/results/summary?scope=lcda&id=${affectedLgaId}`)
        .then(res => res.json())
        .then(updatedSummary => {
          setSummaryMap(prev => ({
            ...prev,
            [affectedLgaId]: updatedSummary
          }));
        })
        .catch(console.error);
    }
  }, [updatedResult, backendUrl]);

  // Filter and sort LGAs
  const filtered = lcdas
    .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'name-asc') return a.name.localeCompare(b.name);
      if (sortKey === 'apc-desc') {
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
          
          {/* Real-time indicator */}
          {connected && (
            <span className="inline-flex items-center gap-1.5 ml-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-mono text-emerald-500">Live</span>
            </span>
          )}
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
            {filtered.map((lga, i) => {
              const hasUpdate = pendingUpdates.has(lga._id);
              return (
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
                  highlight={hasUpdate} // Pass highlight prop
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

