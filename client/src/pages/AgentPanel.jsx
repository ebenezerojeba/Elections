// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { formatDistanceToNow } from 'date-fns';
// import clsx from 'clsx';
// import { useAuth } from '../context/AuthContext';
// import { getResults } from '../api/result';
// import ResultForm from '../component/ResultForm';

// // ─── Status badge map ────────────────────────────────────────────────────────
// const STATUS_MAP = {
//   pending:  { label: 'Pending',  cls: 'badge-pending'  },
//   verified: { label: 'Verified', cls: 'badge-verified' },
//   rejected: { label: 'Rejected', cls: 'badge-rejected' },
// };

// export default function AgentPanel() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const [myResult, setMyResult] = useState(null);
//   const [loading,  setLoading]  = useState(true);
//   const [tab,      setTab]      = useState('submit'); // 'submit' | 'history'

//   const lcdaName = user?.lcda?.name  ?? user?.lcda  ?? '—';
//   const wardName = user?.ward?.name  ?? user?.ward  ?? '—';
//   const wardId   = user?.ward?._id   ?? user?.ward;

//   // ── Fetch this agent's ward result ─────────────────────────────────────────
//   const fetchMyResult = useCallback(async () => {
//     try {
//       const data = await getResults(1, 200);
//       // Match on ward ObjectId (compare as strings to handle both populated and plain id)
//       const mine = data.results.find(
//         (r) => String(r.ward?._id ?? r.ward) === String(wardId)
//       );
//       setMyResult(mine || null);
//     } catch (err) {
//       console.error('fetchMyResult error:', err);
//       toast.error('Could not load submission status');
//     } finally {
//       setLoading(false);
//     }
//   }, [wardId]);

//   useEffect(() => { fetchMyResult(); }, [fetchMyResult]);

//   const handleLogout = () => {
//     logout();
//     toast.success('Signed out');
//     navigate('/login');
//   };

//   const alreadySubmitted = !!myResult;

//   return (
//     <div className="min-h-screen bg-slate-50">

//       {/* ══ Top nav ══════════════════════════════════════════════════════ */}
//       <nav className="bg-ink-900 border-b border-white/10 sticky top-0 z-30">
//         <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

//           {/* Brand + location breadcrumb */}
//           <div className="flex items-center gap-3 min-w-0">
//             <div className="w-7 h-7 bg-vote-500 rounded-lg flex items-center justify-center shrink-0">
//               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd"
//                   d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                   clipRule="evenodd"/>
//               </svg>
//             </div>
//             <span className="font-display font-bold text-white shrink-0">ElectTrack</span>
//             {/* Breadcrumb: LCDA › Ward */}
//             <span className="hidden sm:flex items-center gap-1.5 text-white/20 text-sm overflow-hidden">
//               <span>·</span>
//               <span className="font-mono text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-md truncate max-w-[120px]">
//                 {lcdaName}
//               </span>
//               <svg className="w-3 h-3 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
//               </svg>
//               <span className="font-mono text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-md truncate max-w-[120px]">
//                 {wardName}
//               </span>
//             </span>
//           </div>

//           {/* User + sign out */}
//           <div className="flex items-center gap-2 shrink-0">
//             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
//               <span className="text-white text-xs font-display font-bold">
//                 {user.name.charAt(0).toUpperCase()}
//               </span>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="text-xs text-white/50 hover:text-white transition-colors"
//             >
//               Sign out
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* ══ Page body ════════════════════════════════════════════════════ */}
//       <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

//         {/* Welcome banner */}
//         <div className="mb-8 animate-fade-up">
//           <h1 className="font-display text-2xl font-extrabold text-ink-900 mb-1">
//             Welcome, {user.name.split(' ')[0]}
//           </h1>
//           {/* Mobile shows LCDA + Ward stacked */}
//           <p className="text-slate-500 text-sm">
//             Agent portal —{' '}
//             <span className="font-mono font-medium text-ink-700">{lcdaName}</span>
//             <span className="text-slate-300 mx-1.5">›</span>
//             <span className="font-mono font-medium text-ink-700">{wardName}</span>
//           </p>
//         </div>

