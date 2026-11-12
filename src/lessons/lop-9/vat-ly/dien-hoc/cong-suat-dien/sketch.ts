import type p5 from 'p5';
import { battery, flow, flowOffset, lamp, meter, switchK, wire } from '@/lib/draw/circuit';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';
import { fmt, fmtG } from '@/lib/format';

export interface PowerScene {
  mode: 'congsuat' | 'diennang';
  U: number;
  P: number; // W
  I: number;
  hours: number; // giờ mỗi ngày
  days: number;
  t: number; // congsuat: 0..2; diennang: số ngày đã trôi qua
  show: boolean;
  done: boolean;
  /** đề cho số chỉ ampe kế, hỏi công suất (số oát chưa biết) */
  findP?: boolean;
  /** tên dụng cụ điện (bài điện năng) */
  device?: string;
}

export function drawPower(p: p5, s: PowerScene) {
  drawPaper(p);
  if (s.mode === 'congsuat') drawLampCircuit(p, s);
  else drawMeter(p, s);
}

/** Đèn mắc vào nguồn qua khóa K và ampe kế */
function drawLampCircuit(p: p5, s: PowerScene) {
  const on = s.t >= 0.4;
  const k = Math.max(0, Math.min(1, (s.t - 0.4) / 0.6));
  const loop: [number, number][] = [[120, 246], [120, 140], [620, 140], [620, 380], [120, 380], [120, 274]];
  wire(p, loop);
  if (on) flow(p, loop, flowOffset(s.I * 4) * k);
  battery(p, 120, 260, `U = ${fmt(s.U)} V`);
  switchK(p, 200, 250, 140, Math.min(1, s.t / 0.4));
  lamp(p, 420, 140, on ? k * Math.min(1, 0.25 + s.P / 200) : 0, 26);
  const watt = s.findP && !s.show ? '?' : fmt(s.P);
  labelBox(p, 420, 92, s.findP ? `U = ${fmt(s.U)} V, 𝒫 = ${watt} W` : `${fmt(s.U)} V – ${fmt(s.P)} W`, COL.ink, 14);
  meter(p, 370, 380, 'A', `I = ${!on ? '0' : s.show || s.findP ? fmt(s.I) : '?'} A`, 'below');

  if (s.t <= 0) caption(p, s.findP ? 'Đóng khóa K, đọc số chỉ của ampe kế' : 'Bóng đèn ghi số vôn và số oát định mức');
  else if (s.t < 1) caption(p, 'Đèn sáng bình thường khi dùng đúng hiệu điện thế định mức');
  else caption(p, 'Công suất điện của đèn: 𝒫 = U × I');
}

/** Dụng cụ điện và công tơ điện đếm số kWh theo từng ngày */
function drawMeter(p: p5, s: PowerScene) {
  const day = Math.min(s.t, s.days);
  const A = (s.P / 1000) * s.hours * day; // kWh đã dùng
  const running = day > 0 && !s.done;

  // dụng cụ điện (đèn) bên trái, sáng khi đang dùng
  wire(p, [[160, 300], [160, 380], [560, 380], [560, 330]]);
  lamp(p, 160, 250, running || s.done ? Math.min(1, 0.3 + s.P / 2000) : 0, 34);
  labelBox(p, 160, 188, s.device ? `${s.device}: ${fmtG(s.P, 0)} W` : `${fmtG(s.P, 0)} W`, COL.ink, 15);
  labelBox(p, 160, 320, `dùng ${fmt(s.hours)} giờ mỗi ngày`, COL.text, 13);

  // công tơ điện
  const bx = 470;
  const by = 120;
  p.noStroke();
  p.fill('#F1F3F8');
  p.stroke(COL.text);
  p.strokeWeight(2.5);
  p.rect(bx, by, 180, 210, 10);
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(13);
  p.textStyle(p.BOLD);
  p.text('CÔNG TƠ ĐIỆN', bx + 90, by + 20);
  // ô số
  const digits = Math.min(99999.9, A).toFixed(1).padStart(7, '0');
  const cw = 20;
  const x0 = bx + 90 - (digits.length * cw) / 2;
  for (let i = 0; i < digits.length; i++) {
    const ch = digits[i];
    if (ch === '.') {
      p.fill(COL.text);
      p.circle(x0 + i * cw + cw / 2, by + 76, 4);
      continue;
    }
    const last = i === digits.length - 1;
    p.fill(last ? COL.a : '#22283A');
    p.rect(x0 + i * cw + 1, by + 46, cw - 2, 34, 3);
    p.fill(255);
    p.textSize(20);
    p.text(ch, x0 + i * cw + cw / 2, by + 63);
  }
  p.fill(COL.text);
  p.textSize(13);
  p.text('kWh', bx + 90, by + 98);
  // đĩa quay
  p.push();
  p.translate(bx + 90, by + 150);
  p.fill(200);
  p.stroke(COL.text);
  p.strokeWeight(1.5);
  p.ellipse(0, 0, 110, 26);
  p.noStroke();
  p.fill(COL.a);
  const ang = running ? (performance.now() / 1000) * (2 + s.P / 300) : 0;
  p.ellipse(Math.cos(ang) * 48, Math.sin(ang) * 10, 10, 6);
  p.pop();
  p.textStyle(p.NORMAL);

  // thanh ngày
  const gx = 120;
  const gy = 440;
  const gw = 560;
  p.noStroke();
  p.fill(COL.track);
  p.rect(gx, gy, gw, 14, 7);
  p.fill(COL.ink);
  p.rect(gx, gy, (gw * day) / s.days, 14, 7);
  labelBox(p, gx + gw / 2, gy - 18, `ngày thứ ${Math.min(s.days, Math.floor(day + 1e-9))} trong ${s.days} ngày`, COL.ink, 13);

  if (s.t <= 0) caption(p, 'Công tơ điện đếm điện năng tiêu thụ, đơn vị kilôoát giờ (kWh)');
  else if (!s.done) caption(p, 'Mỗi ngày công tơ tăng thêm 𝒫 × t (kWh)');
  else caption(p, `Sau ${s.days} ngày dùng hết ${fmt(A, 1)} kWh điện`);
}
