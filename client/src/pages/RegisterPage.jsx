import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register: registerAgent } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerAgent({
        name:        values.name,
        email:       values.email,
        password:    values.password,
        pollingUnit: values.pollingUnit.trim().toUpperCase(),
      });
      toast.success('Account created! Welcome, Agent.');
      navigate('/agent');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-up">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-vote-500 rounded-sm" />
            </div>
            <span className="font-display font-bold text-ink-900 text-lg">ElectTrack</span>
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 mb-2">Create agent account</h1>
          <p className="text-slate-500 text-sm">Register to start submitting election results</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Name + Email row */}
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

            {/* Polling unit */}
            <div>
              <label className="label">Assigned polling unit</label>
              <input
                type="text"
                placeholder="e.g. PU-001-ABUJA"
                className={clsx('input font-mono text-sm uppercase', errors.pollingUnit && 'input-error')}
                {...register('pollingUnit', {
                  required: 'Polling unit required',
                  pattern:  { value: /^[A-Za-z0-9\-]+$/, message: 'Letters, numbers and hyphens only' },
                })}
              />
              {errors.pollingUnit && <p className="field-error">⚠ {errors.pollingUnit.message}</p>}
            </div>

            {/* Password fields */}
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
                    validate: (v) => v === watch('password') || 'Passwords do not match',
                  })}
                />
                {errors.confirm && <p className="field-error">⚠ {errors.confirm.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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