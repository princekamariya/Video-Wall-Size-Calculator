import { useState, useCallback } from 'react';
import { calculate } from '../utils/calculator';

export function useCalculator() {
  const [results, setResults]             = useState(null);
  const [error, setError]                 = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const runCalculate = useCallback(({ cabinetType, inputs, unit }) => {
    setError(null);
    setResults(null);
    setSelectedResult(null);

    const result = calculate({ cabinetType, inputs, unit });

    if (result.error) {
      setError(result.error);
    } else {
      setResults(result);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setSelectedResult(null);
  }, []);

  return { results, error, calculate: runCalculate, selectedResult, setSelectedResult, reset };
}
