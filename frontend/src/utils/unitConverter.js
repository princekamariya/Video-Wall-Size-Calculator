/**
 * Unit conversion utilities for the frontend.
 * Base unit: mm
 */

const FACTORS = { mm: 1, m: 1000, ft: 304.8, in: 25.4 };

export function toMm(value, unit) {
  return value * (FACTORS[unit] ?? 1);
}

export function fromMm(valueMm, unit) {
  return valueMm / (FACTORS[unit] ?? 1);
}

/**
 * Convert a value from one unit to another.
 */
export function convert(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  const mm = toMm(value, fromUnit);
  return fromMm(mm, toUnit);
}

export const UNIT_LABELS = {
  mm: 'mm',
  m: 'm',
  ft: 'ft',
  in: 'in',
};

export const UNITS = ['mm', 'm', 'ft', 'in'];
