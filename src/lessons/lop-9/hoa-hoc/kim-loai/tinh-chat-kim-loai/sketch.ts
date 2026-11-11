import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { GLASS_STROKE, LIQ, amountBar, beaker, bubbles, gasJar, testTube, withAlpha } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface MetalScene {
  mode: 'oxi' | 'clo' | 'acid';
  metal: string;
  /** màu kim loại, màu ngọn lửa/ánh sáng khi cháy, màu sản phẩm */
  metalCol: string;
  glowCol: string;
  productCol: string;
  /** chữ trên canvas (Unicode) */
  equation: string;
  productLabel: string;
  gasLabel: string;
  /** số liệu hiển thị: lượng chất ban đầu và sau phản ứng (đã định dạng) */
  metalText: string;
  productText: string;
  gasText: string;
  t: number; // 0..1 đưa kim loại vào, 1..2 phản ứng
  started: boolean;
  done: boolean;
}

export function drawMetal(p: p5, s: MetalScene) {
  drawPaper(p);
  const r = clamp01(s.t - 1); // tiến độ phản ứng
  if (s.mode === 'acid') drawAcid(p, s, r);
  else drawJar(p, s, r);

  // lượng chất
  const x = 560;
  amountBar(p, x, 300, 120, 1 - r, s.metal, s.metalText, s.metalCol === '#D9DDE5' ? '#9AA3B5' : s.metalCol, COL.text);
  amountBar(p, x, 336, 120, r, s.productLabel, r > 0 ? s.productText : '0', COL.a, COL.aText);
  amountBar(p, x, 372, 120, s.mode === 'acid' ? r : 1 - r, s.gasLabel, s.gasText, COL.b, COL.bText);
  p.noStroke();
  p.fill(COL.muted);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(13);
  p.text('lượng chất (mol)', x + 60, 274);

  labelBox(p, 400, 452, s.equation, COL.ink, 20);

  if (!s.started) {
    caption(p, s.mode === 'acid' ? `Thả ${s.metal} vào ống nghiệm đựng dung dịch acid` : `Đốt nóng ${s.metal} rồi đưa vào bình khí`);
  } else if (!s.done) {
    caption(p, s.mode === 'acid' ? 'Kim loại tan dần, có bọt khí hydrogen thoát ra' : s.mode === 'oxi' ? 'Kim loại cháy trong oxygen tạo oxide' : 'Kim loại cháy trong chlorine tạo muối chloride');
  } else caption(p, `Sản phẩm: ${s.productLabel}`);
}

/** Bình khí O2 / Cl2 với muỗng đốt kim loại */
function drawJar(p: p5, s: MetalScene, r: number) {
  const x = 280;
  const yb = 410;
  const gas = s.mode === 'clo' ? withAlpha('#C3DE55', 0.55 * (1 - 0.6 * r)) : withAlpha('#DCEBFA', 0.6);
  gasJar(p, x, yb, 170, 250, gas);
  labelBox(p, x + 130, yb - 200, s.mode === 'clo' ? 'bình khí Cl₂' : 'bình khí O₂', COL.muted, 13);

  // muỗng đốt đi xuống
  const down = clamp01(s.t);
  const sy = 80 + down * 190;
  p.stroke('#5B6478');
  p.strokeWeight(3);
  p.line(x, 40, x, sy);
  p.noStroke();
  p.fill('#5B6478');
  p.arc(x, sy, 34, 22, 0, Math.PI);
  // kim loại trên muỗng
  const size = 18 * (1 - 0.8 * r);
  p.fill(s.metalCol);
  if (size > 1) p.ellipse(x, sy + 2, size, size * 0.6);

  // ngọn lửa / ánh sáng khi cháy
  if (s.t > 0.6 && !s.done) {
    const glow = s.t < 1 ? (s.t - 0.6) / 0.4 : 1;
    const flick = 0.85 + 0.15 * Math.sin(performance.now() / 70);
    p.fill(withAlpha(s.glowCol, 0.35 * glow));
    p.circle(x, sy - 4, 90 * flick);
    p.fill(withAlpha(s.glowCol, 0.8 * glow));
    p.circle(x, sy - 4, 34 * flick);
    // tia lửa
    if (s.metal === 'Fe') {
      p.stroke(withAlpha('#FFB347', glow));
      p.strokeWeight(2);
      for (let i = 0; i < 10; i++) {
        const a = i * 0.63 + performance.now() / 300;
        const L = 30 + 20 * Math.sin(i * 7 + performance.now() / 90);
        p.line(x + Math.cos(a) * 16, sy + Math.sin(a) * 16, x + Math.cos(a) * L, sy + Math.sin(a) * L);
      }
      p.noStroke();
    }
  }
  // sản phẩm: khói/bột phủ đáy bình
  if (r > 0) {
    p.fill(withAlpha(s.productCol, 0.1 * r));
    p.rect(x - 80, sy - 40, 160, yb - sy + 20, 10);
    p.fill(s.productCol);
    p.rect(x - 76, yb - 14 - 10 * r, 152, 10 * r, 3);
  }
  if (s.done) labelBox(p, x, yb - 40, s.productLabel, COL.aText, 14);
}

