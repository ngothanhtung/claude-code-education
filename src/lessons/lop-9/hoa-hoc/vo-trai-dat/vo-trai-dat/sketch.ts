import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01, ease } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';

/** Thành phần khối lượng các nguyên tố trong vỏ Trái Đất (%, số liệu tham khảo SGK) */
export const CRUST: [string, number][] = [
  ['O', 46.6], ['Si', 27.7], ['Al', 8.1], ['Fe', 5.0], ['Ca', 3.6], ['Na', 2.8], ['K', 2.6], ['Mg', 2.1], ['khác', 1.5],
];

export interface CrustScene {
  metal: string;
  mineral: string;
  /** % kim loại trong khoáng vật (0..100) và nhãn */
  pct: number;
  pctText: string;
  /** dòng mô tả quặng → kim loại (dạng quặng) */
  oreLines: string[];
  t: number;
  started: boolean;
  done: boolean;
}

export function drawCrust(p: p5, s: CrustScene) {
  drawPaper(p);
  const k = ease(clamp01(s.t));

  // thành phần vỏ Trái Đất
  const x0 = 110;
  const y0 = 92;
  const maxW = 220;
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text('Vỏ Trái Đất (% khối lượng)', 50, 70);
  CRUST.forEach(([el, v], i) => {
    const y = y0 + i * 36;
    const hi = el === s.metal;
    p.textAlign(p.RIGHT, p.CENTER);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.fill(hi ? COL.aText : COL.text);
    p.text(el, x0 - 12, y + 10);
    p.fill(COL.track);
    p.rect(x0, y, maxW, 20, 6);
    p.fill(hi ? COL.a : el === 'O' || el === 'Si' ? COL.ink : '#9AA3B5');
    p.rect(x0, y, (maxW * v) / 46.6, 20, 6);
    p.fill(COL.text);
    p.textAlign(p.LEFT, p.CENTER);
    p.textStyle(p.NORMAL);
    p.textSize(13);
    p.text(`${String(v).replace('.', ',')}%`, x0 + (maxW * v) / 46.6 + 8, y + 10);
  });
  p.textStyle(p.NORMAL);

  // khoáng vật: phần kim loại trong phân tử
  const cx = 590;
  labelBox(p, cx, 96, s.mineral, COL.ink, 18);
  const bw = 300;
  const by = 140;
  p.noStroke();
  p.fill(COL.track);
  p.rect(cx - bw / 2, by, bw, 46, 8);
  p.fill(COL.a);
  p.rect(cx - bw / 2, by, (bw * s.pct * k) / 100, 46, 8);
  if (k > 0.3) labelBox(p, cx, by + 23, `${s.metal}: ${s.pctText}`, COL.aText, 15);
  p.fill(COL.muted);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(12);
  p.text('phần khối lượng kim loại trong khoáng vật', cx, by + 64);

  s.oreLines.forEach((line, i) => labelBox(p, cx, 270 + i * 40, line, i === s.oreLines.length - 1 ? COL.ink : COL.text, 15));

  if (!s.started) caption(p, 'Oxygen và silicon chiếm khoảng ¾ khối lượng vỏ Trái Đất');
  else if (!s.done) caption(p, 'Kim loại nằm trong khoáng vật, quặng');
  else caption(p, `${s.metal} chiếm ${s.pctText} khối lượng ${s.mineral}`);
}
