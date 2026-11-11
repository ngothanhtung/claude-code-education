import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import {
  bracket, dashedLine, drawBackground, drawRoadTicks, pointLabel, roadsideTag, segment, topTag,
} from '@/lib/draw/scene';
import { CAR_HALF, drawCar } from '@/lib/draw/vehicles';
import { fmt, hm } from '@/lib/format';

const X0 = 100;
const X1 = 700;
const LANE_B = 192;
const LANE_A = 240;
const LINE_Y = 420;

export interface NguocScene {
  S: number;
  vA: number;
  vB: number;
  /** số giờ ô tô đỏ đi trước (0 nếu xuất phát cùng lúc) */
  lead: number;
  valid: boolean;
  /** giờ, tính từ lúc ô tô đỏ xuất phát */
  t: number;
  met: boolean;
  metAt: number;
  /** thời gian gặp nhau tính từ lúc ô tô xanh đi */
  answerT: number;
}

export function drawNguoc(p: p5, s: NguocScene) {
  // Vị trí tính theo ĐẦU xe: đầu xe đỏ ở mốc 0 km, đầu xe xanh ở mốc S km
  const px = (X1 - X0) / s.S;
  const sA = s.vA * s.t;
  const sB = s.vB * Math.max(s.t - s.lead, 0);
  const noseA = X0 + sA * px;
  const noseB = X1 - sB * px;

  drawBackground(p, (LANE_A + LANE_B) / 2);
  drawRoadTicks(p, X0, X1, s.S, {
    start: 'A', startCol: COL.a, end: 'B', endCol: COL.b, skipX: s.met ? noseA : null,
  });
  if (s.met) dashedLine(p, noseA, 56, noseA, LINE_Y, COL.ink);
  drawCar(p, noseA - CAR_HALF, LANE_A, COL.a, 1, sA * px);
  drawCar(p, noseB + CAR_HALF, LANE_B, COL.b, -1, sB * px);
  if (s.lead > 0 && s.t < s.lead && s.valid) {
    roadsideTag(p, 800 - 12, `Ô tô xanh chờ ở B: còn ${hm(s.lead - s.t)}`, COL.bText, true);
  }
  drawDiagram(p, s, px, noseA, noseB, sA, sB);
  if (s.met) {
    topTag(p, noseA,
      s.lead > 0 ? `Gặp nhau sau ${hm(s.answerT)}, cách A ${fmt(sA, 1)} km` : `Gặp nhau sau ${hm(s.answerT)}`,
      s.metAt);
  }
}

/** Sơ đồ đoạn thẳng kiểu SGK */
function drawDiagram(p: p5, s: NguocScene, px: number, noseA: number, noseB: number, sA: number, sB: number) {
  p.noStroke();
  p.textSize(14);
  p.textStyle(p.BOLD);
  p.fill(COL.aText);
  p.textAlign(p.LEFT, p.CENTER);
  p.text(`${s.vA} km/giờ  →`, X0, 322);
  p.fill(COL.bText);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text(`←  ${s.vB} km/giờ`, X1, 322);
  p.fill(COL.ink);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(`AB = ${s.S} km`, (X0 + X1) / 2, 322);

  segment(p, X0, X1, LINE_Y);

  // khoảng còn lại giữa hai xe
  if (!s.met) {
    dashedLine(p, noseA, LINE_Y - 22, noseB, LINE_Y - 22, COL.muted, 1.5, [4, 5]);
    if (noseB - noseA > 110) {
      const label = `còn ${fmt(Math.max(s.S - sA - sB, 0), 1)} km`;
      p.noStroke();
      p.textSize(13);
      p.textStyle(p.NORMAL);
      const w = p.textWidth(label) + 12;
      const mx = (noseA + noseB) / 2;
      p.fill(255);
      p.rect(mx - w / 2, LINE_Y - 32, w, 20, 4);
      p.fill(COL.muted);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, mx, LINE_Y - 22);
    }
  }

  // thanh quãng đường mỗi xe đã đi
  p.noStroke();
  p.fill(COL.a);
  if (noseA > X0) p.rect(X0, LINE_Y - 26, noseA - X0, 8, 4);
  p.fill(COL.b);
  if (noseB < X1) p.rect(noseB, LINE_Y - 26, X1 - noseB, 8, 4);

  p.textSize(14);
  p.textStyle(p.BOLD);
  p.textAlign(p.CENTER, p.CENTER);
  if (sA > 0) {
    p.fill(COL.aText);
    p.text(`${fmt(sA, 1)} km`, Math.max((X0 + noseA) / 2, X0 + 30), LINE_Y - 44);
  }
  if (sB > 0) {
    p.fill(COL.bText);
    p.text(`${fmt(sB, 1)} km`, Math.min((noseB + X1) / 2, X1 - 30), LINE_Y - 44);
  }

  pointLabel(p, X0, LINE_Y + 24, 'A');
  pointLabel(p, X1, LINE_Y + 24, 'B');

  if (s.met) {
    p.noStroke();
    p.fill(COL.ink);
    p.circle(noseA, LINE_Y, 11);
    pointLabel(p, noseA, LINE_Y + 24, 'C', COL.ink);
  }

  // đoạn ô tô đỏ đi trước (dạng 2)
  if (s.lead > 0 && s.t >= s.lead && s.valid) {
    const xD = X0 + s.vA * s.lead * px;
    p.stroke(COL.aText);
    p.strokeWeight(2);
    p.line(xD, LINE_Y - 8, xD, LINE_Y + 8);
    bracket(p, X0, xD, 470, `ô tô đỏ đi trước ${fmt(s.vA * s.lead)} km`, COL.aText);
  }
}
