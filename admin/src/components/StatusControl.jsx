// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// const STATUS_META = {
//   verified: { bg: 'rgba(26,107,58,0.18)',  border: 'rgba(26,107,58,0.45)',  color: '#4ADE80' },
//   pending:  { bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.35)', color: '#C9A84C' },
//   rejected: { bg: 'rgba(220,38,38,0.12)',  border: 'rgba(220,38,38,0.35)',  color: '#F87171' },
// };

// const TRANSITIONS = {
//   pending:  ['verified', 'rejected'],
//   verified: ['pending', 'rejected'],  // ← add 'pending'
//   rejected: ['verified', 'pending'],  // ← add 'pending' here too if desired
// };

// /**
//  * Renders the current status badge + a dropdown to change it.
//  * Only renders the dropdown when the logged-in user is admin.
//  *
//  * Props:
//  *   resultId  — MongoDB _id of the result document
//  *   status    — current status string
//  *   onUpdated — callback(newStatus) so parent can update its local state
//  */
// export default function StatusControl({ resultId, status, onUpdated }) {
//   const { user, authFetch } = useAuth();
//   const isAdmin = user?.role === 'admin';

//   const [current,  setCurrent]  = useState((status || 'pending').toLowerCase());
//   const [busy,     setBusy]     = useState(false);
//   const [error,    setError]    = useState(null);
//   const [open,     setOpen]     = useState(false);

//   const meta = STATUS_META[current] || STATUS_META.pending;
//   const nextStatuses = TRANSITIONS[current] || [];
//   const VITE_API_URL = import.meta.env.VITE_API_URL

//   const handleChange = async (newStatus) => {
//     if (newStatus === current || busy) return;
//     setOpen(false);
//     setBusy(true);
//     setError(null);

//     try {
//       const res  = await authFetch(`${VITE_API_URL}/results/${resultId}/status`, {
//         method: 'PATCH',
//         body:   JSON.stringify({ status: newStatus }),
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || 'Update failed');
//         return;
//       }

//       setCurrent(newStatus);
//       onUpdated?.(newStatus);
//     } catch {
//       setError('Network error');
//     } finally {
//       setBusy(false);
//     }
//   };

//   // Non-admin: just a badge
//   if (!isAdmin) {
//     return (
//       <span style={{
//         display: 'inline-block', padding: '2px 8px', borderRadius: 4,
//         border: `1px solid ${meta.border}`, background: meta.bg,
//         color: meta.color, fontFamily: 'var(--mono)', fontSize: 10,
//         letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
//       }}>
//         {current}
//       </span>
//     );
//   }

//   // Admin: badge + dropdown
//   return (
//     <div style={{ position: 'relative', display: 'inline-block' }}>
//       {/* Current status — clickable trigger */}
//       <button
//         onClick={() => !busy && nextStatuses.length > 0 && setOpen(o => !o)}
//         disabled={busy || nextStatuses.length === 0}
//         title={nextStatuses.length > 0 ? 'Change status' : 'No further transitions'}
//         style={{
//           display: 'inline-flex', alignItems: 'center', gap: 5,
//           padding: '2px 8px', borderRadius: 4,
//           border: `1px solid ${meta.border}`,
//           background: meta.bg, color: meta.color,
//           fontFamily: 'var(--mono)', fontSize: 10,
//           letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
//           cursor: busy || nextStatuses.length === 0 ? 'default' : 'pointer',
//           transition: 'opacity 0.15s',
//           opacity: busy ? 0.6 : 1,
//         }}
//       >
//         {busy ? (
//           // Tiny spinner
//           <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
//             style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
//             <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//             <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2"/>
//             <path d="M5 1.5A3.5 3.5 0 0 1 8.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
//           </svg>
//         ) : (
//           <>
//             {current}
//             {nextStatuses.length > 0 && (
//               <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
//                 <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             )}
//           </>
//         )}
//       </button>

//       {/* Dropdown */}
//       {open && (
//         <>
//           {/* Click-away overlay */}
//           <div
//             onClick={() => setOpen(false)}
//             style={{ position: 'fixed', inset: 0, zIndex: 98 }}
//           />
//           <div style={{
//             position: 'absolute', top: 'calc(100% + 4px)', left: 0,
//             zIndex: 99, minWidth: 110,
//             background: 'var(--surface-2)',
//             border: '1px solid var(--border-2)',
//             borderRadius: 8, overflow: 'hidden',
//             boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
//             animation: 'slide-up 0.15s ease both',
//           }}>
//             {nextStatuses.map(s => {
//               const m = STATUS_META[s];
//               return (
//                 <button
//                   key={s}
//                   onClick={() => handleChange(s)}
//                   style={{
//                     display: 'block', width: '100%', textAlign: 'left',
//                     padding: '9px 14px',
//                     background: 'transparent',
//                     border: 'none',
//                     borderBottom: '1px solid var(--border)',
//                     color: m.color,
//                     fontFamily: 'var(--mono)', fontSize: 10,
//                     letterSpacing: '0.1em', textTransform: 'uppercase',
//                     fontWeight: 500, cursor: 'pointer',
//                     transition: 'background 0.15s',
//                   }}
//                   onMouseEnter={e => e.currentTarget.style.background = m.bg}
//                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//                 >
//                   Mark {s}
//                 </button>
//               );
//             })}
//           </div>
//         </>
//       )}

