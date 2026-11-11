# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive simulations for Vietnamese Grade 5 math, grouped by topic: motion word problems ("Chuyển động") and measurement ("Đo lường"), built for teachers to project in class. Next.js 16 (App Router) + TypeScript + p5.js 1.x. UI text is Vietnamese.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # all pages are statically prerendered
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
```

## Lessons (routes)

| Route | Lesson |
| --- | --- |
| `/` | Lesson picker (mục lục), one section per topic, generated from `TOPICS` + `LESSONS` |
| `/van-toc-quang-duong-thoi-gian` | Bài 1 – one car; choose the unknown (v, s or t); diagram split into hour chunks |
| `/gio-den-noi` | Bài 2 – departure/arrival time with a rest stop; analog clock + time line |
| `/hai-xe-chuyen-dong-nguoc-chieu` | Bài 3 – toward each other (tổng vận tốc); modes: same start / red car leaves first |
| `/hai-xe-chuyen-dong-cung-chieu` | Bài 4 – chase (hiệu vận tốc); modes: motorbike leaves first / same start with a gap |
| `/doi-don-vi-do` | Đo lường – unit conversion table (length, mass, area, volume); comma slides 1/2/3 digits per unit column |
| `/dien-tich-tam-giac-hinh-thang` | Đo lường – triangle / trapezoid area via cut-and-rotate animation |
| `/hinh-tron` | Đo lường – circle circumference (rolling) and area (16 sectors rearranged); given r or d |
| `/the-tich-hinh-hop` | Đo lường – cuboid / cube volume by stacking 1 cm³ cubes layer by layer |

`legacy/` holds the original single-file HTML versions (reference only, excluded from TS).

## Architecture

```
src/
  app/                    routes; each lesson page.tsx only sets metadata and renders its Lesson
    fonts.ts              next/font: Be Vietnam Pro (--font-ui), Patrick Hand (--font-hand), vietnamese subset
    globals.css           the whole design system (tokens in :root, lesson + index page styles)
  lib/
    lessons.ts            TOPICS + LESSONS registry: single source for index sections/cards, nav (same-topic lessons), page titles and topic intro
    format.ts             Vietnamese number/time formatting (fmt, hm, clockStr, isExact, round2, niceLength…)
    draw/                 p5 drawing helpers – pure functions taking the p5 instance `p`
      colors.ts           COL (mirrors CSS tokens – keep in sync)
      scene.ts            road background + drawPaper (grid paper), road ticks, badges, tags, brackets, labelBox, segments
      geometry.ts         Pt, rotate, poly, dashedPoly, rightAngle, phase/ease/lerp, caption, formulaLine, TINT
      vehicles.ts         drawCar, drawMoto (Cub-style underbone, no brand marks)
  hooks/useSimulation.ts  sim clock (rAF), run/pause/reset, auto-reveal on finish, Space/R shortcuts, playback speed
  components/
    LessonLayout.tsx      page skeleton: masthead+nav, Đề bài, canvas, readout, controls | Bài giải, Cần nhớ
    SimCanvas.tsx         p5 instance mode, loaded client-side; calls the latest `draw` every frame
    controls.tsx          Num, RangeField, DecimalField (comma decimals), Segmented (mode/rate radios), PlaybackControls (+ PlayLabels), Readout
    notebook.tsx          Notebook, Rules, and solution-line primitives: Step, Calc, Val, Blank, ConvLine, MinutesLine, Answer
    LessonNav.tsx, LessonThumbs.tsx
  lessons/<slug>/
    Lesson.tsx            'use client': params state, derived math, problem text, solution JSX, readout items
    sketch.ts             draw<Name>(p, scene) – stateless drawing from a plain scene object
```

### Conventions

- **Adding a lesson**: add an entry to `LESSONS` (with its `topic`), a thumbnail in `LessonThumbs.tsx`, `src/app/<slug>/page.tsx`, and `src/lessons/<slug>/{Lesson.tsx,sketch.ts}`. Nav and index update automatically.
- **State flow**: Lesson owns params; any param change calls `sim.reset()` (via an `update(patch)` helper). `sim.t` is in the lesson's own unit: hours (motion), minutes (gio-den-noi), animation steps (measurement lessons: unit-column hops, cut/rotate phases 0..N, or number of cubes placed). Measurement lessons pass `playLabels` so the play button says what happens ("Dời dấu phẩy", "Cắt ghép hình"…). Sketches receive everything they need in one scene object — no React or globals inside `sketch.ts`.
- **Canvas** is drawn at a fixed 800×500 (`W`, `H`) and scaled by CSS. Positions are measured from vehicle noses (`CAR_HALF`, `MOTO_HALF`) so road ticks, vehicles, diagram bars and the meet point C stay aligned.
- **Solutions** follow SGK notebook style. For non-terminating times, round t to 2 decimals and reuse that rounded value in later steps (as students would), marking approximations with ≈ / "khoảng".
- **p5 fonts**: p5 wraps font names containing spaces in quotes, so `SimCanvas` passes only the first family from `uiFont.style.fontFamily`.
- p5 is pinned to **1.x** (`p5@^1.11`); 2.x changed shape/text APIs used throughout `lib/draw`.
- Design: Vietnamese school notebook (vở ô li) + purple ink (mực tím). Red = car A / ô tô, teal = car B / xe máy; each has a draw color and a darker text color for contrast.
- Giờ đến nơi: the distance slider snaps to multiples of v/4 so travel time is always a multiple of 15 minutes.
- Đổi đơn vị: conversions are done on digit strings (`lessons/doi-don-vi-do/units.ts`), never floats; numbers ≥ 5 integer digits are grouped with spaces (10 000) as in SGK.
- Products with 3,14 are cleaned with `Math.round(x * 1e4) / 1e4` and shown with `fmt(x, 4)` so exact answers like 19,625 are not rounded away.
