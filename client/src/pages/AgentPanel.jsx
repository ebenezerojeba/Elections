import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext.jsx';
// import { getResults } from '../../api/results.js';
// import ResultForm from '../../components/agent/ResultForm.jsx';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { getResults } from '../api/result';
import ResultForm from '../component/ResultForm';

const STATUS_MAP = {
  pending:  { label: 'Pending',  cls: 'badge-pending'  },
  verified: { label: 'Verified', cls: 'badge-verified' },
  rejected: { label: 'Rejected', cls: 'badge-rejected' },
};

export default function AgentPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myResult, setMyResult]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [tab,      setTab]        = useState('submit'); // 'submit' | 'history'

  const fetchMyResult = useCallback(async () => {
    try {
      const data = await getResults(1, 100);
      // Filter to this agent's polling unit
      const mine = data.results.find(
        (r) => r.pollingUnit === user.pollingUnit
      );
      setMyResult(mine || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.pollingUnit]);

  useEffect(() => { fetchMyResult(); }, [fetchMyResult]);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const alreadySubmitted = !!myResult;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="bg-ink-900 border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-vote-500 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white">ElectTrack</span>
            <span className="hidden sm:block text-white/20 text-lg">·</span>
            <span className="hidden sm:block font-mono text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-md">
              {user.pollingUnit}
            </span>
          </div>
          <div className="flex items-center gap-3">
       
            <div className="flex items-center gap-2">
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
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome banner */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-2xl font-extrabold text-ink-900 mb-1">
            Welcome, {user.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm">
            Agent portal for polling unit{' '}
            <span className="font-mono font-medium text-ink-700">{user.pollingUnit}</span>
          </p>
        </div>

        {/* Status card if already submitted */}
        {!loading && alreadySubmitted && (
          <div className="mb-6 animate-fade-up">
            <div className="card border-vote-500/30 bg-vote-50/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-vote-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-bold text-ink-900 text-sm">Results already submitted</p>
                    <span className={STATUS_MAP[myResult.status]?.cls}>
                      {STATUS_MAP[myResult.status]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Submitted {formatDistanceToNow(new Date(myResult.submittedAt), { addSuffix: true })}
                  </p>
                  {/* Party breakdown */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {myResult.results.map((r) => (
                      <div key={r.party} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
                        <span className="font-mono font-bold text-ink-900">{r.party}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span className="font-mono text-vote-600">{r.votes.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                tab === t
                  ? 'bg-white text-ink-900 shadow-card'
                  : 'text-slate-500 hover:text-ink-700'
              )}
            >
              {t === 'submit' ? '📤 Submit results' : '📋 My submission'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'submit' && (
          <div className="animate-fade-up">
            {alreadySubmitted ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-display font-bold text-ink-900 mb-2">Submission complete</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Your results for <span className="font-mono font-medium">{user.pollingUnit}</span> have been recorded.
                  Each polling unit can only submit once.
                </p>
            
              </div>
            ) : (
              <div className="card">
                <h2 className="font-display font-bold text-ink-900 mb-1">Submit election results</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Enter the vote counts for each party. This action cannot be undone.
                </p>
                <ResultForm onSuccess={fetchMyResult} />
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="animate-fade-up">
            {loading ? (
              <div className="card flex items-center justify-center py-16">
                <span className="w-8 h-8 border-2 border-slate-200 border-t-ink-900 rounded-full animate-spin" />
              </div>
            ) : myResult ? (
              <div className="card">
                <h2 className="font-display font-bold text-ink-900 mb-4">Your submission</h2>
                {/* Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Polling unit</p>
                    <p className="font-mono font-bold text-ink-900 text-sm">{myResult.pollingUnit}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Total votes</p>
                    <p className="font-mono font-bold text-ink-900 text-sm">{myResult.totalVotes?.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <span className={STATUS_MAP[myResult.status]?.cls}>
                      {STATUS_MAP[myResult.status]?.label}
                    </span>
                  </div>
                </div>

                {/* Party breakdown table */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Party</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Votes</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myResult.results.map((r, i) => {
                        const pct = myResult.totalVotes > 0
                          ? ((r.votes / myResult.totalVotes) * 100).toFixed(1)
                          : '0.0';
                        return (
                          <tr key={r.party} className={clsx('border-b border-slate-50 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                            <td className="px-4 py-3 font-mono font-bold text-ink-900">{r.party}</td>
                            <td className="px-4 py-3 text-right font-mono text-ink-700">{r.votes.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-slate-500">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Image proof */}
                {myResult.imageUrl && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">Image proof</p>
                    <img
                      src={myResult.imageUrl}
                      alt="Result sheet"
                      className="rounded-xl border border-slate-100 max-h-64 object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-16">
                <p className="text-slate-400 text-sm">No submission found for your polling unit yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}