import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { LIQ, amountBar, beaker, flame, withAlpha } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface LimeScene {
  mode: 'nungvoi' | 'toivoi' | 'thuytinh';
  equation: string;
  inLabel: string;
  inText: string;
  outs: { label: string; text: string }[];
  t: number;
  started: boolean;
  done: boolean;
}

export function drawLime(p: p5, s: LimeScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  if (s.mode === 'toivoi') drawSlaking(p, s, k);
  else drawKiln(p, s, k);

  amountBar(p, 590, 300, 110, 1 - k, s.inLabel, s.inText, '#B9B39C', COL.text);
  s.outs.forEach((o, i) => amountBar(p, 590, 336 + i * 36, 110, k, o.label, o.text, i === 0 ? COL.ink : '#9AA3B5', i === 0 ? COL.ink : COL.text));
  labelBox(p, 400, 456, s.equation, COL.ink, 18);
}

/** Lò nung vôi / lò nấu thủy tinh */
function drawKiln(p: p5, s: LimeScene, k: number) {
  const cx = 260;
  const glass = s.mode === 'thuytinh';
  p.noStroke();
  p.fill('#B5562B');
  p.beginShape();
  p.vertex(cx - 70, 104);
  p.vertex(cx + 70, 104);
  p.vertex(cx + 110, 392);
  p.vertex(cx - 110, 392);
  p.endShape(p.CLOSE);
  // gạch chịu lửa
  p.stroke('#8F3F1C');
  p.strokeWeight(1);
  for (let y = 124; y < 392; y += 22) p.line(cx - 70 - ((y - 104) * 40) / 288, y, cx + 70 + ((y - 104) * 40) / 288, y);
  p.noStroke();
  p.fill('#3A3F4B');
  p.beginShape();
  p.vertex(cx - 52, 114);
  p.vertex(cx + 52, 114);
  p.vertex(cx + 86, 374);
  p.vertex(cx - 86, 374);
  p.endShape(p.CLOSE);
  // ngọn lửa
  if (s.started && !s.done) for (let i = -2; i <= 2; i++) flame(p, cx + i * 30, 366, 36, '#F28C28');
  p.fill(withAlpha('#FF8A3D', s.started && !s.done ? 0.25 : 0.08));
  p.ellipse(cx, 300, 150, 120);
  // nguyên liệu nạp từ trên
  const now = performance.now() / 1000;
  if (s.started && !s.done) {
    for (let i = 0; i < 12; i++) {
      const ph = (now * 0.35 + i * 0.173) % 1;
      p.fill(glass ? (i % 2 ? '#E9DFB8' : '#F5F1E6') : '#D9D4C3');
      p.circle(cx + Math.sin(i * 3.7) * (30 + 20 * ph), 130 + ph * 180, glass ? 8 : 14);
    }
  }
  // sản phẩm ở đáy
  const h = 8 + 28 * k;
  p.fill(glass ? withAlpha('#9FD7E0', 0.9) : '#F4F4F0');
  p.rect(cx - 82, 372 - h, 164, h, 4);
  // khí CO2 thoát ra
  if (k > 0) {
    p.fill(withAlpha('#9AA3B5', 0.35 * k));
    for (let i = 0; i < 5; i++) p.circle(cx + 10 + i * 16, 96 - i * 6 - ((now * 20) % 12), 18 + i * 3);
  }
  labelBox(p, cx - 150, 120, glass ? 'nạp cát, soda, đá vôi' : 'nạp đá vôi', COL.text, 13);
  labelBox(p, cx + 160, 84, 'khí CO₂ thoát ra', COL.muted, 12);
  labelBox(p, cx, 414, glass ? 'thủy tinh lỏng' : 'vôi sống CaO', COL.ink, 13);

  if (!s.started) caption(p, glass ? 'Lò nấu thủy tinh: nạp cát, soda và đá vôi' : 'Lò nung vôi: nạp đá vôi và nhiên liệu');
  else if (!s.done) caption(p, glass ? 'Nấu chảy ở khoảng 1400 °C, thoát khí CO₂' : 'Đá vôi bị nhiệt phân ở khoảng 900 °C');
  else caption(p, glass ? 'Thủy tinh lỏng được ép, thổi thành sản phẩm' : 'Vôi sống lấy ra ở đáy lò, khí CO₂ thoát ra trên');
}

/** Tôi vôi: cho vôi sống vào nước, tỏa nhiệt */
function drawSlaking(p: p5, s: LimeScene, k: number) {
  const bx = 280;
  const yb = 400;
  beaker(p, bx, yb, 220, 200, 0.65, withAlpha(LIQ.water, 1 - 0.6 * k) as string);
  p.noStroke();
  p.fill(withAlpha('#F4F4F0', 0.3 + 0.7 * k));
  p.rect(bx - 106, yb - 200 * 0.65 * k, 212, 200 * 0.65 * k - 2, 0, 0, 8, 8);
  // các cục vôi sống rơi vào
  for (let i = 0; i < 6; i++) {
    const y = 120 + Math.min(1, k * 2) * 200 + (i % 2) * 10;
    const sz = 22 * (1 - k);
    p.fill('#E9E6DA');
    if (sz > 2) p.rect(bx - 80 + i * 30, Math.min(y, yb - 20), sz, sz, 4);
  }
  // hơi nước bốc lên (tỏa nhiệt)
  if (s.started && !s.done) {
    p.noFill();
    p.stroke(withAlpha('#9AA3B5', 0.7));
    p.strokeWeight(3);
    const now = performance.now() / 400;
    for (let i = 0; i < 4; i++) {
      const x = bx - 60 + i * 40;
      p.bezier(x, yb - 210, x - 14, yb - 240 - (now % 1) * 10, x + 14, yb - 260, x, yb - 290);
    }
    p.noStroke();
  }
  labelBox(p, bx, yb + 22, 'vôi tôi Ca(OH)₂', COL.ink, 13);
  if (!s.started) caption(p, 'Tôi vôi: cho vôi sống vào nước');
  else if (!s.done) caption(p, 'Phản ứng tỏa nhiều nhiệt, nước sôi lên');
  else caption(p, 'Thu được vôi tôi (calcium hydroxide)');
}
