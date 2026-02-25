import { useState, useCallback } from 'react';
import axios from 'axios';
import { convert } from '../utils/unitConverter';

const API_URL = '/api/calculate';

export function useCalculator() {
  const [results, setResults] = useState(null);       // { lower, upper }
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [selectedResult, setSelectedResult] = useState(null); // 'lower' | 'upper'

  const calculate = useCallback(async ({ cabinetType, inputs, unit }) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedResult(null);

    try {
      const { data } = await axios.post(API_URL, { cabinetType, inputs, unit });
      setResults(data);
    } catch (err) {
      const msg = err.response?.data?.error ?? err.message ?? 'Calculation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setSelectedResult(null);
  }, []);

  return { results, loading, error, calculate, selectedResult, setSelectedResult, reset };
}
