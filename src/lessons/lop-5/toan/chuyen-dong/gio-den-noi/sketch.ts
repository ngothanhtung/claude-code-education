import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { arrowHead } from '@/lib/draw/geometry';
import { bracket, drawBackground, drawRoadTicks, roadsideTag, topTag } from '@/lib/draw/scene';
import { CAR_HALF, drawCar } from '@/lib/draw/vehicles';
import { clockStr, hm } from '@/lib/format';

const X0 = 100;
const X1 = 700;
const LANE = 240;
const CLOCK_X = 690;
const CLOCK_Y = 56;
const CLOCK_R = 42;
const TL_Y = 392; // trục thời gian

export interface GioDenScene {
  dep: number; // giờ khởi hành (phút từ 0 giờ)
  S: number;
  V: number;
  rest: number; // phút nghỉ
  m: number; // phút từ lúc khởi hành
  done: boolean;
  doneAt: number;
  revealed: boolean;
}

export const driveMinutes = (S: number, V: number) => (S * 60) / V;

/** Quãng đường đã đi sau m phút; xe nghỉ ở chính giữa quãng đường */
export function posKm(s: Pick<GioDenScene, 'S' | 'V' | 'rest'>, m: number) {
  const half = driveMinutes(s.S, s.V) / 2;
  if (m <= half) return (s.V * m) / 60;
  if (m <= half + s.rest) return s.S / 2;
  return s.S / 2 + (s.V * (m - half - s.rest)) / 60;
}

export function isResting(s: Pick<GioDenScene, 'S' | 'V' | 'rest'>, m: number) {
  const half = driveMinutes(s.S, s.V) / 2;
  return s.rest > 0 && m > half && m < half + s.rest;
}

export function drawGioDen(p: p5, s: GioDenScene) {
  const px = (X1 - X0) / s.S;
  const pos = posKm(s, s.m);
  const nose = X0 + pos * px;
  const half = driveMinutes(s.S, s.V) / 2;

  drawBackground(p, 216);
  drawRoadTicks(p, X0, X1, s.S, { start: 'A', end: 'B' });
  if (s.rest > 0) drawRestStop(p, (X0 + X1) / 2);
  drawCar(p, nose - CAR_HALF, LANE, COL.a, 1, pos * px);
  if (isResting(s, s.m)) {
    roadsideTag(p, Math.max(12, nose - 190), `Đang nghỉ: còn ${Math.ceil(half + s.rest - s.m)} phút`, COL.restText);
  }
  drawClock(p, s.dep + s.m);
  drawTimeline(p, s, half);
  if (s.done) topTag(p, 300, `Đến B lúc ${clockStr(s.dep + 2 * half + s.rest)}`, s.doneAt);
}

function drawRestStop(p: p5, x: number) {
  p.stroke('#7A6A55');
  p.strokeWeight(3);
  p.line(x, 100, x, 158);
  p.noStroke();
  p.fill(COL.rest);
  p.rect(x - 34, 84, 68, 22, 5);
  p.fill('#3A2600');
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(12);
  p.textStyle(p.BOLD);
  p.text('Trạm nghỉ', x, 95);
  p.textStyle(p.NORMAL);
}

