import type p5 from 'p5';
import { battery, flow, flowOffset, meter, node, resistor, wire } from '@/lib/draw/circuit';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';
import { fmt } from '@/lib/format';

export interface CircuitScene {
  parallel: boolean;
  U: number;
  R1: number;
  R2: number;
  I: number;
  I1: number;
  I2: number;
  U1: number;
  U2: number;
  show: boolean;
  t: number; // 0..2
}

const L = 100;
const R_ = 700;
const T = 150;
const Bt = 400;

const v = (show: boolean, x: number, unit: string, name: string) => `${name} = ${show ? fmt(x) : '?'} ${unit}`;

export function drawCircuit(p: p5, s: CircuitScene) {
  drawPaper(p);
  const k = Math.min(1, s.t); // dòng điện tăng dần trong pha đầu
  if (s.parallel) drawParallel(p, s, k);
  else drawSeries(p, s, k);

  if (s.t <= 0) caption(p, s.parallel ? 'Hai điện trở mắc song song giữa hai điểm M, N' : 'Hai điện trở mắc nối tiếp, cùng một dòng điện chạy qua');
  else if (s.t < 1) caption(p, 'Đóng mạch: các hạt mang điện chuyển động theo chiều dòng điện');
  else if (s.parallel) caption(p, 'Dòng điện mạch chính chia thành hai nhánh: I = I₁ + I₂');
  else caption(p, 'Hiệu điện thế chia cho hai điện trở: U = U₁ + U₂');
}

function drawSeries(p: p5, s: CircuitScene, k: number) {
  const T = 170;
  const VY = 100;
  const loop: [number, number][] = [[L, 261], [L, T], [R_, T], [R_, Bt], [L, Bt], [L, 289]];
  wire(p, loop);
  // vôn kế đo U1, U2
  wire(p, [[230, T], [230, VY], [370, VY], [370, T]]);
  wire(p, [[430, T], [430, VY], [570, VY], [570, T]]);
  if (k > 0) flow(p, loop, flowOffset(s.I) * k);

  battery(p, L, 275, `U = ${fmt(s.U)} V`);
  resistor(p, 300, T, `R₁ = ${fmt(s.R1)} Ω`, { col: COL.aText });
  resistor(p, 500, T, `R₂ = ${fmt(s.R2)} Ω`, { col: COL.bText });
  meter(p, 300, VY, 'V', v(s.show, s.U1, 'V', 'U₁'), 'above', COL.aText);
  meter(p, 500, VY, 'V', v(s.show, s.U2, 'V', 'U₂'), 'above', COL.bText);
  meter(p, 400, Bt, 'A', v(s.show, s.I, 'A', 'I'), 'below');
}

function drawParallel(p: p5, s: CircuitScene, k: number) {
  const M = 250;
  const Nx = 550;
  const B2 = 280; // nhánh 2
  const trunkIn: [number, number][] = [[L, 261], [L, T], [M, T]];
  const br1: [number, number][] = [[M, T], [Nx, T]];
  const br2: [number, number][] = [[M, T], [M, B2], [Nx, B2], [Nx, T]];
  const trunkOut: [number, number][] = [[Nx, T], [R_, T], [R_, Bt], [L, Bt], [L, 289]];
  for (const path of [trunkIn, br1, br2, trunkOut]) wire(p, path);
  if (k > 0) {
    flow(p, trunkIn, flowOffset(s.I) * k);
    flow(p, br1, flowOffset(s.I1) * k, 26, COL.a);
    flow(p, br2, flowOffset(s.I2) * k, 26, COL.b);
    flow(p, trunkOut, flowOffset(s.I) * k);
  }

  battery(p, L, 275, `U = ${fmt(s.U)} V`);
  resistor(p, 440, T, `R₁ = ${fmt(s.R1)} Ω`, { col: COL.aText });
  resistor(p, 440, B2, `R₂ = ${fmt(s.R2)} Ω`, { col: COL.bText });
  meter(p, 330, T, 'A', v(s.show, s.I1, 'A', 'I₁'), 'above', COL.aText);
  meter(p, 330, B2, 'A', v(s.show, s.I2, 'A', 'I₂'), 'below', COL.bText);
  meter(p, 400, Bt, 'A', v(s.show, s.I, 'A', 'I'), 'below');
  node(p, M, T);
  node(p, Nx, T);
  labelBox(p, M - 14, T - 18, 'M', COL.text, 14);
  labelBox(p, Nx + 14, T - 18, 'N', COL.text, 14);
}
