import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { TINT, caption, ease, formulaLine, lerp, phase } from '@/lib/draw/geometry';
import { dashedLine, drawPaper, labelBox, spanArrow } from '@/lib/draw/scene';
import { fmt } from '@/lib/format';

export interface CircleScene {
  mode: 'chuvi' | 'dientich';
  given: 'r' | 'd';
  r: number;
  C: number;
  S: number;
  t: number;
  done: boolean;
}

export function drawCircle(p: p5, s: CircleScene) {
  drawPaper(p);
  if (s.mode === 'chuvi') drawPerimeter(p, s);
  else drawArea(p, s);
}

// ------------------------------------------------------------
// Chu vi: lăn hình tròn đúng một vòng, phần đã lăn là chu vi
// ------------------------------------------------------------
function drawPerimeter(p: p5, s: CircleScene) {
  const R = 90; // bán kính trên hình (px) – hình luôn cùng cỡ, chỉ số đo thay đổi
  const D = 2 * R;
  const L = 2 * Math.PI * R;
  const baseY = 330;
  const x0 = (800 - L) / 2;

  const k1 = ease(phase(s.t, 0));
  const k2 = ease(phase(s.t, 1));

  // đoạn chu vi đã trải ra
  p.stroke(COL.a);
  p.strokeWeight(5);
  p.strokeCap(p.ROUND);
  if (k1 > 0) p.line(x0, baseY, x0 + L * k1, baseY);
  p.stroke('#C9D2E3');
  p.strokeWeight(1.5);
  p.line(x0 - 40, baseY, x0 + L + 40, baseY);

  // hình tròn lăn: tâm dịch theo cung đã lăn, góc quay = quãng đường / bán kính
  const cx = x0 + L * k1;
  const cy = baseY - R;
  const angle = 2 * Math.PI * k1;
  p.push();
  p.translate(cx, cy);
  p.fill(255, 255, 255, 220);
  p.stroke(COL.ink);
  p.strokeWeight(3);
  p.circle(0, 0, D);
  p.rotate(angle);
  // đường kính quay theo hình tròn
  p.stroke(COL.bText);
  p.strokeWeight(2.5);
  p.line(-R, 0, R, 0);
  p.noStroke();
  p.fill(COL.ink);
  p.circle(0, 0, 7);
  // điểm đánh dấu trên vành, lúc đầu chạm đất
  p.fill(COL.a);
  p.circle(0, R, 12);
  p.pop();
  if (k1 === 0) labelBox(p, cx, cy - 18, `d = ${fmt(2 * s.r)} cm`, COL.bText, 14);

  // bước 2: đặt các đoạn bằng đường kính lên đoạn chu vi
  if (k2 > 0) {
    const y = baseY + 30;
    for (let i = 0; i < 3; i++) {
      const a = x0 + i * D;
      const grow = Math.min(1, Math.max(0, k2 * 3.4 - i));
      if (grow <= 0) continue;
      p.stroke(i % 2 === 0 ? COL.bText : COL.b);
      p.strokeWeight(8);
      p.strokeCap(p.SQUARE);
      p.line(a, y, a + D * grow, y);
      if (grow >= 1) labelBox(p, a + D / 2, y + 24, `lần ${i + 1}: d`, COL.bText, 13);
    }
    if (k2 >= 1) {
      p.stroke(COL.a);
      p.strokeWeight(8);
      p.line(x0 + 3 * D, y, x0 + L, y);
      labelBox(p, x0 + L + 4, y + 24, 'thêm 0,14 d', COL.aText, 13);
    }
    p.strokeCap(p.ROUND);
  }

  spanArrow(p, x0, x0 + L, 384 + 70, k1 >= 1 ? `chu vi ≈ 3,14 × d` : 'chu vi = ?');

  if (s.t <= 0) caption(p, 'Đánh dấu một điểm trên vành rồi lăn hình tròn đúng một vòng');
  else if (s.t < 1) caption(p, 'Bước 1: lăn hình tròn, đoạn đỏ đã trải ra chính là chu vi');
  else if (!s.done) caption(p, 'Bước 2: đặt đường kính lên đoạn chu vi xem được mấy lần');
  else caption(p, 'Chu vi dài gấp khoảng 3,14 lần đường kính');

  if (s.done) {
    const expr = s.given === 'd' ? `${fmt(2 * s.r)} × 3,14` : `${fmt(s.r)} × 2 × 3,14`;
    formulaLine(p, `C = ${expr} = ${fmt(s.C, 4)} (cm)`, 74);
  }
}