/** Ống nghiệm acid + kim loại, khí H2 thu bằng cách đẩy nước */
function drawAcid(p: p5, s: MetalScene, r: number) {
  const tx = 170;
  const top = 150;
  testTube(p, tx, top, 220, 50, 0.6, LIQ.acid);
  labelBox(p, tx, top + 245, 'dung dịch acid', COL.muted, 12);
  // nút và ống dẫn khí
  p.noStroke();
  p.fill('#8C7A60');
  p.rect(tx - 20, top - 14, 40, 18, 3);
  p.noFill();
  p.stroke(GLASS_STROKE);
  p.strokeWeight(3);
  p.beginShape();
  p.vertex(tx, top - 14);
  p.vertex(tx, top - 50);
  p.vertex(300, top - 50);
  p.vertex(300, 404);
  p.vertex(352, 404);
  p.vertex(352, 378);
  p.endShape();

  // các hạt kim loại rơi xuống rồi tan dần
  const drop = clamp01(s.t);
  const n = 5;
  for (let i = 0; i < n; i++) {
    const gx = tx - 12 + (i % 3) * 12;
    const gy = top + 60 + drop * 132 + (i > 2 ? -10 : 0);
    const sz = 12 * (1 - 0.85 * r);
    p.noStroke();
    p.fill(s.metalCol);
    if (sz > 1) p.ellipse(gx, gy, sz, sz * 0.8);
  }
  if (s.t >= 1 && !s.done) bubbles(p, tx, top + 200, top + 95, 40, 0.9);

  // chậu nước + ống nghiệm úp ngược thu khí
  const cx = 360;
  beaker(p, cx + 10, 420, 150, 110, 0.75, LIQ.water);
  const cylTop = 150;
  const cylBot = 390;
  const gasH = (cylBot - cylTop - 20) * r;
  p.noStroke();
  p.fill(LIQ.water);
  p.rect(cx - 22, cylTop + gasH, 44, cylBot - cylTop - gasH);
  p.fill(withAlpha('#FFFFFF', 0.6));
  p.rect(cx - 22, cylTop, 44, gasH);
  p.noFill();
  p.stroke(GLASS_STROKE);
  p.strokeWeight(2.5);
  p.rect(cx - 24, cylTop - 6, 48, cylBot - cylTop + 6, 18, 18, 0, 0);
  p.strokeWeight(1);
  for (let k = 1; k < 8; k++) p.line(cx + 12, cylTop + k * 28, cx + 24, cylTop + k * 28);
  if (r > 0) bubbles(p, cx, cylBot, cylTop + gasH + 6, 20, s.done ? 0 : 0.6, 3);
  labelBox(p, cx + 90, cylTop + 20, `khí ${s.gasLabel}`, COL.bText, 13);
}
