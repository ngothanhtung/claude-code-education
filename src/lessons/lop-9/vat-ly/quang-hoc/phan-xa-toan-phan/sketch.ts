import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption } from '@/lib/draw/geometry';
import { LIGHT, mediumLabel, type V } from '@/lib/draw/optics';
import { deg } from '@/lib/format';

const X0 = 70;
const X1 = 770;
const TOP = 220;
const BOT = 320;

export interface FiberScene {
  n: number;
  fill: string;
  name: string;
  i: number; // góc tới ở mặt bên (độ)
  igh: number;
  t: number; // 0..2
}

/** Đường đi của tia sáng trong lõi sợi quang (gấp khúc) */
function fiberPath(s: FiberScene) {
  const ir = (s.i * Math.PI) / 180;
  const dx = Math.sin(ir);
  let dy = -Math.cos(ir);
  const pts: V[] = [[X0, (TOP + BOT) / 2]];
  let leak: { at: V; dir: V } | null = null;
  let x = X0;
  let y = (TOP + BOT) / 2;
  for (let n = 0; n < 200 && x < X1; n++) {
    const yWall = dy < 0 ? TOP : BOT;
    const tHit = (yWall - y) / dy;
    let nx = x + dx * tHit;
    let ny = yWall;
    if (nx > X1) {
      // tới đầu kia của sợi
      const tEnd = (X1 - x) / dx;
      nx = X1;
      ny = y + dy * tEnd;
      pts.push([nx, ny]);
      break;
    }
    pts.push([nx, ny]);
    if (s.i < s.igh && !leak) {
      // tia khúc xạ lọt ra ngoài không khí
      const sinR = Math.min(1, s.n * Math.sin(ir));
      const r = Math.asin(sinR);
      leak = { at: [nx, ny], dir: [Math.sin(r), dy < 0 ? -Math.cos(r) : Math.cos(r)] };
    }
    x = nx;
    y = ny;
    dy = -dy;
  }
  return { pts, leak };
}

export function drawFiber(p: p5, s: FiberScene) {
  p.background(255);
  // lõi sợi quang
  p.noStroke();
  p.fill(s.fill);
  p.rect(X0, TOP, X1 - X0, BOT - TOP, 4);
  p.stroke('#7FA7C9');
  p.strokeWeight(2);
  p.line(X0, TOP, X1, TOP);
  p.line(X0, BOT, X1, BOT);
  mediumLabel(p, X0, TOP - 24, 'Không khí (n = 1)');
  mediumLabel(p, X0, BOT + 24, `Lõi sợi quang bằng ${s.name.toLowerCase()} (n = ${String(s.n).replace('.', ',')})`);

  // nguồn sáng
  p.noStroke();
  p.fill('#3A4152');
  p.rect(18, 252, 52, 36, 6);
  p.fill(LIGHT);
  p.circle(64, 270, 10);

  const { pts, leak } = fiberPath(s);
  const total = pts.reduce((acc, pt, k) => (k === 0 ? 0 : acc + Math.hypot(pt[0] - pts[k - 1][0], pt[1] - pts[k - 1][1])), 0);
  const shown = (Math.min(s.t, 2) / 2) * total;
  const leaking = s.i < s.igh;

  // vẽ đường gấp khúc theo độ dài đã truyền
  let acc = 0;
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1];
    const b = pts[k];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (acc >= shown) break;
    const u = Math.min(1, (shown - acc) / L);
    const col = p.color(LIGHT);
    col.setAlpha(leaking && k > 1 ? 70 : 255);
    p.stroke(col);
    p.strokeWeight(leaking && k > 1 ? 1.5 : 3);
    p.line(a[0], a[1], a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u);
    acc += L;
  }

  if (leak && shown > Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])) {
    p.stroke(LIGHT);
    p.strokeWeight(3);
    const e: V = [leak.at[0] + leak.dir[0] * 140, leak.at[1] + leak.dir[1] * 140];
    p.line(leak.at[0], leak.at[1], e[0], e[1]);
  }

  // đầu ra
  if (!leaking && s.t >= 2) {
    p.noStroke();
    p.fill(255, 200, 40);
    p.circle(X1 + 8, pts[pts.length - 1][1], 18);
  }

  if (s.t <= 0) caption(p, `Góc tới ở mặt bên i = ${deg(s.i, 0)}, góc tới hạn i_gh ≈ ${deg(s.igh)}`);
  else if (leaking) caption(p, 'i < i_gh: một phần ánh sáng khúc xạ lọt ra ngoài, tín hiệu yếu dần');
  else caption(p, 'i ≥ i_gh: ánh sáng phản xạ toàn phần liên tiếp, truyền hết sợi quang');
  p.noStroke();
  p.fill(COL.muted);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(13);
  p.text('Hình vẽ phóng to lõi sợi quang (thực tế lõi chỉ mảnh như sợi tóc)', 400, 440);
}
