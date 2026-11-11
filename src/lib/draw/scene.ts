import type p5 from 'p5';
import { COL } from './colors';
import { fmt } from '@/lib/format';

/** Canvas luôn vẽ ở 800×500 rồi CSS co theo khung. */
export const W = 800;
export const H = 500;
export const ROAD_TOP = 160;
export const ROAD_BOT = 272;
export const DIAG_TOP = 292;

const ctx2d = (p: p5) => p.drawingContext as CanvasRenderingContext2D;

// ------------------------------------------------------------
// Nền tĩnh: trời, đồi, cỏ, mặt đường, giấy ô li (vẽ 1 lần rồi dùng lại)
// ------------------------------------------------------------
const bgCache = new WeakMap<p5, Map<number, p5.Graphics>>();

export function drawBackground(p: p5, laneMid: number) {
  let byLane = bgCache.get(p);
  if (!byLane) {
    byLane = new Map();
    bgCache.set(p, byLane);
  }
  let g = byLane.get(laneMid);
  if (!g) {
    g = buildBackground(p, laneMid);
    byLane.set(laneMid, g);
  }
  p.image(g, 0, 0);
}

function buildBackground(p: p5, laneMid: number): p5.Graphics {
  const g = p.createGraphics(W, H);
  g.noStroke();

  const skyTop = p.color('#CFE2FF');
  const skyBot = p.color('#F4F8FF');
  for (let y = 0; y < 150; y++) {
    g.fill(p.lerpColor(skyTop, skyBot, y / 150));
    g.rect(0, y, W, 1);
  }

  g.fill('#D5EACB');
  g.beginShape();
  g.vertex(0, 150);
  for (let x = 0; x <= W; x += 10) {
    g.vertex(x, 126 + 9 * Math.sin(x / 95) + 5 * Math.sin(x / 41 + 1));
  }
  g.vertex(W, 150);
  g.endShape(p.CLOSE);

  g.fill('#A9D493');
  g.rect(0, 146, W, ROAD_TOP - 146);
  g.rect(0, ROAD_BOT, W, DIAG_TOP - ROAD_BOT);

  g.fill('#3A4152');
  g.rect(0, ROAD_TOP, W, ROAD_BOT - ROAD_TOP);
  g.fill(255, 255, 255, 200);
  g.rect(0, ROAD_TOP + 5, W, 2);
  g.rect(0, ROAD_BOT - 7, W, 2);
  g.fill('#F2F4F8');
  for (let x = 8; x < W; x += 48) g.rect(x, laneMid - 1.5, 26, 3, 1.5);

  g.fill('#FFFFFF');
  g.rect(0, DIAG_TOP, W, H - DIAG_TOP);
  g.stroke('#E4EAF5');
  g.strokeWeight(1);
  for (let x = 0; x <= W; x += 20) g.line(x + 0.5, DIAG_TOP, x + 0.5, H);
  for (let y = DIAG_TOP; y <= H; y += 20) g.line(0, y + 0.5, W, y + 0.5);
  g.stroke('#D5DDEC');
  g.line(0, DIAG_TOP + 0.5, W, DIAG_TOP + 0.5);
  return g;
}

// ------------------------------------------------------------
// Nền giấy ô li toàn canvas (cho các bài hình học, đo lường)
// ------------------------------------------------------------
const paperCache = new WeakMap<p5, p5.Graphics>();

export function drawPaper(p: p5) {
  let g = paperCache.get(p);
  if (!g) {
    g = p.createGraphics(W, H);
    g.background('#FFFFFF');
    g.stroke('#E9EEF7');
    g.strokeWeight(1);
    for (let x = 0; x <= W; x += 10) g.line(x + 0.5, 0, x + 0.5, H);
    for (let y = 0; y <= H; y += 10) g.line(0, y + 0.5, W, y + 0.5);
    g.stroke('#DCE4F2');
    for (let x = 0; x <= W; x += 40) g.line(x + 0.5, 0, x + 0.5, H);
    for (let y = 0; y <= H; y += 40) g.line(0, y + 0.5, W, y + 0.5);
    paperCache.set(p, g);
  }
  p.image(g, 0, 0);
}

/** Chữ căn giữa với nền trắng phía sau (nhãn số đo trên hình) */
export function labelBox(
  p: p5, x: number, y: number, label: string,
  col: string = COL.ink, size = 14, bg: [number, number, number, number] = [255, 255, 255, 235],
) {
  p.textSize(size);
  p.textStyle(p.BOLD);
  const w = p.textWidth(label) + 12;
  p.noStroke();
  p.fill(...bg);
  p.rect(x - w / 2, y - size * 0.75, w, size * 1.5, 4);
  p.fill(col);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(label, x, y);
  p.textStyle(p.NORMAL);
}

// ------------------------------------------------------------
// Mốc trên đường
// ------------------------------------------------------------
export function badge(p: p5, x: number, label: string, col: string) {
  p.fill(col);
  p.stroke(255);
  p.strokeWeight(2);
  p.circle(x, 126, 28);
  p.noStroke();
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text(label, x, 126);
  p.textStyle(p.NORMAL);
}

export interface RoadTickOptions {
  start?: string;
  startCol?: string;
  end?: string;
  endCol?: string;
  /** hiện "? km" thay cho số km */
  hide?: boolean;
  /** bỏ nhãn km gần vị trí này (ví dụ đường gạch chỗ gặp nhau) */
  skipX?: number | null;
}

