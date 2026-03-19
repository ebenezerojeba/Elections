import { useState, useEffect, useCallback } from 'react';
import { getResults, getSummary } from '../api/result';

export const useSummary = (refreshKey = 0) => {
  const [summary,  setSummary]  = useState(null);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetch = useCallback(async () => {
    try {
      const [sumData, resData] = await Promise.all([
        getSummary(),
        getResults(1, 100),
      ]);
      setSummary(sumData.summary);
      setResults(resData.results);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch, refreshKey]);

  return { summary, results, loading, error, refetch: fetch };
};