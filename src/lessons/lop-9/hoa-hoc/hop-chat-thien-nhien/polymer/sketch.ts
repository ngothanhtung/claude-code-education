import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01, ease, lerp } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface ChainScene {
  /** công thức monomer và mắt xích (Unicode) */
  monomer: string;
  unit: string;
  col: string;
  lines: string[];
  t: number; // 0..1 các monomer nối dần thành mạch
  started: boolean;
  done: boolean;
}

/** Monomer (có liên kết đôi) rơi xuống, mở liên kết đôi và nối thành mạch polymer */
export function drawChain(p: p5, s: ChainScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  const chainY = 300;
  // ô rộng theo chữ của mắt xích; mắt xích dài thì vẽ ít ô hơn cho vừa canvas
  p.textSize(14);
  p.textStyle(p.BOLD);
  const box = Math.max(100, p.textWidth(s.unit) + 20, p.textWidth(s.monomer) + 20);
  p.textStyle(p.NORMAL);
  const w = box + 14;
  const COUNT = Math.min(6, Math.floor(700 / w));
  const x0 = 400 - (COUNT * w) / 2;
  // liên kết giữa các mắt xích đã nối
  const joined = [...Array(COUNT).keys()].filter((i) => k >= i * 0.13 + 0.3).length;
  p.stroke(COL.ink);
  p.strokeWeight(4);
  for (let i = 0; i < joined - 1; i++) {
    const xa = x0 + i * w + w / 2;
    p.line(xa, chainY, xa + w, chainY);
  }
  for (let i = 0; i < COUNT; i++) {
    const u = ease(clamp01((k - i * 0.13) / 0.3));
    const sx = x0 + w / 2 + i * w;
    const sy = 130 + (i % 2) * 34;
    const tx = x0 + i * w + w / 2;
    const x = lerp(sx, tx, u);
    const y = lerp(sy, chainY, u);
    p.stroke(s.col);
    p.strokeWeight(2);
    p.fill(u >= 1 ? '#FFFFFF' : '#F6F3FF');
    p.rect(x - box / 2, y - 20, box, 40, 20);
    p.noStroke();
    p.fill(COL.text);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.textStyle(p.BOLD);
    p.text(u >= 1 ? s.unit : s.monomer, x, y);
    p.textStyle(p.NORMAL);
  }
  if (k >= 1) {
    // ngoặc và chỉ số n
    p.noFill();
    p.stroke(COL.ink);
    p.strokeWeight(3);
    const L = x0 - 10;
    const R = x0 + COUNT * w + 10;
    p.line(L, chainY - 34, L - 10, chainY - 34);
    p.line(L - 10, chainY - 34, L - 10, chainY + 34);
    p.line(L - 10, chainY + 34, L, chainY + 34);
    p.line(R, chainY - 34, R + 10, chainY - 34);
    p.line(R + 10, chainY - 34, R + 10, chainY + 34);
    p.line(R + 10, chainY + 34, R, chainY + 34);
    p.noStroke();
    p.fill(COL.ink);
    p.textSize(20);
    p.textStyle(p.BOLD);
    p.text('n', R + 24, chainY + 34);
    p.textStyle(p.NORMAL);
  }
  s.lines.forEach((line, i) => labelBox(p, 400, 390 + i * 32, line, i === 0 ? COL.ink : COL.text, 16));

  if (!s.started) caption(p, `Monomer ${s.monomer} có liên kết đôi`);
  else if (!s.done) caption(p, 'Liên kết đôi mở ra, các monomer nối với nhau thành mạch dài');
  else caption(p, 'Polymer gồm n mắt xích lặp lại');
}
