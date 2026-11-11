import type p5 from 'p5';
import { cu, type Reaction } from '@/lib/chem';
import { COL } from './colors';

/**
 * Mô hình phân tử dạng rỗng (quả cầu – thanh nối) cho các bài Hóa học hữu cơ và phương trình
 * hóa học động. Toạ độ nguyên tử tính theo độ dài liên kết = 1.
 */

type Atom = [el: string, x: number, y: number];
type Bond = [a: number, b: number, order?: number];
export interface Molecule {
  atoms: Atom[];
  bonds: Bond[];
}

export const ATOM_COL: Record<string, string> = {
  C: '#3A3F4B', H: '#FFFFFF', O: '#E0443F', Cl: '#3DBE5A', Br: '#A0522D', N: '#3D6FD8', S: '#E3C02E', P: '#E8873A',
};
const ATOM_R: Record<string, number> = { C: 0.42, H: 0.28, O: 0.4, Cl: 0.46, Br: 0.5, N: 0.4, S: 0.48, P: 0.46 };

/**
 * Mạch carbon no thẳng CnH2n+2. Chỉ số nguyên tử: carbon thứ i là 3i, hai H của nó là 3i+1 (trên)
 * và 3i+2 (dưới); H ở hai đầu mạch là 3n (trái) và 3n+1 (phải).
 */
function alkane(n: number): Molecule {
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  for (let i = 0; i < n; i++) {
    const c = i * 3;
    atoms.push(['C', i, 0], ['H', i, -1], ['H', i, 1]);
    bonds.push([c, c + 1], [c, c + 2]);
    if (i > 0) bonds.push([c - 3, c]);
  }
  atoms.push(['H', -1, 0], ['H', n, 0]);
  bonds.push([0, 3 * n], [3 * (n - 1), 3 * n + 1]);
  return { atoms, bonds };
}

function replaceAtom(m: Molecule, index: number, el: string): Molecule {
  const atoms = m.atoms.map((a, i) => (i === index ? ([el, a[1], a[2]] as Atom) : a));
  return { atoms, bonds: m.bonds };
}

const C2H4: Molecule = {
  atoms: [['C', 0, 0], ['C', 1.1, 0], ['H', -0.6, -0.85], ['H', -0.6, 0.85], ['H', 1.7, -0.85], ['H', 1.7, 0.85]],
  bonds: [[0, 1, 2], [0, 2], [0, 3], [1, 4], [1, 5]],
};

const C3H6: Molecule = {
  atoms: [['C', 0, 0], ['C', 1.1, 0], ['C', 2.1, 0.6], ['H', -0.6, -0.85], ['H', -0.6, 0.85], ['H', 1.1, -1], ['H', 2.1, 1.6], ['H', 3.0, 0.1], ['H', 2.6, -0.2]],
  bonds: [[0, 1, 2], [1, 2], [0, 3], [0, 4], [1, 5], [2, 6], [2, 7], [2, 8]],
};

const C2H5OH: Molecule = {
  atoms: [['C', 0, 0], ['H', 0, -1], ['H', 0, 1], ['C', 1, 0], ['H', 1, -1], ['H', 1, 1], ['H', -1, 0], ['O', 2, 0], ['H', 2.8, -0.6]],
  bonds: [[0, 1], [0, 2], [0, 3], [3, 4], [3, 5], [0, 6], [3, 7], [7, 8]],
};

const CH3COOH: Molecule = {
  atoms: [['C', 0, 0], ['H', 0, -1], ['H', 0, 1], ['H', -1, 0], ['C', 1, 0], ['O', 1.6, -0.85], ['O', 1.8, 0.6], ['H', 2.7, 0.4]],
  bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5, 2], [4, 6], [6, 7]],
};

const CH3OCH3: Molecule = {
  atoms: [['C', 0, 0], ['H', 0, -1], ['H', 0, 1], ['H', -1, 0], ['O', 1, 0], ['C', 2, 0], ['H', 2, -1], ['H', 2, 1], ['H', 3, 0]],
  bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5], [5, 6], [5, 7], [5, 8]],
};

/** C2H4Br2: mỗi C mang một Br (sản phẩm cộng bromine) */
const C2H4Br2: Molecule = replaceAtom(replaceAtom(alkane(2), 1, 'Br'), 4, 'Br');

const C3H6Br2: Molecule = replaceAtom(replaceAtom(alkane(3), 1, 'Br'), 4, 'Br');

