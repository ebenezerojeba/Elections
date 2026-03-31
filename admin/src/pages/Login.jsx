import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── APCMark (inline — no external import needed on the login page) ───────────
function APCMark({ size = 60 }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 200 220" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect x="10"  y="10" width="60"  height="160" fill="#009A44"/>
      <rect x="70"  y="10" width="60"  height="160" fill="#FFFFFF"/>
      <rect x="130" y="10" width="60"  height="160" fill="#87CEEB"/>
      <rect x="10"  y="10" width="180" height="160" fill="none" stroke="#ccc" strokeWidth="0.5"/>
      {[
        [62,20,2.2],[68,18,2],[74,16,1.8],[80,14,1.8],
        [86,13,2],[91,12,2.2],[96,12,2.4],[100,12,2.8],
        [104,12,2.4],[109,12,2.2],[114,13,2],[120,14,1.8],
        [126,16,1.8],[132,18,2],[138,20,2.2],
      ].map(([x2, y2, sw], i) => (
        <line key={i} x1="100" y1="115" x2={x2} y2={y2}
          stroke={i % 2 === 0 ? '#C8A96E' : '#D4B87A'}
          strokeWidth={sw} strokeLinecap="round"/>
      ))}
      <rect x="91" y="108" width="18" height="8"  rx="3" fill="#8B6914" opacity="0.9"/>
      <rect x="89" y="114" width="22" height="7"  rx="3" fill="#7A5C10" opacity="0.85"/>
      <ellipse cx="100" cy="132" rx="13" ry="16" fill="#8B5E3C"/>
      <ellipse cx="87"  cy="127" rx="6"  ry="4.5" fill="#9B6E4C" transform="rotate(-20,87,127)"/>
      <ellipse cx="93"  cy="120" rx="4" ry="3" fill="#7A4E2C" opacity="0.5"/>
      <ellipse cx="100" cy="118" rx="4" ry="3" fill="#7A4E2C" opacity="0.5"/>
      <ellipse cx="107" cy="120" rx="4" ry="3" fill="#7A4E2C" opacity="0.5"/>
      <rect x="89" y="144" width="22" height="22" rx="5" fill="#8B5E3C"/>
      <rect x="87" y="160" width="26" height="8"  rx="3" fill="#6B4224" opacity="0.7"/>
      <rect x="10" y="170" width="180" height="40" fill="#CC1E1E"/>
      <text x="100" y="198" textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="28" fontWeight="900" fill="#FFFFFF" letterSpacing="4">APC</text>
    </svg>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, id, type, value, onChange, placeholder, autoComplete, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{
        fontFamily: 'var(--mono)', fontSize: 9,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: focused ? 'var(--apc-gold)' : 'var(--muted)',
        transition: 'color 0.2s',
      }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '11px 14px',
          background: 'var(--surface-2)',
          border: `1px solid ${focused ? 'var(--apc-gold)' : 'var(--border-2)'}`,
          borderRadius: 8,
          color: 'var(--text)',
          fontFamily: 'var(--mono)',
          fontSize: 13,
          outline: 'none',
          transition: 'border-color 0.2s',
          opacity: disabled ? 0.5 : 1,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Already authenticated — go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const ok = await login(email.trim(), password);
    if (ok) navigate(from, { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--mono)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background grid texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(26,107,58,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,107,58,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,107,58,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 400,
        background: 'var(--surface)',
        border: '1px solid var(--border-2)',
        borderRadius: 16,
        padding: '36px 32px 32px',
        boxSizing: 'border-box',
      }}>

        {/* Logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', marginBottom: 16 }}>
            <APCMark size={52} />
          </div>
          <h1 style={{
            fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22,
            color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1,
            marginBottom: 6,
          }}>
            Admin Access
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>
            APC RESULTS CENTRE
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            marginBottom: 20,
            padding: '10px 14px',
            background: 'rgba(220,38,38,0.1)',
            border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 8,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            {/* Warning icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M7 1L13 12H1L7 1Z" stroke="#F87171" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
              <line x1="7" y1="5.5" x2="7" y2="8.5" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="7" cy="10.5" r="0.6" fill="#F87171"/>
            </svg>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#F87171', lineHeight: 1.5 }}>
              {error}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field
            label="Email address"
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@apc.ng"
            autoComplete="email"
            disabled={loading}
          />

          {/* Password field with show/hide toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{
                fontFamily: 'var(--mono)', fontSize: 9,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--muted)',
              }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  background: 'none', border: 'none',
                  fontFamily: 'var(--mono)', fontSize: 9,
                  color: 'var(--apc-gold)', cursor: 'pointer',
                  letterSpacing: '0.1em', padding: 0,
                }}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                borderRadius: 8,
                color: 'var(--text)',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 0.2s',
                opacity: loading ? 0.5 : 1,
                boxSizing: 'border-box',
              }}
              onFocus={e  => e.target.style.borderColor = 'var(--apc-gold)'}
              onBlur={e   => e.target.style.borderColor = 'var(--border-2)'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '13px',
              borderRadius: 8,
              border: 'none',
              background: loading || !email || !password
                ? 'rgba(26,107,58,0.3)'
                : 'var(--apc-green)',
              color: loading || !email || !password
                ? 'rgba(184,223,200,0.4)'
                : '#D4EDE0',
              fontFamily: 'var(--display)',
              fontSize: 14, fontWeight: 700,
              letterSpacing: '-0.01em',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                {/* Spinner */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <circle cx="7" cy="7" r="5.5" stroke="rgba(184,223,200,0.3)" strokeWidth="1.5"/>
                  <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="rgba(184,223,200,0.8)"
                    strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Signing in…
              </>
            ) : 'Sign in to Dashboard'}
          </button>
        </form>

        {/* Footer note */}
        <p style={{
          marginTop: 24,
          textAlign: 'center',
          fontFamily: 'var(--mono)', fontSize: 9,
          color: 'rgba(184,223,200,0.25)',
          letterSpacing: '0.08em', lineHeight: 1.6,
        }}>
          Restricted to authorised administrators only.
          <br />All access is logged.
        </p>
      </div>
    </div>
  );
}