import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { W, drawPaper } from '@/lib/draw/scene';
import { powerOf10, viNumber, type KindInfo, type Placement } from './units';

const ARC_Y = 128; // đường cung "×10 / ×100…" giữa các đơn vị
const HEAD_Y = 150; // hàng tên đơn vị
const HEAD_H = 44;
const ROW_Y = HEAD_Y + HEAD_H; // hàng chữ số
const ROW_H = 72;

export interface UnitScene {
  kind: KindInfo;
  from: number;
  to: number;
  placement: Placement;
  value: string;
  result: string;
  /** số cột đơn vị dấu phẩy đã đi (0..steps) */
  t: number;
  valid: boolean;
  done: boolean;
}

export function drawUnits(p: p5, s: UnitScene) {
  drawPaper(p);
  const { kind, placement: pl } = s;
  const n = kind.units.length;
  const N = pl.cells;
  const cw = Math.min(80, 720 / N);
  const x0 = (W - N * cw) / 2;
  const cx = (c: number) => x0 + c * cw; // mép trái của ô c
  const dir = Math.sign(s.to - s.from);
  const steps = Math.abs(s.to - s.from);
  const bt = pl.b0 + dir * kind.k * s.t; // vị trí dấu phẩy hiện tại (theo ô)

  // --- Cung "×10 / ×100 / ×1000" giữa hai đơn vị liền nhau ---
  const factor = `×${powerOf10(kind.k)}`;
  for (let u = 0; u < n - 1; u++) {
    const a = cx(u * kind.k + kind.k / 2);
    const b = cx((u + 1) * kind.k + kind.k / 2);
    // đoạn này đã được dấu phẩy đi qua?
    const lo = Math.min(s.from, s.to);
    const hi = Math.max(s.from, s.to);
    const inPath = s.valid && u >= lo && u < hi;
    const hop = dir > 0 ? u - s.from : s.from - 1 - u; // thứ tự bước nhảy
    const passed = inPath && s.t >= hop + 1 - 1e-9;
    const active = inPath && s.t > hop && !passed;
    p.noFill();
    p.stroke(passed ? COL.ink : active ? COL.a : '#C9D2E3');
    p.strokeWeight(passed || active ? 2.5 : 1.5);
    p.arc((a + b) / 2, ARC_Y + 8, b - a, 34, p.PI, p.TWO_PI);
    p.noStroke();
    p.fill(passed ? COL.ink : active ? COL.aText : COL.muted);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(kind.k === 1 && n === 7 ? 13 : 12);
    p.textStyle(passed || active ? p.BOLD : p.NORMAL);
    p.text(dir < 0 && inPath ? `:${powerOf10(kind.k)}` : factor, (a + b) / 2, ARC_Y - 12);
  }
  p.textStyle(p.NORMAL);

  // --- Hàng tên đơn vị ---
  for (let u = 0; u < n; u++) {
    const x = cx(u * kind.k);
    const w = kind.k * cw;
    let bg = '#F4F6FB';
    if (s.valid && u === s.from) bg = '#FBE1E0';
    if (s.valid && u === s.to) bg = '#D6F1ED';
    p.stroke('#B9C4DA');
    p.strokeWeight(1.5);
    p.fill(bg);
    p.rect(x, HEAD_Y, w, HEAD_H);
    p.noStroke();
    p.fill(u === s.from ? COL.aText : u === s.to ? COL.bText : COL.text);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(n === 7 && kind.k === 2 ? 15 : 17);
    p.textStyle(p.BOLD);
    p.text(kind.units[u], x + w / 2, HEAD_Y + HEAD_H / 2);
  }

  // --- Hàng chữ số ---
  p.fill(255);
  p.stroke('#B9C4DA');
  p.strokeWeight(1.5);
  p.rect(cx(0), ROW_Y, N * cw, ROW_H);
  for (let c = 1; c < N; c++) {
    const unitEdge = c % kind.k === 0;
    p.stroke(unitEdge ? '#B9C4DA' : '#E1E7F2');
    p.strokeWeight(unitEdge ? 1.5 : 1);
    p.line(cx(c), ROW_Y, cx(c), ROW_Y + ROW_H);
  }

  if (!s.placement.fits) return;

  // ô nào cần điền thêm chữ số 0 (dấu phẩy đã đi qua)
  const zeros = new Set<number>();
  if (dir > 0) {
    for (let c = pl.last + 1; c <= Math.floor(bt + 1e-9) - 1; c++) zeros.add(c);
  } else if (dir < 0) {
    for (let c = Math.ceil(bt - 1e-9); c <= pl.first - 1; c++) zeros.add(c);
    if (s.done && pl.b1 - 1 < pl.first) zeros.add(pl.b1 - 1); // số 0 ở phần nguyên
  }

  // chữ số 0 thừa ở đầu phần nguyên khi đã xong thì làm mờ
  const leadingFaded = new Set<number>();
  if (s.done) {
    const cellsLeft = Math.min(pl.first, ...Array.from(zeros));
    for (let c = cellsLeft; c < pl.b1 - 1; c++) {
      const d = digitAt(c);
      if (d === '0') leadingFaded.add(c);
      else if (d !== null) break;
    }
  }

  function digitAt(c: number): string | null {
    if (c >= pl.first && c <= pl.last) return pl.digits[c - pl.first];
    if (zeros.has(c)) return '0';
    return null;
  }

  p.textAlign(p.CENTER, p.CENTER);
  p.textStyle(p.BOLD);
  p.textSize(Math.min(34, cw * 0.62));
  for (let c = 0; c < N; c++) {
    const d = digitAt(c);
    if (d === null) continue;
    const x = cx(c);
    const added = zeros.has(c);
    if (added) {
      p.noStroke();
      p.fill('#D6F1ED');
      p.rect(x + 3, ROW_Y + 3, cw - 6, ROW_H - 6, 6);
    }
    p.fill(leadingFaded.has(c) ? '#C3CBDB' : added ? COL.bText : COL.text);
    p.text(d, x + cw / 2, ROW_Y + ROW_H / 2 - 2);
  }

  // --- Dấu phẩy ---
  const commaX = cx(bt);
  p.noStroke();
  p.fill(COL.a);
  p.circle(commaX, ROW_Y + ROW_H - 16, 11);
  p.stroke(COL.a);
  p.strokeWeight(4);
  p.strokeCap(p.ROUND);
  p.line(commaX + 1, ROW_Y + ROW_H - 12, commaX - 4, ROW_Y + ROW_H - 2);

  // --- Câu đổi và lời giải thích bên dưới ---
  const fromU = kind.units[s.from];
  const toU = kind.units[s.to];
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textStyle(p.BOLD);
  p.textSize(30);
  p.fill(COL.text);
  const resultText = s.done ? viNumber(s.result) : '?';
  p.text(`${viNumber(s.value)} ${fromU} = ${resultText} ${toU}`, W / 2, 352);

  if (steps > 0) {
    p.textSize(16);
    p.textStyle(p.NORMAL);
    p.fill(COL.muted);
    const side = dir > 0 ? 'phải' : 'trái';
    p.text(
      `Dời dấu phẩy sang ${side} ${steps} cột đơn vị, mỗi cột ${kind.k} chữ số: tất cả ${steps * kind.k} chữ số`,
      W / 2, 398,
    );
    p.text(
      dir > 0 ? `Từ đơn vị lớn sang đơn vị bé: nhân với ${powerOf10(steps * kind.k)}` :
        `Từ đơn vị bé sang đơn vị lớn: chia cho ${powerOf10(steps * kind.k)}`,
      W / 2, 426,
    );
  }

}
