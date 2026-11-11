import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import {
  bracket, dashedLine, drawBackground, drawRoadTicks, pointLabel, roadsideTag, segment, topTag,
} from '@/lib/draw/scene';
import { CAR_HALF, MOTO_HALF, drawCar, drawMoto } from '@/lib/draw/vehicles';
import { fmt, hm } from '@/lib/format';

const X0 = 100; // A
const X1 = 740; // mốc cuối của thang km
const LANE_MOTO = 206;
const LANE_CAR = 249;
const LINE_Y = 420;

export interface CungScene {
  mode: 'late' | 'gap';
  v1: number; // xe máy
  v2: number; // ô tô
  t0: number; // dạng 1: xe máy đi trước bao nhiêu giờ
  g: number; // dạng 2: quãng đường AB
  /** độ dài thang km trên hình */
  L: number;
  valid: boolean;
  /** ô tô chờ bao lâu */
  delay: number;
  /** xe máy xuất phát cách A */
  offset: number;
  /** khoảng cách lúc ô tô bắt đầu đuổi */
  headStart: number;
  catchTime: number;
  meetDist: number;
  /** giờ, tính từ lúc xe máy xuất phát */
  t: number;
  met: boolean;
  metAt: number;
}

export function drawCung(p: p5, s: CungScene) {
  const px = (X1 - X0) / s.L;
  const sMoto = s.offset + s.v1 * s.t; // xe máy cách A
  const sCar = s.v2 * Math.max(s.t - s.delay, 0); // ô tô cách A
  const noseMoto = X0 + sMoto * px;
  const noseCar = X0 + sCar * px;

  drawBackground(p, (LANE_MOTO + LANE_CAR) / 2);
  drawRoadTicks(p, X0, X1, s.L, { start: 'A', skipX: s.met ? noseCar : null });
  if (s.met) dashedLine(p, noseCar, 56, noseCar, LINE_Y, COL.ink);
  drawMoto(p, noseMoto - MOTO_HALF, LANE_MOTO, s.v1 * s.t * px);
  drawCar(p, noseCar - CAR_HALF, LANE_CAR, COL.a, 1, sCar * px);
  if (s.delay > 0 && s.t < s.delay && s.valid) {
    roadsideTag(p, 12, `Ô tô chờ ở A: còn ${hm(s.delay - s.t)}`, COL.aText);
  }
  drawDiagram(p, s, px, noseMoto, noseCar, sMoto, sCar);
  if (s.met) topTag(p, noseCar, `Đuổi kịp sau ${hm(s.catchTime)}, cách A ${fmt(s.meetDist, 1)} km`, s.metAt);
}

/** Sơ đồ đoạn thẳng kiểu SGK */
function drawDiagram(p: p5, s: CungScene, px: number, noseMoto: number, noseCar: number, sMoto: number, sCar: number) {
  p.noStroke();
  p.textSize(14);
  p.textStyle(p.BOLD);
  p.fill(COL.bText);
  p.textAlign(p.LEFT, p.CENTER);
  p.text(`Xe máy ${s.v1} km/giờ →`, X0, 318);
  p.fill(COL.aText);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text(`Ô tô ${s.v2} km/giờ →`, X1, 318);

  // thanh quãng đường đã đi: xe máy (trên) tính từ chỗ xuất phát, ô tô (dưới) từ A
  const yMoto = 350;
  const yCar = 386;
  const startMoto = X0 + s.offset * px;
  p.fill(COL.b);
  if (noseMoto > startMoto) p.rect(startMoto, yMoto - 4, noseMoto - startMoto, 8, 4);
  p.fill(COL.a);
  if (noseCar > X0) p.rect(X0, yCar - 4, noseCar - X0, 8, 4);

  p.textSize(13);
  p.textAlign(p.LEFT, p.CENTER);
  if (s.t > 0) {
    p.fill(COL.bText);
    p.text(`${fmt(s.v1 * s.t, 1)} km`, noseMoto + 8, yMoto);
  }
  if (sCar > 0) {
    p.fill(COL.aText);
    p.text(`${fmt(sCar, 1)} km`, noseCar + 8, yCar);
  }

  // khoảng cách giữa hai xe
  const midY = (yMoto + yCar) / 2;
  if (!s.met && noseMoto - noseCar > 2) {
    dashedLine(p, noseCar, midY, noseMoto, midY, COL.muted, 1.5, [4, 5]);
    const label = `cách nhau ${fmt(sMoto - sCar, 1)} km`;
    p.textSize(12);
    p.textStyle(p.NORMAL);
    const w = p.textWidth(label) + 12;
    if (noseMoto - noseCar > w + 10) {
      p.noStroke();
      p.fill(255);
      const mx = (noseCar + noseMoto) / 2;
      p.rect(mx - w / 2, midY - 10, w, 20, 4);
      p.fill(COL.muted);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(label, mx, midY);
    }
  }

  segment(p, X0, X1, LINE_Y, false);
  pointLabel(p, X0, LINE_Y + 24, 'A');

  // điểm B
  if (s.valid && (s.mode === 'gap' || s.t >= s.t0)) {
    const xB = X0 + s.headStart * px;
    p.stroke(COL.bText);
    p.strokeWeight(2);
    p.line(xB, LINE_Y - 8, xB, LINE_Y + 8);
    pointLabel(p, xB, LINE_Y + 24, 'B', COL.bText);
    bracket(p, X0, xB, 466,
      s.mode === 'gap' ? `AB = ${fmt(s.g)} km` : `xe máy đi trước ${fmt(s.headStart)} km`, COL.bText);
  }

  // chỗ gặp nhau
  if (s.met) {
    p.noStroke();
    p.fill(COL.ink);
    p.circle(noseCar, LINE_Y, 11);
    pointLabel(p, noseCar, LINE_Y + 24, 'C', COL.ink);
  }
}
