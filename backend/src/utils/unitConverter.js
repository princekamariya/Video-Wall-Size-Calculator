/**
 * Unit conversion utilities.
 * All internal calculations use millimeters (mm) as the base unit.
 */

const CONVERSIONS = {
  mm: 1,
  m: 1000,
  ft: 304.8,
  in: 25.4,
};

/**
 * Convert a value from a given unit to mm.
 * @param {number} value
 * @param {string} unit - 'mm' | 'm' | 'ft' | 'in'
 * @returns {number} value in mm
 */
function toMm(value, unit) {
  const factor = CONVERSIONS[unit];
  if (!factor) throw new Error(`Unknown unit: ${unit}`);
  return value * factor;
}

/**
 * Convert a value from mm to a given unit.
 * @param {number} valueMm
 * @param {string} unit - 'mm' | 'm' | 'ft' | 'in'
 * @returns {number} value in target unit
 */
function fromMm(valueMm, unit) {
  const factor = CONVERSIONS[unit];
  if (!factor) throw new Error(`Unknown unit: ${unit}`);
  return valueMm / factor;
}

module.exports = { toMm, fromMm };
