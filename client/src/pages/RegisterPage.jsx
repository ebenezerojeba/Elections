import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const backendUrl = import.meta.env.VITE_API_URL


// ── Fetch helpers (adjust base URL if you use an axios instance) ─────────────
async function fetchLcdas() {
  const res = await fetch(`${backendUrl}/results/lcdas`);
  if (!res.ok) throw new Error('Could not load LCDAs');
  const data = await res.json();
  return data.lcdas ?? data; // handle { lcdas: [] } or plain array
}

async function fetchWards(lcdaId) {
  const res = await fetch(`${backendUrl}/results/lcdas/${lcdaId}/wards`);
  if (!res.ok) throw new Error('Could not load wards');
  const data = await res.json();
  return data.wards ?? data;
}

export default function RegisterPage() {
  const { register: registerAgent } = useAuth();
  const navigate = useNavigate();

  // ── Cascade state ────────────────────────────────────────────────────────
  const [lcdas,       setLcdas]       = useState([]);
  const [wards,       setWards]       = useState([]);
  const [lcdaLoading, setLcdaLoading] = useState(true);
  const [wardLoading, setWardLoading] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedLcda = watch('lcda');
  const selectedWard = watch('ward');

  // Load all LCDAs on mount
  useEffect(() => {
    fetchLcdas()
      .then(setLcdas)
      .catch(() => toast.error('Failed to load LCDAs'))
      .finally(() => setLcdaLoading(false));
  }, []);

  // Load wards whenever LCDA selection changes
  useEffect(() => {
    if (!selectedLcda) { setWards([]); setValue('ward', ''); return; }
    setWardLoading(true);
    setValue('ward', '');
    fetchWards(selectedLcda)
      .then(setWards)
      .catch(() => toast.error('Failed to load wards'))
      .finally(() => setWardLoading(false));
  }, [selectedLcda, setValue]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerAgent({
        name:     values.name,
        email:    values.email,
        password: values.password,
        lcda:     values.lcda,   // ObjectId
        ward:     values.ward,   // ObjectId
      });
      toast.success('Account created! Welcome, Agent.');
      navigate('/agent');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Resolved display names for the confirmation pill
  const lcdaName = lcdas.find((l) => l._id === selectedLcda)?.name ?? '';
  const wardName = wards.find((w) => w._id === selectedWard)?.name ?? '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-up">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-extrabold text-ink-900 mb-2">
            Create agent account
          </h1>
          <p className="text-slate-500 text-sm">
            Register to start submitting election results for your ward
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* ── Name + Email ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  placeholder="Amina Yusuf"
                  className={clsx('input', errors.name && 'input-error')}
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Too short' },
                  })}
                />
                {errors.name && <p className="field-error">⚠ {errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  placeholder="agent@election.gov"
                  className={clsx('input', errors.email && 'input-error')}
                  {...register('email', {
                    required: 'Email required',
                    pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                />
                {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
              </div>
            </div>

            {/* ── LCDA select ── */}
            <div>
              <label className="label">
                Assigned LCDA
                {lcdaLoading && (
                  <span className="ml-2 inline-flex items-center gap-1 text-slate-400 text-xs font-normal">
                    <span className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin"/>
                    Loading…
                  </span>
                )}
              </label>
              <select
                className={clsx(
                  'input bg-white',
                  errors.lcda && 'input-error',
                  !selectedLcda && 'text-slate-400'
                )}
                disabled={lcdaLoading}
                {...register('lcda', { required: 'Please select your LCDA' })}
              >
                <option value="">
                  {lcdaLoading ? 'Loading LCDAs…' : '— Select LCDA —'}
                </option>
                {lcdas.map((l) => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </select>
              {errors.lcda && <p className="field-error">⚠ {errors.lcda.message}</p>}
            </div>

            {/* ── Ward select — cascades in after LCDA chosen ── */}
            <div>
              <label className="label">
                Assigned Ward
                {wardLoading && (
                  <span className="ml-2 inline-flex items-center gap-1 text-slate-400 text-xs font-normal">
                    <span className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin"/>
                    Loading…
                  </span>
                )}
              </label>
              <select
                className={clsx(
                  'input bg-white',
                  errors.ward && 'input-error',
                  (!selectedLcda || !selectedWard) && 'text-slate-400'
                )}
                disabled={!selectedLcda || wardLoading}
                {...register('ward', { required: 'Please select your ward' })}
              >
                <option value="">
                  {!selectedLcda
                    ? 'Select an LCDA first'
                    : wardLoading
                      ? 'Loading wards…'
                      : '— Select Ward —'}
                </option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
              {errors.ward && <p className="field-error">⚠ {errors.ward.message}</p>}
            </div>

            {/* ── Assignment confirmation pill ── */}
            {lcdaName && wardName && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <span className="text-slate-500">Assigned to</span>
                <span className="font-mono font-medium text-ink-900">{lcdaName}</span>
                <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
                <span className="font-mono font-medium text-ink-900">{wardName}</span>
              </div>
            )}

            {/* ── Password fields ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  className={clsx('input', errors.password && 'input-error')}
                  {...register('password', {
                    required:  'Password required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern:   { value: /\d/, message: 'Must include a number' },
                  })}
                />
                {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  className={clsx('input', errors.confirm && 'input-error')}
                  {...register('confirm', {
                    required: 'Please confirm',
                    validate:  (v) => v === watch('password') || 'Passwords do not match',
                  })}
                />
                {errors.confirm && <p className="field-error">⚠ {errors.confirm.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                  Creating account…
                </>
              ) : (
                'Create agent account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/agent/login" className="text-ink-900 font-medium hover:text-vote-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}