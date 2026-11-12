import type p5 from 'p5';
import { fmtG } from '@/lib/format';
import { COL } from './colors';
import { labelBox } from './scene';

/** Một cột năng lượng (Wt, Wđ, W…) */
export interface EnergyBar {
  name: string;
  value: number;
  /** màu cột */
  col: string;
  /** màu chữ (tên + số), mặc định = màu cột */
  textCol?: string;
  /** nhãn số trên đỉnh cột; mặc định fmtG(value, 1) */
  label?: string;
}

export interface EnergyChart {
  title: string;
  bars: EnergyBar[];
  /** tâm cột đầu tiên và khoảng cách giữa các tâm cột */
  cx: number;
  step: number;
  /** chân cột (mốc 0) và chiều cao ứng với `max` */
  base: number;
  maxH: number;
  max: number;
  width?: number;
  /** cỡ chữ tên cột; tên đặt ở `nameY` (mặc định ngay dưới chân cột) */
  nameSize?: number;
  nameY?: number;
  /** dòng tiêu đề, mặc định ngay trên rãnh nền */
  titleY?: number;
}

/**
 * Biểu đồ cột năng lượng dùng chung cho chủ đề Năng lượng cơ học (thế năng, cơ năng…):
 * rãnh nền, cột màu (âm thì vẽ xuống dưới mốc), tên dưới chân, số trong nhãn trắng trên đỉnh, vạch mốc 0.
 * Trả về toạ độ x mép trái/phải của cả biểu đồ để bài vẽ thêm ghi chú.
 */
export function energyBars(p: p5, c: EnergyChart): { left: number; right: number } {
  const w = c.width ?? 56;
  const left = c.cx - w / 2 - 20;
  const right = c.cx + (c.bars.length - 1) * c.step + w / 2 + 20;

  p.noStroke();
  p.fill(COL.text);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(15);
  p.textStyle(p.BOLD);
  p.text(c.title, (left + right) / 2, c.titleY ?? c.base - c.maxH - 28);

  c.bars.forEach((b, i) => {
    const x = c.cx + i * c.step - w / 2;
    const h = c.max > 0 ? (c.maxH * b.value) / c.max : 0;
    const textCol = b.textCol ?? b.col;
    p.noStroke();
    p.fill(COL.track);
    p.rect(x, c.base - c.maxH, w, c.maxH, 4);
    p.fill(b.col);
    if (h >= 0) p.rect(x, c.base - h, w, h, 4);
    else p.rect(x, c.base, w, -h, 4);
    p.fill(textCol);
    p.textSize(c.nameSize ?? 14);
    p.textStyle(p.BOLD);
    p.text(b.name, x + w / 2, c.nameY ?? c.base + 18);
    labelBox(p, x + w / 2, h >= 0 ? c.base - h - 14 : c.base - h + 14, b.label ?? fmtG(b.value, 1), textCol, 13);
  });

  p.stroke(COL.muted);
  p.strokeWeight(1.5);
  p.line(left, c.base, right, c.base);
  p.textStyle(p.NORMAL);
  return { left, right };
}