/** Đồng hồ kim + đồng hồ số bên trái */
function drawClock(p: p5, minutes: number) {
  p.push();
  p.translate(CLOCK_X, CLOCK_Y);
  p.noStroke();
  p.fill(0, 0, 0, 30);
  p.circle(2, 3, CLOCK_R * 2 + 4);
  p.fill(255);
  p.stroke(COL.ink);
  p.strokeWeight(3);
  p.circle(0, 0, CLOCK_R * 2);

  for (let i = 0; i < 12; i++) {
    const a = (i * p.TWO_PI) / 12;
    const major = i % 3 === 0;
    p.stroke(COL.text);
    p.strokeWeight(major ? 2.5 : 1.2);
    const r1 = CLOCK_R - (major ? 9 : 6);
    p.line(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * (CLOCK_R - 4), Math.sin(a) * (CLOCK_R - 4));
  }
  p.noStroke();
  p.fill(COL.text);
  p.textSize(11);
  p.textStyle(p.BOLD);
  p.textAlign(p.CENTER, p.CENTER);
  const rn = CLOCK_R - 17;
  p.text('12', 0, -rn);
  p.text('3', rn, 0);
  p.text('6', 0, rn);
  p.text('9', -rn, 0);

  const mm = minutes % 60;
  const hh = (minutes / 60) % 12;
  const ha = (hh / 12) * p.TWO_PI - p.HALF_PI;
  const ma = (mm / 60) * p.TWO_PI - p.HALF_PI;
  p.strokeCap(p.ROUND);
  p.stroke(COL.text);
  p.strokeWeight(4);
  p.line(0, 0, Math.cos(ha) * CLOCK_R * 0.5, Math.sin(ha) * CLOCK_R * 0.5);
  p.stroke(COL.ink);
  p.strokeWeight(2.5);
  p.line(0, 0, Math.cos(ma) * CLOCK_R * 0.78, Math.sin(ma) * CLOCK_R * 0.78);
  p.noStroke();
  p.fill(COL.a);
  p.circle(0, 0, 7);
  p.pop();

  const label = clockStr(minutes);
  p.textSize(15);
  p.textStyle(p.BOLD);
  const w = p.textWidth(label) + 24;
  const right = CLOCK_X - CLOCK_R - 12;
  p.noStroke();
  p.fill(255, 255, 255, 235);
  p.rect(right - w, CLOCK_Y - 15, w, 30, 15);
  p.fill(COL.ink);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(label, right - w / 2, CLOCK_Y);
  p.textStyle(p.NORMAL);
}

/** Trục thời gian: đi – nghỉ – đi */
function drawTimeline(p: p5, s: GioDenScene, half: number) {
  const T = 2 * half + s.rest;
  const tx = (m: number) => X0 + ((X1 - X0) * m) / T;

  // chú thích màu
  p.noStroke();
  p.textSize(13);
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.CENTER);
  p.fill(COL.a);
  p.rect(X0, 316, 16, 8, 4);
  p.fill(COL.aText);
  p.text('đi', X0 + 22, 320);
  if (s.rest > 0) {
    p.fill(COL.rest);
    p.rect(X0 + 52, 316, 16, 8, 4);
    p.fill(COL.restText);
    p.text('nghỉ', X0 + 74, 320);
  }

  const segs: [number, number, 'drive' | 'rest'][] = [
    [0, half, 'drive'],
    [half, half + s.rest, 'rest'],
    [half + s.rest, T, 'drive'],
  ];
  for (const [a, b, kind] of segs) {
    if (b - a <= 1e-9) continue;
    p.fill(kind === 'rest' ? '#F7DFB6' : '#F6CBC9');
    p.rect(tx(a), TL_Y - 7, tx(b) - tx(a), 14);
    const b2 = Math.min(b, s.m);
    if (b2 > a) {
      p.fill(kind === 'rest' ? COL.rest : COL.a);
      p.rect(tx(a), TL_Y - 7, tx(b2) - tx(a), 14);
    }
    if (kind === 'rest') {
      p.fill(COL.restText);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.textStyle(p.BOLD);
      p.text(`nghỉ ${s.rest} phút`, (tx(a) + tx(b)) / 2, TL_Y - 32);
    }
  }

  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(X0, TL_Y - 12, X0, TL_Y + 12);
  p.line(X1, TL_Y - 12, X1, TL_Y + 12);
  p.noStroke();
  p.textSize(13);
  p.textStyle(p.BOLD);
  p.fill(COL.text);
  p.textAlign(p.LEFT, p.CENTER);
  p.text(`khởi hành: ${clockStr(s.dep)}`, X0, TL_Y + 28);
  p.fill(COL.ink);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text(`đến B: ${s.done ? clockStr(s.dep + T) : '?'}`, X1, TL_Y + 28);

  // con trỏ thời điểm hiện tại
  const x = tx(s.m);
  p.stroke(COL.ink);
  p.strokeWeight(2);
  p.line(x, TL_Y - 12, x, TL_Y + 12);
  arrowHead(p, x, TL_Y - 12, Math.PI / 2, COL.ink, 8, 6);

  bracket(p, X0, X1, 462, `đi và nghỉ hết ${s.done || s.revealed ? hm(T / 60) : '?'}`, COL.ink);
  p.textStyle(p.NORMAL);
}
