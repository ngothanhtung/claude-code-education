import type p5 from 'p5';
import type { Reaction } from '@/lib/chem';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { GLASS_STROKE, LIQ, bubbles, mix, testTube } from '@/lib/draw/lab';
import { drawMolecule, drawReaction } from '@/lib/draw/molecule';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface BromineScene {
  reaction: Reaction;
  equation: string;
  /** hỗn hợp có khí không phản ứng (CH4) thoát ra */
  mixture: boolean;
  /** mức nhạt màu cuối cùng của nước bromine 0..1 */
  fade: number;
  gasLabel: string;
  t: number; // 0..1
  started: boolean;
  done: boolean;
}

/** Dẫn khí qua ống nghiệm đựng nước bromine */
export function drawBromine(p: p5, s: BromineScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  drawReaction(p, s.reaction, k, 110, 26, 300, 780);
  labelBox(p, 540, 190, s.equation, COL.ink, 16);

  // bình khí và ống dẫn
  p.noStroke();
  p.fill('#E3EEF8');
  p.stroke(GLASS_STROKE);
  p.strokeWeight(2.5);
  p.ellipse(90, 330, 110, 110);
  p.rect(78, 250, 24, 30);
  labelBox(p, 90, 400, s.gasLabel, COL.text, 13);
  p.noFill();
  p.beginShape();
  p.vertex(90, 250);
  p.vertex(90, 220);
  p.vertex(200, 220);
  p.vertex(200, 400);
  p.endShape();

  const level = 0.65;
  const col = mix(LIQ.bromine, '#F4F1E8', s.fade * k);
  testTube(p, 200, 230, 210, 64, level, col);
  labelBox(p, 280, 430, 'nước bromine', '#B5651D', 13);
  if (s.started && !s.done) bubbles(p, 200, 420, 230 + 210 * (1 - level) + 6, 40, 0.8);
  if (s.mixture && k > 0.1) {
    labelBox(p, 330, 206, 'CH₄ không phản ứng, thoát ra', COL.muted, 12);
    p.stroke(COL.muted);
    p.strokeWeight(2);
    p.line(232, 240, 232, 200);
    p.line(226, 208, 232, 200);
    p.line(238, 208, 232, 200);
  }

  if (!s.started) caption(p, 'Dẫn khí vào ống nghiệm đựng nước bromine màu da cam');
  else if (!s.done) caption(p, 'Liên kết đôi mở ra, bromine cộng vào: màu da cam nhạt dần');
  else caption(p, 'Alkene làm mất màu nước bromine');
}

export interface PolymerScene {
  t: number;
  started: boolean;
  done: boolean;
  massText: string;
  productText: string;
}

/** Trùng hợp ethylene thành polyethylene */
export function drawPolymer(p: p5, s: PolymerScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  const units = 7;
  const joined = Math.round(k * units);
  // các phân tử monomer còn rời
  for (let i = joined; i < units; i++) {
    drawMolecule(p, 'C2H4', 120 + i * 92, 140 + (i % 2) * 30, 30);
  }
  // mạch polymer đang lớn dần
  const y = 330;
  const step = 46;
  const x0 = 400 - (units * 2 * step) / 2 + step / 2;
  for (let i = 0; i < joined * 2; i++) {
    const x = x0 + i * step;
    p.stroke('#8D96A8');
    p.strokeWeight(3);
    if (i < joined * 2 - 1) p.line(x, y, x + step, y);
    p.line(x, y, x, y - 34);
    p.line(x, y, x, y + 34);
    if (i === 0) p.line(x, y, x - step * 0.6, y);
    if (i === joined * 2 - 1) p.line(x, y, x + step * 0.6, y);
    p.noStroke();
    p.fill('#FFFFFF');
    p.stroke('#8D96A8');
    p.strokeWeight(1.5);
    p.circle(x, y - 34, 18);
    p.circle(x, y + 34, 18);
    p.noStroke();
    p.fill('#3A3F4B');
    p.circle(x, y, 28);
    p.fill('#FFFFFF');
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(13);
    p.textStyle(p.BOLD);
    p.text('C', x, y + 0.5);
    p.textStyle(p.NORMAL);
  }
  if (joined > 0) labelBox(p, 400, y + 70, `mạch polyethylene (PE): …–CH₂–CH₂–…`, COL.ink, 14);
  labelBox(p, 400, 448, `ethylene: ${s.massText}  →  PE: ${s.productText}`, COL.text, 16);

  if (!s.started) caption(p, 'Nhiều phân tử ethylene (monomer) có liên kết đôi');
  else if (!s.done) caption(p, 'Liên kết đôi mở ra, các phân tử nối với nhau thành mạch dài');
  else caption(p, 'Phản ứng trùng hợp tạo polyethylene');
}
