const express = require('express');
const router = express.Router();
const { calculate } = require('../calculator');

/**
 * POST /api/calculate
 *
 * Body:
 * {
 *   cabinetType: '16:9' | '1:1',
 *   inputs: {
 *     aspectRatio?: number,   // e.g. 1.7778
 *     height?:      number,
 *     width?:       number,
 *     diagonal?:    number,
 *   },
 *   unit: 'mm' | 'm' | 'ft' | 'in'
 * }
 *
 * Response:
 * {
 *   lower: ConfigResult | null,
 *   upper: ConfigResult | null,
 *   error?: string
 * }
 */
router.post('/', (req, res) => {
  const { cabinetType, inputs, unit } = req.body;

  // ── basic validation ──────────────────────────────────────────────────────
  if (!cabinetType || !inputs || !unit) {
    return res.status(400).json({ error: 'cabinetType, inputs, and unit are required.' });
  }

  const validUnits = ['mm', 'm', 'ft', 'in'];
  if (!validUnits.includes(unit)) {
    return res.status(400).json({ error: `unit must be one of: ${validUnits.join(', ')}` });
  }

  const validCabinetTypes = ['16:9', '1:1'];
  if (!validCabinetTypes.includes(cabinetType)) {
    return res.status(400).json({ error: `cabinetType must be one of: ${validCabinetTypes.join(', ')}` });
  }

  // Count active inputs
  const activeKeys = ['aspectRatio', 'height', 'width', 'diagonal'].filter(
    (k) => inputs[k] != null && inputs[k] !== ''
  );

  if (activeKeys.length !== 2) {
    return res.status(400).json({
      error: `Exactly 2 input parameters are required. Got: ${activeKeys.length}`,
    });
  }

  // Validate numeric values
  for (const key of activeKeys) {
    const val = Number(inputs[key]);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ error: `${key} must be a positive number.` });
    }
    inputs[key] = val;
  }

  // Run calculation
  const result = calculate({ cabinetType, inputs, unit });

  if (result.error) {
    return res.status(422).json({ error: result.error });
  }

  return res.json(result);
});

module.exports = router;
