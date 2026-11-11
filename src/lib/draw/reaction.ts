import type p5 from 'p5';
import { cu, type Reaction } from '@/lib/chem';
import { COL } from './colors';
import { caption, clamp01 } from './geometry';
import { amountBar } from './lab';
import { drawReaction } from './molecule';
import { drawPaper, labelBox } from './scene';

export interface ReactionScene {
  reaction: Reaction;
  equation: string;
  /** lượng mỗi chất (mol) sau phản ứng; frac 0..1 so với lượng lớn nhất */
  bars: { label: string; reactant: boolean; frac: number; text: string }[];
  captions: [before: string, during: string, after: string];
  t: number; // 0..1
  started: boolean;
  done: boolean;
}

/** Phương trình hóa học động bằng mô hình phân tử + thanh số mol từng chất */
export function drawReactionScene(p: p5, s: ReactionScene) {
  drawPaper(p);
  const k = clamp01(s.t);
  drawReaction(p, s.reaction, k, 170, 30);
  labelBox(p, 400, 262, s.equation, COL.ink, 20);

  const x = 330;
  s.bars.forEach((b, i) => {
    const frac = b.reactant ? b.frac * (1 - k) : b.frac * k;
    amountBar(p, x, 306 + i * 36, 260, frac, b.label, b.text, b.reactant ? '#9AA3B5' : COL.b, b.reactant ? COL.text : COL.bText);
  });
  p.noStroke();
  p.fill(COL.muted);
  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(12);
  p.text('số mol (chất tham gia giảm dần, sản phẩm tăng dần)', x, 294);

  caption(p, !s.started ? s.captions[0] : !s.done ? s.captions[1] : s.captions[2]);
}

/**
 * Các thanh số mol cho drawReactionScene: mỗi chất trong phương trình, chất đã biết luôn hiện số,
 * chất cần tìm hiện "?" cho tới khi hiện đáp án.
 */
export function reactionBars(r: Reaction, nOf: (f: string) => number, known: string[], show: boolean, fmtN: (x: number) => string) {
  const all = [...r.left.map((s) => ({ ...s, reactant: true })), ...r.right.map((s) => ({ ...s, reactant: false }))];
  const maxN = Math.max(...all.map((s) => nOf(s.f)), 1e-9);
  return all.map((s) => ({
    label: cu(s.f),
    reactant: s.reactant,
    frac: nOf(s.f) / maxN,
    text: known.includes(s.f) || show ? `${fmtN(nOf(s.f))} mol` : '? mol',
  }));
}

export interface FlowStep {
  title: string;
  value: string;
  col: string;
}

/**
 * Sơ đồ quy trình: các khối nối bằng mũi tên (vd. gạo → glucose → ethylic alcohol).
 * k 0..1 làm hiện dần từng khối từ trái sang phải; arrows là chữ ghi trên mỗi mũi tên.
 */
export function drawFlow(p: p5, steps: FlowStep[], arrows: string[], k: number, captions: [string, string, string], started: boolean, done: boolean, y = 230) {
  drawPaper(p);
  const n = steps.length;
  const bw = n > 3 ? 132 : 170;
  const gap = (720 - n * bw) / Math.max(1, n - 1);
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  steps.forEach((s, i) => {
    const x = 40 + i * (bw + gap);
    const vis = i === 0 ? 1 : clamp01(k * (n - 1) - (i - 1));
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.75 * vis;
    p.noStroke();
    p.fill('#FFFFFF');
    p.stroke(s.col);
    p.strokeWeight(2.5);
    p.rect(x, y - 60, bw, 120, 12);
    p.noStroke();
    p.fill(s.col);
    p.rect(x, y - 60, bw, 34, 12, 12, 0, 0);
    p.fill('#FFFFFF');
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(14);
    p.text(s.title, x + bw / 2, y - 43);
    p.fill(COL.text);
    p.textSize(vis >= 1 ? 19 : 17);
    p.text(vis >= 1 ? s.value : '…', x + bw / 2, y + 16);
    p.textStyle(p.NORMAL);
    ctx.restore();
    if (i < n - 1) {
      const ax = x + bw + 8;
      const bx = x + bw + gap - 8;
      const on = clamp01(k * (n - 1) - i);
      p.stroke(on > 0 ? COL.ink : '#C9D3EA');
      p.strokeWeight(3);
      p.line(ax, y, ax + (bx - ax) * Math.max(on, 0.001), y);
      if (on >= 1) {
        p.noStroke();
        p.fill(COL.ink);
        p.triangle(bx, y, bx - 10, y - 6, bx - 10, y + 6);
      }
      if (arrows[i]) {
        // nhãn dưới hàng khối, có vạch nối lên mũi tên
        p.stroke('#C9D3EA');
        p.strokeWeight(1.5);
        p.line((ax + bx) / 2, y + 6, (ax + bx) / 2, y + 74 + (i % 2) * 26);
        p.noStroke();
        labelBox(p, (ax + bx) / 2, y + 84 + (i % 2) * 26, arrows[i], COL.ink, 13);
      }
    }
  });
  caption(p, !started ? captions[0] : !done ? captions[1] : captions[2]);
}
