import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Modal for admin to correct vote figures submitted by an agent.
 *
 * Props:
 *   result     — full result object to edit (null = closed)
 *   onClose    — called when modal dismissed
 *   onSaved    — callback(updatedResult) so parent can patch local state
 */
export default function EditResultModal({ result, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  const [parties, setParties] = useState([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const firstInputRef = useRef(null);
  const modalRef = useRef(null);

  // Trigger enter animation
  useEffect(() => {
    if (result) {
      setClosing(false);
      requestAnimationFrame(() => setMounted(true));
    } else {
      setMounted(false);
    }
  }, [result]);

  // Seed form whenever result changes
  useEffect(() => {
    if (!result) return;
    setParties((result.results || []).map(p => ({ ...p })));
    setNote('');
    setError(null);
  }, [result]);

  // Focus first input when modal opens
  useEffect(() => {
    if (mounted && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [mounted]);

  // Trap focus within modal
  useEffect(() => {
    if (!result) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [result, mounted]);

  const handleVoteChange = useCallback((idx, raw) => {
    const value = raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0);
    setParties(prev => prev.map((p, i) => i === idx ? { ...p, votes: value } : p));
  }, []);

  const totalVotes = parties.reduce((sum, p) => sum + (parseInt(p.votes, 10) || 0), 0);

  const animatedClose = useCallback(() => {
    setClosing(true);
    setMounted(false);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  const handleSave = async () => {
    if (busy) return;
    const invalid = parties.some(p => p.votes === '' || isNaN(parseInt(p.votes, 10)));
    if (invalid) { setError('All vote counts must be valid numbers.'); return; }

    setBusy(true);
    setError(null);
    try {
      const res = await authFetch(`${VITE_API_URL}/results/${result._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          results: parties.map(p => ({ ...p, votes: parseInt(p.votes, 10) })),
          totalVotes,
          correctionNote: note.trim() || undefined,
          status: 'pending',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Save failed. Please try again.'); return; }
      onSaved?.(data.result ?? data);
      animatedClose();
    } catch {
      setError('Network error — check your connection and retry.');
    } finally {
      setBusy(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !busy) animatedClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [animatedClose, busy]);

  // Prevent body scroll when open
  useEffect(() => {
    if (result) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [result]);

  if (!result && !closing) return null;

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    opacity: mounted ? 1 : 0,
    transition: 'opacity 0.2s ease',
    cursor: busy ? 'not-allowed' : 'pointer',
  };

  const panelStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: mounted
      ? 'translate(-50%, -50%) scale(1)'
      : 'translate(-50%, -48%) scale(0.97)',
    zIndex: 201,
    width: 'min(540px, calc(100vw - 24px))',
    maxHeight: 'calc(100dvh - 48px)',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
    background: 'var(--surface-1, #0d1810)',
    border: '1px solid var(--border-2, rgba(255,255,255,0.08))',
    borderRadius: 'clamp(10px, 2vw, 14px)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset',
    opacity: mounted ? 1 : 0,
    transition: 'transform 0.22s cubic-bezier(0.34,1.26,0.64,1), opacity 0.18s ease',
    outline: 'none',
  };

  return (
    <>
      <style>{`
        @keyframes em-spin {
          to { transform: rotate(360deg); }
        }
        .em-spin {
          animation: em-spin 0.7s linear infinite;
        }
        .em-input:focus {
          border-color: var(--apc-gold, #C9A84C) !important;
          box-shadow: 0 0 0 2px rgba(201,168,76,0.15);
          outline: none;
        }
        .em-btn-cancel:hover:not(:disabled) {
          background: var(--surface-3, rgba(255,255,255,0.06)) !important;
          color: var(--text, #e8e4d9) !important;
        }
        .em-btn-save:hover:not(:disabled) {
          background: rgba(201,168,76,0.2) !important;
          border-color: rgba(201,168,76,0.7) !important;
        }
        .em-btn-save:focus-visible,
        .em-btn-cancel:focus-visible {
          outline: 2px solid var(--apc-gold, #C9A84C);
          outline-offset: 2px;
        }
        .em-row:last-child {
          padding-bottom: 0;
        }
        /* Scrollbar styling */
        .em-panel::-webkit-scrollbar {
          width: 4px;
        }
        .em-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .em-panel::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }
        .em-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        /* Remove number input spinners */
        .em-vote-input::-webkit-inner-spin-button,
        .em-vote-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .em-vote-input {
          -moz-appearance: textfield;
        }
        @media (max-width: 400px) {
          .em-party-row {
            grid-template-columns: 1fr 100px !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => !busy && animatedClose()}
        style={backdropStyle}
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="em-title"
        tabIndex={-1}
        className="em-panel"
        style={panelStyle}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          padding: 'clamp(14px, 4vw, 20px) clamp(14px, 4vw, 20px) 13px',
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.07))',
          position: 'sticky',
          top: 0,
          background: 'var(--surface-1, #0d1810)',
          zIndex: 1,
        }}>
          <div style={{ minWidth: 0 }}>
            <div
              id="em-title"
              style={{
                fontFamily: 'var(--display, "Georgia", serif)',
                fontSize: 'clamp(13px, 3vw, 15px)',
                fontWeight: 700,
                color: 'var(--text, #e8e4d9)',
                marginBottom: 4,
              }}
            >
              Correct Result
            </div>
            <div style={{
              fontFamily: 'var(--mono, "Courier New", monospace)',
              fontSize: 'clamp(9px, 2vw, 10px)',
              color: 'var(--muted, rgba(232,228,217,0.45))',
              lineHeight: 1.6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'calc(100% - 4px)',
            }}>
              {[result.pollingUnit, result.lga, result.state]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>

          <button
            onClick={() => !busy && animatedClose()}
            disabled={busy}
            aria-label="Close modal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: 7,
              border: '1px solid var(--border, rgba(255,255,255,0.1))',
              background: 'transparent',
              color: 'var(--muted, rgba(232,228,217,0.45))',
              fontSize: 13,
              cursor: busy ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              opacity: busy ? 0.4 : 1,
              marginTop: 1,
            }}
            onMouseEnter={e => !busy && (e.currentTarget.style.background = 'var(--surface-3, rgba(255,255,255,0.06))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '0 clamp(14px, 4vw, 20px)' }}>

          {/* Warning banner */}
          <div
            role="note"
            style={{
              marginTop: 14,
              padding: '9px 12px',
              borderRadius: 7,
              background: 'rgba(201,168,76,0.07)',
              border: '1px solid rgba(201,168,76,0.25)',
              fontFamily: 'var(--mono, monospace)',
              fontSize: 'clamp(9px, 2vw, 10px)',
              color: '#C9A84C',
              lineHeight: 1.65,
            }}
          >
            ⚠ Saving will reset this result to <strong>pending</strong> and require re-verification.
          </div>

          {/* Vote inputs */}
          <div style={{ marginTop: 18 }}>
            <div style={{
              fontFamily: 'var(--mono, monospace)',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted, rgba(232,228,217,0.4))',
              marginBottom: 10,
            }}>
              Vote Figures
            </div>

            <div
              role="list"
              style={{ display: 'flex', flexDirection: 'column', gap: 7 }}
            >
              {parties.map((p, idx) => (
                <div
                  key={p.party}
                  role="listitem"
                  className="em-party-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 110px',
                    alignItems: 'center',
                    gap: 10,
                    padding: '5px 0',
                  }}
                >
                  <label
                    htmlFor={`em-vote-${idx}`}
                    style={{
                      fontFamily: 'var(--display, serif)',
                      fontSize: 'clamp(11px, 2.5vw, 13px)',
                      fontWeight: 700,
                      color: 'var(--text, #e8e4d9)',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {p.party}
                  </label>

                  <input
                    id={`em-vote-${idx}`}
                    ref={idx === 0 ? firstInputRef : null}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={p.votes}
                    onChange={e => handleVoteChange(idx, e.target.value)}
                    aria-label={`Votes for ${p.party}`}
                    className="em-input em-vote-input"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '7px 10px',
                      borderRadius: 7,
                      border: '1px solid var(--border-2, rgba(255,255,255,0.1))',
                      background: 'var(--surface-2, rgba(255,255,255,0.04))',
                      color: 'var(--text, #e8e4d9)',
                      fontFamily: 'var(--mono, monospace)',
                      fontSize: 'clamp(11px, 2.5vw, 13px)',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      textAlign: 'right',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Running total */}
            <div
              aria-live="polite"
              aria-label={`Total votes: ${totalVotes.toLocaleString()}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid var(--border, rgba(255,255,255,0.07))',
                fontFamily: 'var(--mono, monospace)',
                fontSize: 'clamp(10px, 2.5vw, 12px)',
              }}
            >
              <span style={{ color: 'var(--muted, rgba(232,228,217,0.45))' }}>Total votes</span>
              <span style={{ color: 'var(--text, #e8e4d9)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {totalVotes.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Correction note */}
          <div style={{ marginTop: 16 }}>
            <label
              htmlFor="em-correction-note"
              style={{
                display: 'block',
                fontFamily: 'var(--mono, monospace)',
                fontSize: 9,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--muted, rgba(232,228,217,0.4))',
                marginBottom: 6,
              }}
            >
              Correction Note{' '}
              <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              id="em-correction-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Transposition error on APC figure, corrected from 1240 to 1420"
              rows={3}
              maxLength={500}
              aria-describedby="em-note-count"
              className="em-input"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 10px',
                borderRadius: 7,
                border: '1px solid var(--border-2, rgba(255,255,255,0.1))',
                background: 'var(--surface-2, rgba(255,255,255,0.04))',
                color: 'var(--text, #e8e4d9)',
                fontFamily: 'var(--mono, monospace)',
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                resize: 'vertical',
                minHeight: 72,
                lineHeight: 1.65,
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            />
            <div
              id="em-note-count"
              aria-live="polite"
              style={{
                textAlign: 'right',
                fontFamily: 'var(--mono, monospace)',
                fontSize: 9,
                color: note.length > 450
                  ? '#F87171'
                  : 'var(--muted, rgba(232,228,217,0.3))',
                marginTop: 4,
                transition: 'color 0.15s',
              }}
            >
              {note.length}/500
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                marginTop: 10,
                padding: '8px 12px',
                borderRadius: 7,
                background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.3)',
                fontFamily: 'var(--mono, monospace)',
                fontSize: 'clamp(9px, 2vw, 10px)',
                color: '#F87171',
                lineHeight: 1.6,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 7,
              }}
            >
              <span aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>✕</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
          padding: 'clamp(14px, 4vw, 16px) clamp(14px, 4vw, 20px) clamp(14px, 4vw, 20px)',
          marginTop: 4,
          position: 'sticky',
          bottom: 0,
          background: 'var(--surface-1, #0d1810)',
          borderTop: '1px solid var(--border, rgba(255,255,255,0.07))',
        }}>
          <button
            onClick={() => !busy && animatedClose()}
            disabled={busy}
            className="em-btn-cancel"
            style={{
              padding: '7px clamp(12px, 3vw, 16px)',
              borderRadius: 7,
              border: '1px solid var(--border, rgba(255,255,255,0.1))',
              background: 'transparent',
              color: 'var(--muted, rgba(232,228,217,0.5))',
              fontFamily: 'var(--mono, monospace)',
              fontSize: 'clamp(10px, 2.5vw, 11px)',
              cursor: busy ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              opacity: busy ? 0.4 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={busy}
            className="em-btn-save"
            aria-busy={busy}
            aria-label={busy ? 'Saving correction…' : 'Save correction'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px clamp(14px, 3vw, 18px)',
              borderRadius: 7,
              border: '1px solid rgba(201,168,76,0.45)',
              background: busy
                ? 'rgba(201,168,76,0.05)'
                : 'rgba(201,168,76,0.12)',
              color: busy
                ? 'rgba(201,168,76,0.45)'
                : 'var(--apc-gold, #C9A84C)',
              fontFamily: 'var(--mono, monospace)',
              fontSize: 'clamp(10px, 2.5vw, 11px)',
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}
          >
            {busy ? (
              <>
                <svg
                  className="em-spin"
                  width="11"
                  height="11"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="5" cy="5" r="3.5"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5 1.5A3.5 3.5 0 0 1 8.5 5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                Saving…
              </>
            ) : (
              'Save Correction'
            )}
          </button>
        </div>
      </div>
    </>
  );
}