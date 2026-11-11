import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { drawBackground, drawRoadTicks, pointLabel, segment, spanArrow, topTag } from '@/lib/draw/scene';
import { CAR_HALF, drawCar } from '@/lib/draw/vehicles';
import { fmt } from '@/lib/format';

const X0 = 100;
const X1 = 700;
const LANE = 240;
const LINE_Y = 410;

export interface VanTocScene {
  S: number;
  T: number;
  V: number;
  /** thời gian xe đã đi (giờ) */
  e: number;
  hideV: boolean;
  hideS: boolean;
  done: boolean;
  doneAt: number;
  doneLabel: string;
}

export function drawVanToc(p: p5, s: VanTocScene) {
  const px = (X1 - X0) / s.S;
  const pos = s.V * s.e;
  const nose = X0 + pos * px;

  drawBackground(p, 216);
  drawRoadTicks(p, X0, X1, s.S, { start: 'A', end: 'B', hide: s.hideS });
  drawCar(p, nose - CAR_HALF, LANE, COL.a, 1, pos * px);
  drawDiagram(p, s, px, nose);
  if (s.done) topTag(p, X1, s.doneLabel, s.doneAt);
}

/** Sơ đồ: quãng đường đã đi, tô xen kẽ theo từng giờ */
function drawDiagram(p: p5, s: VanTocScene, px: number, nose: number) {
  p.noStroke();
  p.textSize(14);
  p.textStyle(p.BOLD);
  p.fill(COL.aText);
  p.textAlign(p.LEFT, p.CENTER);
  p.text(`${s.hideV ? '?' : fmt(s.V)} km/giờ  →`, X0, 322);

  const yBar = LINE_Y - 30;
  const hoursStarted = Math.ceil(s.e - 1e-9);
  for (let k = 0; k < hoursStarted; k++) {
    const end = Math.min(k + 1, s.e);
    const x1 = X0 + s.V * k * px;
    const x2 = X0 + s.V * end * px;
    p.noStroke();
    p.fill(k % 2 === 0 ? COL.a : COL.aLight);
    p.rect(x1, yBar - 5, x2 - x1, 10);
    // mỗi giờ trọn vẹn: ghi số km đi được trong giờ đó
    if (end - k > 1 - 1e-9 && x2 - x1 > 48 && !s.hideV) {
      p.fill(COL.aText);
      p.textSize(12);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(`${fmt(s.V, 1)} km`, (x1 + x2) / 2, yBar - 16);
    }
  }

  segment(p, X0, X1, LINE_Y);

  // mốc từng giờ xe đã đi qua
  let prevX = X0;
  for (let k = 1; k <= Math.floor(s.e + 1e-9); k++) {
    const x = X0 + s.V * k * px;
    if (x > X1 - 4) break;
    p.stroke(COL.muted);
    p.strokeWeight(1.5);
    p.line(x, LINE_Y - 6, x, LINE_Y + 6);
    if (x - prevX >= 36 && x - X0 > 30 && X1 - x > 30) {
      p.noStroke();
      p.fill(COL.muted);
      p.textSize(12);
      p.textStyle(p.NORMAL);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(`${k} giờ`, x, LINE_Y + 22);
      prevX = x;
    }
  }

  pointLabel(p, X0, LINE_Y + 24, 'A');
  pointLabel(p, X1, LINE_Y + 24, 'B');

  if (s.e > 0 && !s.done) {
    p.noStroke();
    p.fill(COL.a);
    p.circle(nose, LINE_Y, 9);
  }

  spanArrow(p, X0, X1, 466, `${s.hideS ? '?' : fmt(s.S)} km`);
}
