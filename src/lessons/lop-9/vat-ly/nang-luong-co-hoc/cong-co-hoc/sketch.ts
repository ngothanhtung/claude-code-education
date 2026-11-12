import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { arrow, caption, clamp01, ease } from '@/lib/draw/geometry';
import { dashedLine, drawPaper, labelBox } from '@/lib/draw/scene';

export interface WorkScene {
  /** true: nâng vật lên cao (A = P × h); false: kéo vật trên mặt ngang (A = F × s) */
  lift: boolean;
  wheels: boolean;
  /** nhãn lực, quãng đường/độ cao, công (có thể là "?") */
  FText: string;
  dText: string;
  /** công đã thực hiện đến thời điểm hiện tại (đã định dạng) */
  AText: string;
  t: number; // 0..1
  started: boolean;
  done: boolean;
}

const FLOOR = 360;

export function drawWork(p: p5, s: WorkScene) {
  drawPaper(p);
  const k = ease(clamp01(s.t));
  if (s.lift) drawLift(p, s, k);
  else drawPull(p, s, k);

  // thanh công đã thực hiện
  const x0 = 160;
  const y = 440;
  const w = 480;
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.RIGHT, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text('Công A', x0 - 12, y + 9);
  p.textStyle(p.NORMAL);
  p.fill(COL.track);
  p.rect(x0, y, w, 18, 9);
  p.fill(COL.ink);
  if (k > 0) p.rect(x0, y, w * k, 18, 9);
  labelBox(p, x0 + w + 70, y + 9, s.AText, COL.ink, 14);

  if (!s.started) caption(p, s.lift ? 'Lực nâng vật lên theo phương thẳng đứng' : 'Lực kéo vật theo phương ngang');
  else if (!s.done) caption(p, 'Có lực tác dụng và vật dịch chuyển theo phương của lực: lực thực hiện công');
  else caption(p, s.lift ? 'Công nâng vật: A = P × h' : 'Công của lực: A = F × s');
}

function box(p: p5, x: number, yBottom: number, w: number, h: number, wheels: boolean) {
  p.noStroke();
  p.fill('#B98B52');
  p.rect(x, yBottom - h - (wheels ? 10 : 0), w, h, 3);
  p.stroke('#8A6436');
  p.strokeWeight(1.5);
  p.line(x + 4, yBottom - h / 2 - (wheels ? 10 : 0), x + w - 4, yBottom - h / 2 - (wheels ? 10 : 0));
  if (wheels) {
    p.noStroke();
    p.fill(COL.text);
    p.circle(x + 14, yBottom - 8, 16);
    p.circle(x + w - 14, yBottom - 8, 16);
  }
}

function drawPull(p: p5, s: WorkScene, k: number) {
  const X0 = 110;
  const DIST = 430;
  const BW = 90;
  const BH = 60;
  p.noStroke();
  p.fill('#E9DFCF');
  p.rect(40, FLOOR, 720, 16);
  p.stroke('#8C7A60');
  p.strokeWeight(2);
  p.line(40, FLOOR, 760, FLOOR);

  // vị trí đầu, vị trí cuối
  dashedLine(p, X0 + DIST, FLOOR - BH - 14, X0 + DIST, FLOOR, COL.muted, 1.2, [4, 4]);
  p.noFill();
  p.stroke(COL.muted);
  p.strokeWeight(1);
  p.rect(X0 + DIST, FLOOR - BH - (s.wheels ? 10 : 0), BW, BH, 3);

  const x = X0 + DIST * k;
  box(p, x, FLOOR, BW, BH, s.wheels);
  const yF = FLOOR - BH / 2 - (s.wheels ? 10 : 0);
  arrow(p, x + BW, yF, x + BW + 90, yF, COL.aText, { weight: 4 });
  labelBox(p, x + BW + 60, yF - 24, `F = ${s.FText}`, COL.aText, 14);

  // quãng đường dịch chuyển
  const y = FLOOR + 44;
  dashedLine(p, X0, FLOOR + 18, X0, y + 8, COL.muted, 1.2, [3, 3]);
  p.stroke(COL.ink);
  p.strokeWeight(2);
  p.line(X0, y, X0 + DIST, y);
  p.line(X0 + DIST, y - 6, X0 + DIST, y + 6);
  p.line(X0, y - 6, X0, y + 6);
  labelBox(p, X0 + DIST / 2, y, `s = ${s.dText}`, COL.ink, 14);
}

function drawLift(p: p5, s: WorkScene, k: number) {
  const LX = 340;
  const TOPY = 110;
  const BW = 80;
  const BH = 56;
  p.noStroke();
  p.fill('#E9DFCF');
  p.rect(160, FLOOR, 400, 16);
  p.stroke('#8C7A60');
  p.strokeWeight(2);
  p.line(160, FLOOR, 560, FLOOR);

  // ròng rọc
  p.stroke(COL.text);
  p.strokeWeight(3);
  p.line(LX - 80, 62, LX + 80, 62);
  p.noFill();
  p.strokeWeight(2);
  p.circle(LX, 74, 22);

  const yBottom = FLOOR - (FLOOR - TOPY - BH) * k;
  p.strokeWeight(1.5);
  p.line(LX, 85, LX, yBottom - BH);
  // vị trí cuối
  p.noFill();
  p.stroke(COL.muted);
  p.strokeWeight(1);
  p.rect(LX - BW / 2, TOPY, BW, BH, 3);
  box(p, LX - BW / 2, yBottom, BW, BH, false);
  arrow(p, LX + BW / 2 + 30, yBottom - BH / 2 + 30, LX + BW / 2 + 30, yBottom - BH / 2 - 50, COL.aText, { weight: 4 });
  labelBox(p, LX + BW / 2 + 90, yBottom - BH / 2, `F = ${s.FText}`, COL.aText, 14);

  // độ cao nâng
  const x = 220;
  p.stroke(COL.ink);
  p.strokeWeight(2);
  p.line(x, FLOOR, x, TOPY + BH);
  p.line(x - 6, FLOOR, x + 6, FLOOR);
  p.line(x - 6, TOPY + BH, x + 6, TOPY + BH);
  dashedLine(p, x + 6, TOPY + BH, LX - BW / 2, TOPY + BH, COL.muted, 1.2, [4, 4]);
  labelBox(p, x, (FLOOR + TOPY + BH) / 2, `h = ${s.dText}`, COL.ink, 14);
}
