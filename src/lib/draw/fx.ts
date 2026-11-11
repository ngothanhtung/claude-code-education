import type p5 from 'p5';

/**
 * Hiệu ứng thí nghiệm "giống thật" cho các bài Hóa học, vẽ bằng p5 (2D, nhẹ cho máy chiếu):
 * cốc thủy tinh có độ dày và vệt sáng, dung dịch đổi màu dần có mặt khum, thanh kim loại có ánh kim,
 * bọt khí sinh ra trên bề mặt kim loại rồi nổi nhanh dần và vỡ ở mặt thoáng, tinh thể kim loại bám dần.
 * Mọi hạt tính từ thời gian (performance.now) và chỉ số hạt nên hàm vẫn không lưu trạng thái.
 */

type Ctx = CanvasRenderingContext2D;

/** Số giả ngẫu nhiên ổn định theo chỉ số (0..1) */
export const rand = (i: number, seed = 0) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function hexRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
const shade = (hex: string, k: number) => {
  const [r, g, b] = hexRgb(hex).map((v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))));
  return `rgb(${r},${g},${b})`;
};

export interface Beaker {
  x: number; // tâm
  yBottom: number;
  w: number;
  h: number;
}

/** Mặt thoáng chất lỏng trong cốc */
export const surfaceY = (b: Beaker, level: number) => b.yBottom - 6 - (b.h - 10) * level;

/** Chất lỏng: gradient đậm dần xuống đáy, mặt khum sáng ở thành cốc */
export function liquid(p: p5, b: Beaker, level: number, col: string) {
  const ctx = p.drawingContext as Ctx;
  const l = b.x - b.w / 2 + 4;
  const r = b.x + b.w / 2 - 4;
  const top = surfaceY(b, level);
  const bot = b.yBottom - 5;
  const g = ctx.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, rgba(col, 0.55));
  g.addColorStop(1, rgba(col, 0.92));
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(l, top - 4);
  ctx.quadraticCurveTo(l + 6, top, l + 16, top);
  ctx.lineTo(r - 16, top);
  ctx.quadraticCurveTo(r - 6, top, r, top - 4);
  ctx.lineTo(r, bot - 8);
  ctx.quadraticCurveTo(r, bot, r - 8, bot);
  ctx.lineTo(l + 8, bot);
  ctx.quadraticCurveTo(l, bot, l, bot - 8);
  ctx.closePath();
  ctx.fill();
  // mặt thoáng
  ctx.strokeStyle = rgba('#FFFFFF', 0.75);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(l + 14, top + 1);
  ctx.lineTo(r - 14, top + 1);
  ctx.stroke();
  ctx.restore();
}

