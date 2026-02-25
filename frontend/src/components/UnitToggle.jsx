import React from 'react';
import { UNITS, UNIT_LABELS } from '../utils/unitConverter';

export default function UnitToggle({ value, onChange }) {
  return (
    <div className="unit-toggle">
      <label className="section-label">Unit</label>
      <div className="unit-options">
        {UNITS.map((u) => (
          <button
            key={u}
            type="button"
            className={`unit-btn ${value === u ? 'active' : ''}`}
            onClick={() => onChange(u)}
          >
            {UNIT_LABELS[u]}
          </button>
        ))}
      </div>
    </div>
  );
}
