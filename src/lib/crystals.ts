/**
 * Dựng tọa độ (Å) cho đơn chất không có sẵn trên PubChem: mạng tinh thể kim loại, kim cương, than chì,
 * muối ăn, khí hiếm, phân tử hai nguyên tử. Trả về chuỗi định dạng XYZ cho 3Dmol.js.
 * Hằng số mạng lấy theo giá trị thực nghiệm ở nhiệt độ phòng (làm tròn).
 */

type Atom = [el: string, x: number, y: number, z: number];

export function toXyz(atoms: Atom[], title = ''): string {
  return `${atoms.length}\n${title}\n${atoms.map(([e, x, y, z]) => `${e} ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}`).join('\n')}\n`;
}

/** Cụm hình cầu từ một mạng lập phương: basis là tọa độ phân số trong ô cơ sở */
function cubicCluster(basis: [string, number, number, number][], a: number, radius: number): Atom[] {
  const n = Math.ceil(radius / a) + 1;
  const atoms: Atom[] = [];
  for (let i = -n; i <= n; i++)
    for (let j = -n; j <= n; j++)
      for (let k = -n; k <= n; k++)
        for (const [el, u, v, w] of basis) {
          const x = (i + u) * a;
          const y = (j + v) * a;
          const z = (k + w) * a;
          if (Math.hypot(x, y, z) <= radius + 1e-6) atoms.push([el, x, y, z]);
        }
  return atoms;
}

const FCC: [number, number, number][] = [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]];
const BCC: [number, number, number][] = [[0, 0, 0], [0.5, 0.5, 0.5]];

export type MetalLattice = 'bcc' | 'fcc' | 'hcp';

/** Kiểu mạng và hằng số mạng (a, c cho lục phương) của các kim loại hay gặp */
export const METAL_LATTICE: Record<string, { type: MetalLattice; a: number; c?: number }> = {
  Li: { type: 'bcc', a: 3.51 }, Na: { type: 'bcc', a: 4.29 }, K: { type: 'bcc', a: 5.23 }, Ba: { type: 'bcc', a: 5.02 },
  Cr: { type: 'bcc', a: 2.88 }, Fe: { type: 'bcc', a: 2.87 }, W: { type: 'bcc', a: 3.16 },
  Al: { type: 'fcc', a: 4.05 }, Ca: { type: 'fcc', a: 5.58 }, Ni: { type: 'fcc', a: 3.52 }, Cu: { type: 'fcc', a: 3.61 },
  Ag: { type: 'fcc', a: 4.09 }, Au: { type: 'fcc', a: 4.08 }, Pt: { type: 'fcc', a: 3.92 }, Pb: { type: 'fcc', a: 4.95 },
  Be: { type: 'hcp', a: 2.29, c: 3.58 }, Mg: { type: 'hcp', a: 3.21, c: 5.21 }, Ti: { type: 'hcp', a: 2.95, c: 4.68 },
  Co: { type: 'hcp', a: 2.51, c: 4.07 }, Zn: { type: 'hcp', a: 2.66, c: 4.95 },
};

/** Khoảng cách giữa hai nguyên tử gần nhau nhất (bán kính kim loại = một nửa) */
export function nearest(m: { type: MetalLattice; a: number }): number {
  return m.type === 'bcc' ? (m.a * Math.sqrt(3)) / 2 : m.type === 'fcc' ? m.a / Math.SQRT2 : m.a;
}

export function metal(el: string): string {
  const m = METAL_LATTICE[el];
  const r = nearest(m) * 2.6; // cụm khoảng vài chục nguyên tử
  if (m.type !== 'hcp') return toXyz(cubicCluster((m.type === 'bcc' ? BCC : FCC).map((b) => [el, ...b]), m.a, r), el);
  // lục phương xếp chặt: lớp A và lớp B lệch nhau, cách nhau c/2
  const atoms: Atom[] = [];
  const a = m.a;
  const c = m.c!;
  for (let l = -2; l <= 2; l++) {
    const z = (l * c) / 2;
    const shift = Math.abs(l) % 2 === 1 ? [a / 2, (a * Math.sqrt(3)) / 6] : [0, 0];
    for (let i = -5; i <= 5; i++)
      for (let j = -5; j <= 5; j++) {
        const x = i * a + j * (a / 2) + shift[0];
        const y = j * ((a * Math.sqrt(3)) / 2) + shift[1];
        if (Math.hypot(x, y, z) <= r) atoms.push([el, x, y, z]);
      }
  }
  return toXyz(atoms, el);
}

/** Kim cương (và silicon): mạng lập phương tâm mặt + dịch (¼, ¼, ¼); mỗi nguyên tử nối 4 nguyên tử */
export function diamondLike(el: 'C' | 'Si', a = el === 'C' ? 3.567 : 5.431): string {
  const basis = [...FCC, ...FCC.map(([u, v, w]) => [u + 0.25, v + 0.25, w + 0.25] as [number, number, number])];
  return toXyz(cubicCluster(basis.map((b) => [el, ...b]), a, a * 1.05), el === 'C' ? 'diamond' : 'silicon');
}

/** Than chì: các lớp lục giác (C–C 1,42 Å) xếp chồng AB, cách nhau 3,35 Å */
export function graphite(): string {
  const a = 2.46;
  const d = 3.35;
  const atoms: Atom[] = [];
  const basis = [[0, 0], [a / 2, a / (2 * Math.sqrt(3))]];
  for (let l = 0; l < 3; l++) {
    const off = l % 2 === 1 ? [a / 2, a / (2 * Math.sqrt(3))] : [0, 0];
    for (let i = -6; i <= 6; i++)
      for (let j = -6; j <= 6; j++)
        for (const [bx, by] of basis) {
          const x = i * a + j * (a / 2) + bx + off[0];
          const y = j * ((a * Math.sqrt(3)) / 2) + by + off[1];
          if (Math.hypot(x, y) <= 5.2) atoms.push(['C', x, y, (l - 1) * d]);
        }
  }
  return toXyz(atoms, 'graphite');
}

/** Muối ăn NaCl: Na⁺ và Cl⁻ xen kẽ trên mạng lập phương (a = 5,64 Å) */
export function rockSalt(): string {
  const a = 5.64;
  // lấy đúng 2 × 2 × 2 nửa ô (khối lập phương 27 ion quen thuộc trong sách)
  const atoms: Atom[] = [];
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) atoms.push([(i + j + k) % 2 === 0 ? 'Na' : 'Cl', (i * a) / 2, (j * a) / 2, (k * a) / 2]);
  return toXyz(atoms, 'NaCl');
}

/** Khí hiếm: các nguyên tử đứng riêng lẻ, cách xa nhau (khí đơn nguyên tử) */
export function nobleGas(el: string): string {
  const atoms: Atom[] = [];
  let seed = el.charCodeAt(0) * 31 + (el.charCodeAt(1) || 7);
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  while (atoms.length < 9) {
    const p: Atom = [el, (rnd() - 0.5) * 18, (rnd() - 0.5) * 18, (rnd() - 0.5) * 18];
    if (atoms.every((q) => Math.hypot(q[1] - p[1], q[2] - p[2], q[3] - p[3]) > 6)) atoms.push(p);
  }
  return toXyz(atoms, el);
}

/** Phân tử hai nguyên tử (độ dài liên kết, Å) */
export const diatomic = (el: string, d: number) => toXyz([[el, -d / 2, 0, 0], [el, d / 2, 0, 0]], `${el}2`);