export const MOLECULES: Record<string, Molecule> = {
  H2: { atoms: [['H', 0, 0], ['H', 0.8, 0]], bonds: [[0, 1]] },
  O2: { atoms: [['O', 0, 0], ['O', 1, 0]], bonds: [[0, 1, 2]] },
  Cl2: { atoms: [['Cl', 0, 0], ['Cl', 1.1, 0]], bonds: [[0, 1]] },
  Br2: { atoms: [['Br', 0, 0], ['Br', 1.2, 0]], bonds: [[0, 1]] },
  HCl: { atoms: [['H', 0, 0], ['Cl', 1, 0]], bonds: [[0, 1]] },
  H2O: { atoms: [['O', 0, 0], ['H', -0.75, 0.6], ['H', 0.75, 0.6]], bonds: [[0, 1], [0, 2]] },
  CO2: { atoms: [['O', -1.1, 0], ['C', 0, 0], ['O', 1.1, 0]], bonds: [[0, 1, 2], [1, 2, 2]] },
  CH4: alkane(1),
  C2H6: alkane(2),
  C3H8: alkane(3),
  C4H10: alkane(4),
  CH3Cl: replaceAtom(alkane(1), 4, 'Cl'),
  C2H5Cl: replaceAtom(alkane(2), 7, 'Cl'),
  C3H7Cl: replaceAtom(alkane(3), 10, 'Cl'),
  C4H9Cl: replaceAtom(alkane(4), 13, 'Cl'),
  C2H4,
  C3H6,
  C2H2: { atoms: [['H', -1, 0], ['C', 0, 0], ['C', 1.1, 0], ['H', 2.1, 0]], bonds: [[0, 1], [1, 2, 3], [2, 3]] },
  C2H4Br2,
  C3H6Br2,
  C2H6O: C2H5OH,
  C2H4O2: CH3COOH,
  CH3OCH3,
  // công thức viết thu gọn như trong phương trình hóa học
  C2H5OH,
  CH3COOH,
  CH3COOC2H5: {
    atoms: [
      ['C', 0, 0], ['H', 0, -1], ['H', 0, 1], ['H', -1, 0], ['C', 1, 0], ['O', 1, -1], ['O', 2, 0.4],
      ['C', 3, 0], ['H', 3, -1], ['H', 3, 1], ['C', 4, 0], ['H', 4, -1], ['H', 4, 1], ['H', 5, 0],
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5, 2], [4, 6], [6, 7], [7, 8], [7, 9], [7, 10], [10, 11], [10, 12], [10, 13]],
  },
  /** glycine H2N–CH2–COOH */
  C2H5NO2: {
    atoms: [['N', 0, 0], ['H', -0.7, -0.75], ['H', -0.7, 0.75], ['C', 1, 0], ['H', 1, -1], ['H', 1, 1], ['C', 2, 0], ['O', 2.6, -0.85], ['O', 2.8, 0.6], ['H', 3.7, 0.4]],
    bonds: [[0, 1], [0, 2], [0, 3], [3, 4], [3, 5], [3, 6], [6, 7, 2], [6, 8], [8, 9]],
  },
  /** alanine CH3–CH(NH2)–COOH */
  C3H7NO2: {
    atoms: [
      ['C', 0, 0], ['H', 0, -1], ['H', -1, 0], ['H', -0.6, 0.8], ['C', 1, 0], ['H', 1, 1], ['N', 1, -1], ['H', 0.4, -1.7], ['H', 1.6, -1.7],
      ['C', 2, 0], ['O', 2.6, -0.85], ['O', 2.8, 0.6], ['H', 3.7, 0.4],
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5], [4, 6], [6, 7], [6, 8], [4, 9], [9, 10, 2], [9, 11], [11, 12]],
  },
};

/** Làm sáng (k > 0) hoặc tối (k < 0) một màu hex */
function shade(hex: string, k: number): string {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const out = v.map((c) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k)));
  return `rgb(${out.join(',')})`;
}

