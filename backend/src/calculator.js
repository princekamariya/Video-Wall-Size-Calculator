/**
 * Core Video Wall Size Calculator Logic
 *
 * Cabinet types:
 *   16:9 → width: 600mm, height: 337.5mm
 *   1:1  → width: 500mm, height: 500mm
 *
 * Finds the closest LOWER (≤ target) and UPPER (> target) cabinet configurations.
 *
 * Supported input pairs (exactly two):
 *   aspectRatio + height
 *   aspectRatio + width
 *   aspectRatio + diagonal
 *   height      + width
 *   height      + diagonal
 *   width       + diagonal
 */

const { toMm, fromMm } = require('./utils/unitConverter');

const CABINET_TYPES = {
  '16:9': { widthMm: 600, heightMm: 337.5 },
  '1:1':  { widthMm: 500, heightMm: 500  },
};

// Hard cap per axis to prevent runaway searches (500×500 = 250k combos, ~5ms)
const HARD_MAX = 500;

// Floating-point tolerance for "exact match" detection (0.001 mm)
const EPSILON = 0.001;

/**
 * Compute a sensible row/col search limit based on the target dimension.
 * Goes 10 steps beyond what's needed for the target, capped at HARD_MAX.
 */
function dynMax(targetMm, cabinetDimMm) {
  return Math.min(HARD_MAX, Math.ceil(targetMm / cabinetDimMm) + 10);
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function diagOf(w, h)    { return Math.sqrt(w * w + h * h); }
function arOf(w, h)      { return w / h; }
function round4(n)       { return Math.round(n * 10000) / 10000; }

/**
 * Build the result object for a (cols, rows) configuration.
 */
function buildResult(cols, rows, cabinet, unit, label) {
  const widthMm  = cols * cabinet.widthMm;
  const heightMm = rows * cabinet.heightMm;
  const diagMm   = diagOf(widthMm, heightMm);
  const ar       = arOf(widthMm, heightMm);

  return {
    label,
    cols,
    rows,
    totalCabinets: cols * rows,
    width:       round4(fromMm(widthMm,  unit)),
    height:      round4(fromMm(heightMm, unit)),
    diagonal:    round4(fromMm(diagMm,   unit)),
    aspectRatio: round4(ar),
  };
}

// ─── Strategy A: AR-constrained search ───────────────────────────────────────
/**
 * Used when Aspect Ratio is one of the two inputs.
 *
 * For each candidate row count (height-primary) or col count (width-primary):
 *   → compute cols (or rows) from the AR constraint
 *   → classify as lower/upper based on the specified dimension
 *   → among lower candidates pick the one with best combined score
 *   → among upper candidates pick the one with best combined score
 *
 * Combined score weights:
 *   70 % – closeness of the specified dimension to its target
 *   30 % – closeness of the actual AR to the target AR
 */
function searchWithAR({ cabinet, targetAr, primaryKey, primaryMm, unit }) {
  // primaryKey is 'height' | 'width' | 'diagonal'

  let lowerBest = null, lowerScore = Infinity;
  let upperBest = null, upperScore = Infinity;

  // Derive dynamic limits from the target primary dimension
  const maxRows = primaryKey === 'height'
    ? dynMax(primaryMm, cabinet.heightMm)
    : primaryKey === 'width'
      ? dynMax(primaryMm / targetAr, cabinet.heightMm)          // implied height
      : dynMax(primaryMm / Math.sqrt(targetAr ** 2 + 1), cabinet.heightMm);
  const maxCols = primaryKey === 'width'
    ? dynMax(primaryMm, cabinet.widthMm)
    : primaryKey === 'height'
      ? dynMax(primaryMm * targetAr, cabinet.widthMm)           // implied width
      : dynMax(primaryMm * targetAr / Math.sqrt(targetAr ** 2 + 1), cabinet.widthMm);

  for (let rows = 1; rows <= Math.min(maxRows, HARD_MAX); rows++) {
    for (let cols = 1; cols <= Math.min(maxCols, HARD_MAX); cols++) {
      const widthMm  = cols * cabinet.widthMm;
      const heightMm = rows * cabinet.heightMm;
      const actualAr = arOf(widthMm, heightMm);

      // Actual value of the primary dimension
      let actualPrimMm;
      if      (primaryKey === 'height')   actualPrimMm = heightMm;
      else if (primaryKey === 'width')    actualPrimMm = widthMm;
      else                                actualPrimMm = diagOf(widthMm, heightMm); // diagonal

      const dimErr = Math.abs(actualPrimMm - primaryMm) / primaryMm;
      const arErr  = Math.abs(actualAr     - targetAr)  / targetAr;
      const s      = 0.7 * dimErr + 0.3 * arErr;

      if (actualPrimMm <= primaryMm + EPSILON) {
        if (s < lowerScore) { lowerScore = s; lowerBest = { cols, rows }; }
      } else {
        if (s < upperScore) { upperScore = s; upperBest = { cols, rows }; }
      }
    }
  }

  return {
    lower: lowerBest ? buildResult(lowerBest.cols, lowerBest.rows, cabinet, unit, 'lower') : null,
    upper: upperBest ? buildResult(upperBest.cols, upperBest.rows, cabinet, unit, 'upper') : null,
  };
}

// ─── Strategy B: Diagonal-based search ───────────────────────────────────────
/**
 * Used when no Aspect Ratio is specified.
 *
 * Split lower/upper by actual diagonal vs target diagonal.
 * Score = combined error of actual width/height/diagonal vs targets.
 */
function searchByDiagonal({ cabinet, targetWidthMm, targetHeightMm, unit }) {
  const targetDiagMm = diagOf(targetWidthMm, targetHeightMm);

  let lowerBest = null, lowerScore = Infinity;
  let upperBest = null, upperScore = Infinity;

  const maxRows = dynMax(targetHeightMm, cabinet.heightMm);
  const maxCols = dynMax(targetWidthMm,  cabinet.widthMm);

  for (let rows = 1; rows <= maxRows; rows++) {
    for (let cols = 1; cols <= maxCols; cols++) {
      const widthMm  = cols * cabinet.widthMm;
      const heightMm = rows * cabinet.heightMm;
      const diagMm   = diagOf(widthMm, heightMm);

      const wErr    = Math.abs(widthMm  - targetWidthMm)  / targetWidthMm;
      const hErr    = Math.abs(heightMm - targetHeightMm) / targetHeightMm;
      const dErr    = Math.abs(diagMm   - targetDiagMm)   / targetDiagMm;
      const s       = (wErr + hErr + dErr) / 3;

      if (diagMm <= targetDiagMm + EPSILON) {
        if (s < lowerScore) { lowerScore = s; lowerBest = { cols, rows }; }
      } else {
        if (s < upperScore) { upperScore = s; upperBest = { cols, rows }; }
      }
    }
  }

  return {
    lower: lowerBest ? buildResult(lowerBest.cols, lowerBest.rows, cabinet, unit, 'lower') : null,
    upper: upperBest ? buildResult(upperBest.cols, upperBest.rows, cabinet, unit, 'upper') : null,
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string} params.cabinetType  - '16:9' | '1:1'
 * @param {object} params.inputs       - exactly two of: { aspectRatio, height, width, diagonal }
 * @param {string} params.unit         - 'mm' | 'm' | 'ft' | 'in'
 * @returns {{ lower: object|null, upper: object|null, error?: string }}
 */
function calculate({ cabinetType, inputs, unit }) {
  const cabinet = CABINET_TYPES[cabinetType];
  if (!cabinet) {
    return { lower: null, upper: null, error: `Unknown cabinet type: ${cabinetType}` };
  }

  const toMmVal = (k) => (inputs[k] != null ? toMm(Number(inputs[k]), unit) : null);

  const heightMm = toMmVal('height');
  const widthMm  = toMmVal('width');
  const diagMm   = toMmVal('diagonal');
  const ar       = inputs.aspectRatio != null ? Number(inputs.aspectRatio) : null;

  // ── AR + Height ─────────────────────────────────────────────────────────────
  if (ar != null && heightMm != null) {
    if (heightMm <= 0 || ar <= 0)
      return { lower: null, upper: null, error: 'Height and aspect ratio must be positive.' };
    return searchWithAR({ cabinet, targetAr: ar, primaryKey: 'height', primaryMm: heightMm, unit });
  }

  // ── AR + Width ──────────────────────────────────────────────────────────────
  if (ar != null && widthMm != null) {
    if (widthMm <= 0 || ar <= 0)
      return { lower: null, upper: null, error: 'Width and aspect ratio must be positive.' };
    return searchWithAR({ cabinet, targetAr: ar, primaryKey: 'width', primaryMm: widthMm, unit });
  }

  // ── AR + Diagonal ───────────────────────────────────────────────────────────
  if (ar != null && diagMm != null) {
    if (diagMm <= 0 || ar <= 0)
      return { lower: null, upper: null, error: 'Diagonal and aspect ratio must be positive.' };
    return searchWithAR({ cabinet, targetAr: ar, primaryKey: 'diagonal', primaryMm: diagMm, unit });
  }

  // ── Height + Diagonal ────────────────────────────────────────────────────────
  if (heightMm != null && diagMm != null) {
    if (diagMm <= heightMm)
      return { lower: null, upper: null, error: 'Diagonal must be greater than height.' };
    const tw = Math.sqrt(diagMm ** 2 - heightMm ** 2);
    return searchByDiagonal({ cabinet, targetWidthMm: tw, targetHeightMm: heightMm, unit });
  }

  // ── Width + Diagonal ─────────────────────────────────────────────────────────
  if (widthMm != null && diagMm != null) {
    if (diagMm <= widthMm)
      return { lower: null, upper: null, error: 'Diagonal must be greater than width.' };
    const th = Math.sqrt(diagMm ** 2 - widthMm ** 2);
    return searchByDiagonal({ cabinet, targetWidthMm: widthMm, targetHeightMm: th, unit });
  }

  // ── Height + Width ───────────────────────────────────────────────────────────
  if (heightMm != null && widthMm != null) {
    if (heightMm <= 0 || widthMm <= 0)
      return { lower: null, upper: null, error: 'Height and width must be positive.' };
    return searchByDiagonal({ cabinet, targetWidthMm: widthMm, targetHeightMm: heightMm, unit });
  }

  return { lower: null, upper: null, error: 'Unsupported input combination.' };
}

module.exports = { calculate, CABINET_TYPES };
