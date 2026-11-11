import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01, lerp } from '@/lib/draw/geometry';
import { LIQ, amountBar, flame, withAlpha } from '@/lib/draw/lab';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface FuelScene {
  mode: 'nhiet' | 'dunnuoc' | 'co2';
  coal: boolean;
  flameCol: string;
  fuelLabel: string;
  equation: string;
  /** nhiệt độ nước đầu và cuối (°C) */
  t1: number;
  t2: number;
  /** thanh: nhiên liệu đã cháy, nhiệt lượng, CO2 (text đã định dạng) */
  fuelText: string;
  heatText: string;
  co2Text: string;
  t: number; // 0..1
  started: boolean;
  done: boolean;
}

export function drawFuel(p: p5, s: FuelScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  const burning = s.started && !s.done;
  const cx = 250;
  const base = 400;

  // bếp
  p.noStroke();
  p.fill('#3A3F4B');
  p.rect(cx - 110, base, 220, 26, 6);
  p.fill('#5B6478');
  p.rect(cx - 90, base - 14, 180, 14, 3);
  if (s.coal) {
    p.fill('#2B2B2B');
    for (let i = 0; i < 5; i++) p.circle(cx - 48 + i * 24, base - 22, 26 * (1 - 0.4 * k));
  }
  if (burning) {
    for (let i = -2; i <= 2; i++) flame(p, cx + i * 26, base - (s.coal ? 30 : 14), 38, s.flameCol);
  }

  // nồi nước (dạng đun nước)
  if (s.mode === 'dunnuoc') {
    const temp = lerp(s.t1, s.t2, k);
    p.fill('#9AA3B5');
    p.rect(cx - 100, base - 190, 200, 130, 0, 0, 14, 14);
    p.fill(LIQ.water);
    p.rect(cx - 92, base - 170, 184, 104, 0, 0, 10, 10);
    p.fill('#7C8AA5');
    p.rect(cx - 112, base - 196, 224, 10, 4);
    // hơi nước khi gần sôi
    if (temp > 90 && burning) {
      p.noFill();
      p.stroke(withAlpha('#9AA3B5', 0.7));
      p.strokeWeight(3);
      const now = performance.now() / 400;
      for (let i = 0; i < 3; i++) {
        const x = cx - 50 + i * 50;
        p.bezier(x, base - 205, x - 14, base - 230 - (now % 1) * 10, x + 14, base - 250, x, base - 275);
      }
    }
    // nhiệt kế
    const tx = cx + 140;
    p.noStroke();
    p.fill('#FFFFFF');
    p.stroke('#7C8AA5');
    p.strokeWeight(2);
    p.rect(tx - 9, 110, 18, 200, 9);
    p.circle(tx, 318, 30);
    p.noStroke();
    p.fill(COL.a);
    p.circle(tx, 318, 22);
    const hT = (190 * temp) / 110;
    p.rect(tx - 4, 306 - hT, 8, hT);
    labelBox(p, tx + 52, 306 - hT, `${Math.round(temp)} °C`, COL.aText, 14);
  } else {
    // nhiệt tỏa ra
    if (k > 0) {
      p.noFill();
      p.stroke(withAlpha('#F28C28', 0.5));
      p.strokeWeight(3);
      for (let i = 0; i < 4; i++) {
        const r = 60 + ((performance.now() / 20 + i * 40) % 160);
        p.arc(cx, base - 40, r * 2, r * 1.4, Math.PI * 1.1, Math.PI * 1.9);
      }
    }
  }
  // khói CO2
  if (s.mode === 'co2' && k > 0) {
    p.noStroke();
    for (let i = 0; i < 12 * k; i++) {
      p.fill(withAlpha('#9AA3B5', 0.35));
      p.circle(cx - 60 + ((i * 47) % 140), 140 - ((i * 29) % 70), 40 + (i % 3) * 10);
    }
    labelBox(p, cx, 110, 'khí CO₂ thải vào không khí', COL.muted, 13);
  }
  labelBox(p, cx, base + 44, s.fuelLabel, COL.text, 13);

  // các thanh
  const x = 560;
  amountBar(p, x, 150, 120, 1 - k, 'Nhiên liệu', s.fuelText, '#9AA3B5', COL.text);
  amountBar(p, x, 190, 120, k, 'Nhiệt lượng', s.heatText, '#F28C28', COL.restText);
  amountBar(p, x, 230, 120, k, 'CO₂', s.co2Text, '#5B6478', COL.text);
  labelBox(p, 400, 466, s.equation, COL.ink, 16);

  if (!s.started) caption(p, s.mode === 'dunnuoc' ? 'Dùng nhiên liệu đun nước' : 'Đốt cháy nhiên liệu');
  else if (!s.done) caption(p, s.mode === 'co2' ? 'Nhiên liệu cháy thải ra khí carbon dioxide' : 'Nhiên liệu cháy tỏa nhiệt');
  else caption(p, s.mode === 'dunnuoc' ? 'Chỉ một phần nhiệt lượng làm nóng nước (hiệu suất)' : 'Nhiên liệu đã cháy hết');
}
