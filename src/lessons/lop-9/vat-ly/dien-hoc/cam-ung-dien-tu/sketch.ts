import type p5 from 'p5';
import { lamp, wire } from '@/lib/draw/circuit';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';
import { fmt } from '@/lib/format';

const NORTH = '#E0443F';
const SOUTH = '#3B6FD8';

// ------------------------------------------------------------
// Nam châm và cuộn dây: đưa vào (0..1), giữ yên (1..2), kéo ra (2..3)
// ------------------------------------------------------------
export interface CoilScene {
  pole: 'N' | 'S'; // cực quay về phía cuộn dây
  speed: number; // 1..5
  turns: number;
  t: number;
}

/** Phần của mỗi giai đoạn dành cho chuyển động: nhanh hơn thì đi hết sớm hơn */
const moveFrac = (speed: number) => 1 / speed;

/** Vị trí (0 ở ngoài, 1 ở trong cuộn dây) và chiều chuyển động hiện tại */
export function magnetState(s: CoilScene) {
  const f = moveFrac(s.speed);
  if (s.t <= 1) {
    const u = Math.min(1, s.t / f);
    return { pos: u, moving: s.t > 0 && s.t < f ? 1 : 0, phase: 'in' as const };
  }
  if (s.t <= 2) return { pos: 1, moving: 0, phase: 'hold' as const };
  const u = Math.min(1, (s.t - 2) / f);
  return { pos: 1 - u, moving: s.t - 2 < f ? -1 : 0, phase: 'out' as const };
}

export function drawCoil(p: p5, s: CoilScene) {
  drawPaper(p);
  const st = magnetState(s);
  const cy = 210;
  const coilX0 = 420;
  const coilX1 = 640;
  // nam châm: đầu quay về cuộn dây đi từ x=250 (ngoài) đến x=470 (trong lòng cuộn dây)
  const head = 250 + st.pos * 220;
  const mlen = 170;
  const near = s.pole === 'N' ? NORTH : SOUTH;
  const far = s.pole === 'N' ? SOUTH : NORTH;

  // đường sức từ quanh nam châm
  p.noFill();
  p.stroke(near);
  p.strokeWeight(1.2);
  for (let k = 1; k <= 3; k++) {
    p.arc(head - mlen / 2, cy, mlen + 40 * k, 40 + 40 * k, -Math.PI * 0.95, -Math.PI * 0.05);
    p.arc(head - mlen / 2, cy, mlen + 40 * k, 40 + 40 * k, Math.PI * 0.05, Math.PI * 0.95);
  }

  // cuộn dây: nửa sau vẽ trước nam châm, nửa trước vẽ sau
  const turns = Math.round(6 + (s.turns / 1000) * 8);
  const step = (coilX1 - coilX0) / turns;
  p.stroke('#B07A3A');
  p.strokeWeight(3);
  for (let i = 0; i <= turns; i++) p.arc(coilX0 + i * step, cy, 26, 120, Math.PI / 2, (3 * Math.PI) / 2);

  // nam châm thẳng
  p.noStroke();
  p.fill(far);
  p.rect(head - mlen, cy - 22, mlen / 2, 44, 4, 0, 0, 4);
  p.fill(near);
  p.rect(head - mlen / 2, cy - 22, mlen / 2, 44, 0, 4, 4, 0);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(20);
  p.textStyle(p.BOLD);
  p.text(s.pole, head - mlen / 4, cy);
  p.text(s.pole === 'N' ? 'S' : 'N', head - (3 * mlen) / 4, cy);
  p.textStyle(p.NORMAL);

  p.stroke('#B07A3A');
  p.strokeWeight(3);
  p.noFill();
  for (let i = 0; i <= turns; i++) p.arc(coilX0 + i * step, cy, 26, 120, -Math.PI / 2, Math.PI / 2);

  // dây nối tới điện kế
  wire(p, [[coilX0, cy + 60], [coilX0, 380], [500, 380]]);
  wire(p, [[coilX1, cy + 60], [coilX1, 380], [580, 380]]);
  const deflect = st.moving * Math.min(1, (s.speed * s.turns) / 2500) * (s.pole === 'N' ? 1 : -1);
  galvanometer(p, 540, 395, deflect);
  labelBox(p, 530, 288, `${s.turns} vòng dây`, COL.text, 13);

  const flux = st.phase === 'in' ? (st.moving ? 'tăng' : 'không đổi') : st.phase === 'hold' ? 'không đổi' : st.moving ? 'giảm' : 'không đổi';
  if (s.t > 0) labelBox(p, 230, 330, `Số đường sức từ qua cuộn dây: ${flux}`, COL.ink, 14);

  if (s.t <= 0) caption(p, 'Nam châm đứng ngoài cuộn dây dẫn kín nối với điện kế');
  else if (st.phase === 'in') caption(p, st.moving ? 'Đưa nam châm vào: kim điện kế lệch, có dòng điện cảm ứng' : 'Nam châm đã nằm trong cuộn dây');
  else if (st.phase === 'hold') caption(p, 'Giữ yên nam châm: kim chỉ số 0, không có dòng điện cảm ứng');
  else caption(p, st.moving ? 'Kéo nam châm ra: kim lệch ngược lại, dòng điện đổi chiều' : 'Nam châm đã ra khỏi cuộn dây');
}