//         {/* ── Submitted-status card ───────────────────────────────────── */}
//         {!loading && alreadySubmitted && (
//           <div className="mb-6 animate-fade-up">
//             <div className="card border-vote-500/30 bg-vote-50/50">
//               <div className="flex items-start gap-4">
//                 <div className="w-10 h-10 rounded-xl bg-vote-500 flex items-center justify-center shrink-0">
//                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
//                     stroke="currentColor" strokeWidth={2.5}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
//                   </svg>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1 flex-wrap">
//                     <p className="font-display font-bold text-ink-900 text-sm">
//                       Results already submitted
//                     </p>
//                     <span className={STATUS_MAP[myResult.status]?.cls}>
//                       {STATUS_MAP[myResult.status]?.label}
//                     </span>
//                   </div>
//                   <p className="text-sm text-slate-500">
//                     Submitted {formatDistanceToNow(new Date(myResult.submittedAt), { addSuffix: true })}
//                   </p>
//                   {/* Party vote pills */}
//                   <div className="mt-3 flex flex-wrap gap-2">
//                     {myResult.results.map((r) => (
//                       <div
//                         key={r.party}
//                         className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
//                       >
//                         <span className="font-mono font-bold text-ink-900">{r.party}</span>
//                         <span className="text-slate-400 mx-1.5">·</span>
//                         <span className="font-mono text-vote-600">{r.votes.toLocaleString()}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Tabs ────────────────────────────────────────────────────── */}
//         <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
//           {['submit', 'history'].map((t) => (
//             <button
//               key={t}
//               onClick={() => setTab(t)}
//               className={clsx(
//                 'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
//                 tab === t
//                   ? 'bg-white text-ink-900 shadow-card'
//                   : 'text-slate-500 hover:text-ink-700'
//               )}
//             >
//               {t === 'submit' ? '📤 Submit results' : '📋 My submission'}
//             </button>
//           ))}
//         </div>

//         {/* ── Tab: Submit ─────────────────────────────────────────────── */}
//         {tab === 'submit' && (
//           <div className="animate-fade-up">
//             {alreadySubmitted ? (
//               <div className="card text-center py-12">
//                 <div className="text-5xl mb-4">✅</div>
//                 <h3 className="font-display font-bold text-ink-900 mb-2">
//                   Submission complete
//                 </h3>
//                 <p className="text-slate-500 text-sm max-w-xs mx-auto">
//                   Results for{' '}
//                   <span className="font-mono font-medium">{wardName}</span>
//                   {' '}ward have been recorded. Each ward can only submit once.
//                 </p>
//               </div>
//             ) : (
//               <div className="card">
//                 <h2 className="font-display font-bold text-ink-900 mb-1">
//                   Submit ward results
//                 </h2>
//                 {/* Ward identity reminder */}
//                 <div className="flex items-center gap-2 mb-4">
//                   <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-mono">
//                     {lcdaName}
//                   </span>
//                   <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24"
//                     stroke="currentColor" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
//                   </svg>
//                   <span className="text-xs bg-ink-900 text-white px-2.5 py-1 rounded-full font-mono">
//                     {wardName}
//                   </span>
//                 </div>
//                 <p className="text-slate-500 text-sm mb-6">
//                   Enter the vote counts for each party. This action cannot be undone.
//                 </p>
//                 <ResultForm onSuccess={fetchMyResult} />
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── Tab: History ────────────────────────────────────────────── */}
//         {tab === 'history' && (
//           <div className="animate-fade-up">
//             {loading ? (
//               <div className="card flex items-center justify-center py-16">
//                 <span className="w-8 h-8 border-2 border-slate-200 border-t-ink-900 rounded-full animate-spin"/>
//               </div>
//             ) : myResult ? (
//               <div className="card">
//                 <h2 className="font-display font-bold text-ink-900 mb-4">
//                   Your submission
//                 </h2>

