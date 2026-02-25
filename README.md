# Video Wall Size Calculator

Application that calculates the closest lower and upper LED cabinet configurations for a video wall based on user-selected parameters.

## Tech Stack
- **Frontend**: React 18 + Vite


### Run development servers

**Terminal —> Frontend (port 3000)**
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Cabinet Types

| Type | Width   | Height    | Aspect Ratio |
|------|---------|-----------|--------------|
| 16:9 | 600 mm  | 337.5 mm  | 1.7778       |
| 1:1  | 500 mm  | 500 mm    | 1.0          |

## Input Parameters (pick exactly 2)

| Parameter    | Description                          |
|-------------|--------------------------------------|
| Aspect Ratio | Preset wall AR (16:9, 4:3, 21:9…)   |
| Height       | Target wall height                   |
| Width        | Target wall width                    |
| Diagonal     | Target wall diagonal                 |

## Core Logic

- Converts all inputs to mm internally.
- Resolves the two inputs to a `(targetWidth, targetHeight)` pair.
- Searches all `(cols, rows)` combinations up to 100×100.
- **Lower** = config with the best combined score whose primary dimension ≤ target.
- **Upper** = config with the best combined score whose primary dimension > target.
- **Exact match** → becomes Lower; next-larger config becomes Upper.
- Score = `0.7 × dimensionError + 0.3 × aspectRatioError`

## Unit Support

mm · m · ft · in — values convert automatically when the unit is changed.

## Assumptions Considered & Handled

- No exact aspect ratio achievable (e.g. 1:1 cabinets targeting 16:9 wall AR)
- Very small sizes (no lower config exists → lower = null)
- Very large sizes (capped at 100×100 search space)
- Diagonal ≤ height/width (returns error message)
- Unit switching after results are shown (values auto-convert, results reset)
- Floating-point precision (epsilon = 0.001 mm for exact-match detection)
