import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { arrow, arrowHead, caption, clamp01, ease, lerp } from '@/lib/draw/geometry';
import { dashedLine, drawPaper, labelBox } from '@/lib/draw/scene';
import { drawCar, drawMoto } from '@/lib/draw/vehicles';
import { contactShadow, shadedSphere } from '@/lib/draw/fx';

export type Shape = 'ball' | 'iron' | 'moto' | 'car';

export interface KineticScene {
  shape: Shape;
  /** nhãn đã định dạng ("0,5 kg", "?") */
  mText: string;
  vText: string;
  WText: string;
  /** tỉ lệ động năng so với mức lớn nhất của vật (0..1), quyết định khúc gỗ trượt xa bao nhiêu */
  ratio: number;
  t: number; // 0..1 vật lao tới, 1..2 đẩy khúc gỗ
  started: boolean;
  done: boolean;
}

const FLOOR = 290;
const START = 110;
const BLOCK_X = 470; // mép trái khúc gỗ lúc đầu
const BLOCK_W = 70;
const BLOCK_H = 46;
const SLIDE_MAX = 230;

/** nửa chiều dài vật (để mũi vật chạm khúc gỗ) */
const HALF: Record<Shape, number> = { ball: 22, iron: 26, moto: 34, car: 48 };

export function drawKinetic(p: p5, s: KineticScene) {
  drawPaper(p);
  const approach = ease(clamp01(s.t));
  const push = clamp01(s.t - 1);
  // trượt chậm dần: quãng đường tăng nhanh rồi chậm lại
  const slide = SLIDE_MAX * Math.sqrt(clamp01(s.ratio)) * (1 - (1 - push) ** 2);
  const half = HALF[s.shape];
  const contact = BLOCK_X - half;
  const x = s.t <= 1 ? lerp(START, contact, approach) : contact + slide;
  const moving = s.started && !s.done;

  // sàn
  p.noStroke();
  p.fill('#E9DFCF');
  p.rect(40, FLOOR, 720, 16);
  p.stroke('#8C7A60');
  p.strokeWeight(2);
  p.line(40, FLOOR, 760, FLOOR);

  // khúc gỗ
  const bx = BLOCK_X + (s.t > 1 ? slide : 0);
  contactShadow(p, bx + BLOCK_W / 2, FLOOR, BLOCK_W * 1.05);
  p.noStroke();
  p.fill('#C99A62');
  p.rect(bx, FLOOR - BLOCK_H, BLOCK_W, BLOCK_H, 3);
  p.stroke('#9C7444');
  p.strokeWeight(1.5);
  for (let k = 1; k < 3; k++) p.line(bx + 6, FLOOR - (BLOCK_H * k) / 3, bx + BLOCK_W - 6, FLOOR - (BLOCK_H * k) / 3);
  labelBox(p, bx + BLOCK_W / 2, FLOOR - BLOCK_H - 16, 'khúc gỗ', COL.muted, 12);

  // vật
  drawObject(p, s.shape, x, s.t <= 1 ? approach * 600 : 600 + slide);
  labelBox(p, x, FLOOR - 100, `m = ${s.mText}`, COL.text, 13);

  // mũi tên vận tốc khi vật đang lao tới
  if (s.t < 1) {
    const y = FLOOR - 74;
    arrow(p, x - 10, y, x + 60, y, COL.aText);
    labelBox(p, x + 112, y, `v = ${s.vText}`, COL.aText, 13);
  }

  // quãng đường khúc gỗ bị đẩy đi
  if (s.t > 1) {
    const y = FLOOR + 40;
    dashedLine(p, BLOCK_X, FLOOR + 18, BLOCK_X, y + 8, COL.muted, 1.2, [3, 3]);
    dashedLine(p, bx, FLOOR + 18, bx, y + 8, COL.muted, 1.2, [3, 3]);
    p.stroke(COL.ink);
    p.strokeWeight(2);
    p.line(BLOCK_X, y, bx, y);
    if (bx - BLOCK_X > 30) {
      arrowHead(p, bx, y, 0, COL.ink, 8, 5);
      labelBox(p, (BLOCK_X + bx) / 2, y + 20, 'khúc gỗ bị đẩy đi', COL.ink, 12);
    }
  }

  // thanh động năng
  drawEnergyBar(p, s);

  if (!s.started) caption(p, 'Vật chuyển động có động năng: nó có thể sinh công đẩy khúc gỗ');
  else if (moving && s.t < 1) caption(p, 'Vật lao tới khúc gỗ với vận tốc v');
  else if (!s.done) caption(p, 'Động năng của vật sinh công đẩy khúc gỗ đi một đoạn');
  else caption(p, 'Động năng càng lớn thì khúc gỗ bị đẩy đi càng xa');
}

function drawObject(p: p5, shape: Shape, x: number, travelled: number) {
  if (shape === 'car') {
    p.push();
    p.translate(x, FLOOR - 28);
    p.scale(1.5);
    drawCar(p, 0, 0, COL.a, 1, travelled);
    p.pop();
    return;
  }
  if (shape === 'moto') {
    p.push();
    p.translate(x, FLOOR - 26);
    p.scale(1.3);
    drawMoto(p, 0, 0, travelled);
    p.pop();
    return;
  }
  const r = HALF[shape];
  const cy = FLOOR - r;
  // bóng đổ mềm trên mặt bàn + quả cầu có khối; đường may xoay theo quãng đường để thấy vật lăn
  contactShadow(p, x, FLOOR, r * 2);
  shadedSphere(p, x, cy, r, shape === 'ball' ? COL.a : '#6B7385', { metal: shape === 'iron', spin: travelled / r });
}

function drawEnergyBar(p: p5, s: KineticScene) {
  const x0 = 140;
  const y = 430;
  const w = 520;
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.RIGHT, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text('Động năng Wđ', x0 - 12, y + 9);
  p.textStyle(p.NORMAL);
  p.fill(COL.track);
  p.rect(x0, y, w, 18, 9);
  // động năng của vật lúc lao tới (trước khi va chạm)
  const full = Math.max(0.04, Math.sqrt(clamp01(s.ratio)));
  p.fill(COL.a);
  p.rect(x0, y, w * full, 18, 9);
  labelBox(p, x0 + w / 2, y - 22, `Wđ = ½ × m × v² = ${s.WText}`, COL.aText, 14);
}
