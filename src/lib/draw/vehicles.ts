import type p5 from 'p5';
import { COL } from './colors';

/** Nửa chiều dài xe: đầu xe nằm ở tâm + HALF */
export const CAR_HALF = 32;
export const MOTO_HALF = 28;

/** Ô tô. dir = +1 đi sang phải, -1 đi sang trái. */
export function drawCar(p: p5, cx: number, cy: number, col: string, dir: 1 | -1, travelledPx: number) {
  p.push();
  p.translate(cx, cy);
  p.scale(dir, 1);
  p.noStroke();

  p.fill(0, 0, 0, 45);
  p.ellipse(0, 19, 62, 6);

  p.fill(col);
  p.rect(-32, -6, 64, 17, 6);
  p.beginShape();
  p.vertex(-21, -6);
  p.vertex(-13, -20);
  p.vertex(11, -20);
  p.vertex(21, -6);
  p.endShape(p.CLOSE);

  p.fill(226, 240, 255);
  p.beginShape();
  p.vertex(-17, -7);
  p.vertex(-11, -17);
  p.vertex(-2, -17);
  p.vertex(-2, -7);
  p.endShape(p.CLOSE);
  p.beginShape();
  p.vertex(1, -7);
  p.vertex(1, -17);
  p.vertex(10, -17);
  p.vertex(17, -7);
  p.endShape(p.CLOSE);

  p.fill('#FFF3B0');
  p.ellipse(30, 1, 5, 5);
  p.fill('#7A1E1E');
  p.rect(-32, -1, 3, 5, 1);

  // bánh xe lăn đúng theo quãng đường đã đi
  const ang = travelledPx / 8;
  drawWheel(p, -18, 11, ang);
  drawWheel(p, 18, 11, ang);
  p.pop();
}

function drawWheel(p: p5, x: number, y: number, ang: number) {
  p.push();
  p.translate(x, y);
  p.noStroke();
  p.fill('#22283A');
  p.circle(0, 0, 16);
  p.fill('#C9D0DD');
  p.circle(0, 0, 8);
  p.rotate(ang);
  p.stroke('#22283A');
  p.strokeWeight(1.5);
  p.line(-4, 0, 4, 0);
  p.line(0, -4, 0, 4);
  p.pop();
}

/**
 * Xe máy kiểu xe số dáng Cub, đi sang phải: khung thấp, ốp chắn gió chân,
 * đèn pha tròn trên tay lái, bánh to vỏ mỏng có nan hoa, yên dài + baga sau.
 */
