# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SimBook** (Simulation Book; Vietnamese tagline "Vở mô phỏng") — product name used in page titles (`%s – SimBook`), the sidebar header and the home page. Don't rename the `vo-mo-phong:*` localStorage keys (saved calculator/periodic-table state would be lost).

Interactive simulations for Vietnamese classrooms, organised Grade → Subject → Topic → Lesson: Grade 5 Math (Chuyển động, Đo lường), Grade 9 Physics (Năng lượng cơ học, Quang học, Điện học) and Grade 9 Chemistry (Kim loại và phi kim, Hydrocarbon và nhiên liệu, Ethylic alcohol và acetic acid, Lipid – carbohydrate – protein – polymer, Tài nguyên từ vỏ Trái Đất) — both part of KHTN 9 (Kết nối tri thức), built for teachers to project in class. Next.js 16 (App Router) + TypeScript + p5.js 1.x. UI text is Vietnamese.

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
| `/` | Grade picker: one card per lớp (level, subjects with their topics, lesson counts) linking to the class page |
| `/classes/[class]/subjects` | Subjects of one grade (`/classes/9/subjects`): grade tabs, one card per subject listing its topics (→ topic pages) |
| `/classes/[class]/subjects/[subject]` | One subject (`/classes/9/subjects/vat-ly`): topic chips, then `TopicMasonry`: one shadcn `Card` per topic (icon, title → topic page, intro, "N bài" badge, compact lesson rows, "Xem chủ đề" footer) in a CSS-columns masonry (1 / 2 from 1000px / 3 from 1700px) |
| `/classes/[class]/subjects/[subject]/topics/[topic]` | One topic (`…/vat-ly/topics/quang-hoc`): sibling-topic tabs + lesson cards. Redirects: `/classes` → `/`, `/classes/9` → `/classes/9/subjects`, `…/topics` → subject page; mismatched grade/subject/topic → 404 |
| `/van-toc-quang-duong-thoi-gian` | Bài 1 – one car; choose the unknown (v, s or t); diagram split into hour chunks |
| `/gio-den-noi` | Bài 2 – departure/arrival time with a rest stop; analog clock + time line |
| `/hai-xe-chuyen-dong-nguoc-chieu` | Bài 3 – toward each other (tổng vận tốc); modes: same start / red car leaves first |
| `/hai-xe-chuyen-dong-cung-chieu` | Bài 4 – chase (hiệu vận tốc); modes: motorbike leaves first / same start with a gap |
| `/doi-don-vi-do` | Đo lường – unit conversion table (length, mass, area, volume); comma slides 1/2/3 digits per unit column |
| `/dien-tich-tam-giac-hinh-thang` | Đo lường – triangle / trapezoid area via cut-and-rotate animation |
| `/hinh-tron` | Đo lường – circle circumference (rolling) and area (16 sectors rearranged); given r or d |
| `/the-tich-hinh-hop` | Đo lường – cuboid / cube volume by stacking 1 cm³ cubes layer by layer |
| `/dong-nang` | Lý 9 – kinetic energy: object (ball, iron ball, motorbike, car) pushes a wooden block; find Wđ, v or m (vehicles in km/h with conversion) |
| `/the-nang` | Lý 9 – gravitational potential energy: pulley lifts an object; find Wt, h, m, or compare two reference levels (floor vs table) |
| `/co-nang` | Lý 9 – free fall; Wt/Wđ/W bars; energy at point M (conservation) |
| `/cong-co-hoc` | Lý 9 – mechanical work: pull (A = F × s), lift (A = P × h) or find the force |
| `/cong-suat` | Lý 9 – power: two cranes lifting in parallel; work vs power |
| `/nha-may-thuy-dien` | Lý 9 – hydropower: Wt → Wđ → điện năng with efficiency |
| `/khuc-xa-anh-sang` | Lý 9 – refraction at a flat boundary (water/glass/diamond, both directions) |
| `/phan-xa-toan-phan` | Lý 9 – total internal reflection; boundary or optical-fibre view |
| `/lang-kinh` | Lý 9 – prism ray tracing; monochromatic deviation or white-light dispersion |
| `/thau-kinh` | Lý 9 – converging/diverging lens image construction; d', h' via similar triangles (SGK method, no 1/f formula) |
| `/kinh-lup-do-tieu-cu` | Lý 9 – magnifier (G = 25 : f) and optical-bench focal length measurement (d = d' = 2f) |
| `/dien-tro-dinh-luat-om` | Lý 9 – Ohm's law circuit + I–U graph; find I, find R, or R = ρ × l : S (material, mm² → m²) |
| `/mach-noi-tiep-song-song` | Lý 9 – two resistors in series (voltmeters U₁, U₂) or parallel (branch ammeters I₁, I₂) |
| `/cong-suat-dien` | Lý 9 – lamp rating 𝒫 = U × I: find I and R from the rating, or 𝒫 and R from the ammeter |
| `/dien-nang` | Lý 9 – electric energy A = 𝒫 × t (kWh) for a household appliance; meter + electricity bill |
| `/cam-ung-dien-tu` | Lý 9 – magnet in/out of a coil with galvanometer; or AC generator with i(t) sine graph (f = n, 2 reversals per turn) |
| `/tinh-chat-kim-loai` | Hóa 9 (Bài 18) – metal + O₂ / Cl₂ (gas jar, deflagrating spoon) or + acid (H₂ collected over water); m product, V gas |
| `/day-hoat-dong-hoa-hoc` | Hóa 9 (Bài 19) – activity series; metal strip in acid/salt solution, displacement or no reaction |
| `/tach-kim-loai-hop-kim` | Hóa 9 (Bài 20) – blast furnace (Fe₂O₃ + CO), Al₂O₃ electrolysis with efficiency, brass + HCl → % Zn |
| `/kim-loai-va-phi-kim` | Hóa 9 (Bài 21) – burn S, C, P, Na, Ca in O₂, oxide + water, litmus red (acid) / blue (base) |
| `/hop-chat-huu-co` | Hóa 9 (Bài 22) – ball-and-stick molecule built atom by atom; % mass, or molecular formula from % and M |
| `/alkane` | Hóa 9 (Bài 23) – combustion or chlorination of CH₄…C₄H₁₀ as an animated molecule equation + mol bars |
| `/alkene` | Hóa 9 (Bài 24) – bromine water decolourised, CH₄/C₂H₄ mixture, combustion, polymerisation to PE |
| `/nguon-nhien-lieu` | Hóa 9 (Bài 25) – fuel stove: heat released, fuel needed to heat water (efficiency), CO₂ emitted |
| `/ethylic-alcohol` | Hóa 9 (Bài 26) – combustion, + Na → H₂, độ cồn (graduated cylinder, D = 0,8 g/mL), glucose fermentation with H |
| `/acetic-acid` | Hóa 9 (Bài 27) – + NaOH, + Mg/Zn, + Na₂CO₃, esterification (⇌, H₂SO₄ đặc) with H |
| `/lipid` | Hóa 9 (Bài 28) – saponification of tristearin/tripalmitin/triolein; mass conservation to find m fat |
| `/glucose-saccharose` | Hóa 9 (Bài 29) – silver mirror, fermentation, saccharose hydrolysis (glucose + fructose), photosynthesis |
| `/tinh-bot-cellulose` | Hóa 9 (Bài 30) – hydrolysis / ethanol from gạo, ngô, sắn, mùn cưa (flow diagram, % content, H); photosynthesis of starch |
| `/protein` | Hóa 9 (Bài 31) – % N in glycine/alanine, peptide hydrolysis (Gly-Gly, Gly-Gly-Gly), daily protein needs |
| `/polymer` | Hóa 9 (Bài 32) – PE/PVC/PS: degree of polymerisation, mass with H, % element; monomers linking into a chain |
| `/vo-trai-dat` | Hóa 9 (Bài 33) – crust composition bars; % metal in hematite, magnetite, bauxite, pyrite, calcite; metal in ore |
| `/da-voi-silicate` | Hóa 9 (Bài 34) – lime kiln (CaCO₃ → CaO + CO₂), slaking, glass (SiO₂ + Na₂CO₃); tấn proportions with H |
| `/bang-tuan-hoan` | Tiện ích – full-page periodic table (sidebar, new tab): colour by họ / kim loại–phi kim / nguyên tử khối, highlight same group or period, `?z=26` deep link, molar mass, 3D |
| `/may-tinh` | Tiện ích – full-page scientific calculator (sidebar, new tab): big keys, full 20-item history beside it |
| `/nhien-lieu-hoa-thach` | Hóa 9 (Bài 35) – carbon cycle diagram; CO₂ from petrol (octane) and coal, trees needed to absorb CO₂ |

Old slugs `/dong-nang-the-nang-co-nang`, `/cong-va-cong-suat`, `/cong-suat-dien-dien-nang` redirect (next.config.ts) to `/co-nang`, `/cong-suat`, `/cong-suat-dien`.

`legacy/` holds the original single-file HTML versions (reference only, excluded from TS).

## Architecture

```
src/
  app/                    routes; each lesson page.tsx only sets metadata and renders its Lesson
    fonts.ts              exactly two fonts for every grade (vietnamese subset): Be Vietnam Pro (--font-ui: UI, problem text, canvas) and Noto Serif (--font-book: SGK-style notebook, Cần nhớ, subject titles, Vietnamese text inside formulas)
    shadcn.css            Tailwind v4 WITHOUT preflight (theme + utilities layers only, `@source "../"`) + shadcn theme vars mapped to the mực tím palette (`--muted` is taken by globals.css → shadcn's muted bg is `--surface-muted`) + a scoped mini-preflight only for shadcn slots (sidebar, sheet, dropdown, tooltip, site-header) + `[hidden]` rule; imports shadcn-variants.css (copy of shadcn/tailwind.css: `data-active`, `data-open`… custom variants — without it `data-active="false"` counts as active). Imported before globals.css
    globals.css           the whole design system (tokens in :root, lesson + index page styles)
  lib/
    lessons.ts            GRADES → SUBJECTS → TOPICS → LESSONS registry; trailOf(slug) gives the breadcrumb; URL segments are `GRADES[].no`, `SUBJECTS[].slug`, topic `id`; build links only with `classHref`, `subjectHref`, `topicHref` (lessons breadcrumb and "Tất cả bài" use them); single source for index, nav (same-topic lessons), titles, topic intro
    chem.ts               Hóa học: ATOMIC masses, molarMass, ce() (TeX formula), cu() (Unicode subscripts for canvas), eqTex/eqUni, displacement/combine/combustion balancers, ACTIVITY series, solution-line builders (molFromMass, molFromVolume, molRatio, massOf, volumeOf), N4/f4/e4 number format, VM = 24,79
    crystals.ts           generated XYZ coordinates for structures PubChem lacks: metal lattices (bcc/fcc/hcp with real lattice constants, METAL_LATTICE), diamond/silicon, graphite (1,42 Å, layers 3,35 Å), NaCl rock salt, noble-gas atoms, diatomic H₂/F₂; nearest-neighbour distances verified against experiment
    molecules3d.ts        MOL3D catalog for Molecule3D: file id → name, formula, note (what to notice: tứ diện, phẳng, thẳng hàng, nối α/β, liên kết peptide). SDF files in public/molecules/ (PubChem 3D, offline)
    elements.ts           periodic table data: 118 ELEMENTS (Z, symbol, IUPAC name as in KNTT, IUPAC mass, radio flag, period/group/fRow from Z, category kim loại/phi kim/khí hiếm as in SGK, plus `family` for colouring: kiềm, kiềm thổ, chuyển tiếp, sau chuyển tiếp, lanthan, actini, á kim, phi kim, halogen, khí hiếm, chưa rõ tính chất — FAMILY_NAME; colours as CSS vars `--fam`/`--fam-line` on `.ptable .fam-*`), calcMass (SGK-rounded: H 1, Cl 35,5, Cu 64 — single source for chem.ts ATOMIC), VALENCE, shells (Z ≤ 20), groupName (IA…VIIIA), formulaMass (parentheses, hydrates CuSO4.5H2O, Vietnamese error messages)
    media.ts              refractive indices (nước/thủy tinh/kim cương), refractionAngle, criticalAngle
    format.ts             Vietnamese number/time formatting (fmt, fmtG, hm, clockStr, isExact, round2, niceLength…)
    calc.ts               scientific calculator engine: token list (one token per key, DEL removes "sin("), own recursive-descent parser (no eval), deg/rad, implicit ×, auto-close ')', Ans/M, ᴇ (×10ⁿ); show() formats VN-style (comma, 10 000, a × 10ⁿ outside 10⁻³…10¹⁰), toFraction() for S⇔D; CalcError 'Lỗi cú pháp'/'Lỗi toán'
    tex.ts                LaTeX builders: N (1{,}2, 10\,000), NS, T (\text), U "(km/giờ)", u, UN (m² → \text{m}^2), B (blank), H, D (degrees), SCI (a × 10^n), eq, ap
    draw/                 p5 drawing helpers – pure functions taking the p5 instance `p`
      colors.ts           COL (mirrors CSS tokens – keep in sync)
      scene.ts            road background + drawPaper (grid paper), road ticks, badges, tags, brackets, labelBox, segments
      geometry.ts         Pt, rotate, poly, dashedPoly, rightAngle, phase/ease/lerp, caption, formulaLine, TINT
      optics.ts           vector math, refract/reflect, ray–segment hits, drawRay, angleArc, normalLine, drawBoundary (shared refraction scene)
      lens.ts             thin-lens computeImage/describeImage, drawLensDiagram (two special rays + image), drawLens, arrowUp
      circuit.ts          SGK circuit symbols: wire, flow/flowOffset (charge dots, speed ∝ I), resistor, battery, meter (A/V), lamp, switchK, node; draw wires + flow first, components after (white fill cuts the wire)
      vehicles.ts         drawCar, drawMoto (Cub-style underbone, no brand marks)
      lab.ts              chemistry glassware: testTube, beaker, gasJar, bubbles, flame, burner, litmus, amountBar, mix/withAlpha colours
      fx.ts               realistic lab effects (stateless, time-based particles): glassBeaker (thickness, highlight), liquid (gradient + meniscus), metalStrip (metallic gradient), fizz (bubbles nucleate on the metal, rise faster, pop at the surface; rate ∝ activity), deposit (crystals grow bottom-up, flakes settle), pits (acid corrosion), contactShadow (soft elliptical floor shadow, fades with lift), shadedSphere (3D ball: radial shading, floor bounce light, soft + sharp highlight, rotating seam via `spin`; `metal` for iron balls). Every ball in the năng lượng cơ học lessons (dong-nang, the-nang, co-nang) uses shadedSphere + contactShadow (pass the height above the floor as `lift`); new lessons with balls should too. Used by day-hoat-dong-hoa-hoc; roll out to other lab scenes the same way
      reaction.ts         chemistry scenes shared by lessons: drawReactionScene (animated equation + mol bars), reactionBars, drawFlow (process boxes raw → product with labelled arrows)
      organic.ts          drawOrganic: molecule built atom by atom + % mass bars (hợp chất hữu cơ, protein)
      molecule.ts         ball-and-stick MOLECULES (alkanes, alkenes, ethanol, acetic acid, small inorganic), drawMolecule (atom-by-atom progress), drawReaction (animated equation, coefficients)
  hooks/useExercises.ts   5 preset exercises per lesson: params, current (null = teacher changed numbers), pick, edit(patch) with optional fix()
  hooks/useSimulation.ts  sim clock (rAF), run/pause/reset, auto-reveal on finish, Space/R shortcuts, playback speed
  components/
    LessonLayout.tsx      page skeleton (CSS grid areas): left = Đề bài + canvas + readout, then Bài giải below; right = Điều chỉnh panel (playback buttons, mode radios, sliders) then Cần nhớ. Mobile order: stage → controls → notebook → rules
    SimCanvas.tsx         p5 instance mode, loaded client-side; calls the latest `draw` every frame
    Controls.tsx          Num, RangeField, DecimalField (comma decimals), Segmented (mode/rate radios), PlaybackControls (+ PlayLabels), Readout
    Tex.tsx               KaTeX renderer: <Tex src/> and <Rich text="chữ $công thức$"/>; macros \blank, \chia
    Notebook.tsx          Notebook, Rules, and solution-line primitives: Step (string with $…$), Calc (tex), Summary (Tóm tắt/Giải), ConvLine, MinutesLine, Answer
    Catalog.tsx           shared catalog blocks: CatalogHead (breadcrumb/title/intro), Tabs (grade or topic pills), LessonCards, TopicMasonry (subject page; uses ui/card + ui/badge), TOPIC_ICON (lucide), Arrow, TeacherTip
    Molecule3D.tsx        rotatable 3D molecules (3Dmol.js, BSD-3, dynamic import so only chemistry pages load it). Props: `files` (chips), `value` (follows the lesson selector, e.g. alkane → propane), `groups` (side-by-side comparison of 2–4 molecules, cameras linked with linkViewer). Ball-and-stick (double/triple bonds) or space-filling; element letters stuck to each sphere: depth-tested labels (`inFront: false`) re-placed on every render via `setViewChangeCallback` at atom + radius × view direction (inverse of the view quaternion), so they follow the atom when rotating and hide behind nearer atoms (H letters omitted above 30 atoms, no letters on big lattices); plus a CPK colour legend, a full-name label on hover and click-to-pin (touch boards); `.mol3d-hover` live text repeats the pointed element, auto-spin, +/−; zoom scales with atom count; mouse wheel scrolls the page. Transparent viewer background (`.mol3d-view` paints a soft radial gradient); colour legend only when ≥ 2 elements; optional `title` / `actions` slots replace the "Mô hình 3D" heading (the periodic-table 3D panel uses them for an element tile + close button, panel tinted with the element's family colour `fam-*`). Placed via LessonLayout `media` prop (below the readout); hide it when it would give away the answer (hop-chat-huu-co "tìm công thức")
    ChemSteps.tsx         Hóa học notebook solutions: StoichSolution (n = m : M or V : 24,79 → PTHH → ratio → H% on products → m, V, Đáp số) with computeStoich for readouts; MassSolution (industrial tấn/kg proportion: % content → equation → "cứ … tạo ra …" → H%) with computeMass; options: cond, reversible, equation override, eqLabel, given/lead
    Calculator.tsx        floating "Máy tính" popup (SHIFT second functions, memory, history, keyboard input, draggable, persisted in localStorage); open state lives in `tools-context.tsx` (ToolsProvider in app/layout.tsx mounts both popups once, lazily via next/dynamic; `useTool(id)`, `TOOLS` labels/icons), LessonLayout shows the quick toggles when the subject has `calculator: true` (Vật lý 9, Hóa học 9) / `periodicTable: true`. Both floating toggles live in `.tool-dock` (bottom-right flex row) as icon-only round buttons `<ToolToggle tool="calculator" />` (lucide CalculatorIcon / Grid3x3Icon, name in a shadcn Tooltip + aria-label, "Đóng …" while open); the focused popup is raised above the other. Root class `.calculator` (not `.calc`, which is the notebook formula line). Its root has `data-own-keys` so useSimulation ignores Space/R typed into it
    BohrModel.tsx         SGK Rutherford–Bohr atom (SVG): nucleus +Z, electrons on concentric shells (Z ≤ 20, slow rotation off under prefers-reduced-motion); Z > 20 draws only the shell count
    PeriodicTable.tsx     floating "Bảng tuần hoàn" popup for subjects with `periodicTable: true` (Hóa học 9): 18-group grid + lanthan/actini rows, detail card in the empty space above the B groups, search (symbol/name/Z), category filter, arrow-key navigation, molar-mass calculator; layout: detail panel on the LEFT (BohrModel 200px, p/n, stacked label/value info, actions; stacks above the table below 1100px), 18-group grid on the right with the family colour legend placed in the empty block above groups 3–12; "Xem đơn chất 3D" (solidOf: molecules, diamond vs graphite, metal lattices, noble gases) and "Xem 3D" next to M for catalogued formulas (view3dOfFormula; same-formula isomers open as a comparison) in a Molecule3D panel inside the popup; same drag/Esc/`data-own-keys` behaviour as Calculator; persists Z + formula in localStorage
    app-sidebar.tsx       site-wide table of contents = shadcn/ui block sidebar-07 (`collapsible="icon"`, mounted in app/layout.tsx inside TooltipProvider → SidebarProvider defaultOpen={false} → SidebarInset with a sticky `.site-header` (SidebarTrigger, Ctrl/⌘+B) and `.page-body` (page padding, formerly on body)). Two sections: "Nội dung" = NavMain (nav-main.tsx): each grade a collapsible item (GRADE_ICON) whose sub-items are its subjects (SUBJECT_ICON → subject page), current grade open + subject active; "Tiện ích & công cụ" = ToolItem links to the full-page tools `/bang-tuan-hoan`, `/may-tinh` (target _blank; route group `app/(cong-cu)/`), rendered by the same components with `page` (no title bar/drag/Esc, `is-page` CSS). The floating `.tool-dock` buttons in lessons still open the popups. Header = "Vở mô phỏng" link to `/` + accent-insensitive lesson search (Enter opens first hit). Header/content carry `data-own-keys`
    ui/                   shadcn/ui generated components (style radix-nova, components.json); edit sparingly (SidebarInset was changed to a div)
    LessonNav.tsx, LessonThumbs.tsx
  app/(lop-9)/(vat-ly)/(quang-hoc)/<slug>/page.tsx   route groups mirror grade/subject/topic; URL stays /<slug>
  lessons/<lop>/<mon>/<chu-de>/<slug>/   e.g. lessons/lop-5/toan/chuyen-dong/gio-den-noi/
    Lesson.tsx            'use client': params state (exports `Params`), derived math, problem text, solution JSX, readout items
    sketch.ts             draw<Name>(p, scene) – stateless drawing from a plain scene object
    exercises.ts          Vật lý 9: `EXERCISES: Params[]`, the 5 preset exercises (data only)
```

### Conventions

- **File names:** React component files (and `Lesson.tsx`) are PascalCase — `Controls.tsx`, `Notebook.tsx`, `Catalog.tsx`, `LessonLayout.tsx`; hooks are camelCase `useX.ts`; every other module (helpers, data, sketches, exercises) is lowercase/kebab-case — `format.ts`, `sketch.ts`, `exercises.ts`, `units.ts`; folders are lowercase kebab-case (Next.js route groups `(lop-9)` included). The macOS file system ignores case: rename with `git mv -f` (or via a temp name) and check imports with `npm run typecheck`.

- **Bài tập (Vật lý 9, every lesson):** one theory per lesson (động năng, thế năng, cơ năng, công, công suất… are separate lessons) and exactly 5 preset exercises in `exercises.ts` next to the lesson (`EXERCISES: Params[]`, `Params` exported from Lesson.tsx) (mix the "Dạng đề" variants, include unit conversions, keep values inside slider ranges, avoid identical answers). Use `const ex = useExercises(EXERCISES, fix?)`, `q = ex.params`, `update = (patch) => { ex.edit(patch); sim.reset(); }`, and pass `exercises={ex}` to LessonLayout, which renders the "Bài tập" picker (Bài 1…5) at the top of Điều chỉnh and the tag next to "Đề bài" ("Bài tập N" or "Số liệu tự đặt").

- **Folder layout (grade → subject → topic):** lesson code lives in `src/lessons/<grade id>/<subject slug>/<topic id>/<slug>/` (e.g. `src/lessons/lop-9/vat-ly/quang-hoc/thau-kinh/`), pages in route groups `src/app/(<grade id>)/(<subject slug>)/(<topic id>)/<slug>/page.tsx` — parentheses keep the public URL `/<slug>`. Folder names must match the ids in `lessons.ts`; if a lesson moves topic, move both folders.
- **Adding a lesson**: add an entry to `LESSONS` (with its `topic`; add a topic/subject/grade first if new), a thumbnail in `LessonThumbs.tsx`, the page under the matching route groups, and `Lesson.tsx`, `sketch.ts` (+ `exercises.ts` for Vật lý) in the matching `src/lessons/...` folder. Nav and index update automatically.
- **State flow**: Lesson owns params; any param change calls `sim.reset()` (via an `update(patch)` helper). `sim.t` is in the lesson's own unit: hours (motion), minutes (gio-den-noi), animation steps (measurement lessons: unit-column hops, cut/rotate phases 0..N, or number of cubes placed). Measurement lessons pass `playLabels` so the play button says what happens ("Dời dấu phẩy", "Cắt ghép hình"…). Sketches receive everything they need in one scene object — no React or globals inside `sketch.ts`.
- **Canvas** is drawn at a fixed 800×500 (`W`, `H`) and scaled by CSS. Pages are full width (no max-width on `.workspace`, `.masthead`, `.sheet`); the canvas width is capped at `(100dvh − 220px) × 1,6` (min 480px) so the whole scene fits on a projector screen; `.lesson-list` goes to 2+ columns from 1280px, the control column is 420px from 1600px. Positions are measured from vehicle noses (`CAR_HALF`, `MOTO_HALF`) so road ticks, vehicles, diagram bars and the meet point C stay aligned.
- **Solutions** follow SGK notebook style. For non-terminating times, round t to 2 decimals and reuse that rounded value in later steps (as students would), marking approximations with ≈ / "khoảng".
- **p5 fonts**: p5 wraps font names containing spaces in quotes, so `SimCanvas` passes only the first family from `uiFont.style.fontFamily`.
- **Tailwind/shadcn:** Tailwind classes are used only in shadcn components (sidebar); lesson pages keep plain CSS in globals.css. globals.css resets (`* {margin:0…}`, `:focus-visible`) live in `@layer base` so Tailwind utilities can override them; any other unlayered globals rule beats Tailwind utilities, so don't style bare `button`/`a`. Add components with `npx shadcn@latest add <name>` (if npm fails with EALLOWSCRIPTS, prefix `npm_config_userconfig=/tmp/empty-npmrc` for that command only).
- p5 is pinned to **1.x** (`p5@^1.11`); 2.x changed shape/text APIs used throughout `lib/draw`.
- Design: Vietnamese school notebook (vở ô li) + purple ink (mực tím). Red = car A / ô tô, teal = car B / xe máy; each has a draw color and a darker text color for contrast.
- Giờ đến nơi: the distance slider snaps to multiples of v/4 so travel time is always a multiple of 15 minutes.
- Đổi đơn vị: conversions are done on digit strings (`lessons/lop-5/toan/do-luong/doi-don-vi-do/units.ts`), never floats; numbers ≥ 5 integer digits are grouped with spaces (10 000) as in SGK.
- Products with 3,14 are cleaned with `Math.round(x * 1e4) / 1e4` and shown with `fmt(x, 4)` so exact answers like 19,625 are not rounded away.
- Physics solutions start with `<Summary given find />` (Tóm tắt → Giải), use g = 10 (P = 10 · m), "·" for multiplication in formulas, 𝒫 for power, and `fmtG` for numbers ≥ 10 000 (space-grouped).
- Physics `sim.t` units: seconds (fall, cranes) or animation phases (optics: 0..2 or 0..3). Optics lessons use `LIGHT_LABELS` ("Chiếu tia sáng"…). Điện học: phases 0..2 (close switch, then graph/result), days (điện năng), or magnet phases 0..3 (in, hold, out); keep meter readings clear of the top caption (y ≈ 34), i.e. meters at y ≥ 100 with readings above.
- **Hóa học 9:** same layout/exercise rules as Vật lý (5 exercises in `exercises.ts`, `Summary` → Giải, calculator on). Gas volumes at đkc: $V = n \times 24{,}79$ (L), never 22,4. Element/compound names follow KNTT IUPAC spelling (sodium, iron, sulfur, ethylene, acetic acid…). Formulas in TeX only via `ce('Al2(SO4)3')`, on canvas via `cu()`; balance equations with the `chem.ts` helpers instead of hand-writing coefficients. Mole ratios are written `n_B = n_A × kB : kA` (no fraction bars). Exact results keep up to 4 decimals (3,7185 L); approximate ones round to 2 with ≈ (`N4`, `f4`, `e4`). Industrial problems (lò cao, điện phân, trùng hợp) use the tấn mass proportion with efficiency `× H : 100`.
- **3D molecules:** add a file with `curl "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/<name>/SDF?record_type=3d"`, keep it up to the `M  END` line + `$$$$`, save as `public/molecules/<name>.sdf`, then add it to `MOL3D` in `lib/molecules3d.ts` and pass `media={<Molecule3D files={[…]} value={…} groups={[…]} />}`. Use explicit ring forms for sugars (beta-D-glucopyranose, beta-D-fructofuranose); PubChem has no 3D for very flexible molecules (tristearin, stearic acid). Canvas (p5) scenes stay 2D.
- **Hóa học lessons** reuse shared scenes instead of a local sketch where possible: equation-type lessons use `drawReactionScene` + `reactionBars`, process lessons `drawFlow`; write a `sketch.ts` only for a genuinely different picture (lò nung, chu trình carbon…). Solutions use `StoichSolution` / `MassSolution`; never put two subscripts on one symbol (`m_{X}\,(\text{lí thuyết})`, not `m_{X}_\text{…}`) and use `\xrightleftharpoons` (not `\overset`) so lines stay one ô li row. Same formula on both sides (glucose + fructose) → pass an `equation` override. Reference data that is not in SGK (protein in food, CO₂ per tree, heats of combustion) must be stated in the problem text.
- Lens maths: ảnh d' and h' are derived with similar triangles exactly as in SGK KHTN 9 (no lens formula in the written solution); `computeImage` is the single source for both drawing and solution.
- Prism dispersion uses exaggerated indices (1,47 → 1,56) so the spectrum is visible; the readout says so.
- **Formulas are LaTeX (KaTeX)** everywhere in solutions, "Cần nhớ" rules and index rule chips. `Calc` takes a `tex` string; `Step`, `Answer` items and rule `text` accept prose with `$…$`. Build TeX with `lib/tex.ts` helpers: decimal comma must be `{,}`, thousands `\,`, Vietnamese words/units always in `\text{}` (rendered in Noto Serif because KaTeX fonts lack Vietnamese diacritics). Blanks before reveal: `B(show, tex)` → `\blank`.
- **Operators (Vietnamese convention, all grades):** multiplication is always × (`\\times`, also for implicit products: write `m \\times h`, never `mh` or `\\cdot`); division is always ":" (`\\chia`), never a fraction bar or "/" (e.g. `\\mathscr{P} = A \\chia t`, `OA' = OA \\times OF' \\chia (OA - OF')`). Only numeric fractions like ½ in $W_\\text{đ}$ stay as `\\frac{1}{2}`. "/" appears only inside units (km/giờ, m/s). On-screen separators use "và", not "/". Units in parentheses `U('km/giờ')`; upright subscripts `W_\\text{đ}`, `i_\\text{gh}`; power `\\mathscr{P}`; degrees `D(a)`.
- In template literals remember `\\` for one TeX backslash; in plain single-quoted strings too. Avoid shell heredocs with many backslashes (use the Edit tool).
- Canvas (p5) labels stay plain Unicode text; LaTeX is only in the DOM.
- Typography is identical for cấp I and cấp II: don't add per-grade fonts. Notebook text 18px Noto Serif; KaTeX scaled 1.08em to match its x-height.
- **Control naming (all lessons):** the selector that switches problem variant is always legend "Dạng đề"; the selector for the unknown is "Cần tìm"; other selectors are named after the parameter (Môi trường, Chiều truyền, Đại lượng, Đề cho…). Optics lessons use the shared `LIGHT_LABELS` ("Chiếu tia sáng"); other lessons may use an action verb that matches their animation.
- **Notebook ô li grid (globals.css "VỞ Ô LI"):** every line in `.solution` is exactly one row `--row: 40px` (4 li × 10px), font 20px; the bold rule sits at `--base: 27px` where the 20px Noto Serif baseline falls (measured 27.5px). Never add margins/padding in px that aren't multiples of 40 inside the notebook, and keep formulas inline (no `\dfrac`, no display math) so lines stay one row tall. Calc lines indent one big square (40px); the red margin is on a vertical rule (`--margin-x`). If you change the notebook font or size, re-measure the baseline (probe span with `vertical-align: baseline`) and update `--base`.
