import React, { useState, useCallback } from 'react';
import CabinetSelector from './components/CabinetSelector';
import UnitToggle from './components/UnitToggle';
import ParameterInputs from './components/ParameterInputs';
import ResultCard from './components/ResultCard';
import { useCalculator } from './hooks/useCalculator';
import { convert } from './utils/unitConverter';
import './App.css';

export default function App() {
  // ── state ──────────────────────────────────────────────────────────────────
  const [cabinetType, setCabinetType] = useState('16:9');
  const [unit, setUnit]               = useState('in');
  const [activeParams, setActiveParams] = useState(new Set()); // max 2 keys
  const [paramValues, setParamValues] = useState({
    aspectRatio: null,
    height: '',
    width: '',
    diagonal: '',
  });

  const { results, error, calculate, selectedResult, setSelectedResult, reset } = useCalculator();

  // ── handlers ───────────────────────────────────────────────────────────────

  // Toggle a parameter active/inactive
  const handleToggleParam = useCallback((key) => {
    setActiveParams((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        // Clear its value when deselecting
        setParamValues((pv) => ({ ...pv, [key]: key === 'aspectRatio' ? null : '' }));
      } else {
        if (next.size < 2) next.add(key);
      }
      return next;
    });
    reset();
  }, [reset]);

  const handleValueChange = useCallback((key, val) => {
    setParamValues((prev) => ({ ...prev, [key]: val }));
    reset();
  }, [reset]);

  // When unit changes: convert all active numeric values
  const handleUnitChange = useCallback((newUnit) => {
    if (newUnit === unit) return;
    setParamValues((prev) => {
      const next = { ...prev };
      ['height', 'width', 'diagonal'].forEach((key) => {
        if (activeParams.has(key) && prev[key] !== '' && prev[key] != null) {
          const converted = convert(parseFloat(prev[key]), unit, newUnit);
          next[key] = isNaN(converted) ? '' : parseFloat(converted.toFixed(6)).toString();
        }
      });
      return next;
    });
    setUnit(newUnit);
    reset();
  }, [unit, activeParams, reset]);

  // Build inputs object for the API
  const buildInputs = () => {
    const inputs = {};
    activeParams.forEach((key) => {
      const v = paramValues[key];
      if (v != null && v !== '') {
        inputs[key] = parseFloat(v);
      }
    });
    return inputs;
  };

  const canCalculate = () => {
    const inputs = buildInputs();
    const keys = Object.keys(inputs);
    if (keys.length !== 2) return false;
    return keys.every((k) => !isNaN(inputs[k]) && inputs[k] > 0);
  };

  const handleCalculate = () => {
    if (!canCalculate()) return;
    calculate({ cabinetType, inputs: buildInputs(), unit });
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="app-header">
        <h1>Video Wall Size Calculator</h1>
        <p className="app-subtitle">
          Configure your LED video wall by selecting a cabinet type and two target parameters.
        </p>
      </header>

      <main className="app-main">
        {/* ── Left panel: inputs ── */}
        <section className="input-panel">
          <CabinetSelector value={cabinetType} onChange={(v) => { setCabinetType(v); reset(); }} />
          <UnitToggle value={unit} onChange={handleUnitChange} />
          <ParameterInputs
            activeParams={activeParams}
            values={paramValues}
            unit={unit}
            onToggleParam={handleToggleParam}
            onValueChange={handleValueChange}
          />

          <button
            type="button"
            className="calculate-btn"
            disabled={!canCalculate()}
            onClick={handleCalculate}
          >
            Calculate
          </button>

          {error && <div className="error-banner">{error}</div>}

          {/* Active input summary */}
          {activeParams.size === 2 && (
            <div className="input-summary">
              <span className="summary-title">Active inputs:</span>
              {[...activeParams].map((k) => (
                <span key={k} className="summary-chip">
                  {k === 'aspectRatio'
                    ? `AR: ${paramValues.aspectRatio ? parseFloat(paramValues.aspectRatio).toFixed(3) : '—'}`
                    : `${k}: ${paramValues[k] || '—'} ${unit}`}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Right panel: results ── */}
        <section className="results-panel">
          {results ? (
            <>
              <h2 className="results-title">Results</h2>
              <div className="results-grid">
                <ResultCard
                  result={results.lower}
                  unit={unit}
                  isSelected={selectedResult === 'lower'}
                  onSelect={() => setSelectedResult(selectedResult === 'lower' ? null : 'lower')}
                />
                <ResultCard
                  result={results.upper}
                  unit={unit}
                  isSelected={selectedResult === 'upper'}
                  onSelect={() => setSelectedResult(selectedResult === 'upper' ? null : 'upper')}
                />
              </div>

              {/* Final selection summary */}
              {selectedResult && results[selectedResult] && (
                <SelectedSummary result={results[selectedResult]} unit={unit} />
              )}
            </>
          ) : (
              <div className="results-placeholder">
                <div className="placeholder-icon">⬛⬛<br />⬛⬛</div>
                <p>Configure inputs on the left and click <strong>Calculate</strong> to see configurations.</p>
              </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SelectedSummary({ result, unit }) {
  const u = unit;
  return (
    <div className="selected-summary">
      <h3>Selected Configuration</h3>
      <p>
        <strong>{result.cols} columns × {result.rows} rows</strong> &nbsp;·&nbsp;
        {result.totalCabinets} cabinets &nbsp;·&nbsp;
        {result.width} {u} W × {result.height} {u} H &nbsp;·&nbsp;
        Diagonal: {result.diagonal} {u} &nbsp;·&nbsp;
        AR: {result.aspectRatio.toFixed(3)}
      </p>
    </div>
  );
}
