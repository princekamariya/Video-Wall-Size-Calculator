import React from 'react';
import { CABINET_TYPES } from '../utils/constants';

export default function CabinetSelector({ value, onChange }) {
  return (
    <div className="cabinet-selector">
      <label className="section-label">Cabinet Type</label>
      <div className="cabinet-options">
        {CABINET_TYPES.map((c) => (
          <button
            key={c.id}
            className={`cabinet-btn ${value === c.id ? 'active' : ''}`}
            onClick={() => onChange(c.id)}
            type="button"
          >
            <span className="cabinet-name">{c.label}</span>
            <span className="cabinet-dims">
              {c.widthMm} × {c.heightMm} mm
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
