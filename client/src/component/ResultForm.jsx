import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { submitResult } from '../api/result';

const DEFAULT_PARTIES = ['APC', 'PDP', 'LP', 'NNPP'];

export default function ResultForm({ onSuccess }) {
  const { user }     = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [preview,    setPreview]    = useState(null);
  const fileRef      = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pollingUnit: user?.pollingUnit || '',
      results: DEFAULT_PARTIES.map((party) => ({ party, votes: '' })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'results' });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('pollingUnit', values.pollingUnit);
      // Append results as JSON string — server parses it
      fd.append('results', JSON.stringify(
        values.results.map((r) => ({ party: r.party, votes: parseInt(r.votes, 10) }))
      ));
      if (fileRef.current?.files[0]) {
        fd.append('image', fileRef.current.files[0]);
      }

      await submitResult(fd);
      toast.success('Results submitted successfully!');
      reset({
        pollingUnit: user?.pollingUnit || '',
        results: DEFAULT_PARTIES.map((party) => ({ party, votes: '' })),
      });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      onSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Polling unit — locked to agent's assignment */}
      <div className="mb-6">
        <label className="label">Polling unit</label>
        <div className="relative">
          <input
            readOnly
            className="input bg-slate-50 font-mono text-sm cursor-not-allowed"
            {...register('pollingUnit')}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="badge-verified text-xs">Assigned</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          You can only submit results for your assigned polling unit.
        </p>
      </div>

      {/* Party results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="label mb-0">Party results</label>
          <button
            type="button"
            onClick={() => append({ party: '', votes: '' })}
            className="btn-ghost text-xs py-1 px-3"
          >
            + Add party
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start animate-fade-in">
              <div className="flex-1">
                <input
                  placeholder="Party name (e.g. APC)"
                  className={clsx(
                    'input text-sm uppercase',
                    errors.results?.[index]?.party && 'input-error'
                  )}
                  {...register(`results.${index}.party`, {
                    required: 'Required',
                  })}
                />
                {errors.results?.[index]?.party && (
                  <p className="field-error">{errors.results[index].party.message}</p>
                )}
              </div>
              <div className="w-32">
                <input
                  type="number"
                  min="0"
                  placeholder="Votes"
                  className={clsx(
                    'input text-sm font-mono',
                    errors.results?.[index]?.votes && 'input-error'
                  )}
                  {...register(`results.${index}.votes`, {
                    required: 'Required',
                    min: { value: 0, message: '≥ 0' },
                    valueAsNumber: true,
                  })}
                />
                {errors.results?.[index]?.votes && (
                  <p className="field-error">{errors.results[index].votes.message}</p>
                )}
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2.5 text-slate-300 hover:text-alert-500 transition-colors"
                  aria-label="Remove party"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image proof upload */}
      <div className="mb-8">
        <label className="label">Image proof <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
        <div
          onClick={() => fileRef.current?.click()}
          className={clsx(
            'border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer',
            'hover:border-ink-900 transition-colors text-center group'
          )}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-cover"
              />
              <p className="text-xs text-slate-400 mt-2">Click to change</p>
            </div>
          ) : (
            <div>
              <svg className="w-8 h-8 text-slate-300 group-hover:text-slate-400 mx-auto mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-slate-400">
                <span className="text-ink-900 font-medium">Click to upload</span> result sheet image
              </p>
              <p className="text-xs text-slate-400 mt-1">JPEG, PNG or WebP · max 5 MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full text-base py-3.5"
      >
        {submitting ? (
          <>
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Submitting results…
          </>
        ) : (
          'Submit election results'
        )}
      </button>

      <p className="text-xs text-slate-400 text-center mt-3">
        ⚠ Results cannot be edited after submission. Verify all counts before submitting.
      </p>
    </form>
  );
}