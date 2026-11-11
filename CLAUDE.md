# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Educational physics simulation games about "Chuyển Động Ngược Chiều" (Opposite Direction Motion). All files are self-contained HTML pages using CDN-hosted libraries — no build step or Node.js required.

## Files

| File | Description | Tech Stack |
| --- | --- | --- |
| `two-cars-simple-p5js.html` | Main simulation | p5.js 1.9.0 + plain CSS (no other JS libs) |

## Running

Open any `.html` file directly in a browser, or serve locally:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000/two-cars-simple-p5js.html`

## Key Libraries (CDN)

- **p5.js** — `https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js`
- **Google Fonts** — Be Vietnam Pro (UI), Patrick Hand (handwritten "Bài giải" notebook)

## Design

- Theme: Vietnamese school notebook (vở ô li) + purple ink (mực tím). Tokens are CSS variables in `:root`; the canvas mirrors them in the `COL` object — keep both in sync.
- Car colors have separate "draw" and "text" variants (`--car-a` / `--car-a-text`) so text meets contrast on white.
- Rules are written in words (SGK lớp 5 style), not symbolic formulas — MathJax was removed on purpose.

## Architecture Notes

- All state lives in the `st` object; DOM is updated via `syncAll()` / `updateReadout()` / `renderSolution()`.
- Canvas is drawn at a fixed 800×500 and scaled to container width by CSS. Static scenery is pre-rendered once into a `createGraphics` buffer (`buildBackground`).
- Top half = road with cars; bottom half = SGK-style line-segment diagram (sơ đồ đoạn thẳng). Both share `X0` (A) and `X1` (B); car positions are measured from the car noses so ticks, cars, bars and the meet point C stay aligned.
- Any slider change resets the simulation and hides the solution. The solution reveals automatically when the cars meet (or via "Hiện đáp án").
- For non-terminating times, the solution rounds t to 2 decimals and reuses that rounded value in later steps (as students would), marking approximations with ≈.
- Keyboard: Space = run/pause, R = reset. `prefers-reduced-motion` disables the highlighter and tag fade animations.