/** Vạch km ven đường: 5 khoảng từ X0 đến X1, ứng với L km */
export function drawRoadTicks(p: p5, X0: number, X1: number, L: number, o: RoadTickOptions = {}) {
  for (let i = 0; i <= 5; i++) {
    const x = X0 + ((X1 - X0) * i) / 5;
    p.stroke(COL.text);
    p.strokeWeight(2);
    p.line(x, 148, x, 159);
    p.noStroke();
    if (i === 0 && o.start) badge(p, x, o.start, o.startCol ?? COL.ink);
    else if (i === 5 && o.end) badge(p, x, o.end, o.endCol ?? COL.ink);
    else if (o.skipX == null || Math.abs(x - o.skipX) > 30) {
      p.fill(COL.text);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.textSize(12);
      p.textStyle(p.NORMAL);
      p.text(o.hide ? '? km' : `${fmt((L * i) / 5, 1)} km`, x, 143);
    }
  }
}

// ------------------------------------------------------------
// Đường kẻ, nhãn, ngoặc đo
// ------------------------------------------------------------
export function dashedLine(
  p: p5, x1: number, y1: number, x2: number, y2: number,
  col: string, w = 2, pattern: number[] = [6, 6],
) {
  p.stroke(col);
  p.strokeWeight(w);
  ctx2d(p).setLineDash(pattern);
  p.line(x1, y1, x2, y2);
  ctx2d(p).setLineDash([]);
}

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Nhãn vàng trên cao khi có kết quả; `since` là performance.now() lúc có kết quả */
export function topTag(p: p5, x: number, label: string, since: number) {
  const a = reduceMotion() ? 255 : 255 * Math.min((performance.now() - since) / 350, 1);
  p.textSize(15);
  p.textStyle(p.BOLD);
  const w = p.textWidth(label) + 28;
  const cx = p.constrain(x, w / 2 + 10, W - w / 2 - 10);
  p.noStroke();
  p.fill(255, 227, 110, a);
  p.rect(cx - w / 2, 22, w, 34, 17);
  p.fill(59, 42, 140, a);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(label, cx, 39);
  p.textStyle(p.NORMAL);
}

/** Nhãn trắng nhỏ trên dải cỏ dưới đường */
export function roadsideTag(p: p5, x: number, label: string, col: string, alignRight = false) {
  p.textSize(12);
  p.textStyle(p.BOLD);
  const w = p.textWidth(label) + 20;
  const left = alignRight ? x - w : x;
  p.noStroke();
  p.fill(255, 255, 255, 235);
  p.rect(left, ROAD_BOT + 1, w, 18, 9);
  p.fill(col);
  p.textAlign(p.LEFT, p.CENTER);
  p.text(label, left + 10, ROAD_BOT + 10);
  p.textStyle(p.NORMAL);
}

/** Ngoặc đo đoạn x1..x2 kèm nhãn (nhãn ra ngoài nếu đoạn quá ngắn) */
export function bracket(p: p5, x1: number, x2: number, y: number, label: string, col: string) {
  p.stroke(col);
  p.strokeWeight(1.5);
  p.line(x1, y, x2, y);
  p.line(x1, y - 6, x1, y + 6);
  p.line(x2, y - 6, x2, y + 6);
  p.noStroke();
  p.textSize(13);
  p.textStyle(p.BOLD);
  const lw = p.textWidth(label);
  if (x2 - x1 > lw + 16) {
    p.fill(255);
    p.rect((x1 + x2) / 2 - lw / 2 - 6, y - 10, lw + 12, 20);
    p.fill(col);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(label, (x1 + x2) / 2, y);
  } else {
    p.fill(col);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(label, x2 + 10, y);
  }
  p.textStyle(p.NORMAL);
}

/** Mũi tên hai đầu đo toàn bộ đoạn, nhãn ở giữa */
export function spanArrow(p: p5, x1: number, x2: number, y: number, label: string) {
  p.stroke(COL.muted);
  p.strokeWeight(1.5);
  p.line(x1, y, x2, y);
  p.line(x1, y, x1 + 8, y - 5);
  p.line(x1, y, x1 + 8, y + 5);
  p.line(x2, y, x2 - 8, y - 5);
  p.line(x2, y, x2 - 8, y + 5);
  p.noStroke();
  p.textSize(14);
  p.textStyle(p.BOLD);
  const tw = p.textWidth(label) + 16;
  p.fill(255);
  p.rect((x1 + x2) / 2 - tw / 2, y - 11, tw, 22);
  p.fill(COL.ink);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(label, (x1 + x2) / 2, y);
  p.textStyle(p.NORMAL);
}

/** Đoạn thẳng gốc của sơ đồ, có vạch ở hai đầu */
export function segment(p: p5, x1: number, x2: number, y: number, endTick = true) {
  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(x1, y, x2, y);
  p.line(x1, y - 8, x1, y + 8);
  if (endTick) p.line(x2, y - 8, x2, y + 8);
}

/** Chữ đậm căn giữa (tên điểm A, B, C trên sơ đồ…) */
export function pointLabel(p: p5, x: number, y: number, label: string, col: string = COL.text, size = 16) {
  p.noStroke();
  p.fill(col);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(size);
  p.textStyle(p.BOLD);
  p.text(label, x, y);
  p.textStyle(p.NORMAL);
}