function bounds(m: Molecule) {
  const xs = m.atoms.map((a) => a[1]);
  const ys = m.atoms.map((a) => a[2]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/** Chiều rộng (px) của phân tử khi vẽ với độ dài liên kết s */
export function moleculeWidth(f: string, s: number): number {
  const m = MOLECULES[f];
  if (!m) return cu(f).length * s * 0.4 + s * 0.8;
  const b = bounds(m);
  return (b.x1 - b.x0 + 1) * s;
}

/**
 * Vẽ phân tử, tâm khung bao tại (cx, cy). s: độ dài liên kết (px).
 * progress 0..1: số nguyên tử đã hiện (dùng khi "lắp" phân tử từng nguyên tử).
 * Chất không có mô hình (kim loại, muối) được vẽ thành ô ghi công thức.
 */
export function drawMolecule(p: p5, f: string, cx: number, cy: number, s: number, progress = 1, labels = true) {
  const m = MOLECULES[f];
  if (!m) {
    p.noStroke();
    p.fill('#F1F3F8');
    p.stroke(COL.muted);
    p.strokeWeight(1.5);
    const label = cu(f);
    p.textSize(s * 0.6);
    const w = p.textWidth(label) + s * 0.6;
    p.rect(cx - w / 2, cy - s * 0.5, w, s, 6);
    p.noStroke();
    p.fill(COL.text);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.text(label, cx, cy);
    p.textStyle(p.NORMAL);
    return;
  }
  const b = bounds(m);
  const ox = cx - ((b.x0 + b.x1) / 2) * s;
  const oy = cy - ((b.y0 + b.y1) / 2) * s;
  const shown = Math.ceil(progress * m.atoms.length);
  const P = (i: number) => [ox + m.atoms[i][1] * s, oy + m.atoms[i][2] * s] as const;

  p.stroke('#8D96A8');
  p.strokeWeight(Math.max(2, s * 0.09));
  for (const [a, c, order = 1] of m.bonds) {
    if (a >= shown || c >= shown) continue;
    const [x1, y1] = P(a);
    const [x2, y2] = P(c);
    const len = Math.hypot(x2 - x1, y2 - y1);
    const nx = (-(y2 - y1) / len) * s * 0.12;
    const ny = ((x2 - x1) / len) * s * 0.12;
    if (order === 1) p.line(x1, y1, x2, y2);
    else if (order === 2) {
      p.line(x1 + nx, y1 + ny, x2 + nx, y2 + ny);
      p.line(x1 - nx, y1 - ny, x2 - nx, y2 - ny);
    } else {
      p.line(x1, y1, x2, y2);
      p.line(x1 + nx * 1.6, y1 + ny * 1.6, x2 + nx * 1.6, y2 + ny * 1.6);
      p.line(x1 - nx * 1.6, y1 - ny * 1.6, x2 - nx * 1.6, y2 - ny * 1.6);
    }
  }
  for (let i = 0; i < shown; i++) {
    const [el] = m.atoms[i];
    const [x, y] = P(i);
    const r = (ATOM_R[el] ?? 0.4) * s;
    // quả cầu tô chuyển sắc (sáng ở góc trên trái, tối dần) để có khối mà không đè lên chữ
    const base = ATOM_COL[el] ?? '#999999';
    const ctx = p.drawingContext as CanvasRenderingContext2D;
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r);
    g.addColorStop(0, shade(base, 0.35));
    g.addColorStop(0.55, base);
    g.addColorStop(1, shade(base, -0.25));
    ctx.save();
    ctx.fillStyle = g;
    ctx.strokeStyle = el === 'H' ? '#8D96A8' : 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    p.noStroke();
    if (labels && r > 7) {
      p.fill(el === 'H' || el === 'S' ? COL.text : '#FFFFFF');
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(Math.max(9, r * 0.95));
      p.textStyle(p.BOLD);
      p.text(el, x, y + 0.5);
      p.textStyle(p.NORMAL);
    }
  }
}

/**
 * Phương trình hóa học động trên canvas: mỗi chất vẽ một phân tử kèm hệ số,
 * k 0..1: chất tham gia mờ dần, sản phẩm hiện dần. Dòng công thức chữ đặt ngay dưới.
 */
export function drawReaction(p: p5, r: Reaction, k: number, y: number, s = 22, x0 = 40, x1 = 760) {
  const items: { f: string; coef: number; side: 0 | 1 }[] = [
    ...r.left.map((x) => ({ f: x.f, coef: x.k, side: 0 as const })),
    ...r.right.map((x) => ({ f: x.f, coef: x.k, side: 1 as const })),
  ];
  const gap = 34; // cho dấu "+" và mũi tên
  const coefW = (c: number) => (c > 1 ? 22 : 0);
  const widths = items.map((it) => moleculeWidth(it.f, s) + coefW(it.coef));
  let scale = 1;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1) + 30;
  if (total > x1 - x0) scale = (x1 - x0) / total;
  const ss = s * scale;
  const ws = items.map((it) => moleculeWidth(it.f, ss) + coefW(it.coef));
  const sum = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1) + 30;
  let x = (x0 + x1) / 2 - sum / 2;
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  items.forEach((it, i) => {
    const alpha = it.side === 0 ? 1 - 0.55 * k : 0.25 + 0.75 * k;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (it.coef > 1) {
      p.noStroke();
      p.fill(COL.ink);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(18);
      p.textStyle(p.BOLD);
      p.text(String(it.coef), x, y);
      p.textStyle(p.NORMAL);
    }
    const mw = moleculeWidth(it.f, ss);
    drawMolecule(p, it.f, x + coefW(it.coef) + mw / 2, y, ss);
    ctx.restore();
    x += ws[i];
    if (i < items.length - 1) {
      const isArrow = items[i + 1].side === 1 && it.side === 0;
      p.noStroke();
      p.fill(COL.text);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(20);
      p.textStyle(p.BOLD);
      if (isArrow) {
        p.stroke(COL.ink);
        p.strokeWeight(2.5);
        p.line(x + 6, y, x + gap + 18, y);
        p.noStroke();
        p.fill(COL.ink);
        p.triangle(x + gap + 24, y, x + gap + 14, y - 6, x + gap + 14, y + 6);
        x += gap + 30;
      } else {
        p.text('+', x + gap / 2, y);
        x += gap;
      }
      p.textStyle(p.NORMAL);
    }
  });
}
