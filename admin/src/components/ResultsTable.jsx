// import { useState, useMemo } from 'react';
// import { formatDistanceToNow } from 'date-fns';
// import clsx from 'clsx';
// import { partyColor } from '../utils/partyColors';

// const STATUS_STYLE = {
//   pending:  'badge-pending',
//   verified: 'badge-verified',
//   rejected: 'badge-rejected',
// };

// export default function ResultsTable({ results = [], newestId = null }) {
//   const [search,   setSearch]  = useState('');
//   const [sortKey,  setSortKey] = useState('submittedAt');
//   const [sortDir,  setSortDir] = useState('desc');
//   const [page,     setPage]    = useState(1);
//   const PAGE_SIZE = 10;

//   const filtered = useMemo(() => {
//     const q = search.toLowerCase();
//     return results.filter(
//       (r) =>
//         r.pollingUnit.toLowerCase().includes(q) ||
//         r.agentName?.toLowerCase().includes(q) ||
//         r.results?.some((p) => p.party.toLowerCase().includes(q))
//     );
//   }, [results, search]);

//   const sorted = useMemo(() => {
//     return [...filtered].sort((a, b) => {
//       let va = a[sortKey], vb = b[sortKey];
//       if (sortKey === 'submittedAt') { va = new Date(va); vb = new Date(vb); }
//       if (sortKey === 'totalVotes')  { va = Number(va);   vb = Number(vb);   }
//       return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
//     });
//   }, [filtered, sortKey, sortDir]);

//   const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
//   const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const toggleSort = (key) => {
//     if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
//     else { setSortKey(key); setSortDir('desc'); }
//   };

//   const SortIcon = ({ k }) => (
//     <span className={clsx('ml-1 text-xs', sortKey === k ? 'text-ink-900' : 'text-slate-300')}>
//       {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
//     </span>
//   );

//   return (
//     <div className="card">
//       {/* Table header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
//         <h2 className="font-display font-bold text-ink-900">
//           All polling units
//           <span className="ml-2 text-sm font-body font-normal text-slate-400">
//             ({filtered.length})
//           </span>
//         </h2>
//         <input
//           type="search"
//           placeholder="Search unit, agent, party…"
//           value={search}
//           onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//           className="input text-sm w-full sm:w-64"
//         />
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto -mx-6 px-6">
//         <table className="w-full text-sm min-w-[640px]">
//           <thead>
//             <tr className="border-b border-slate-100">
//               {[
//                 { label: 'Polling unit',    key: 'pollingUnit'  },
//                 { label: 'Agent',           key: 'agentName'    },
//                 { label: 'Results',         key: null           },
//                 { label: 'Total votes',     key: 'totalVotes'   },
//                 { label: 'Status',          key: 'status'       },
//                 { label: 'Submitted',       key: 'submittedAt'  },
//               ].map(({ label, key }) => (
//                 <th
//                   key={label}
//                   onClick={() => key && toggleSort(key)}
//                   className={clsx(
//                     'text-left px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide',
//                     'first:pl-0 last:pr-0',
//                     key && 'cursor-pointer hover:text-ink-900 select-none transition-colors'
//                   )}
//                 >
//                   {label}
//                   {key && <SortIcon k={key} />}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {paged.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="text-center py-12 text-slate-400">
//                   {search ? 'No results match your search' : 'No results yet'}
//                 </td>
//               </tr>
//             ) : (
//               paged.map((r) => (
//                 <tr
//                   key={r._id}
//                   className={clsx(
//                     'border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
//                     r._id === newestId && 'bg-vote-50/60'
//                   )}
//                 >
//                   {/* Polling unit */}
//                   <td className="px-3 py-3.5 first:pl-0">
//                     <div className="flex items-center gap-2">
//                       {r._id === newestId && <span className="live-dot shrink-0" />}
//                       <span className="font-mono font-bold text-ink-900 text-xs">
//                         {r.pollingUnit}
//                       </span>
//                     </div>
//                   </td>

//                   {/* Agent */}
//                   <td className="px-3 py-3.5 text-slate-500 text-xs">
//                     {r.agentName}
//                   </td>

//                   {/* Party pills */}
//                   <td className="px-3 py-3.5">
//                     <div className="flex flex-wrap gap-1">
//                       {r.results?.slice(0, 3).map((p) => (
//                         <span
//                           key={p.party}
//                           className="text-xs font-mono px-1.5 py-0.5 rounded"
//                           style={{
//                             background: partyColor(p.party).light,
//                             color:      partyColor(p.party).bg,
//                           }}
//                         >
//                           {p.party} {p.votes.toLocaleString()}
//                         </span>
//                       ))}
//                       {r.results?.length > 3 && (
//                         <span className="text-xs text-slate-400">+{r.results.length - 3}</span>
//                       )}
//                     </div>
//                   </td>

//                   {/* Total */}
//                   <td className="px-3 py-3.5 font-mono font-bold text-ink-900 tabular-nums text-xs">
//                     {r.totalVotes?.toLocaleString()}
//                   </td>

//                   {/* Status */}
//                   <td className="px-3 py-3.5">
//                     <span className={STATUS_STYLE[r.status] || 'badge'}>
//                       {r.status}
//                     </span>
//                   </td>

