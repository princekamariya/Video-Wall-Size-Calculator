import React from 'react';
import { UNIT_LABELS } from '../utils/unitConverter';
import GridVisualization from './GridVisualization';

const LOWER_COLOR = '#22c55e';
const UPPER_COLOR = '#f59e0b';

export default function ResultCard({ result, unit, isSelected, onSelect }) {
  if (!result) return null;

  const isLower = result.label === 'lower';
  const color = isLower ? LOWER_COLOR : UPPER_COLOR;
  const unitLabel = UNIT_LABELS[unit];

  return (
    <div
      className={`result-card ${isLower ? 'lower' : 'upper'} ${isSelected ? 'selected' : ''}`}
      style={{ '--card-color': color }}
    >
      {/* Badge */}
      <div className="result-badge" style={{ background: color }}>
        {isLower ? '▼ Lower' : '▲ Upper'}
      </div>

      {/* Metrics grid */}
      <div className="result-metrics">
        <Metric label="Configuration" value={`${result.cols} cols × ${result.rows} rows`} />
        <Metric label="Total Cabinets" value={result.totalCabinets} />
        <Metric label={`Width (${unitLabel})`} value={fmt(result.width)} />
        <Metric label={`Height (${unitLabel})`} value={fmt(result.height)} />
        <Metric label={`Diagonal (${unitLabel})`} value={fmt(result.diagonal)} />
        <Metric label="Aspect Ratio" value={result.aspectRatio.toFixed(3)} />
      </div>

      {/* Grid visualization */}
      <GridVisualization
        cols={result.cols}
        rows={result.rows}
        label={isLower ? 'Lower' : 'Upper'}
        color={color}
      />

      {/* Select button */}
      <button
        type="button"
        className={`select-btn ${isSelected ? 'chosen' : ''}`}
        style={isSelected ? { background: color } : {}}
        onClick={onSelect}
      >
        {isSelected ? '✓ Selected Configuration' : 'Select This Configuration'}
      </button>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}

function fmt(n) {
  // Show up to 4 significant decimal places, trimming trailing zeros
  return parseFloat(n.toFixed(4)).toString();
}
