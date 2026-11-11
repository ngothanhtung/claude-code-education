import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { GLASS_STROKE, withAlpha } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface AlcoholScene {
  /** thể tích dung dịch (mL) và độ cồn (°) */
  Vdd: number;
  deg: number;
  alcoholText: string;
  t: number; // 0..1 tách dần phần rượu nguyên chất
  started: boolean;
  done: boolean;
}

/** Ống đong rượu: phần rượu nguyên chất (tím nhạt) tách khỏi phần nước theo độ cồn */
export function drawAlcohol(p: p5, s: AlcoholScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  const x = 300;
  const top = 90;
  const bot = 420;
  const w = 110;
  const full = bot - top - 20;
  const hLiquid = full * Math.min(1, s.Vdd / 1000);
  const hAlc = hLiquid * (s.deg / 100) * k;
  // chất lỏng
  p.noStroke();
  p.fill(withAlpha('#CFE6F7', 0.9));
  p.rect(x - w / 2 + 3, bot - hLiquid, w - 6, hLiquid - 3, 0, 0, 8, 8);
  p.fill(withAlpha('#B7A6EE', 0.85));
  p.rect(x - w / 2 + 3, bot - hLiquid, w - 6, hAlc);
  // ống đong
  p.noFill();
  p.stroke(GLASS_STROKE);
  p.strokeWeight(2.5);
  p.rect(x - w / 2, top, w, bot - top, 0, 0, 10, 10);
  p.line(x - w / 2 - 30, bot, x + w / 2 + 30, bot);
  p.strokeWeight(1);
  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(11);
  for (let v = 0; v <= 1000; v += 100) {
    const y = bot - (full * v) / 1000;
    p.stroke(GLASS_STROKE);
    p.line(x + w / 2 - 18, y, x + w / 2, y);
    p.noStroke();
    p.fill(COL.muted);
    if (v % 200 === 0) p.text(`${v} mL`, x + w / 2 + 6, y);
  }
  labelBox(p, x - 160, bot - hLiquid / 2, `${s.Vdd} mL dung dịch`, COL.text, 13);
  if (k > 0) labelBox(p, x - 160, bot - hLiquid + hAlc / 2 - 18, `rượu nguyên chất: ${s.alcoholText}`, '#5B45B8', 13);

  // thẻ độ cồn
  const cx = 610;
  p.noStroke();
  p.fill('#FFFFFF');
  p.stroke('#C9D3EA');
  p.strokeWeight(1.5);
  p.rect(cx - 120, 150, 240, 170, 12);
  p.noStroke();
  p.fill(COL.ink);
  p.textAlign(p.CENTER, p.CENTER);
  p.textStyle(p.BOLD);
  p.textSize(46);
  p.text(`${s.deg}°`, cx, 205);
  p.textSize(14);
  p.text('độ cồn', cx, 245);
  p.textStyle(p.NORMAL);
  p.fill(COL.text);
  p.textSize(13);
  p.text(`100 mL dung dịch có ${s.deg} mL`, cx, 278);
  p.text('ethylic alcohol nguyên chất', cx, 298);

  if (!s.started) caption(p, `Rượu ${s.deg}°: trong 100 mL dung dịch có ${s.deg} mL ethylic alcohol`);
  else if (!s.done) caption(p, 'Tách riêng phần ethylic alcohol nguyên chất trong dung dịch');
  else caption(p, 'Khối lượng = thể tích × khối lượng riêng (0,8 g/mL)');
}
