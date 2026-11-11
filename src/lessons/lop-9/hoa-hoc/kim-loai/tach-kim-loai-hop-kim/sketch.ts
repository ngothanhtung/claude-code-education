import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { LIQ, amountBar, beaker, bubbles, withAlpha } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface ExtractScene {
  mode: 'locao' | 'dienphan' | 'hopkim';
  equation: string;
  /** nhãn thanh lượng chất: [nguyên liệu, sản phẩm] */
  inLabel: string;
  outLabel: string;
  inText: string;
  outText: string;
  t: number; // 0..1 nạp nguyên liệu, 1..2 phản ứng
  started: boolean;
  done: boolean;
}

export function drawExtract(p: p5, s: ExtractScene) {
  drawPaper(p);
  const r = clamp01(s.t - 1);
  if (s.mode === 'locao') drawFurnace(p, s, r);
  else if (s.mode === 'dienphan') drawCell(p, s, r);
  else drawBrass(p, s, r);

  amountBar(p, 560, 330, 110, 1 - r, s.inLabel, s.inText, '#B5562B', COL.text);
  amountBar(p, 560, 366, 110, r, s.outLabel, s.outText, COL.ink, COL.ink);
  labelBox(p, 400, 456, s.equation, COL.ink, 18);
}

/** Lò cao luyện gang */
function drawFurnace(p: p5, s: ExtractScene, r: number) {
  const cx = 280;
  // thân lò
  p.noStroke();
  p.fill('#8E8E96');
  p.beginShape();
  p.vertex(cx - 60, 80);
  p.vertex(cx + 60, 80);
  p.vertex(cx + 110, 300);
  p.vertex(cx + 90, 410);
  p.vertex(cx - 90, 410);
  p.vertex(cx - 110, 300);
  p.endShape(p.CLOSE);
  p.fill('#3A3F4B');
  p.beginShape();
  p.vertex(cx - 46, 90);
  p.vertex(cx + 46, 90);
  p.vertex(cx + 94, 300);
  p.vertex(cx + 76, 400);
  p.vertex(cx - 76, 400);
  p.vertex(cx - 94, 300);
  p.endShape(p.CLOSE);
  // ánh lửa trong lò
  const heat = s.started ? 0.5 + 0.5 * clamp01(s.t) : 0.2;
  p.fill(withAlpha('#FF8A3D', 0.22 * heat));
  p.ellipse(cx, 330, 150, 110);
  p.fill(withAlpha('#FFC266', 0.3 * heat));
  p.ellipse(cx, 345, 90, 60);
  // nguyên liệu rơi xuống
  const now = performance.now() / 1000;
  if (s.started && !s.done) {
    for (let i = 0; i < 14; i++) {
      const ph = (now * 0.4 + i * 0.137) % 1;
      const x = cx + Math.sin(i * 4.1) * (40 + 30 * ph);
      const y = 100 + ph * 220;
      p.fill(i % 3 === 0 ? '#2B2B2B' : i % 3 === 1 ? '#B5562B' : '#E9E2D0');
      p.circle(x, y, 9);
    }
  }
  // gang lỏng và xỉ dưới đáy
  const pool = 6 + 34 * r;
  p.fill('#F2A65A');
  p.rect(cx - 74, 400 - pool, 148, pool, 0, 0, 6, 6);
  if (r > 0.2) {
    p.fill('#B9B39C');
    p.rect(cx - 72, 400 - pool - 8, 144, 8);
  }
  // gió nóng thổi vào
  p.stroke('#E0443F');
  p.strokeWeight(3);
  p.line(cx - 160, 340, cx - 96, 340);
  p.line(cx + 160, 340, cx + 96, 340);
  p.noStroke();
  labelBox(p, cx - 150, 320, 'không khí nóng', COL.aText, 12);
  labelBox(p, cx, 62, 'quặng Fe₂O₃, than cốc, đá vôi', COL.text, 13);
  labelBox(p, cx + 150, 110, 'khí CO₂ ra', COL.muted, 12);
  labelBox(p, cx, 426, 'gang lỏng', '#B5562B', 13);

  if (!s.started) caption(p, 'Lò cao: nạp quặng sắt, than cốc và đá vôi từ trên xuống');
  else if (!s.done) caption(p, 'Carbon monoxide khử iron(III) oxide thành sắt');
  else caption(p, 'Gang lỏng chảy xuống đáy lò, xỉ nổi lên trên');
}

