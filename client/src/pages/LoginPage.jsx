import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success('Welcome back, Agent');
      navigate('/agent');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 bg-vote-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">ElectTrack</span>
          </div>
          <h1 className="font-display text-5xl font-extrabold text-white leading-[1.1] mb-6">
            Field Agent<br />
            <span className="text-vote-500">Portal</span>
          </h1>
          <p className="text-slate-400 text-lg font-body leading-relaxed max-w-sm">
            Submit real-time election results from your polling unit. Every vote counts.
          </p>
        </div>

        {/* Stats strip at bottom */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Secure', value: 'JWT Auth' },
            { label: 'Real-time', value: 'Socket.io' },
            { label: 'Storage', value: 'Cloudinary' },
          ].map((s) => (
            <div key={s.label} className="border border-white/10 rounded-xl p-4">
              <div className="text-vote-500 font-display font-bold text-sm">{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-ink-900 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-vote-500 rounded-sm" />
            </div>
            <span className="font-display font-bold text-ink-900">ElectTrack</span>
          </div>

          <div className="mb-10">
            <h2 className="font-display text-3xl font-extrabold text-ink-900 mb-2">Sign in</h2>
            <p className="text-slate-500 text-sm">Enter your agent credentials to access the portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                placeholder="agent@election.gov"
                className={clsx('input', errors.email && 'input-error')}
                {...register('email', {
                  required: 'Email is required',
                  pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
              />
              {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={clsx('input', errors.password && 'input-error')}
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to portal'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            New agent?{' '}
            <Link to="/register" className="text-ink-900 font-medium hover:text-vote-600 transition-colors">
              Create account
            </Link>
          </p>

          {/* Public dashboard link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <L
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-ink-900 transition-colors"
            >
              <span className="live-dot" />
              View live public dashboard
            </L>
          </div>
        </div>
      </div>
    </div>
  );
}