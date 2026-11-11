import type p5 from 'p5';
import { ACTIVITY } from '@/lib/chem';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { beaker, bubbles, mix } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface SeriesScene {
  metal: string;
  /** nguyên tố trong dung dịch bị đẩy ra (H, Cu, Ag, Fe) */
  cation: string;
  reacts: boolean;
  isAcid: boolean;
  metalCol: string;
  /** màu lớp kim loại bám vào thanh, màu dung dịch trước và sau */
  coatCol: string;
  solCol: string;
  solAfter: string;
  solLabel: string;
  equation: string;
  t: number; // 0..1 nhúng thanh kim loại, 1..2 phản ứng
  started: boolean;
  done: boolean;
}

export function drawSeries(p: p5, s: SeriesScene) {
  drawPaper(p);
  drawActivityRow(p, s);

  const r = s.reacts ? clamp01(s.t - 1) : 0;
  const bx = 300;
  const yb = 420;
  const sol = mix(s.solCol, s.solAfter, r);
  beaker(p, bx, yb, 200, 190, 0.72, sol);
  labelBox(p, bx, yb + 22, s.solLabel, COL.muted, 13);

  // thanh kim loại nhúng xuống
  const dip = clamp01(s.t);
  const top = 150 + dip * 70;
  const h = 210;
  p.noStroke();
  p.fill(s.metalCol);
  p.rect(bx - 14, top, 28, h, 3);
  p.fill(255, 255, 255, 80);
  p.rect(bx - 10, top + 4, 5, h - 8, 2);
  // phần ngập trong dung dịch bị phủ kim loại mới
  const liquidTop = yb - 190 * 0.72;
  if (r > 0 && !s.isAcid) {
    const y0 = Math.max(top, liquidTop);
    p.fill(s.coatCol);
    const spots = 40;
    for (let i = 0; i < spots * r; i++) {
      const sx = bx - 14 + ((i * 37) % 28);
      const sy = y0 + ((i * 53) % Math.max(1, top + h - y0));
      p.ellipse(sx, sy, 7 + (i % 3) * 2, 6);
    }
    p.fill(s.coatCol + 'AA');
    p.rect(bx - 15, y0, 30, (top + h - y0) * r, 2);
  }
  if (s.isAcid && s.reacts && s.t >= 1 && !s.done) bubbles(p, bx, top + h, liquidTop + 6, 40, 0.8);
  labelBox(p, bx, top - 16, `thanh ${s.metal}`, COL.text, 13);

  // phương trình hoặc kết luận
  labelBox(p, 600, 300, s.reacts ? 'Có phản ứng' : 'Không phản ứng', s.reacts ? COL.aText : COL.muted, 18);
  if (s.reacts) labelBox(p, 600, 340, s.equation, COL.ink, 16);

  if (!s.started) caption(p, 'So sánh vị trí hai nguyên tố trong dãy hoạt động hóa học', 132);
  else if (!s.reacts) caption(p, `${s.metal} đứng sau ${s.cation}: không có hiện tượng gì`, 132);
  else if (!s.done) caption(p, s.isAcid ? `${s.metal} đứng trước H: có bọt khí hydrogen` : `${s.metal} đẩy ${s.cation} ra khỏi dung dịch muối`, 132);
  else caption(p, s.isAcid ? 'Kim loại tan, khí hydrogen thoát ra' : `Lớp ${s.cation} bám vào thanh ${s.metal}`, 132);
}

/** Hàng dãy hoạt động, tô kim loại (đỏ) và nguyên tố trong dung dịch (xanh) */
function drawActivityRow(p: p5, s: SeriesScene) {
  const w = 52;
  const x0 = 400 - (ACTIVITY.length * w) / 2;
  const y = 40;
  p.textAlign(p.CENTER, p.CENTER);
  ACTIVITY.forEach((el, i) => {
    const x = x0 + i * w;
    const isM = el === s.metal;
    const isC = el === s.cation;
    p.stroke(isM ? COL.a : isC ? COL.b : '#C9D3EA');
    p.strokeWeight(isM || isC ? 3 : 1.5);
    p.fill(isM ? '#FDE3E1' : isC ? '#D8F2EE' : '#FFFFFF');
    p.rect(x + 3, y, w - 6, 40, 6);
    p.noStroke();
    p.fill(isM ? COL.aText : isC ? COL.bText : COL.text);
    p.textSize(17);
    p.textStyle(p.BOLD);
    p.text(el, x + w / 2, y + 20);
  });
  p.textStyle(p.NORMAL);
  p.fill(COL.muted);
  p.textSize(12);
  p.textAlign(p.LEFT, p.CENTER);
  p.text('mạnh', x0, y + 54);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text('yếu', x0 + ACTIVITY.length * w, y + 54);
  p.stroke(COL.muted);
  p.strokeWeight(1.5);
  p.line(x0 + 40, y + 54, x0 + ACTIVITY.length * w - 34, y + 54);
  p.noStroke();
  p.fill(COL.muted);
  const xe = x0 + ACTIVITY.length * w - 34;
  p.triangle(xe, y + 54, xe - 8, y + 50, xe - 8, y + 58);
  labelBox(p, 400, y + 54, 'mức độ hoạt động hóa học giảm dần', COL.muted, 12);
}
