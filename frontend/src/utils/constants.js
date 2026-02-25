export const CABINET_TYPES = [
  { id: '16:9', label: '16:9 Cabinet', widthMm: 600, heightMm: 337.5 },
  { id: '1:1',  label: '1:1 Cabinet',  widthMm: 500, heightMm: 500 },
];

export const ASPECT_RATIO_PRESETS = [
  { label: '16:9',  value: 16 / 9 },
  { label: '4:3',   value: 4 / 3 },
  { label: '21:9',  value: 21 / 9 },
  { label: '1:1',   value: 1 },
  { label: '9:16',  value: 9 / 16 },
];

export const PARAMETER_KEYS = ['aspectRatio', 'height', 'width', 'diagonal'];

export const PARAMETER_LABELS = {
  aspectRatio: 'Aspect Ratio',
  height: 'Height',
  width: 'Width',
  diagonal: 'Diagonal',
};
