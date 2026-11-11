import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import {
  TINT, caption, dashedPoly, ease, formulaLine, mid, phase, poly, rightAngle, rotate, type Pt,
} from '@/lib/draw/geometry';
import { drawPaper, labelBox, pointLabel, spanArrow } from '@/lib/draw/scene';
import { fmt } from '@/lib/format';

const BASE_MAX = 360; // đáy của hình khi hình cao nhất
/** Căn hình vào giữa vùng vẽ theo chiều dọc */
const baseFor = (height: number) => Math.min(BASE_MAX, 222 + height / 2);
const MAX_W = 560;
const MAX_H = 250;

export interface ShapeScene {
  mode: 'tamgiac' | 'hinhthang';
  a: number; // đáy (tam giác) / đáy lớn (hình thang)
  b: number; // đáy bé (hình thang)
  h: number;
  area: number;
  /** 0..3: ba bước cắt ghép */
  t: number;
  done: boolean;
}

export function drawShapes(p: p5, s: ShapeScene) {
  drawPaper(p);
  if (s.mode === 'tamgiac') drawTriangle(p, s);
  else drawTrapezoid(p, s);
}

// ------------------------------------------------------------
// Tam giác: hai mảnh hai bên đường cao xoay ra, lấp đầy hình chữ nhật đáy × chiều cao
// ------------------------------------------------------------
function drawTriangle(p: p5, s: ShapeScene) {
  const sc = Math.min(MAX_W / s.a, MAX_H / s.h);
  const w = s.a * sc;
  const hh = s.h * sc;
  const xL = 400 - w / 2;
  const BASE_Y = baseFor(hh);
  const top = BASE_Y - hh;
  const u = w * 0.38; // chân đường cao nằm trong đáy

  const B: Pt = [xL, BASE_Y];
  const C: Pt = [xL + w, BASE_Y];
  const A: Pt = [xL + u, top];
  const H: Pt = [xL + u, BASE_Y];

  // khung hình chữ nhật (nét đứt) để học sinh thấy chỗ trống cần lấp
  dashedPoly(p, [[xL, top], [xL + w, top], C, B]);

  poly(p, [A, B, C], TINT.a, COL.aText, 2.5);

  // bước 1: kẻ đường cao
  const k1 = ease(phase(s.t, 0));
  if (k1 > 0) {
    p.stroke(COL.ink);
    p.strokeWeight(2);
    p.line(A[0], A[1], A[0], A[1] + (BASE_Y - top) * k1);
    if (k1 >= 1) {
      rightAngle(p, H[0], H[1]);
      labelBox(p, A[0] + 34, (top + BASE_Y) / 2, `h = ${fmt(s.h)} cm`, COL.ink, 14);
    }
  }

  // bước 2, 3: xoay mảnh trái quanh trung điểm AB, mảnh phải quanh trung điểm AC
  const left: Pt[] = [A, B, H];
  const right: Pt[] = [A, C, H];
  const k2 = ease(phase(s.t, 1));
  const k3 = ease(phase(s.t, 2));
  // xoay ra phía ngoài tam giác để không đè lên hình gốc
  if (k2 > 0) poly(p, rotate(left, mid(A, B), -Math.PI * k2), TINT.b, COL.bText, 2);
  if (k3 > 0) poly(p, rotate(right, mid(A, C), Math.PI * k3), TINT.b, COL.bText, 2);

  pointLabel(p, A[0], A[1] - 16, 'A', COL.text, 15);
  pointLabel(p, B[0] - 14, B[1] + 2, 'B', COL.text, 15);
  pointLabel(p, C[0] + 14, C[1] + 2, 'C', COL.text, 15);
  if (k1 >= 1) pointLabel(p, H[0], H[1] + 16, 'H', COL.ink, 14);

  spanArrow(p, xL, xL + w, BASE_Y + 46, `đáy = ${fmt(s.a)} cm`);

  if (s.t <= 0) caption(p, 'Hình tam giác ABC nằm trong hình chữ nhật cùng đáy, cùng chiều cao');
  else if (s.t < 1) caption(p, 'Bước 1: kẻ đường cao AH, chia tam giác thành hai mảnh');
  else if (s.t < 2) caption(p, 'Bước 2: xoay mảnh ABH lấp vào góc trống bên trái');
  else if (!s.done) caption(p, 'Bước 3: xoay mảnh ACH lấp vào góc trống bên phải');
  else caption(p, 'Hình chữ nhật gồm 2 lần tam giác, nên diện tích tam giác bằng một nửa');

  if (s.done) formulaLine(p, `${fmt(s.a)} × ${fmt(s.h)} : 2 = ${fmt(s.area, 4)} (cm²)`);
}

