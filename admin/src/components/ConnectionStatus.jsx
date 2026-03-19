import clsx from 'clsx';

export default function ConnectionStatus({ connected }) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
        connected
          ? 'bg-vote-50 text-vote-700'
          : 'bg-slate-100 text-slate-400'
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          connected ? 'bg-vote-500 animate-pulse-dot' : 'bg-slate-300'
        )}
      />
      {connected ? 'Live' : 'Reconnecting…'}
    </div>
  );
}