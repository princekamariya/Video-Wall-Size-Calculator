import React from 'react';
import { PARAMETER_KEYS, PARAMETER_LABELS, ASPECT_RATIO_PRESETS } from '../utils/constants';
import { UNIT_LABELS } from '../utils/unitConverter';

/**
 * Renders the 4 parameter inputs with exactly-2-at-a-time selection logic.
 *
 * activeParams: Set of currently enabled param keys (max 2)
 * values:       { aspectRatio, height, width, diagonal } — numeric strings
 * unit:         currently selected unit (used for labels on height/width/diagonal)
 *
 * onToggleParam(key): toggle a param key active/inactive
 * onValueChange(key, value): update a param's value
 */
export default function ParameterInputs({ activeParams, values, unit, onToggleParam, onValueChange }) {
  const activeList = [...activeParams];
  const isFull = activeList.length === 2;

  return (
    <div className="param-inputs">
      <label className="section-label">
        Select exactly 2 parameters
        <span className="param-count">{activeList.length}/2</span>
      </label>

      <div className="param-grid">
        {PARAMETER_KEYS.map((key) => {
          const isActive = activeParams.has(key);
          const isDisabled = isFull && !isActive;

          return (
            <div
              key={key}
              className={`param-card ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
            >
              {/* Header row: checkbox-style toggle + label */}
              <div className="param-header" onClick={() => !isDisabled && onToggleParam(key)}>
                <span className={`param-check ${isActive ? 'checked' : ''}`}>
                  {isActive ? '✓' : ''}
                </span>
                <span className="param-label">{PARAMETER_LABELS[key]}</span>
                {key !== 'aspectRatio' && (
                  <span className="param-unit">({UNIT_LABELS[unit]})</span>
                )}
              </div>

              {/* Input area */}
              {key === 'aspectRatio' ? (
                <AspectRatioInput
                  active={isActive}
                  disabled={isDisabled}
                  value={values.aspectRatio}
                  onChange={(v) => onValueChange('aspectRatio', v)}
                />
              ) : (
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="param-input"
                  placeholder="Enter value…"
                  disabled={!isActive}
                  value={isActive ? (values[key] ?? '') : ''}
                  onChange={(e) => onValueChange(key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AspectRatioInput({ active, disabled, value, onChange }) {
  return (
    <div className="ar-options">
      {ASPECT_RATIO_PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          disabled={!active || disabled}
          className={`ar-btn ${active && Math.abs(value - p.value) < 0.001 ? 'selected' : ''}`}
          onClick={() => active && onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
