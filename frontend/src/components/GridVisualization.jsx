import React, { useMemo } from 'react';

const MAX_VISUAL_CELLS = 400; // cap rendering for very large configs
const MIN_CELL_PX = 4;
const MAX_GRID_PX = 300;

export default function GridVisualization({ cols, rows, label, color }) {
  // Compute cell size so the grid fits inside MAX_GRID_PX
  const cellSize = useMemo(() => {
    const byWidth  = Math.floor(MAX_GRID_PX / cols);
    const byHeight = Math.floor(MAX_GRID_PX / rows);
    return Math.max(MIN_CELL_PX, Math.min(byWidth, byHeight));
  }, [cols, rows]);

  const totalCells = cols * rows;
  const tooMany = totalCells > MAX_VISUAL_CELLS;

  return (
    <div className="grid-viz">
      <div className="grid-viz-title" style={{ color }}>
        {label} — {cols} × {rows} grid
      </div>

      {tooMany ? (
        <div className="grid-viz-large">
          <div
            className="grid-rect"
            style={{
              width: Math.min(cols * MIN_CELL_PX, MAX_GRID_PX),
              height: Math.min(rows * MIN_CELL_PX, MAX_GRID_PX),
              borderColor: color,
            }}
          >
            <span className="grid-rect-label">{cols} × {rows}</span>
          </div>
          <p className="grid-note">Grid too large to render individually — showing proportional rectangle.</p>
        </div>
      ) : (
        <div
          className="grid-cells"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows:    `repeat(${rows}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: totalCells }).map((_, i) => (
            <div
              key={i}
              className="grid-cell"
              style={{ width: cellSize, height: cellSize, borderColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