/** Bể điện phân nhôm oxide nóng chảy */
function drawCell(p: p5, s: ExtractScene, r: number) {
  const x0 = 120;
  const x1 = 440;
  const top = 180;
  const bot = 400;
  p.noStroke();
  p.fill('#5B6478');
  p.rect(x0 - 12, top, x1 - x0 + 24, bot - top + 12, 8);
  p.fill('#2B2B2B');
  p.rect(x0, top + 10, x1 - x0, bot - top - 10, 4);
  const al = 8 + 40 * r;
  p.fill(LIQ.molten);
  p.rect(x0 + 6, top + 30, x1 - x0 - 12, bot - top - 36 - al);
  p.fill('#D9DDE5');
  p.rect(x0 + 6, bot - 6 - al, x1 - x0 - 12, al, 0, 0, 4, 4);
  // cực dương than chì
  const dip = clamp01(s.t);
  for (const ax of [x0 + 70, x0 + 160, x0 + 250]) {
    p.fill('#3A3F4B');
    p.rect(ax - 22, top - 40 + dip * 60, 44, 70, 3);
    p.stroke(COL.text);
    p.strokeWeight(2);
    p.line(ax, top - 40 + dip * 60, ax, 110);
    p.noStroke();
    if (s.t >= 1 && !s.done) bubbles(p, ax, top + 80, top + 34, 40, 0.5, ax);
  }
  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(x0 + 70, 110, x0 + 250, 110);
  p.noStroke();
  labelBox(p, x0 + 160, 92, 'cực dương (+): than chì, khí O₂ thoát ra', COL.aText, 12);
  labelBox(p, (x0 + x1) / 2, bot + 30, 'cực âm (−): nhôm lỏng tụ ở đáy bể', COL.bText, 12);
  labelBox(p, x0 + 160, top + 120, 'Al₂O₃ nóng chảy + cryolite', COL.text, 12);

  if (!s.started) caption(p, 'Bể điện phân nhôm oxide nóng chảy');
  else if (!s.done) caption(p, 'Dòng điện phân hủy Al₂O₃: nhôm ở cực âm, oxygen ở cực dương');
  else caption(p, 'Nhôm lỏng thu được ở đáy bể');
}

/** Đồng thau (Cu – Zn) trong dung dịch HCl: chỉ Zn phản ứng */
function drawBrass(p: p5, s: ExtractScene, r: number) {
  const bx = 280;
  const yb = 410;
  beaker(p, bx, yb, 200, 200, 0.7, LIQ.acid);
  labelBox(p, bx, yb + 22, 'dung dịch HCl dư', COL.muted, 13);
  const drop = clamp01(s.t);
  const y = 160 + drop * 210;
  // mẩu hợp kim: phần vàng (đồng thau) nhạt dần thành màu đỏ đồng khi Zn tan hết
  const w = 90;
  p.noStroke();
  p.fill(r > 0 ? `rgb(${Math.round(214 - 14 * r)},${Math.round(178 - 63 * r)},${Math.round(80 - 22 * r)})` : '#D6B250');
  p.rect(bx - w / 2, y - 26, w, 26, 4);
  // các hạt Zn trên bề mặt
  p.fill(withAlpha('#B8C0CC', 1 - r));
  for (let i = 0; i < 9; i++) p.circle(bx - 36 + i * 9, y - 13 + (i % 2 ? 5 : -5), 6);
  if (s.t >= 1 && !s.done) bubbles(p, bx, y - 26, yb - 140 + 4, 80, 0.8);
  labelBox(p, bx + 110, y - 13, s.done ? 'còn lại Cu' : 'đồng thau (Cu – Zn)', COL.text, 12);

  if (!s.started) caption(p, 'Cho mẩu đồng thau vào dung dịch HCl dư');
  else if (!s.done) caption(p, 'Zn tan, có bọt khí H₂; Cu đứng sau H nên không phản ứng');
  else caption(p, 'Từ thể tích H₂ tính được khối lượng Zn trong hợp kim');
}
