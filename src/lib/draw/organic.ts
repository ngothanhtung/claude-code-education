import type p5 from 'p5';
import { COL } from './colors';
import { caption, clamp01 } from './geometry';
import { ATOM_COL, drawMolecule } from './molecule';
import { drawPaper, labelBox } from './scene';

export interface OrganicScene {
  /** công thức dùng tra mô hình (C2H6O…) và nhãn hiển thị (C₂H₅OH…) */
  formula: string;
  label: string;
  /** dạng tìm công thức phân tử: hiện % trước, lắp phân tử sau */
  findFormula: boolean;
  /** phần trăm khối lượng từng nguyên tố (theo thứ tự C, H, O) */
  parts: { el: string; pct: number; text: string }[];
  t: number; // 0..2
  started: boolean;
  done: boolean;
}

export function drawOrganic(p: p5, s: OrganicScene) {
  drawPaper(p);
  const a = clamp01(s.t);
  const b = clamp01(s.t - 1);
  const buildK = s.findFormula ? b : !s.started ? 1 : a;
  const barsK = s.findFormula ? 1 : b;

  // mô hình phân tử
  if (s.findFormula && b === 0) {
    p.noStroke();
    p.fill(COL.muted);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(72);
    p.textStyle(p.BOLD);
    p.text('?', 250, 230);
    p.textStyle(p.NORMAL);
    labelBox(p, 250, 360, 'công thức phân tử A = ?', COL.ink, 16);
  } else {
    drawMolecule(p, s.formula, 250, 230, 62, buildK);
    labelBox(p, 250, 380, s.findFormula && !s.done ? '…' : s.label, COL.ink, 20);
  }

  // cột phần trăm khối lượng
  const x0 = 520;
  const base = 380;
  const maxH = 240;
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text('% khối lượng', 620, 108);
  s.parts.forEach((part, i) => {
    const x = x0 + i * 74;
    const h = (maxH * part.pct * barsK) / 100;
    p.noStroke();
    p.fill(COL.track);
    p.rect(x, base - maxH, 50, maxH, 4);
    p.fill(part.el === 'H' ? COL.inkLine : ATOM_COL[part.el]);
    p.rect(x, base - h, 50, h, 4);
    p.fill(COL.text);
    p.textSize(16);
    p.textStyle(p.BOLD);
    p.text(part.el, x + 25, base + 18);
    p.textStyle(p.NORMAL);
    if (barsK > 0) labelBox(p, x + 25, base - h - 14, part.text, COL.text, 13);
  });

  if (s.findFormula) {
    if (!s.started) caption(p, 'Biết % khối lượng các nguyên tố và khối lượng mol, tìm công thức phân tử');
    else if (!s.done) caption(p, 'Tính số nguyên tử mỗi nguyên tố trong một phân tử');
    else caption(p, `Công thức phân tử: ${s.label}`);
  } else if (!s.started) caption(p, `Mô hình phân tử ${s.label}`);
  else if (s.t < 1) caption(p, 'Lắp phân tử: mỗi nguyên tử C tạo 4 liên kết, H tạo 1, O tạo 2');
  else caption(p, 'Phần trăm khối lượng của mỗi nguyên tố trong phân tử');
}
