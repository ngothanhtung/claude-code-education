import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { energyBars } from '@/lib/draw/energy';
import { arrow, caption } from '@/lib/draw/geometry';
import { dashedLine, drawPaper, labelBox } from '@/lib/draw/scene';
import { contactShadow, shadedSphere } from '@/lib/draw/fx';
import { fmt, fmtG } from '@/lib/format';

const GROUND = 440;
const TOP = 80;
const BALL_X = 250;

export interface FallScene {
  m: number;
  h0: number;
  hM: number;
  /** độ cao hiện tại và vận tốc hiện tại */
  h: number;
  v: number;
  started: boolean;
  done: boolean;
}

export function drawFall(p: p5, s: FallScene) {
  drawPaper(p);
  const P = 10 * s.m;
  const W = P * s.h0;
  const Wt = P * s.h;
  const Wd = W - Wt;
  const scale = (GROUND - TOP) / s.h0;
  const yOf = (h: number) => GROUND - h * scale;

  // mặt đất
  p.noStroke();
  p.fill('#C9B79C');
  p.rect(60, GROUND, 340, 14);
  p.stroke('#8C7A60');
  p.strokeWeight(2);
  p.line(60, GROUND, 400, GROUND);

  // thước đo độ cao
  const step = s.h0 <= 5 ? 1 : s.h0 <= 10 ? 2 : 5;
  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(150, GROUND, 150, yOf(s.h0));
  p.textAlign(p.RIGHT, p.CENTER);
  p.textSize(12);
  for (let h = 0; h <= s.h0 + 1e-9; h += step) {
    p.stroke(COL.text);
    p.line(144, yOf(h), 156, yOf(h));
    p.noStroke();
    p.fill(COL.text);
    p.text(`${h} m`, 138, yOf(h));
  }

  // điểm M cần xét
  const yM = yOf(s.hM);
  dashedLine(p, 156, yM, 380, yM, COL.ink, 1.5, [6, 5]);
  labelBox(p, 425, yM, `M: h = ${fmt(s.hM)} m`, COL.ink, 13);
  if (s.h <= s.hM + 1e-9 && s.started) {
    const PM = P * s.hM;
    p.noFill();
    p.stroke(COL.ink);
    p.strokeWeight(2);
    p.circle(BALL_X, yM, 28);
    labelBox(p, 330, yM + 22, `tại M: Wt = ${fmtG(PM)} J, Wđ = ${fmtG(W - PM)} J`, COL.ink, 12);
  }

  // vật đang rơi + mũi tên vận tốc
  const yb = yOf(s.h) - 14;
  if (s.v > 0.01) {
    const L = Math.min(80, 6 * s.v);
    arrow(p, BALL_X, yb + 16, BALL_X, yb + 16 + L + 8, COL.aText);
    labelBox(p, BALL_X + 52, yb + 16 + L / 2, `v = ${fmt(s.v, 1)} m/s`, COL.aText, 12);
  }
  // quả cầu có khối như bài Động năng; bóng trên mặt đất đậm và gọn dần khi vật rơi xuống gần
  contactShadow(p, BALL_X, GROUND, 28, GROUND - (yb + 14));
  shadedSphere(p, BALL_X, yb, 14, COL.a);
  p.noStroke();
  labelBox(p, BALL_X - 50, yb, `${fmt(s.m)} kg`, COL.text, 12);

  // cột năng lượng
  drawBars(p, W, Wt, Wd);

  if (!s.started) caption(p, 'Vật đứng yên ở độ cao h: chỉ có thế năng, động năng bằng 0');
  else if (!s.done) caption(p, 'Vật rơi: thế năng giảm bao nhiêu, động năng tăng bấy nhiêu');
  else caption(p, 'Chạm đất: toàn bộ thế năng đã chuyển thành động năng');
}

function drawBars(p: p5, W: number, Wt: number, Wd: number) {
  const base = 420;
  const maxH = 280;
  energyBars(p, {
    title: 'Năng lượng (J)',
    titleY: 92,
    bars: [
      { name: 'Wt', value: Wt, col: COL.b, textCol: COL.bText },
      { name: 'Wđ', value: Wd, col: COL.a, textCol: COL.aText },
      { name: 'W', value: W, col: COL.ink },
    ],
    cx: 508,
    step: 90,
    base,
    maxH,
    max: W,
    nameSize: 16,
  });
  dashedLine(p, 470, base - maxH, 740, base - maxH, COL.muted, 1.2, [4, 4]);
  p.noStroke();
  p.fill(COL.muted);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(13);
  p.text('Wt + Wđ = W luôn không đổi', 610, base + 46);
}
