// import { useAnimatedCount } from '../hooks/useAnimatedCount.js';
// import clsx from 'clsx';

// export default function StatCard({ label, value, sub, accent, flash }) {
//   const displayed = useAnimatedCount(value ?? 0);

//   return (
//     <div
//       className={clsx(
//         'card relative overflow-hidden transition-all duration-500',
//         flash && 'ring-2 ring-vote-500 ring-offset-1'
//       )}
//     >
//       {/* Accent strip */}
//       {accent && (
//         <div
//           className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
//           style={{ background: accent }}
//         />
//       )}

//       <p className="text-xs uppercase tracking-widest font-medium text-slate-400 mb-3 mt-1">
//         {label}
//       </p>

//       <p className="font-display font-extrabold text-3xl text-ink-900 tabular-nums">
//         {displayed.toLocaleString()}
//       </p>

//       {sub && (
//         <p className="text-xs text-slate-400 mt-1.5">{sub}</p>
//       )}

//       {/* Flash pulse overlay when value just changed */}
//       {flash && (
//         <div className="absolute inset-0 bg-vote-500/5 rounded-2xl animate-fade-in pointer-events-none" />
//       )}
//     </div>
//   );
// }



import { useAnimatedCount } from '../hooks/useAnimatedCount.js';
import clsx from 'clsx';

export default function StatCard({ label, value, sub, accent, flash }) {
  const displayed = useAnimatedCount(typeof value === 'number' ? value : 0);
  const isNumeric = typeof value === 'number';

  return (
    <div
      className={clsx(
        'card relative overflow-hidden transition-all duration-500',
        flash && 'ring-2 ring-vote-500 ring-offset-1'
      )}
    >
      {/* Accent bar */}
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: accent }}
        />
      )}

      {/* Label */}
      <p className="text-xs uppercase tracking-widest font-medium text-slate-400 mb-2 mt-1 leading-none">
        {label}
      </p>

      {/* Value — clamp size so it never overflows on XS screens */}
      <p
        className={clsx(
          'font-display font-extrabold text-ink-900 tabular-nums leading-none',
          'text-2xl sm:text-3xl',
          flash && 'animate-pulse'
        )}
      >
        {isNumeric ? displayed.toLocaleString() : (value ?? '—')}
      </p>

      {/* Sub */}
      {sub && (
        <p className="text-xs text-slate-400 mt-2 leading-snug">{sub}</p>
      )}

      {/* Flash overlay */}
      {flash && (
        <div className="absolute inset-0 bg-vote-500/5 rounded-2xl animate-fade-in pointer-events-none" />
      )}
    </div>
  );
}