import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, formulaLine, poly, type Pt } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface BoxScene {
  cube: boolean; // hình lập phương
  a: number; // dài
  b: number; // rộng
  c: number; // cao
  /** số hình lập phương 1 cm³ đã xếp (có phần lẻ cho hiệu ứng hiện dần) */
  t: number;
  done: boolean;
}

/** Thứ tự xếp: từng lớp từ dưới lên; trong lớp, hàng phía sau trước, mỗi hàng từ trái sang phải */
export function cellAt(n: number, a: number, b: number): [number, number, number] {
  const perLayer = a * b;
  const k = Math.floor(n / perLayer);
  const r = n % perLayer;
  const j = b - 1 - Math.floor(r / a);
  const i = r % a;
  return [i, j, k];
}

const COLORS = {
  done: { front: '#9FD9CF', top: '#CDEFEA', side: '#7CC4B8', edge: COL.bText },
  current: { front: '#F4A9A6', top: '#F9D3D1', side: '#E98682', edge: COL.aText },
};

export function drawBox(p: p5, s: BoxScene) {
  drawPaper(p);
  const { a, b, c } = s;
  const total = a * b * c;
  const placed = Math.min(Math.floor(s.t + 1e-9), total);
  const frac = s.done ? 0 : s.t - placed;

  // phối cảnh xiên: chiều sâu đi chéo lên bên phải
  const depthX = 0.433;
  const depthY = -0.25;
  const sc = Math.min(54, 520 / (a + b * depthX), 270 / (c + b * -depthY));
  const boxW = (a + b * depthX) * sc;
  const boxH = (c - b * depthY) * sc;
  const ox = 400 - boxW / 2;
  const oy = 236 + boxH / 2;
  const P = (i: number, j: number, k: number): Pt => [ox + i * sc + j * depthX * sc, oy - k * sc + j * depthY * sc];

  // cạnh khuất của hộp (nét đứt)
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  p.stroke('#B3BED3');
  p.strokeWeight(1.5);
  ctx.setLineDash([5, 5]);
  const hidden = P(0, b, 0);
  for (const q of [P(a, b, 0), P(0, 0, 0), P(0, b, c)]) p.line(hidden[0], hidden[1], q[0], q[1]);
  ctx.setLineDash([]);

  // các hình lập phương đã xếp, vẽ từ xa đến gần
  const currentLayer = Math.floor(Math.min(placed, total - 1) / (a * b));
  const cells: [number, number, number, number][] = [];
  for (let n = 0; n < placed + (frac > 0 ? 1 : 0) && n < total; n++) {
    const [i, j, k] = cellAt(n, a, b);
    cells.push([i, j, k, n]);
  }
  cells.sort((u, v) => v[1] - u[1] || u[2] - v[2] || u[0] - v[0]);
  for (const [i, j, k, n] of cells) {
    const pal = !s.done && k === currentLayer ? COLORS.current : COLORS.done;
    const alpha = n === placed ? frac : 1;
    const lift = (1 - alpha) * sc * 0.8; // khối mới rơi nhẹ xuống
    const Q = (ii: number, jj: number, kk: number): Pt => {
      const [x, y] = P(ii, jj, kk);
      return [x, y - lift];
    };
    const a255 = Math.round(alpha * 255).toString(16).padStart(2, '0');
    poly(p, [Q(i, j, k), Q(i + 1, j, k), Q(i + 1, j, k + 1), Q(i, j, k + 1)], pal.front + a255, pal.edge + a255, 1);
    poly(p, [Q(i, j, k + 1), Q(i + 1, j, k + 1), Q(i + 1, j + 1, k + 1), Q(i, j + 1, k + 1)], pal.top + a255, pal.edge + a255, 1);
    poly(p, [Q(i + 1, j, k), Q(i + 1, j + 1, k), Q(i + 1, j + 1, k + 1), Q(i + 1, j, k + 1)], pal.side + a255, pal.edge + a255, 1);
  }

  // cạnh nhìn thấy của hộp
  p.noFill();
  p.stroke(COL.ink);
  p.strokeWeight(2.5);
  const edges: [Pt, Pt][] = [
    [P(0, 0, 0), P(a, 0, 0)], [P(a, 0, 0), P(a, 0, c)], [P(a, 0, c), P(0, 0, c)], [P(0, 0, c), P(0, 0, 0)],
    [P(0, 0, c), P(0, b, c)], [P(a, 0, c), P(a, b, c)], [P(a, 0, 0), P(a, b, 0)],
    [P(0, b, c), P(a, b, c)], [P(a, b, c), P(a, b, 0)],
  ];
  for (const [u, v] of edges) p.line(u[0], u[1], v[0], v[1]);

  // số đo ba kích thước
  const unit = (n: number) => `${n} cm`;
  const fl = P(0, 0, 0);
  const fr = P(a, 0, 0);
  labelBox(p, (fl[0] + fr[0]) / 2, fl[1] + 22, `${s.cube ? 'cạnh' : 'dài'} ${unit(a)}`, COL.ink, 14);
  const br = P(a, b, 0);
  labelBox(p, (fr[0] + br[0]) / 2 + 38, (fr[1] + br[1]) / 2 + 8, `${s.cube ? 'cạnh' : 'rộng'} ${unit(b)}`, COL.ink, 14);
  const tl = P(0, 0, c);
  labelBox(p, fl[0] - 42, (fl[1] + tl[1]) / 2, `${s.cube ? 'cạnh' : 'cao'} ${unit(c)}`, COL.ink, 14);

  // chú thích theo tiến độ
  const perLayer = a * b;
  const layersDone = Math.floor(placed / perLayer);
  if (s.done) caption(p, `${c} lớp, mỗi lớp ${a} × ${b} = ${perLayer} hình lập phương 1 cm³`);
  else if (placed === 0 && frac === 0) caption(p, 'Xếp các hình lập phương cạnh 1 cm vào đầy hộp');
  else if (placed < a) caption(p, `Xếp một hàng theo chiều dài: ${a} hình`);
  else if (placed < perLayer) caption(p, `Lớp dưới cùng có ${b} hàng, mỗi hàng ${a} hình`);
  else caption(p, `Đã xếp ${layersDone} lớp, mỗi lớp ${perLayer} hình. Xếp tiếp lên trên`);

  p.noStroke();
  p.fill(COL.muted);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(15);
  p.text(
    s.done ? `Đã xếp đầy hộp: ${total} hình lập phương 1 cm³` : `Đã xếp ${placed} hình lập phương 1 cm³, chưa đầy hộp`,
    400, 420,
  );

  if (s.done) {
    const expr = s.cube ? `${a} × ${a} × ${a}` : `${a} × ${b} × ${c}`;
    formulaLine(p, `V = ${expr} = ${total} (cm³)`, 460);
  }
}