//                 {/* Meta grid */}
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//                   <div className="bg-slate-50 rounded-xl p-4 col-span-1">
//                     <p className="text-xs text-slate-500 mb-1">LCDA</p>
//                     <p className="font-mono font-bold text-ink-900 text-sm truncate">{lcdaName}</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-4 col-span-1">
//                     <p className="text-xs text-slate-500 mb-1">Ward</p>
//                     <p className="font-mono font-bold text-ink-900 text-sm truncate">{wardName}</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <p className="text-xs text-slate-500 mb-1">Total votes</p>
//                     <p className="font-mono font-bold text-ink-900 text-sm">
//                       {myResult.totalVotes?.toLocaleString()}
//                     </p>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <p className="text-xs text-slate-500 mb-1">Status</p>
//                     <span className={STATUS_MAP[myResult.status]?.cls}>
//                       {STATUS_MAP[myResult.status]?.label}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Party breakdown table */}
//                 <div className="border border-slate-100 rounded-xl overflow-hidden">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b border-slate-100 bg-slate-50">
//                         <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
//                           Party
//                         </th>
//                         <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
//                           Votes
//                         </th>
//                         <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
//                           Share
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {myResult.results.map((r, i) => {
//                         const pct = myResult.totalVotes > 0
//                           ? ((r.votes / myResult.totalVotes) * 100).toFixed(1)
//                           : '0.0';
//                         return (
//                           <tr
//                             key={r.party}
//                             className={clsx(
//                               'border-b border-slate-50 last:border-0',
//                               i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
//                             )}
//                           >
//                             <td className="px-4 py-3 font-mono font-bold text-ink-900">{r.party}</td>
//                             <td className="px-4 py-3 text-right font-mono text-ink-700">
//                               {r.votes.toLocaleString()}
//                             </td>
//                             <td className="px-4 py-3 text-right text-slate-500">{pct}%</td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Image proof */}
//                 {myResult.imageUrl && (
//                   <div className="mt-4">
//                     <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">
//                       Image proof
//                     </p>
//                     <img
//                       src={myResult.imageUrl}
//                       alt="Result sheet"
//                       className="rounded-xl border border-slate-100 max-h-64 object-cover"
//                     />
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="card text-center py-16">
//                 <p className="text-slate-400 text-sm">
//                   No submission found for{' '}
//                   <span className="font-mono font-medium text-slate-500">{wardName}</span>
//                   {' '}ward yet.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { getResults } from '../api/result';
import ResultForm from '../component/ResultForm';

const backendUrl = import.meta.env.VITE_API_URL;

const STATUS_MAP = {
  pending:  { label: 'Pending',  cls: 'badge-pending'  },
  verified: { label: 'Verified', cls: 'badge-verified' },
  rejected: { label: 'Rejected', cls: 'badge-rejected' },
};

async function fetchWards(lcdaId) {
  const res = await fetch(`${backendUrl}/results/lcdas/${lcdaId}/wards`);
  if (!res.ok) throw new Error('Could not load wards');
  const data = await res.json();
  return data.wards ?? data;
}

export default function AgentPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const lcdaId   = user?.lcda?._id  ?? user?.lcda;
  const lcdaName = user?.lcda?.name ?? '—';

  const [wards,        setWards]        = useState([]);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [myResults,    setMyResults]    = useState([]);    // all submitted results for this LCDA by this agent
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('submit');
  const [selectedWard, setSelectedWard] = useState('');   // chosen for next submission

  // ── Load wards for agent's LCDA ─────────────────────────────────────────
  useEffect(() => {
    if (!lcdaId) return;
    fetchWards(lcdaId)
      .then(setWards)
      .catch(() => toast.error('Failed to load wards'))
      .finally(() => setWardsLoading(false));
  }, [lcdaId]);

  // ── Load all results the agent has submitted ────────────────────────────
  const fetchMyResults = useCallback(async () => {
    try {
      const data = await getResults(1, 500);
      // Only show results from this agent
      const mine = data.results.filter(
        (r) => String(r.agent?._id ?? r.agent) === String(user._id)
      );
      setMyResults(mine);
    } catch (err) {
      console.error('fetchMyResults error:', err);
      toast.error('Could not load submissions');
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => { fetchMyResults(); }, [fetchMyResults]);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  // Wards already submitted by this agent
  const submittedWardIds = new Set(
    myResults.map((r) => String(r.ward?._id ?? r.ward))
  );

  // Available wards = all wards minus already submitted ones
  const availableWards = wards.filter((w) => !submittedWardIds.has(String(w._id)));

  const selectedWardName = wards.find((w) => w._id === selectedWard)?.name ?? '';
  const wardAlreadyDone  = selectedWard && submittedWardIds.has(selectedWard);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ Top nav ══════════════════════════════════════════════════════ */}
      <nav className="bg-ink-900 border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 bg-vote-500 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white shrink-0">ElectTrack</span>
            <span className="hidden sm:flex items-center gap-1.5 text-white/20 text-sm">
              <span>·</span>
              <span className="font-mono text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-md">
                {lcdaName}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-xs font-display font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <button onClick={handleLogout} className="text-xs text-white/50 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* ══ Page body ════════════════════════════════════════════════════ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome banner */}
        <div className="mb-6 animate-fade-up">
          <h1 className="font-display text-2xl font-extrabold text-ink-900 mb-1">
            Welcome, {user.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm">
            Agent portal —{' '}
            <span className="font-mono font-medium text-ink-700">{lcdaName}</span>
          </p>
        </div>

        {/* Progress summary */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up">
            <div className="card py-4 text-center">
              <p className="font-display text-2xl font-extrabold text-ink-900">{wards.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total wards</p>
            </div>
            <div className="card py-4 text-center">
              <p className="font-display text-2xl font-extrabold text-vote-600">{myResults.length}</p>
              <p className="text-xs text-slate-500 mt-1">Submitted</p>
            </div>
            <div className="card py-4 text-center">
              <p className="font-display text-2xl font-extrabold text-amber-500">{availableWards.length}</p>
              <p className="text-xs text-slate-500 mt-1">Remaining</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
          {['submit', 'history'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                tab === t ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-ink-700'
              )}
            >
              {t === 'submit' ? '📤 Submit results' : `📋 My submissions (${myResults.length})`}
            </button>
          ))}
        </div>

        {/* ── Tab: Submit ─────────────────────────────────────────────── */}
        {tab === 'submit' && (
          <div className="animate-fade-up">
            {availableWards.length === 0 && !wardsLoading ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-display font-bold text-ink-900 mb-2">All wards submitted!</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  All {wards.length} wards in {lcdaName} have been recorded.
                </p>
              </div>
            ) : (
              <div className="card">
                <h2 className="font-display font-bold text-ink-900 mb-1">Submit ward results</h2>
                <p className="text-slate-500 text-sm mb-5">
                  Select the ward you are reporting for, then enter the vote counts.
                </p>

                {/* Ward picker */}
                <div className="mb-5">
                  <label className="label">
                    Select ward
                    {wardsLoading && (
                      <span className="ml-2 inline-flex items-center gap-1 text-slate-400 text-xs font-normal">
                        <span className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin"/>
                        Loading…
                      </span>
                    )}
                  </label>
                  <select
                    className={clsx('input bg-white', !selectedWard && 'text-slate-400')}
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={wardsLoading}
                  >
                    <option value="">— Select ward —</option>
                    {availableWards.map((w) => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>

                  {/* Already submitted notice */}
                  {wardAlreadyDone && (
                    <p className="field-error mt-1">⚠ Results for this ward were already submitted.</p>
                  )}

                  {/* Confirmation pill */}
                  {selectedWard && !wardAlreadyDone && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-slate-500">Submitting for</span>
                      <span className="font-mono font-medium text-ink-900">{lcdaName}</span>
                      <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                      <span className="font-mono font-medium text-ink-900">{selectedWardName}</span>
                    </div>
                  )}
                </div>

                {/* Only show form once a ward is selected */}
                {selectedWard && !wardAlreadyDone && (
                  <ResultForm
                    wardId={selectedWard}
                    onSuccess={() => {
                      setSelectedWard('');
                      fetchMyResults();
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: History ────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="animate-fade-up space-y-4">
            {loading ? (
              <div className="card flex items-center justify-center py-16">
                <span className="w-8 h-8 border-2 border-slate-200 border-t-ink-900 rounded-full animate-spin"/>
              </div>
            ) : myResults.length === 0 ? (
              <div className="card text-center py-16">
                <p className="text-slate-400 text-sm">No submissions yet.</p>
              </div>
            ) : (
              myResults.map((r) => {
                const wardLabel = r.ward?.name ?? '—';
                return (
                  <div key={r._id} className="card">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <p className="font-display font-bold text-ink-900 text-sm">{wardLabel}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(r.submittedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <span className={STATUS_MAP[r.status]?.cls}>
                        {STATUS_MAP[r.status]?.label}
                      </span>
                    </div>

                    {/* Party pills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {r.results.map((p) => (
                        <div key={p.party} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                          <span className="font-mono font-bold text-ink-900">{p.party}</span>
                          <span className="text-slate-400 mx-1.5">·</span>
                          <span className="font-mono text-vote-600">{p.votes.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Total: {r.totalVotes?.toLocaleString()} votes
                    </p>

                    {r.imageUrl && (
                      <img
                        src={r.imageUrl}
                        alt="Result sheet"
                        className="mt-3 rounded-xl border border-slate-100 max-h-48 object-cover"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}