export function drawMoto(p: p5, cx: number, cy: number, travelledPx: number) {
  const BODY = COL.b;
  const CREAM = '#F1E9D2';
  const DARK = '#22283A';
  const CHROME = '#C3CAD6';
  const RIDER = '#1D2540';

  p.push();
  p.translate(cx, cy);
  p.strokeCap(p.ROUND);
  p.strokeJoin(p.ROUND);

  // bóng
  p.noStroke();
  p.fill(0, 0, 0, 45);
  p.ellipse(0, 19, 60, 6);

  // bánh xe nan hoa
  const ang = travelledPx / 9;
  drawSpokeWheel(p, -18, 10, ang);
  drawSpokeWheel(p, 19, 10, ang);

  // ống xả crôm
  p.stroke(CHROME);
  p.strokeWeight(3.5);
  p.line(-3, 9, -24, 9);
  p.stroke('#9AA3B5');
  p.strokeWeight(2);
  p.line(-24, 9, -27, 8);

  // máy
  p.noStroke();
  p.fill('#7D8699');
  p.rect(-7, 0, 10, 8, 2);

  // chắn bùn sau
  p.noFill();
  p.stroke(BODY);
  p.strokeWeight(3);
  p.arc(-18, 10, 22, 22, p.PI * 1.05, p.PI * 1.95);

  // khung xương thấp (chỗ trống để chân)
  p.stroke(BODY);
  p.strokeWeight(4.5);
  p.noFill();
  p.bezier(15, -13, 11, -2, 7, 3, -2, 1);

  // ốp thân sau (phần bầu dưới yên)
  p.noStroke();
  p.fill(BODY);
  p.beginShape();
  p.vertex(-27, -7);
  p.vertex(-23, -12);
  p.vertex(-10, -13);
  p.vertex(-1, -11);
  p.vertex(1, -5);
  p.vertex(-2, 2);
  p.vertex(-12, 3);
  p.vertex(-22, 1);
  p.endShape(p.CLOSE);
  p.stroke(255, 255, 255, 110);
  p.strokeWeight(1.2);
  p.line(-24, -6, -4, -6);

  // yên dài
  p.noStroke();
  p.fill(DARK);
  p.rect(-26, -17, 23, 5, 3);

  // baga sau + đèn hậu
  p.stroke('#9AA3B5');
  p.strokeWeight(2);
  p.line(-30, -15, -24, -15);
  p.noStroke();
  p.fill('#C2302B');
  p.rect(-30, -12, 3, 4, 1);

  // người lái: chân (nằm sau ốp chắn gió)
  p.stroke(RIDER);
  p.strokeWeight(5);
  p.line(-14, -17, 4, -14);
  p.strokeWeight(4);
  p.line(4, -14, 7, 1);
  p.noStroke();
  p.fill(DARK);
  p.ellipse(9, 2, 7, 3.5);

  // thân người
  p.stroke(RIDER);
  p.strokeWeight(9);
  p.line(-15, -19, -10, -32);

  // ốp chắn gió chân
  p.stroke('#D9CFB2');
  p.strokeWeight(1);
  p.fill(CREAM);
  p.beginShape();
  p.vertex(8, 5);
  p.bezierVertex(6, -4, 8, -14, 12, -18);
  p.bezierVertex(14, -20, 18, -19, 19, -15);
  p.bezierVertex(20, -7, 19.5, 0, 18, 5);
  p.endShape(p.CLOSE);

  // càng trước
  p.stroke(DARK);
  p.strokeWeight(2.5);
  p.line(17, -15, 19, 10);

  // chắn bùn trước
  p.noFill();
  p.stroke(BODY);
  p.strokeWeight(3.5);
  p.arc(19, 10, 22, 22, p.PI * 1.12, p.PI * 1.88);

  // cụm tay lái + đèn pha tròn
  p.noStroke();
  p.fill(BODY);
  p.rect(12, -26, 11, 7, 3.5);
  p.fill('#FFF3B0');
  p.ellipse(23, -22.5, 4, 6);
  p.stroke(DARK);
  p.strokeWeight(2.5);
  p.line(11, -26, 15, -27);

  // tay người lái
  p.stroke(RIDER);
  p.strokeWeight(4);
  p.line(-10, -29, 12, -25);

  // mũ bảo hiểm
  p.stroke('#CBD3E1');
  p.strokeWeight(1);
  p.fill('#FFFFFF');
  p.circle(-7, -40, 15);
  p.noStroke();
  p.fill('#2B3550');
  p.rect(-3, -42, 6, 5, 2);
  p.pop();
}

function drawSpokeWheel(p: p5, x: number, y: number, ang: number) {
  p.push();
  p.translate(x, y);
  p.noFill();
  p.stroke('#22283A');
  p.strokeWeight(3);
  p.circle(0, 0, 16);
  p.stroke('#C9D0DD');
  p.strokeWeight(1);
  p.circle(0, 0, 12);
  p.rotate(ang);
  p.stroke('#AEB6C6');
  p.strokeWeight(0.7);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    p.line(0, 0, 6 * Math.cos(a), 6 * Math.sin(a));
  }
  p.noStroke();
  p.fill('#9AA3B5');
  p.circle(0, 0, 4);
  p.pop();
}
