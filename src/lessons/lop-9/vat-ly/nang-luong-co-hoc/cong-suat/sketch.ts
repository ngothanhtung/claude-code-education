import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';
import { fmt, fmtG } from '@/lib/format';

const GROUND = 400;
const JIB_Y = 92; // cần ngang của cần cẩu
const LIFT_TOP = JIB_Y + 76; // đáy kiện hàng ở độ cao lớn nhất (chừa chỗ cho kiện hàng dưới cần)

export interface Crane {
  name: string;
  m: number; // kg
  h: number; // m
  t: number; // s
  col: string;
  textCol: string;
}

export interface CraneScene {
  A: Crane;
  B: Crane;
  /** thời gian đã trôi qua (s) */
  now: number;
  hMax: number;
  workMax: number;
  done: boolean;
}

export function drawCranes(p: p5, s: CraneScene) {
  drawPaper(p);
  p.noStroke();
  p.fill('#C9B79C');
  p.rect(0, GROUND, 800, 12);

  drawCrane(p, s.A, 200, s);
  drawCrane(p, s.B, 600, s);

  p.noStroke();
  p.fill(COL.ink);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(16);
  p.textStyle(p.BOLD);
  p.text(`t = ${fmt(s.now, 1)} s`, 400, 74);
  p.textStyle(p.NORMAL);

  if (s.now <= 0) caption(p, 'Hai cần cẩu bắt đầu nâng hàng cùng một lúc');
  else if (!s.done) caption(p, 'Công thực hiện tăng dần trong lúc nâng');
  else caption(p, 'So sánh công thực hiện trong 1 giây: đó là công suất');
}

function drawCrane(p: p5, c: Crane, x: number, s: CraneScene) {
  const scale = (GROUND - LIFT_TOP) / s.hMax;
  const frac = Math.min(s.now / c.t, 1);
  const lifted = c.h * frac;
  const boxSize = 44 + 18 * Math.sqrt(c.m / 2000);
  const hookX = x + 70;
  const loadBottom = GROUND - lifted * scale;

  // tháp + cần
  p.stroke(c.textCol);
  p.strokeWeight(5);
  p.line(x - 40, GROUND, x - 40, JIB_Y);
  p.strokeWeight(4);
  p.line(x - 70, JIB_Y, hookX + 20, JIB_Y);
  p.strokeWeight(1.5);
  for (let y = GROUND; y > JIB_Y; y -= 20) {
    p.line(x - 46, y, x - 34, y - 20);
  }
  p.noStroke();
  p.fill(c.textCol);
  p.rect(x - 78, JIB_Y - 6, 18, 22, 3); // đối trọng

  // cáp + hàng
  p.stroke(COL.text);
  p.strokeWeight(1.5);
  p.line(hookX, JIB_Y, hookX, loadBottom - boxSize);
  p.noStroke();
  p.fill(c.col);
  p.rect(hookX - boxSize / 2, loadBottom - boxSize, boxSize, boxSize, 3);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(10);
  p.textStyle(p.BOLD);
  p.text(`${fmtG(c.m, 0)} kg`, hookX, loadBottom - boxSize / 2);

  // vạch độ cao đích
  const target = GROUND - c.h * scale;
  p.stroke(c.textCol);
  p.strokeWeight(1.2);
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  ctx.setLineDash([5, 4]);
  p.line(hookX + 30, target, hookX + 70, target);
  ctx.setLineDash([]);
  labelBox(p, hookX + 92, target, `${fmt(c.h)} m`, c.textCol, 12);

  // tên + công đã thực hiện
  p.noStroke();
  p.fill(c.textCol);
  p.textSize(17);
  p.textStyle(p.BOLD);
  p.text(c.name, x, GROUND + 30);
  const work = 10 * c.m * lifted;
  const barW = 200;
  p.fill(COL.track);
  p.rect(x - barW / 2, GROUND + 48, barW, 14, 7);
  p.fill(c.col);
  p.rect(x - barW / 2, GROUND + 48, (barW * work) / s.workMax, 14, 7);
  p.fill(COL.text);
  p.textSize(13);
  p.text(`A = ${fmtG(work, 0)} J`, x, GROUND + 78);
  if (frac >= 1) labelBox(p, x - 40, JIB_Y - 22, `xong sau ${fmt(c.t)} s`, c.textCol, 13);
  p.textStyle(p.NORMAL);
}
