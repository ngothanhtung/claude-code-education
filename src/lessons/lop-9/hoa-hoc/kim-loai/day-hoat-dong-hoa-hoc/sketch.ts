import type p5 from 'p5';
import { ACTIVITY } from '@/lib/chem';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { deposit, fizz, glassBeaker, liquid, metalStrip, pits, surfaceY, type Beaker } from '@/lib/draw/fx';
import { mix } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface SeriesScene {
  metal: string;
  /** nguyên tố trong dung dịch bị đẩy ra (H, Cu, Ag, Fe) */
  cation: string;
  reacts: boolean;
  isAcid: boolean;
  metalCol: string;
  /** mức hoạt động 0..1: tốc độ phản ứng và lượng bọt khí (Mg mạnh, Fe yếu) */
  speed: number;
  /** màu lớp kim loại bám vào thanh, màu dung dịch trước và sau */
  coatCol: string;
  solCol: string;
  solAfter: string;
  solLabel: string;
  equation: string;
  t: number; // 0..1 nhúng thanh kim loại, 1..2 phản ứng
  started: boolean;
  done: boolean;
}

export function drawSeries(p: p5, s: SeriesScene) {
  drawPaper(p);
  drawActivityRow(p, s);

  // tiến độ phản ứng: kim loại càng hoạt động thì phản ứng càng nhanh lúc đầu
  const u = clamp01(s.t - 1);
  const r = s.reacts ? 1 - Math.pow(1 - u, 1 + 2 * s.speed) : 0;
  const b: Beaker = { x: 300, yBottom: 420, w: 200, h: 190 };
  const level = 0.72;
  const surface = surfaceY(b, level);
  liquid(p, b, level, mix(s.solCol, s.solAfter, r));

  // thanh kim loại nhúng xuống; bị acid ăn mòn thì mỏng dần
  const dip = clamp01(s.t);
  const top = 150 + dip * 70;
  const h = 196;
  const wStrip = s.isAcid ? 28 * (1 - 0.3 * r) : 28;
  metalStrip(p, b.x, top, wStrip, h, s.metalCol);
  const wet0 = Math.max(top, surface);
  if (s.reacts && s.isAcid) {
    pits(p, b.x, wStrip, wet0, top + h, r, 3);
    // bọt H2 mạnh lúc đầu, yếu dần khi kim loại tan bớt
    const rate = s.started ? s.speed * (1 - 0.75 * r) : 0;
    if (s.t >= 1) fizz(p, { x0: b.x - wStrip / 2 - 3, x1: b.x + wStrip / 2 + 3, y0: wet0 + 6, y1: top + h - 2 }, surface, rate, 1);
  } else if (s.reacts) {
    deposit(p, b.x, wStrip, wet0 + 4, top + h, r, s.coatCol, b.yBottom - 6, 2);
  }
  glassBeaker(p, b);
  labelBox(p, b.x, b.yBottom + 22, s.solLabel, COL.muted, 13);
  // nhãn bên phải phần thanh chưa ngập (không đặt trên đầu thanh để khỏi chạm dòng chú thích y = 132)
  labelBox(p, b.x + 62, top + 20, `thanh ${s.metal}`, COL.text, 13);

  // phương trình hoặc kết luận
  // kết luận chỉ hiện khi thanh đã nhúng vào dung dịch (đề hỏi "phản ứng có xảy ra không?")
  if (s.t >= 1) {
    labelBox(p, 600, 300, s.reacts ? 'Có phản ứng' : 'Không phản ứng', s.reacts ? COL.aText : COL.muted, 18);
    if (s.reacts) labelBox(p, 600, 340, s.equation, COL.ink, 16);
  }

  if (!s.started) caption(p, 'So sánh vị trí hai nguyên tố trong dãy hoạt động hóa học', 132);
  else if (!s.reacts) caption(p, `${s.metal} đứng sau ${s.cation}: không có hiện tượng gì`, 132);
  else if (!s.done) caption(p, s.isAcid ? `${s.metal} đứng trước H: có bọt khí hydrogen` : `${s.metal} đẩy ${s.cation} ra khỏi dung dịch muối`, 132);
  else caption(p, s.isAcid ? 'Kim loại tan, khí hydrogen thoát ra' : `Lớp ${s.cation} bám vào thanh ${s.metal}`, 132);
}

/** Hàng dãy hoạt động, tô kim loại (đỏ) và nguyên tố trong dung dịch (xanh) */
function drawActivityRow(p: p5, s: SeriesScene) {
  const w = 52;
  const x0 = 400 - (ACTIVITY.length * w) / 2;
  const y = 40;
  p.textAlign(p.CENTER, p.CENTER);
  ACTIVITY.forEach((el, i) => {
    const x = x0 + i * w;
    const isM = el === s.metal;
    const isC = el === s.cation;
    p.stroke(isM ? COL.a : isC ? COL.b : '#C9D3EA');
    p.strokeWeight(isM || isC ? 3 : 1.5);
    p.fill(isM ? '#FDE3E1' : isC ? '#D8F2EE' : '#FFFFFF');
    p.rect(x + 3, y, w - 6, 40, 6);
    p.noStroke();
    p.fill(isM ? COL.aText : isC ? COL.bText : COL.text);
    p.textSize(17);
    p.textStyle(p.BOLD);
    p.text(el, x + w / 2, y + 20);
  });
  p.textStyle(p.NORMAL);
  p.fill(COL.muted);
  p.textSize(12);
  p.textAlign(p.LEFT, p.CENTER);
  p.text('mạnh', x0, y + 54);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text('yếu', x0 + ACTIVITY.length * w, y + 54);
  p.stroke(COL.muted);
  p.strokeWeight(1.5);
  p.line(x0 + 40, y + 54, x0 + ACTIVITY.length * w - 34, y + 54);
  p.noStroke();
  p.fill(COL.muted);
  const xe = x0 + ACTIVITY.length * w - 34;
  p.triangle(xe, y + 54, xe - 8, y + 50, xe - 8, y + 58);
  labelBox(p, 400, y + 54, 'mức độ hoạt động hóa học giảm dần', COL.muted, 12);
}
