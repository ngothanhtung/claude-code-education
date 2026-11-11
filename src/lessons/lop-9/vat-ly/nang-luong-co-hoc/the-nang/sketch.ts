import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01, ease } from '@/lib/draw/geometry';
import { dashedLine, drawPaper, labelBox } from '@/lib/draw/scene';
import { fmt, fmtG } from '@/lib/format';

export interface PotentialScene {
  shape: 'box' | 'ball';
  /** khối lượng (kg), độ cao cuối (m) so với sàn/mặt đất, độ cao mặt bàn (m) – 0 nếu không xét mốc thứ hai */
  m: number;
  h: number;
  hb: number;
  /** nhãn hiển thị (có thể là "?") */
  mText: string;
  hText: string;
  WText: string;
  W2Text: string;
  /** "mặt đất" hoặc "sàn nhà" */
  groundName: string;
  t: number; // 0..1 nâng vật lên
  started: boolean;
  done: boolean;
}

const FLOOR = 430;
const TOP = 120;
const LIFT_X = 250;
const RULER_X = 150;

export function drawPotential(p: p5, s: PotentialScene) {
  drawPaper(p);
  const k = ease(clamp01(s.t));
  const hNow = s.h * k;
  const scale = (FLOOR - TOP) / Math.max(s.h, 1);
  const yOf = (h: number) => FLOOR - h * scale;
  const twoRefs = s.hb > 0;

  // nền
  p.noStroke();
  p.fill('#E9DFCF');
  p.rect(60, FLOOR, 400, 14);
  p.stroke('#8C7A60');
  p.strokeWeight(2);
  p.line(60, FLOOR, 460, FLOOR);
  labelBox(p, 410, FLOOR + 30, s.groundName, COL.muted, 12);

  // ròng rọc và dây nâng vật
  p.stroke(COL.text);
  p.strokeWeight(3);
  p.line(LIFT_X - 60, 64, LIFT_X + 40, 64);
  p.noFill();
  p.strokeWeight(2);
  p.circle(LIFT_X, 76, 22);
  const yObj = yOf(hNow);
  const half = 20;
  p.strokeWeight(1.5);
  p.line(LIFT_X, 87, LIFT_X, yObj - half * 2);

  // mặt bàn (mốc thứ hai)
  if (twoRefs) {
    const yb = yOf(s.hb);
    p.noStroke();
    p.fill('#C99A62');
    p.rect(300, yb, 120, 10, 2);
    p.rect(310, yb + 10, 8, FLOOR - yb - 10);
    p.rect(402, yb + 10, 8, FLOOR - yb - 10);
    labelBox(p, 360, yb - 14, 'mặt bàn', COL.muted, 12);
    dashedLine(p, LIFT_X - 30, yb, 300, yb, COL.muted, 1.2, [4, 4]);
    // thước thứ hai đo từ mặt bàn
    p.stroke(COL.bText);
    p.strokeWeight(2);
    p.line(440, yb, 440, yOf(s.h));
    p.line(434, yb, 446, yb);
    p.line(434, yOf(s.h), 446, yOf(s.h));
    labelBox(p, 484, (yb + yOf(s.h)) / 2, `${fmt(s.h - s.hb)} m`, COL.bText, 12);
  }

  // thước đo độ cao từ sàn/mặt đất
  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(RULER_X, FLOOR, RULER_X, yOf(s.h));
  p.line(RULER_X - 6, FLOOR, RULER_X + 6, FLOOR);
  p.line(RULER_X - 6, yOf(s.h), RULER_X + 6, yOf(s.h));
  dashedLine(p, RULER_X + 6, yOf(s.h), LIFT_X - 30, yOf(s.h), COL.muted, 1.2, [4, 4]);
  labelBox(p, RULER_X - 44, (FLOOR + yOf(s.h)) / 2, `h = ${s.hText}`, COL.ink, 13);

  // vật
  p.noStroke();
  if (s.shape === 'box') {
    p.fill('#B98B52');
    p.rect(LIFT_X - half, yObj - half * 2, half * 2, half * 2, 3);
    p.stroke('#8A6436');
    p.strokeWeight(1.5);
    p.line(LIFT_X - half, yObj - half, LIFT_X + half, yObj - half);
  } else {
    p.fill('#6E9B3A');
    p.circle(LIFT_X, yObj - half, half * 2);
    p.fill(255, 255, 255, 90);
    p.circle(LIFT_X - 6, yObj - half - 6, 9);
  }
  labelBox(p, LIFT_X + 62, yObj - half, `m = ${s.mText}`, COL.text, 12);

  // cột thế năng
  const P = 10 * s.m;
  drawBars(p, s, P * hNow, P * (hNow - s.hb), P * s.h);

  if (!s.started) caption(p, `Vật nằm trên ${s.groundName}: thế năng bằng 0 (mốc tại ${s.groundName})`);
  else if (!s.done) caption(p, 'Nâng vật lên càng cao, thế năng trọng trường càng lớn');
  else if (twoRefs) caption(p, 'Thế năng phụ thuộc vào việc chọn mốc thế năng');
  else caption(p, 'Thế năng trọng trường: Wt = P × h');
}

function drawBars(p: p5, s: PotentialScene, Wt: number, Wt2: number, Wmax: number) {
  const twoRefs = s.hb > 0;
  const base = twoRefs ? 360 : 410;
  const maxH = twoRefs ? 210 : 260;
  const bars: [string, number, string, string][] = [[`Wt (mốc ${s.groundName})`, Wt, COL.b, s.WText]];
  if (twoRefs) bars.push(['Wt (mốc mặt bàn)', Wt2, COL.a, s.W2Text]);
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text('Thế năng (J)', 650, 92);
  const cx0 = twoRefs ? 590 : 650;
  bars.forEach(([name, val, col, finalText], i) => {
    const x = cx0 + i * 120 - 30;
    const h = Wmax > 0 ? (maxH * val) / Wmax : 0;
    p.noStroke();
    p.fill('#EEF1F7');
    p.rect(x, base - maxH, 60, maxH, 4);
    p.fill(col);
    if (h >= 0) p.rect(x, base - h, 60, h, 4);
    else p.rect(x, base, 60, -h, 4);
    p.fill(COL.text);
    p.textSize(12);
    p.textStyle(p.BOLD);
    p.text(name, x + 30, twoRefs ? 440 : base + 20);
    const label = s.done ? finalText : fmtG(val, 1);
    labelBox(p, x + 30, h >= 0 ? base - h - 14 : base - h + 14, label, col === COL.b ? COL.bText : COL.aText, 13);
  });
  p.stroke(COL.muted);
  p.strokeWeight(1.5);
  p.line(cx0 - 50, base, cx0 + (twoRefs ? 170 : 50), base);
  p.textStyle(p.NORMAL);
}
