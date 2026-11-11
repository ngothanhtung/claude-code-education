import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, clamp01 } from '@/lib/draw/geometry';
import { withAlpha } from '@/lib/draw/lab';
import { drawCar } from '@/lib/draw/vehicles';
import { drawPaper, labelBox } from '@/lib/draw/scene';

export interface CarbonScene {
  mode: 'xang' | 'than' | 'cay';
  /** chữ hiển thị: CO₂ thải ra, CO₂ hấp thụ */
  emitText: string;
  absorbText: string;
  t: number;
  started: boolean;
  done: boolean;
}

function arrow(p: p5, x1: number, y1: number, x2: number, y2: number, col: string, k: number) {
  if (k <= 0) return;
  const x = x1 + (x2 - x1) * k;
  const y = y1 + (y2 - y1) * k;
  p.stroke(col);
  p.strokeWeight(5);
  p.line(x1, y1, x, y);
  if (k >= 1) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    p.noStroke();
    p.fill(col);
    p.triangle(x2 + Math.cos(a) * 12, y2 + Math.sin(a) * 12, x2 + Math.cos(a + 2.4) * 12, y2 + Math.sin(a + 2.4) * 12, x2 + Math.cos(a - 2.4) * 12, y2 + Math.sin(a - 2.4) * 12);
  }
}

/** Chu trình carbon: đốt nhiên liệu thải CO₂ lên khí quyển, cây xanh và đại dương hấp thụ lại */
export function drawCarbon(p: p5, s: CarbonScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  const emitting = s.mode !== 'cay';

  // khí quyển
  p.noStroke();
  p.fill(withAlpha('#9AA3B5', 0.18 + 0.25 * (emitting ? k : 1 - 0.5 * k)));
  p.ellipse(400, 110, 420, 120);
  labelBox(p, 400, 100, 'CO₂ trong khí quyển', COL.text, 16);
  labelBox(p, 400, 130, emitting ? `+ ${s.emitText}` : `− ${s.absorbText}`, emitting ? COL.aText : COL.bText, 15);

  // mặt đất, đại dương
  p.fill('#E9DFCF');
  p.rect(0, 380, 560, 120);
  p.fill('#9CCBEF');
  p.rect(560, 380, 240, 120);
  labelBox(p, 680, 440, 'đại dương hấp thụ CO₂', '#2D5BBF', 12);

  // nguồn phát thải
  if (s.mode === 'xang') {
    drawCar(p, 140, 362, COL.a, 1, performance.now() / 10);
    p.fill(withAlpha('#5B6478', 0.4));
    for (let i = 0; i < 4; i++) p.circle(92 - i * 12, 356 - i * 10 - ((performance.now() / 30) % 10), 12 + i * 4);
    labelBox(p, 140, 410, 'xe máy, ô tô đốt xăng', COL.text, 12);
  } else {
    p.fill('#5B6478');
    p.rect(90, 260, 110, 120);
    p.rect(120, 190, 22, 70);
    p.rect(160, 210, 22, 50);
    p.fill(withAlpha('#5B6478', 0.4));
    for (let i = 0; i < 4; i++) p.circle(131 + i * 8, 176 - i * 16 - ((performance.now() / 30) % 16), 16 + i * 5);
    labelBox(p, 145, 410, 'nhà máy nhiệt điện đốt than', COL.text, 12);
  }
  arrow(p, 200, 250, 300, 160, COL.a, emitting ? k : 1);
  labelBox(p, 270, 222, 'đốt cháy', COL.aText, 12);

  // cây xanh hấp thụ
  for (let i = 0; i < 3; i++) {
    const x = 380 + i * 60;
    p.noStroke();
    p.fill('#8C6A2A');
    p.rect(x - 5, 330, 10, 50);
    p.fill(i === 1 ? '#3DBE5A' : '#4FA85A');
    p.circle(x, 315, 54);
  }
  arrow(p, 520, 160, 460, 270, COL.b, emitting ? 1 : k);
  labelBox(p, 530, 232, 'quang hợp', COL.bText, 12);
  arrow(p, 600, 150, 680, 360, '#3D6FD8', 1);

  // nhiệt kế ấm lên
  const tx = 740;
  p.fill('#FFFFFF');
  p.stroke('#7C8AA5');
  p.strokeWeight(2);
  p.rect(tx - 8, 90, 16, 150, 8);
  p.circle(tx, 248, 26);
  p.noStroke();
  p.fill(COL.a);
  p.circle(tx, 248, 18);
  const lvl = 60 + (emitting ? 50 * k : 50 - 20 * k);
  p.rect(tx - 4, 238 - lvl, 8, lvl);
  labelBox(p, tx - 30, 76, 'nhiệt độ Trái Đất', COL.aText, 11);

  if (!s.started) caption(p, 'Chu trình carbon: CO₂ đi qua khí quyển, sinh vật, đại dương');
  else if (!s.done) caption(p, emitting ? 'Đốt nhiên liệu hóa thạch thải thêm CO₂ vào khí quyển' : 'Cây xanh hấp thụ CO₂ nhờ quang hợp');
  else caption(p, emitting ? 'CO₂ tăng gây hiệu ứng nhà kính, Trái Đất ấm lên' : 'Trồng cây xanh giúp giảm lượng CO₂ trong khí quyển');
}
