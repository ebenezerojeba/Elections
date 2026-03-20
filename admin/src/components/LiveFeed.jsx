import { useRef, useEffect, useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { partyColor } from '../utils/partyColors';

// ─── useContainerBreakpoint ───────────────────────────────────────────────────
// Measures the component's own container width — not window.innerWidth.
// Returns 'xs' (<360) | 'sm' (360–539) | 'lg' (540+)

function useContainerBreakpoint(ref) {
  const [bp, setBp] = useState('lg');
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      setBp(w < 360 ? 'xs' : w < 540 ? 'sm' : 'lg');
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return bp;
}

// ─── PartyPill ────────────────────────────────────────────────────────────────

function PartyPill({ party, votes, compact }) {
  const { bar, label } = partyColor(party, 0);
  const display = compact && votes >= 1000
    ? `${(votes / 1000).toFixed(1)}k`
    : votes.toLocaleString();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      gap: compact ? 3 : 4,
      padding: compact ? '1px 5px' : '2px 7px',
      borderRadius: 4,
      background: `${bar}22`,
      border: `1px solid ${bar}44`,
      fontFamily: 'var(--mono)',
      fontSize: compact ? 9 : 10,
      whiteSpace: 'nowrap',
      color: label,
    }}>
      <span style={{ fontWeight: 600 }}>{party}</span>
      <span style={{ opacity: 0.72 }}>{display}</span>
    </span>
  );
}

// ─── FeedItem ─────────────────────────────────────────────────────────────────

function FeedItem({ result, isNew, bp }) {
  const sorted    = [...(result.results || [])].sort((a, b) => b.votes - a.votes);
  const topParty  = sorted[0];
  const pillMax   = bp === 'xs' ? 2 : bp === 'sm' ? 3 : 4;
  const overflow  = sorted.length - pillMax;
  const { bar }   = topParty ? partyColor(topParty.party, 0) : { bar: 'var(--border-2)' };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: bp === 'xs' ? '10px 12px' : '11px 14px',
      borderRadius: 10,
      border: `1px solid ${isNew ? 'rgba(201,168,76,0.42)' : 'var(--border)'}`,
      background: isNew ? 'rgba(201,168,76,0.06)' : 'var(--surface-3)',
      transition: 'border-color 0.4s, background 0.4s',
      animation: isNew ? 'slide-up 0.32s cubic-bezier(0.22,1,0.36,1) both' : undefined,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Leading colour bar */}
      <span style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: bar, borderRadius: '10px 0 0 10px',
        opacity: 0.85,
      }} />

      {/* NEW badge */}
      {isNew && (
        <span style={{
          position: 'absolute', top: 8, right: 10,
          fontFamily: 'var(--mono)', fontSize: 8,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          background: 'rgba(201,168,76,0.14)',
          border: '1px solid rgba(201,168,76,0.35)',
          color: 'var(--apc-gold)',
          padding: '1px 5px', borderRadius: 3,
          animation: 'blink 1s ease 4',
        }}>
          NEW
        </span>
      )}

      <div style={{ flex: 1, minWidth: 0, paddingLeft: 6 }}>
        {/* Unit name + time */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 8,
          marginBottom: 6,
        }}>
          <span style={{
            fontFamily: 'var(--display)',
            fontSize: bp === 'xs' ? 11 : 12,
            fontWeight: 700,
            color: isNew ? 'var(--apc-gold2)' : 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {result.pollingUnit}
          </span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9,
            color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0,
            // hide timestamp on xs to save space
            display: bp === 'xs' ? 'none' : 'block',
          }}>
            {formatDistanceToNow(new Date(result.submittedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Location breadcrumb */}
        {(result.state || result.lga) && (
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 9,
            color: 'var(--muted)', marginBottom: 6,
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {result.state && <span>{result.state}</span>}
            {result.lga   && <span style={{ opacity: 0.7 }}>{result.lga}</span>}
          </div>
        )}

        {/* Party pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {sorted.slice(0, pillMax).map(r => (
            <PartyPill
              key={r.party}
              party={r.party}
              votes={r.votes}
              compact={bp === 'xs'}
            />
          ))}
          {overflow > 0 && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 9,
              color: 'var(--muted)', alignSelf: 'center',
            }}>
              +{overflow}
            </span>
          )}
        </div>

        {/* Footer: agent + total + time-on-xs */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9,
            color: 'var(--muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {result.agentName ? `by ${result.agentName}` : ''}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Total votes chip */}
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10,
              fontWeight: 500, color: 'var(--apc-light)',
              letterSpacing: '-0.01em',
            }}>
              {(result.totalVotes || 0).toLocaleString()} votes
            </span>
            {/* Time on xs (moved here from top row) */}
            {bp === 'xs' && (
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)',
              }}>
                {formatDistanceToNow(new Date(result.submittedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LiveFeed ─────────────────────────────────────────────────────────────────

export default function LiveFeed({ results = [], newestId = null }) {
  const containerRef = useRef(null);
  const bp           = useContainerBreakpoint(containerRef);

  const sorted = [...results].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}
    >

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{
            display: 'block', width: 3, height: 13, borderRadius: 2,
            background: 'var(--apc-gold)',
            boxShadow: '0 0 8px rgba(201,168,76,0.45)',
          }} />
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--apc-gold)', fontWeight: 500,
          }}>
            Live activity
          </span>
        </div>

        {/* Live pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
            <span style={{
              display: 'block', width: 8, height: 8,
              borderRadius: '50%', background: '#4ADE80',
              boxShadow: '0 0 6px #4ADE8080',
            }} />
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1.5px solid #4ADE80',
              animation: 'pulse-ring 1.7s ease-out infinite',
            }} />
          </span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#4ADE80', fontWeight: 500,
          }}>
            Receiving
          </span>
        </div>
      </div>

      {/* ── Feed list ─────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: bp === 'xs' ? 6 : 8,
        paddingRight: 2,
        // Custom scrollbar handled by global CSS already in Dashboard
      }}>
        {sorted.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            flex: 1, padding: '48px 0',
            fontFamily: 'var(--mono)', color: 'var(--muted)',
          }}>
            {/* Satellite icon — pure SVG, no emoji */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ marginBottom: 14, opacity: 0.35 }}>
              <circle cx="18" cy="18" r="4" stroke="var(--apc-gold)" strokeWidth="1.5"/>
              <circle cx="18" cy="18" r="9" stroke="var(--apc-gold)" strokeWidth="1" strokeDasharray="3 3"/>
              <circle cx="18" cy="18" r="15" stroke="var(--apc-gold)" strokeWidth="0.75" strokeDasharray="2 4"/>
            </svg>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Awaiting submissions
            </p>
          </div>
        ) : (
          sorted.map(r => (
            <FeedItem
              key={r._id}
              result={r}
              isNew={r._id === newestId}
              bp={bp}
            />
          ))
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 12, marginTop: 10,
        borderTop: '1px solid var(--border)',
        flexShrink: 0, flexWrap: 'wrap', gap: 6,
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)',
        }}>
          {sorted.length} unit{sorted.length !== 1 ? 's' : ''} reported
        </span>
        {sorted.length > 0 && (
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)',
          }}>
            Latest:{' '}
            <span style={{ color: 'var(--apc-light)' }}>
              {formatDistanceToNow(new Date(sorted[0].submittedAt), { addSuffix: true })}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}