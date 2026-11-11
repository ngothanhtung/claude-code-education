import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { LITMUS, LIQ, beaker, gasJar, litmus, mix, withAlpha } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface ElementScene {
  el: string;
  isMetal: boolean;
  elCol: string;
  flameCol: string;
  /** màu khói/khí oxide tạo thành trong bình */
  oxideCol: string;
  oxideLabel: string;
  productLabel: string;
  eq1: string;
  eq2: string;
  t: number; // 0..1 đốt trong oxygen, 1..2 hòa oxide vào nước có quỳ tím
  started: boolean;
  done: boolean;
}

export function drawElements(p: p5, s: ElementScene) {
  drawPaper(p);
  const burn = clamp01(s.t);
  const dissolve = clamp01(s.t - 1);

  // 1. đốt trong bình oxygen
  const jx = 200;
  const yb = 360;
  gasJar(p, jx, yb, 150, 220, withAlpha(s.oxideCol, 0.15 + 0.5 * burn));
  labelBox(p, jx - 100, 80, '① đốt trong khí O₂', COL.ink, 14);
  const sy = 90 + Math.min(1, burn * 3) * 120;
  p.stroke('#5B6478');
  p.strokeWeight(3);
  p.line(jx, 60, jx, sy);
  p.noStroke();
  p.fill('#5B6478');
  p.arc(jx, sy, 30, 20, 0, Math.PI);
  const size = 16 * (1 - 0.9 * burn);
  p.fill(s.elCol);
  if (size > 1) p.ellipse(jx, sy + 2, size, size * 0.7);
  if (burn > 0.2 && burn < 1) {
    const f = 0.85 + 0.15 * Math.sin(performance.now() / 80);
    p.fill(withAlpha(s.flameCol, 0.35));
    p.circle(jx, sy - 8, 70 * f);
    p.fill(withAlpha(s.flameCol, 0.85));
    p.ellipse(jx, sy - 10, 22 * f, 34 * f);
  }
  if (burn >= 1) labelBox(p, jx, yb - 50, s.oxideLabel, COL.text, 14);

  // 2. hòa oxide vào nước, nhúng quỳ tím
  const bx = 470;
  const by = 360;
  beaker(p, bx, by, 150, 150, 0.6, mix(LIQ.water, s.oxideCol === '#FFFFFF' ? '#E8EEF6' : LIQ.water, dissolve));
  labelBox(p, bx, 80, '② cho oxide vào nước', COL.ink, 14);
  const target = s.isMetal ? LITMUS.xanh : LITMUS.do;
  litmus(p, bx + 30, by - 120, mix(LITMUS.tim, target, dissolve));
  labelBox(p, bx + 30, by - 132, 'quỳ tím', COL.muted, 12);
  if (dissolve > 0) {
    p.noStroke();
    p.fill(withAlpha(s.oxideCol === '#FFFFFF' ? '#BFC6D4' : s.oxideCol, 0.6 * (1 - dissolve)));
    for (let i = 0; i < 8; i++) p.circle(bx - 40 + i * 8, by - 90 + dissolve * 60 + (i % 2) * 6, 6);
  }
  if (s.done) labelBox(p, bx - 30, by + 22, `dung dịch ${s.productLabel}`, s.isMetal ? '#2D5BBF' : COL.aText, 13);

  // thẻ kết luận
  const kx = 680;
  p.noStroke();
  p.fill('#FFFFFF');
  p.stroke('#C9D3EA');
  p.strokeWeight(1.5);
  p.rect(kx - 90, 130, 180, 150, 10);
  p.noStroke();
  p.fill(s.isMetal ? '#2D5BBF' : COL.aText);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(20);
  p.textStyle(p.BOLD);
  p.text(s.el, kx, 156);
  p.textSize(14);
  p.text(s.isMetal ? 'kim loại' : 'phi kim', kx, 182);
  p.textStyle(p.NORMAL);
  p.fill(COL.text);
  p.textSize(13);
  p.text(s.isMetal ? 'oxide base' : 'oxide acid', kx, 210);
  p.text(s.isMetal ? 'tạo base với nước' : 'tạo acid với nước', kx, 232);
  p.text(s.done ? (s.isMetal ? 'quỳ tím → xanh' : 'quỳ tím → đỏ') : 'quỳ tím → ?', kx, 256);

  labelBox(p, 400, 432, s.eq1, COL.ink, 16);
  labelBox(p, 400, 462, s.eq2, COL.ink, 16);

  if (!s.started) caption(p, `Đốt ${s.el} trong oxygen rồi cho oxide tạo thành vào nước`);
  else if (s.t < 1) caption(p, `${s.el} cháy trong oxygen tạo oxide`);
  else if (!s.done) caption(p, 'Oxide tan trong nước, giấy quỳ tím đổi màu');
  else caption(p, s.isMetal ? 'Dung dịch base làm quỳ tím hóa xanh' : 'Dung dịch acid làm quỳ tím hóa đỏ');
}
