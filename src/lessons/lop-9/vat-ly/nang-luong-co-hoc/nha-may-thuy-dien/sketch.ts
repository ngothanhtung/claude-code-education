import type p5 from 'p5';
import { COL } from '@/lib/draw/colors';
import { caption, ease, phase } from '@/lib/draw/geometry';
import { drawPaper, labelBox } from '@/lib/draw/scene';
import { fmt } from '@/lib/format';

const SURFACE_Y = 130; // mặt nước hồ chứa
const TURBINE: [number, number] = [470, 392];
const PIPE_START: [number, number] = [262, 170];

export interface DamScene {
  h: number;
  efficiency: number; // %
  /** công suất dòng nước và công suất điện (W) */
  Pw: number;
  Pe: number;
  t: number; // 0..2
  started: boolean;
  done: boolean;
}

const WATER = '#9CCBEF';
const WATER_DEEP = '#6FAEE0';

export function drawDam(p: p5, s: DamScene) {
  drawPaper(p);
  const flow = ease(phase(s.t, 0));
  const fill = ease(phase(s.t, 1));

  // hồ chứa
  p.noStroke();
  p.fill(WATER);
  p.beginShape();
  p.vertex(40, SURFACE_Y);
  p.vertex(250, SURFACE_Y);
  p.vertex(250, 420);
  p.vertex(40, 420);
  p.endShape(p.CLOSE);
  p.stroke(WATER_DEEP);
  p.strokeWeight(2);
  for (let x = 50; x < 240; x += 34) p.line(x, SURFACE_Y + 6, x + 16, SURFACE_Y + 6);

  // đập
  p.noStroke();
  p.fill('#A7AFBF');
  p.beginShape();
  p.vertex(250, SURFACE_Y - 20);
  p.vertex(280, SURFACE_Y - 20);
  p.vertex(330, 420);
  p.vertex(250, 420);
  p.endShape(p.CLOSE);

  // mặt đất phía hạ lưu
  p.fill('#C9B79C');
  p.rect(0, 420, 800, 14);

  // ống dẫn nước từ hồ xuống tuabin
  p.stroke('#5B6478');
  p.strokeWeight(16);
  p.line(PIPE_START[0], PIPE_START[1], TURBINE[0] - 30, TURBINE[1]);
  p.stroke(WATER);
  p.strokeWeight(10);
  p.line(PIPE_START[0], PIPE_START[1], TURBINE[0] - 30, TURBINE[1]);
  if (s.started) {
    // giọt nước chạy trong ống
    p.noStroke();
    p.fill(WATER_DEEP);
    const now = performance.now() / 1000;
    for (let k = 0; k < 8; k++) {
      const u = (now * 0.6 + k / 8) % 1;
      if (u > flow) continue;
      const x = PIPE_START[0] + (TURBINE[0] - 30 - PIPE_START[0]) * u;
      const y = PIPE_START[1] + (TURBINE[1] - PIPE_START[1]) * u;
      p.circle(x, y, 7);
    }
  }

  // độ chênh mực nước h
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  p.stroke(COL.ink);
  p.strokeWeight(1.5);
  ctx.setLineDash([5, 5]);
  p.line(280, SURFACE_Y, 635, SURFACE_Y);
  p.line(TURBINE[0] + 86, TURBINE[1], 635, TURBINE[1]);
  ctx.setLineDash([]);
  p.line(620, SURFACE_Y, 620, TURBINE[1]);
  p.line(613, SURFACE_Y, 627, SURFACE_Y);
  p.line(613, TURBINE[1], 627, TURBINE[1]);
  labelBox(p, 620, (SURFACE_Y + TURBINE[1]) / 2 - 20, `h = ${fmt(s.h)} m`, COL.ink, 14);

  // tuabin + máy phát
  p.push();
  p.translate(TURBINE[0], TURBINE[1]);
  p.noStroke();
  p.fill('#5B6478');
  p.circle(0, 0, 60);
  p.rotate(s.started ? (performance.now() / 1000) * 6 * flow : 0);
  p.fill('#DDE3EE');
  for (let k = 0; k < 6; k++) {
    p.rotate(Math.PI / 3);
    p.ellipse(13, 0, 24, 9);
  }
  p.pop();
  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(12);
  p.textStyle(p.BOLD);
  p.text('tuabin', TURBINE[0], TURBINE[1] + 44);
  p.fill('#3A4152');
  p.rect(TURBINE[0] + 36, TURBINE[1] - 24, 50, 48, 6);
  p.fill(255);
  p.text('máy', TURBINE[0] + 61, TURBINE[1] - 6);
  p.text('phát', TURBINE[0] + 61, TURBINE[1] + 8);

  // dây điện
  p.stroke(COL.text);
  p.strokeWeight(2);
  p.line(TURBINE[0] + 86, TURBINE[1] - 10, 740, 300);
  p.line(740, 300, 740, 420);
  p.line(725, 320, 755, 320);
  if (s.started && flow > 0.5) {
    p.noStroke();
    p.fill(255, 200, 40);
    p.triangle(744, 260, 732, 284, 742, 284);
    p.triangle(742, 280, 752, 280, 736, 304);
  }

  drawFlow(p, s, fill);

  if (!s.started) caption(p, 'Nước trong hồ chứa ở trên cao có thế năng');
  else if (s.t < 1) caption(p, 'Nước chảy xuống: thế năng chuyển thành động năng, làm quay tuabin');
  else if (!s.done) caption(p, 'Máy phát chuyển động năng của tuabin thành điện năng');
  else caption(p, `Chỉ ${s.efficiency}% năng lượng của nước thành điện năng, phần còn lại hao phí`);
}

/** Sơ đồ dòng năng lượng ở góc trên bên phải */
function drawFlow(p: p5, s: DamScene, k: number) {
  const x0 = 330;
  const y = 72;
  const boxes: [string, string, string][] = [
    ['Thế năng', COL.b, s.done ? `${fmt(s.Pw / 1e6, 3)} MW` : '? MW'],
    ['Động năng', COL.aLight, ''],
    ['Điện năng', COL.ink, s.done ? `${fmt(s.Pe / 1e6, 3)} MW` : '? MW'],
  ];
  boxes.forEach(([name, col, val], i) => {
    const x = x0 + i * 150;
    const on = k > i / 3;
    p.noStroke();
    p.fill(on ? col : '#E6EAF2');
    p.rect(x, y - 24, 120, 48, 8);
    p.fill(on ? '#FFFFFF' : COL.muted);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.textStyle(p.BOLD);
    p.text(name, x + 60, y - (val ? 8 : 0));
    if (val) {
      p.textSize(12);
      p.text(val, x + 60, y + 11);
    }
    if (i < 2) {
      p.fill(COL.muted);
      p.triangle(x + 128, y - 7, x + 128, y + 7, x + 142, y);
    }
  });
  if (k >= 1) {
    labelBox(p, x0 + 360, y + 36, `hao phí ${100 - s.efficiency}% (nhiệt, ma sát)`, COL.restText, 12);
  }
  p.textStyle(p.NORMAL);
}