//                   {/* Time */}
//                   <td className="px-3 py-3.5 last:pr-0 text-slate-400 text-xs tabular-nums">
//                     {formatDistanceToNow(new Date(r.submittedAt), { addSuffix: true })}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {pageCount > 1 && (
//         <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
//           <p className="text-xs text-slate-400">
//             Page {page} of {pageCount} · {filtered.length} results
//           </p>
//           <div className="flex gap-1">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
//             >
//               ← Prev
//             </button>
//             <button
//               onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
//               disabled={page === pageCount}
//               className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
//             >
//               Next →
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { partyColor } from '../utils/partyColors';

const STATUS_STYLE = {
  pending:  'badge-pending',
  verified: 'badge-verified',
  rejected: 'badge-rejected',
};

export default function ResultsTable({ results = [], newestId = null }) {
  const [search,  setSearch]  = useState('');
  const [sortKey, setSortKey] = useState('submittedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results.filter(
      (r) =>
        r.pollingUnit.toLowerCase().includes(q) ||
        r.agentName?.toLowerCase().includes(q) ||
        r.results?.some((p) => p.party.toLowerCase().includes(q))
    );
  }, [results, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'submittedAt') { va = new Date(va); vb = new Date(vb); }
      if (sortKey === 'totalVotes')  { va = Number(va);   vb = Number(vb);   }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ k }) => (
    <span className={clsx('ml-1 text-xs', sortKey === k ? 'text-ink-900' : 'text-slate-300')}>
      {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
    </span>
  );

  const columns = [
    { label: 'Polling unit', key: 'pollingUnit',  always: true  },
    { label: 'Agent',        key: 'agentName',    always: false }, // hidden on xs
    { label: 'Results',      key: null,           always: true  },
    { label: 'Total',        key: 'totalVotes',   always: true  },
    { label: 'Status',       key: 'status',       always: false }, // hidden on xs
    { label: 'Submitted',    key: 'submittedAt',  always: false }, // hidden on xs
  ];

  return (
    <div className="card">
      {/* Header row */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-ink-900 text-base sm:text-lg">
          All polling units
          <span className="ml-2 text-sm font-body font-normal text-slate-400">
            ({filtered.length})
          </span>
        </h2>
        <input
          type="search"
          placeholder="Search unit, agent, party…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input text-sm w-full xs:w-56 sm:w-64"
        />
      </div>

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm" style={{ minWidth: 360 }}>
          <thead>
            <tr className="border-b border-slate-100">
              {columns.map(({ label, key, always }) => (
                <th
                  key={label}
                  onClick={() => key && toggleSort(key)}
                  className={clsx(
                    'text-left px-2 sm:px-3 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide',
                    'first:pl-0 last:pr-0',
                    key && 'cursor-pointer hover:text-ink-900 select-none transition-colors',
                    !always && 'hidden sm:table-cell'  // collapse less-critical cols on mobile
                  )}
                >
                  {label}
                  {key && <SortIcon k={key} />}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  {search ? 'No results match your search' : 'No results yet'}
                </td>
              </tr>
            ) : (
              paged.map((r) => (
                <tr
                  key={r._id}
                  className={clsx(
                    'border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
                    r._id === newestId && 'bg-vote-50/60'
                  )}
                >
                  {/* Polling unit — always visible */}
                  <td className="px-2 sm:px-3 py-3 first:pl-0">
                    <div className="flex items-center gap-1.5">
                      {r._id === newestId && <span className="live-dot shrink-0" />}
                      <span className="font-mono font-bold text-ink-900 text-xs">
                        {r.pollingUnit}
                      </span>
                    </div>
                  </td>

                  {/* Agent — hidden on xs */}
                  <td className="hidden sm:table-cell px-3 py-3 text-slate-500 text-xs">
                    {r.agentName}
                  </td>

                  {/* Party pills — max 2 on mobile, 3 on sm */}
                  <td className="px-2 sm:px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.results?.slice(0, 2).map((p) => (
                        <span
                          key={p.party}
                          className="text-xs font-mono px-1.5 py-0.5 rounded whitespace-nowrap"
                          style={{
                            background: partyColor(p.party).light,
                            color:      partyColor(p.party).bg,
                          }}
                        >
                          {p.party} {p.votes.toLocaleString()}
                        </span>
                      ))}
                      {/* 3rd pill only on sm+ */}
                      {r.results?.[2] && (
                        <span
                          className="hidden sm:inline text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: partyColor(r.results[2].party).light,
                            color:      partyColor(r.results[2].party).bg,
                          }}
                        >
                          {r.results[2].party} {r.results[2].votes.toLocaleString()}
                        </span>
                      )}
                      {r.results?.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{r.results.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Total — always visible */}
                  <td className="px-2 sm:px-3 py-3 font-mono font-bold text-ink-900 tabular-nums text-xs whitespace-nowrap">
                    {r.totalVotes?.toLocaleString()}
                  </td>

                  {/* Status — hidden on xs */}
                  <td className="hidden sm:table-cell px-3 py-3">
                    <span className={STATUS_STYLE[r.status] || 'badge'}>
                      {r.status}
                    </span>
                  </td>

                  {/* Time — hidden on xs */}
                  <td className="hidden sm:table-cell px-3 py-3 last:pr-0 text-slate-400 text-xs tabular-nums whitespace-nowrap">
                    {formatDistanceToNow(new Date(r.submittedAt), { addSuffix: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 gap-4 flex-wrap">
          <p className="text-xs text-slate-400">
            Page {page} of {pageCount} · {filtered.length} results
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
            >
              ← Prev
            </button>
            {/* Page number pills — hidden on xs to save space */}
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={clsx(
                    'hidden sm:inline-flex btn-ghost py-1.5 px-3 text-xs',
                    n === page && 'bg-slate-100 font-bold text-ink-900'
                  )}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}