//       {/* Inline error toast */}
//       {error && (
//         <div style={{
//           position: 'absolute', top: 'calc(100% + 4px)', left: 0,
//           zIndex: 100, whiteSpace: 'nowrap',
//           padding: '5px 10px', borderRadius: 6,
//           background: 'rgba(220,38,38,0.15)',
//           border: '1px solid rgba(220,38,38,0.35)',
//           fontFamily: 'var(--mono)', fontSize: 9,
//           color: '#F87171',
//         }}>
//           {error}
//         </div>
//       )}
//     </div>
//   );
// }


import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const STATUS_META = {
  verified: { bg: 'rgba(26,107,58,0.18)',  border: 'rgba(26,107,58,0.45)',  color: '#4ADE80' },
  pending:  { bg: 'rgba(201,168,76,0.12)', border: 'rgba(201,168,76,0.35)', color: '#C9A84C' },
  rejected: { bg: 'rgba(220,38,38,0.12)',  border: 'rgba(220,38,38,0.35)',  color: '#F87171' },
};

// ← fixed: verified can go back to pending; rejected can also go to pending
const TRANSITIONS = {
  pending:  ['verified', 'rejected'],
  verified: ['pending',  'rejected'],
  rejected: ['verified', 'pending'],
};

export default function StatusControl({ resultId, status, onUpdated, onEditRequest }) {
  const { user, authFetch } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [current, setCurrent] = useState((status || 'pending').toLowerCase());
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState(null);
  const [open,    setOpen]    = useState(false);

  const meta         = STATUS_META[current] || STATUS_META.pending;
  const nextStatuses = TRANSITIONS[current] || [];
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const handleChange = async (newStatus) => {
    if (newStatus === current || busy) return;
    setOpen(false);
    setBusy(true);
    setError(null);
    try {
      const res  = await authFetch(`${VITE_API_URL}/results/${resultId}/status`, {
        method: 'PATCH',
        body:   JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Update failed'); return; }
      setCurrent(newStatus);
      onUpdated?.(newStatus);
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin) {
    return (
      <span style={{
        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
        border: `1px solid ${meta.border}`, background: meta.bg,
        color: meta.color, fontFamily: 'var(--mono)', fontSize: 10,
        letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
      }}>
        {current}
      </span>
    );
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 5 }}
      onClick={e => e.stopPropagation()} // ← stop ALL clicks here from bubbling to <tr>
    >
      {/* Status badge / dropdown trigger */}
      <button
        onClick={() => !busy && nextStatuses.length > 0 && setOpen(o => !o)}
        disabled={busy || nextStatuses.length === 0}
        title={nextStatuses.length > 0 ? 'Change status' : 'No further transitions'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 8px', borderRadius: 4,
          border: `1px solid ${meta.border}`,
          background: meta.bg, color: meta.color,
          fontFamily: 'var(--mono)', fontSize: 10,
          letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500,
          cursor: busy || nextStatuses.length === 0 ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1, transition: 'opacity 0.15s',
        }}
      >
        {busy ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2"/>
            <path d="M5 1.5A3.5 3.5 0 0 1 8.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        ) : (
          <>
            {current}
            {nextStatuses.length > 0 && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0 }}>
                <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </>
        )}
      </button>

      {/* Edit button — only shown to admins, triggers modal in parent */}
      {onEditRequest && (
        <button
          onClick={onEditRequest}
          title="Correct vote figures"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 4, flexShrink: 0,
            border: '1px solid rgba(148,163,184,0.3)',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
            e.currentTarget.style.color = 'var(--apc-gold)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)';
            e.currentTarget.style.color = 'var(--muted)';
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z"
              stroke="currentColor" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0,
            zIndex: 99, minWidth: 120,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-2)',
            borderRadius: 8, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            animation: 'slide-up 0.15s ease both',
          }}>
            {nextStatuses.map(s => {
              const m = STATUS_META[s];
              return (
                <button key={s} onClick={() => handleChange(s)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '9px 14px', background: 'transparent',
                    border: 'none', borderBottom: '1px solid var(--border)',
                    color: m.color, fontFamily: 'var(--mono)', fontSize: 10,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = m.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Mark {s}
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          zIndex: 100, whiteSpace: 'nowrap', padding: '5px 10px', borderRadius: 6,
          background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)',
          fontFamily: 'var(--mono)', fontSize: 9, color: '#F87171',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}