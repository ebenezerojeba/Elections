
/**
 * hooks/useSummary.js
 *
 * Fetches aggregated election summary + raw results list.
 *
 * Usage:
 *   useSummary(refreshKey)                          → all-Lagos totals
 *   useSummary(refreshKey, { scope: 'lcda', id })   → one LCDA
 *   useSummary(refreshKey, { scope: 'ward', id })   → one ward
 *
 * Expected API response shape:
 *   GET /api/summary?scope=lcda&id=<id>
 *   {
 *     parties:        [{ party: 'APC', totalVotes: 1234 }, ...],
 *     grandTotal:     5678,
 *     reportingUnits: 12,          // count of wards that submitted
 *   }
 *
 *   GET /api/results?scope=lcda&id=<id>&page=1&limit=200
 *   {
 *     results: [...],
 *     total:   42,
 *   }
 */

import { useState, useEffect, useRef } from 'react';

const BASE = import.meta.env.VITE_API_URL || '';   // e.g. 'https://api.yoursite.com'

/**
 * Build a query string from a plain object, omitting empty/null values.
 * buildQuery({ scope: 'lcda', id: '123' }) → '?scope=lcda&id=123'
 * buildQuery({})                           → ''
 */
function buildQuery(params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export function useSummary(refreshKey = 0, scopeParams = {}) {
  const [summary, setSummary] = useState(null);   // { parties, grandTotal, reportingUnits }
  const [results, setResults] = useState([]);      // raw array of ElectionResult docs
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Keep a stable ref to scopeParams so the effect only re-runs when the
  // actual values change, not when the parent re-renders with a new object ref.
  const paramsRef = useRef(scopeParams);
  useEffect(() => { paramsRef.current = scopeParams; });

  // Serialise scopeParams to a string so useEffect can diff it correctly.
  const paramsKey = buildQuery(scopeParams);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const qs = buildQuery(paramsRef.current);

      try {
        // Run both fetches in parallel
        const [summaryRes, resultsRes] = await Promise.all([
          fetch(`${BASE}/results/summary${qs}`),
          fetch(`${BASE}/results${qs}${qs ? '&' : '?'}page=1&limit=500`),
        ]);

        

        if (!summaryRes.ok) throw new Error(`Summary fetch failed: ${summaryRes.status}`);
        if (!resultsRes.ok) throw new Error(`Results fetch failed: ${resultsRes.status}`);

        const [summaryData, resultsData] = await Promise.all([
          summaryRes.json(),
          resultsRes.json(),
        ]);

        if (cancelled) return;

        // Normalise summary — support both { parties, grandTotal, reportingUnits }
        // and legacy shapes like { data: { parties, ... } }
        const s = summaryData.data ?? summaryData;
        setSummary({
          parties:        s.parties        ?? [],
          grandTotal:     s.grandTotal     ?? 0,
          reportingUnits: s.reportingUnits ?? s.reportingWards ?? 0,
        });

        // Normalise results — support { results: [] } or plain array
        setResults(resultsData.results ?? resultsData ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };

  // Re-fetch whenever refreshKey bumps OR scope changes
  }, [refreshKey, paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { summary, results, loading, error };
}