/** Điện kế: kim lệch trong khoảng -1..1 */
function galvanometer(p: p5, x: number, y: number, v: number) {
  p.fill(255);
  p.stroke(COL.ink);
  p.strokeWeight(2.5);
  p.arc(x, y, 120, 120, Math.PI, 2 * Math.PI, p.CHORD);
  p.strokeWeight(1.2);
  for (let k = -4; k <= 4; k++) {
    const a = -Math.PI / 2 + (k / 4) * 0.9;
    p.line(x + Math.cos(a) * 48, y + Math.sin(a) * 48, x + Math.cos(a) * 56, y + Math.sin(a) * 56);
  }
  p.noStroke();
  p.fill(COL.text);
  p.textSize(11);
  p.textAlign(p.CENTER, p.CENTER);
  p.text('0', x, y - 68);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text('G', x - 34, y - 16);
  p.textStyle(p.NORMAL);
  const a = -Math.PI / 2 + v * 0.9;
  p.stroke(COL.a);
  p.strokeWeight(2.5);
  p.line(x, y, x + Math.cos(a) * 50, y + Math.sin(a) * 50);
  p.noStroke();
  p.fill(COL.text);
  p.circle(x, y, 8);
}

// ------------------------------------------------------------
// Máy phát điện xoay chiều: khung dây quay trong từ trường; đồ thị dòng điện theo thời gian
// ------------------------------------------------------------
export interface GenScene {
  n: number;
  /** số vòng đã quay trên hình (0..2) */
  turnsDone: number;
  done: boolean;
}

export function drawGenerator(p: p5, s: GenScene) {
  drawPaper(p);
  const cx = 250;
  const cy = 220;
  const theta = s.turnsDone * 2 * Math.PI;

  // hai cực nam châm
  p.noStroke();
  p.fill(NORTH);
  p.rect(70, cy - 70, 60, 140, 6);
  p.fill(SOUTH);
  p.rect(370, cy - 70, 60, 140, 6);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(24);
  p.textStyle(p.BOLD);
  p.text('N', 100, cy);
  p.text('S', 400, cy);
  p.textStyle(p.NORMAL);
  // đường sức từ
  p.stroke('#C9D2E3');
  p.strokeWeight(1.2);
  for (let k = -2; k <= 2; k++) p.line(130, cy + k * 26, 370, cy + k * 26);

  // khung dây quay quanh trục đứng: bề rộng nhìn thấy = 180 × |cos θ|
  const w = 180 * Math.cos(theta);
  p.noFill();
  p.stroke('#B07A3A');
  p.strokeWeight(5);
  p.rect(cx - Math.abs(w) / 2, cy - 90, Math.abs(w), 180, 4);
  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(cx, cy - 120, cx, cy + 140);

  // hai vành khuyên trên trục, hai chổi quét nối ra bóng đèn thành mạch kín
  const r1 = cy + 110;
  const r2 = cy + 132;
  wire(p, [[cx - 28, r1], [cx - 100, r1], [cx - 100, 455], [cx - 18, 455]]);
  wire(p, [[cx + 28, r2], [cx + 100, r2], [cx + 100, 455], [cx + 18, 455]]);
  p.fill('#D9B26A');
  p.stroke('#8A6428');
  p.strokeWeight(1.5);
  for (const y of [r1, r2]) p.ellipse(cx, y, 40, 12);
  p.noStroke();
  p.fill(COL.text);
  p.rect(cx - 30, r1 - 5, 10, 10, 2);
  p.rect(cx + 20, r2 - 5, 10, 10, 2);
  const current = Math.sin(theta);
  lamp(p, cx, 455, s.turnsDone > 0 ? Math.abs(current) : 0, 18);
  labelBox(p, cx + 190, r2 + 40, 'vành khuyên và chổi quét', COL.muted, 12);

  // đồ thị i(t)
  const gx = 500;
  const gy = 230;
  const gw = 270;
  const amp = 90;
  p.stroke(COL.text);
  p.strokeWeight(1.6);
  p.line(gx, gy, gx + gw + 10, gy);
  p.line(gx, gy - amp - 20, gx, gy + amp + 20);
  p.noStroke();
  p.fill(COL.text);
  p.textSize(12);
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.CENTER);
  p.text('t', gx + gw + 14, gy);
  p.text('i', gx + 6, gy - amp - 18);
  p.textStyle(p.NORMAL);
  const X = (turn: number) => gx + (gw * turn) / 2;
  p.noFill();
  p.stroke(COL.a);
  p.strokeWeight(2.5);
  p.beginShape();
  for (let k = 0; k <= 200 * s.turnsDone; k++) {
    const turn = k / 200;
    p.vertex(X(turn), gy - amp * Math.sin(turn * 2 * Math.PI));
  }
  p.endShape();
  // các lần đổi chiều (dòng điện qua 0) sau mỗi nửa vòng
  p.noStroke();
  p.fill(COL.ink);
  for (let h = 1; h <= 4; h++) {
    if (h / 2 <= s.turnsDone + 1e-6) p.circle(X(h / 2), gy, 9);
  }
  labelBox(p, gx + gw / 2, gy + amp + 40, 'mỗi chấm: dòng điện đổi chiều', COL.ink, 12);
  labelBox(p, 250, 60, `máy quay ${fmt(s.n)} vòng mỗi giây (hình quay chậm lại)`, COL.muted, 12);

  if (s.turnsDone <= 0) caption(p, 'Khung dây quay trong từ trường của nam châm');
  else if (!s.done) caption(p, 'Dòng điện cảm ứng luân phiên đổi chiều: dòng điện xoay chiều');
  else caption(p, 'Mỗi vòng quay, dòng điện đổi chiều 2 lần');
}