// ------------------------------------------------------------
// Diện tích: cắt 16 hình quạt, xếp xen kẽ thành gần hình chữ nhật
// ------------------------------------------------------------
const N = 16;

function drawArea(p: p5, s: CircleScene) {
  const R = 100;
  const theta = (2 * Math.PI) / N;
  const w = R * theta; // độ dài cung mỗi hình quạt
  const circleC: [number, number] = [200, 270];
  const stripLen = (N / 2) * w; // = nửa chu vi
  const sx = 590 - (stripLen + w / 2) / 2;
  const yTop = 220;
  const yBot = yTop + R;

  const k1 = ease(phase(s.t, 0)); // cắt
  const k2 = ease(phase(s.t, 1)); // xếp lại
  const k3 = ease(phase(s.t, 2)); // ghi số đo

  // bóng hình tròn ban đầu
  if (k2 > 0) {
    const ctx = p.drawingContext as CanvasRenderingContext2D;
    ctx.setLineDash([6, 6]);
    p.noFill();
    p.stroke('#C9D2E3');
    p.strokeWeight(1.5);
    p.circle(circleC[0], circleC[1], 2 * R);
    ctx.setLineDash([]);
  }

  for (let i = 0; i < N; i++) {
    const alpha = (i + 0.5) * theta; // hướng tia giữa của hình quạt
    const lower = i < N / 2; // nửa dưới (y hướng xuống)
    let tx: number;
    let ty: number;
    let tAngle: number;
    if (lower) {
      const k = N / 2 - 1 - i;
      tx = sx + (k + 0.5) * w;
      ty = yTop;
      tAngle = Math.PI / 2; // đỉnh ở trên, cung ở dưới
    } else {
      const k = i - N / 2;
      tx = sx + (k + 1) * w;
      ty = yBot;
      tAngle = (3 * Math.PI) / 2; // đỉnh ở dưới, cung ở trên
    }
    const x = lerp(circleC[0], tx, k2);
    const y = lerp(circleC[1], ty, k2);
    const ang = lerp(alpha, tAngle, k2);
    p.fill(lower ? TINT.a : TINT.b);
    p.stroke(lower ? COL.aText : COL.bText);
    p.strokeWeight(k1 > 0 ? 1.5 : 0);
    if (k1 <= 0) p.noStroke();
    p.arc(x, y, 2 * R, 2 * R, ang - theta / 2, ang + theta / 2, p.PIE);
  }

  // viền ngoài hình tròn trước khi cắt
  if (k2 === 0) {
    p.noFill();
    p.stroke(COL.ink);
    p.strokeWeight(3);
    p.circle(circleC[0], circleC[1], 2 * R);
    p.noStroke();
    p.fill(COL.ink);
    p.circle(circleC[0], circleC[1], 6);
    dashedLine(p, circleC[0], circleC[1], circleC[0] + R, circleC[1], COL.ink, 2, [5, 4]);
    labelBox(p, circleC[0] + R / 2, circleC[1] - 14, `r = ${fmt(s.r)} cm`, COL.ink, 13);
  }

  if (k3 > 0) {
    spanArrow(p, sx + w / 2, sx + w / 2 + stripLen, yTop - 28, 'nửa chu vi = r × 3,14');
    p.stroke(COL.ink);
    p.strokeWeight(1.5);
    const xr = sx + stripLen + w / 2 + 18;
    p.line(xr, yTop, xr, yBot);
    p.line(xr - 5, yTop, xr + 5, yTop);
    p.line(xr - 5, yBot, xr + 5, yBot);
    labelBox(p, xr + 4, (yTop + yBot) / 2, 'r', COL.ink, 16);
  }

  if (s.t <= 0) caption(p, `Hình tròn bán kính ${fmt(s.r)} cm`);
  else if (s.t < 1) caption(p, `Bước 1: cắt hình tròn thành ${N} hình quạt bằng nhau`);
  else if (s.t < 2) caption(p, 'Bước 2: xếp xen kẽ nửa dưới và nửa trên');
  else if (!s.done) caption(p, 'Bước 3: được gần một hình chữ nhật dài bằng nửa chu vi, rộng bằng r');
  else caption(p, 'Diện tích ≈ (r × 3,14) × r = r × r × 3,14');

  if (s.done) formulaLine(p, `S = ${fmt(s.r)} × ${fmt(s.r)} × 3,14 = ${fmt(s.S, 4)} (cm²)`, 440);
}
