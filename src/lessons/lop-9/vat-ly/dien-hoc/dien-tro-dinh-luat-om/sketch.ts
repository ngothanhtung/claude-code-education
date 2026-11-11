import type p5 from 'p5';
import { battery, flow, flowOffset, meter, resistor, switchK, wire } from '@/lib/draw/circuit';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import { dashedLine, drawPaper, labelBox } from '@/lib/draw/scene';
import { fmt, niceLength } from '@/lib/format';

export type OhmMode = 'I' | 'R' | 'rho';

export interface OhmScene {
  mode: OhmMode;
  U: number;
  R: number;
  I: number;
  hideI: boolean;
  hideR: boolean;
  material: string;
  l: number;
  S: number; // mm²
  t: number; // 0..2
  done: boolean;
}

// Mạch: nguồn bên trái, khóa K và điện trở trên dây trên, ampe kế dưới, vôn kế mắc song song với R
const L = 70;
const R_ = 450;
const T = 170;
const Bt = 360;
const RX = 290;

export function drawOhm(p: p5, s: OhmScene) {
  drawPaper(p);
  const closed = Math.min(1, s.t / 0.4);
  const on = s.t >= 0.4;

  const loop: [number, number][] = [[L, 236], [L, T], [R_, T], [R_, Bt], [L, Bt], [L, 264]];
  wire(p, loop);
  wire(p, [[RX - 60, T], [RX - 60, 105], [RX + 60, 105], [RX + 60, T]]);
  if (on) flow(p, loop, flowOffset(s.I) * Math.min(1, (s.t - 0.4) / 0.6));

  battery(p, L, 250);
  switchK(p, 110, 160, T, closed);
  resistor(p, RX, T, `R = ${s.hideR ? '?' : fmt(s.R)} Ω`);
  meter(p, RX, 105, 'V', `U = ${fmt(s.U)} V`, 'above');
  meter(p, 260, Bt, 'A', `I = ${!on ? '0' : s.hideI ? '?' : fmt(s.I)} A`, 'below');

  if (s.mode === 'rho') drawConductor(p, s);
  else drawGraph(p, s, Math.max(0, Math.min(1, s.t - 1)));

  if (s.t <= 0) caption(p, 'Đóng khóa K để có dòng điện chạy trong mạch');
  else if (s.t < 1) caption(p, 'Dòng điện chạy qua điện trở; ampe kế chỉ cường độ dòng điện');
  else if (s.mode === 'rho') caption(p, 'Dây càng dài, tiết diện càng nhỏ thì điện trở càng lớn');
  else caption(p, 'Cường độ dòng điện tỉ lệ thuận với hiệu điện thế');
}

/** Đồ thị I theo U: đường thẳng đi qua gốc tọa độ, độ dốc 1 : R */
function drawGraph(p: p5, s: OhmScene, k: number) {
  const ox = 545;
  const oy = 420;
  const gw = 220;
  const gh = 250;
  const Umax = 24;
  const Imax = niceLength((Umax / s.R) * 1.05);
  const X = (u: number) => ox + (gw * u) / Umax;
  const Y = (i: number) => oy - (gh * i) / Imax;

  p.stroke(COL.text);
  p.strokeWeight(1.8);
  p.line(ox, oy, ox + gw + 12, oy);
  p.line(ox, oy, ox, oy - gh - 12);
  p.noStroke();
  p.fill(COL.text);
  p.textSize(12);
  p.textStyle(p.BOLD);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text('U (V)', ox + gw + 12, oy + 32);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text('I (A)', ox - 6, oy - gh - 14);
  p.textStyle(p.NORMAL);
  p.textSize(11);
  for (let i = 0; i <= 4; i++) {
    const u = (Umax * i) / 4;
    p.textAlign(p.CENTER, p.TOP);
    p.text(fmt(u), X(u), oy + 5);
    const ii = (Imax * i) / 5;
    p.textAlign(p.RIGHT, p.CENTER);
    if (i > 0) p.text(fmt(ii, 2), ox - 6, Y(ii));
  }
  p.textAlign(p.RIGHT, p.CENTER);
  p.text(fmt(Imax, 2), ox - 6, Y(Imax));

  if (k <= 0) return;
  const uEnd = Umax * k;
  p.stroke(COL.a);
  p.strokeWeight(2.5);
  p.line(X(0), Y(0), X(uEnd), Y(uEnd / s.R));
  if (k >= 1) {
    dashedLine(p, X(s.U), oy, X(s.U), Y(s.I), COL.muted, 1.2, [4, 4]);
    dashedLine(p, ox, Y(s.I), X(s.U), Y(s.I), COL.muted, 1.2, [4, 4]);
    p.noStroke();
    p.fill(COL.ink);
    p.circle(X(s.U), Y(s.I), 10);
    if (!s.hideI && !s.hideR) labelBox(p, X(s.U) + 4, Y(s.I) - 18, `(${fmt(s.U)} V; ${fmt(s.I)} A)`, COL.ink, 12);
  }
}

/** Dây dẫn hình trụ: dài theo l, dày theo tiết diện S */
function drawConductor(p: p5, s: OhmScene) {
  const x0 = 520;
  const len = 60 + Math.min(1, s.l / 50) * 200;
  const th = 6 + Math.sqrt(s.S) * 22;
  const y = 270;
  p.noStroke();
  p.fill('#C9A27A');
  p.rect(x0, y - th / 2, len, th, th / 2);
  p.fill('#E6CBA8');
  p.rect(x0 + 4, y - th / 2 + 2, len - 8, th / 4, th / 8);
  p.fill('#A97E55');
  p.ellipse(x0 + len, y, th / 2, th);
  labelBox(p, x0 + len / 2, y - th / 2 - 22, `dây ${s.material}`, COL.ink, 13);
  p.stroke(COL.muted);
  p.strokeWeight(1.4);
  p.line(x0, y + th / 2 + 18, x0 + len, y + th / 2 + 18);
  labelBox(p, x0 + len / 2, y + th / 2 + 18, `l = ${fmt(s.l)} m`, COL.text, 13);
  labelBox(p, x0 + len + 30, y + th / 2 + 52, `S = ${fmt(s.S)} mm²`, COL.text, 13);
}