/** Thành cốc thủy tinh có độ dày, miệng loe, vạch chia và vệt phản chiếu */
export function glassBeaker(p: p5, b: Beaker) {
  const ctx = p.drawingContext as Ctx;
  const l = b.x - b.w / 2;
  const r = b.x + b.w / 2;
  const top = b.yBottom - b.h;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(120,138,170,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(l - 8, top);
  ctx.quadraticCurveTo(l, top + 2, l, top + 12);
  ctx.lineTo(l, b.yBottom - 12);
  ctx.quadraticCurveTo(l, b.yBottom, l + 12, b.yBottom);
  ctx.lineTo(r - 12, b.yBottom);
  ctx.quadraticCurveTo(r, b.yBottom, r, b.yBottom - 12);
  ctx.lineTo(r, top);
  ctx.stroke();
  // lớp thủy tinh mờ bên trong
  ctx.strokeStyle = 'rgba(200,214,236,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(l + 3, top + 12);
  ctx.lineTo(l + 3, b.yBottom - 12);
  ctx.moveTo(r - 3, top + 4);
  ctx.lineTo(r - 3, b.yBottom - 12);
  ctx.stroke();
  // vệt phản chiếu
  const hl = ctx.createLinearGradient(l + 8, 0, l + 26, 0);
  hl.addColorStop(0, 'rgba(255,255,255,0)');
  hl.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl;
  ctx.fillRect(l + 8, top + 18, 18, b.h - 40);
  // vạch chia
  ctx.strokeStyle = 'rgba(120,138,170,0.7)';
  ctx.lineWidth = 1.2;
  for (let k = 1; k <= 4; k++) {
    const y = b.yBottom - (b.h * k) / 5;
    ctx.beginPath();
    ctx.moveTo(r - (k % 2 ? 22 : 14), y);
    ctx.lineTo(r - 4, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Thanh kim loại có ánh kim (gradient ngang) và mép bo */
export function metalStrip(p: p5, x: number, top: number, w: number, h: number, col: string) {
  const ctx = p.drawingContext as Ctx;
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, shade(col, -0.35));
  g.addColorStop(0.25, shade(col, 0.45));
  g.addColorStop(0.55, col);
  g.addColorStop(1, shade(col, -0.45));
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, top, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = shade(col, -0.5);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export interface FizzSource {
  /** vùng sinh bọt: bề mặt kim loại ngập trong chất lỏng */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/**
 * Bọt khí: sinh ra trên bề mặt kim loại, lớn dần khi bám rồi tách ra, nổi nhanh dần,
 * lắc nhẹ, vỡ thành vòng nhỏ ở mặt thoáng. rate 0..1 (Mg mạnh, Fe yếu).
 */
export function fizz(p: p5, src: FizzSource, surface: number, rate: number, seed = 0) {
  if (rate <= 0) return;
  const ctx = p.drawingContext as Ctx;
  const now = performance.now() / 1000;
  const n = Math.round(10 + rate * 46);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const period = 1.6 + rand(i, seed) * 1.6 - rate * 0.6;
    const ph = (now / period + rand(i, seed + 1)) % 1;
    const sx = src.x0 + (src.x1 - src.x0) * rand(i, seed + 2);
    const sy = src.y0 + (src.y1 - src.y0) * rand(i, seed + 3);
    const r0 = 1.4 + rand(i, seed + 4) * (1.6 + rate * 2.2);
    const grow = 0.18; // thời gian bám trên bề mặt
    if (ph < grow) {
      const r = r0 * (0.4 + (0.6 * ph) / grow);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.strokeStyle = 'rgba(96,118,158,0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      continue;
    }
    const u = (ph - grow) / (1 - grow);
    const dist = sy - surface;
    const y = sy - dist * (u * u * 0.6 + u * 0.4); // nổi nhanh dần
    const x = sx + Math.sin(u * 9 + i) * (2 + u * 3);
    if (y <= surface + 2) {
      // vỡ ở mặt thoáng
      const k = Math.min(1, (surface + 2 - y) / 6);
      ctx.strokeStyle = `rgba(96,118,158,${0.7 * (1 - k)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, surface, r0 + 4 * k, 1.5 + k, 0, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    const r = r0 * (1 + 0.35 * u);
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.7, 'rgba(225,235,248,0.35)');
    g.addColorStop(1, 'rgba(170,190,220,0.7)');
    ctx.fillStyle = g;
    ctx.strokeStyle = 'rgba(96,118,158,0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Kim loại bám lên thanh: tinh thể nhỏ mọc dần từ dưới lên, dày dần, có hạt rời lắng xuống đáy.
 * progress 0..1; col là màu kim loại tạo thành (Cu đỏ gạch, Ag xám bạc, Fe xám).
 */
export function deposit(p: p5, x: number, w: number, yTop: number, yBot: number, progress: number, col: string, floor: number, seed = 0) {
  if (progress <= 0) return;
  const ctx = p.drawingContext as Ctx;
  const n = 420;
  const front = yBot - (yBot - yTop) * Math.min(1, progress * 1.25); // mặt phản ứng lan từ dưới lên
  ctx.save();
  for (let i = 0; i < n * progress; i++) {
    const side = rand(i, seed) < 0.5 ? -1 : 1;
    const y = yBot - (yBot - yTop) * Math.pow(rand(i, seed + 1), 1.3);
    if (y < front) continue;
    // phần lớn bám sát hai mép và mặt thanh, lớp dày dần ra ngoài
    const bx = x + side * (w / 2) * rand(i, seed + 7) ** 0.4 + side * rand(i, seed + 2) * 4 * progress;
    const s = 1 + rand(i, seed + 3) * 2.2 * (0.5 + progress);
    const k = rand(i, seed + 4);
    ctx.fillStyle = k < 0.33 ? shade(col, -0.25) : k < 0.66 ? col : shade(col, 0.25);
    ctx.beginPath();
    // tinh thể dạng đa giác nhỏ
    const sides = 5;
    for (let j = 0; j < sides; j++) {
      const a = (j / sides) * Math.PI * 2 + rand(i, seed + 5) * 2;
      const rr = s * (0.6 + 0.6 * rand(i * 7 + j, seed + 6));
      const px = bx + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  // vụn kim loại rơi lắng xuống đáy
  const flakes = Math.round(40 * progress);
  for (let i = 0; i < flakes; i++) {
    const fx = x + (rand(i, seed + 8) - 0.5) * w * 6;
    const fy = floor - rand(i, seed + 9) * 4 * progress;
    ctx.fillStyle = rand(i, seed + 10) < 0.5 ? col : shade(col, -0.3);
    ctx.fillRect(fx, fy - 2, 2 + rand(i, seed + 11) * 3, 2);
  }
  ctx.restore();
}

/** Vết rỗ trên thanh kim loại khi bị acid ăn mòn */
export function pits(p: p5, x: number, w: number, yTop: number, yBot: number, progress: number, seed = 0) {
  if (progress <= 0) return;
  const ctx = p.drawingContext as Ctx;
  ctx.save();
  for (let i = 0; i < 60 * progress; i++) {
    const px = x + (rand(i, seed) - 0.5) * (w - 4);
    const py = yTop + (yBot - yTop) * rand(i, seed + 1);
    ctx.fillStyle = 'rgba(40,44,56,0.35)';
    ctx.beginPath();
    ctx.ellipse(px, py, 1 + rand(i, seed + 2) * 1.8, 0.8 + rand(i, seed + 3), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