// ------------------------------------------------------------
// Hình thang: xoay tam giác ABM quanh M (trung điểm BC) thành tam giác có đáy a + b
// ------------------------------------------------------------
function drawTrapezoid(p: p5, s: ShapeScene) {
  const sc = Math.min(MAX_W / (s.a + s.b), MAX_H / s.h);
  const totalW = (s.a + s.b) * sc;
  const xL = 400 - totalW / 2;
  const BASE_Y = baseFor(s.h * sc);
  const top = BASE_Y - s.h * sc;
  const off = (s.a - s.b) * 0.35 * sc;

  const D: Pt = [xL, BASE_Y];
  const C: Pt = [xL + s.a * sc, BASE_Y];
  const A: Pt = [xL + off, top];
  const B: Pt = [xL + off + s.b * sc, top];
  const M = mid(B, C);
  const A2: Pt = [2 * M[0] - A[0], 2 * M[1] - A[1]]; // ảnh của A sau khi xoay

  const k1 = ease(phase(s.t, 0));
  const k2 = ease(phase(s.t, 1));
  const k3 = ease(phase(s.t, 2));

  // tam giác mới ADA' (nét đứt) để thấy hình sẽ ghép thành
  if (k3 > 0) {
    const ctx = p.drawingContext as CanvasRenderingContext2D;
    ctx.setLineDash([]);
    poly(p, [A, D, A2], null, COL.ink, 1 + 2.5 * k3);
  } else {
    dashedPoly(p, [A, D, A2], '#C9D2E3');
  }

  // phần còn lại của hình thang (ADCM) – giữ nguyên
  poly(p, [A, D, C, M], TINT.a, COL.aText, 2.5);
  // mảnh ABM: trước bước 2 là một phần hình thang, sau đó xoay quanh M
  const piece = rotate([A, B, M], M, -Math.PI * k2); // ngược chiều kim đồng hồ: mảnh đi xuống, không ra khỏi hình
  poly(p, piece, k1 > 0 ? TINT.b : TINT.a, k1 > 0 ? COL.bText : COL.aText, 2.5);

  // đường cao
  p.stroke(COL.ink);
  p.strokeWeight(2);
  p.line(A[0], A[1], A[0], BASE_Y);
  rightAngle(p, A[0], BASE_Y);
  labelBox(p, A[0] - 46, (top + BASE_Y) / 2, `h = ${fmt(s.h)} cm`, COL.ink, 14);

  // bước 1: đánh dấu trung điểm M và đường cắt AM
  if (k1 > 0) {
    p.noStroke();
    p.fill(COL.ink);
    p.circle(M[0], M[1], 8 * k1);
    pointLabel(p, M[0] + 16, M[1], 'M', COL.ink, 15);
  }

  pointLabel(p, A[0], A[1] - 16, 'A', COL.text, 15);
  pointLabel(p, D[0] - 14, D[1] + 2, 'D', COL.text, 15);
  pointLabel(p, C[0], C[1] + 18, 'C', COL.text, 15);
  if (k2 === 0) pointLabel(p, B[0], B[1] - 16, 'B', COL.text, 15);
  if (k2 >= 1) pointLabel(p, A2[0] + 16, A2[1] + 2, 'E', COL.bText, 15);

  // số đo hai đáy
  if (k2 < 0.05) labelBox(p, (A[0] + B[0]) / 2, top - 16, `đáy bé = ${fmt(s.b)} cm`, COL.aText, 13);
  if (k2 < 1) {
    spanArrow(p, D[0], C[0], BASE_Y + 46, `đáy lớn = ${fmt(s.a)} cm`);
  } else {
    spanArrow(p, D[0], A2[0], BASE_Y + 46, `DE = ${fmt(s.a)} + ${fmt(s.b)} = ${fmt(s.a + s.b)} cm`);
  }

  if (s.t <= 0) caption(p, 'Hình thang ABCD có đáy lớn DC, đáy bé AB, chiều cao AH');
  else if (s.t < 1) caption(p, 'Bước 1: lấy M là trung điểm của BC, cắt theo AM');
  else if (s.t < 2) caption(p, 'Bước 2: xoay tam giác ABM quanh M, B trùng với C');
  else if (!s.done) caption(p, 'Bước 3: ghép thành tam giác ADE có đáy bằng tổng hai đáy');
  else caption(p, 'Diện tích hình thang = diện tích tam giác ADE, đáy DE = đáy lớn + đáy bé');

  if (s.done) formulaLine(p, `(${fmt(s.a)} + ${fmt(s.b)}) × ${fmt(s.h)} : 2 = ${fmt(s.area, 4)} (cm²)`);
}
