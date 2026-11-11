/**
 * Hóa học 9 (KHTN 9 – Kết nối tri thức): nguyên tử khối, khối lượng mol, công thức hóa học
 * viết bằng TeX (vở) và Unicode (canvas), cân bằng các phản ứng dùng trong bài.
 * Thể tích khí ở điều kiện chuẩn (đkc: 25 °C, 1 bar): V = n × 24,79 (L).
 */
import { ELEMENTS, calcMass } from './elements';
import { fmt, isExact } from './format';
import { B, N, T, eq } from './tex';

export const VM = 24.79;

/** Nguyên tử khối làm tròn như SGK (H = 1, Cl = 35,5…), lấy từ bảng tuần hoàn trong lib/elements.ts */
export const ATOMIC: Record<string, number> = Object.fromEntries(ELEMENTS.map((e) => [e.symbol, calcMass(e.symbol)!]));

/** Tách hệ số đứng đầu: "2Al2O3" → [2, "Al2O3"] */
export function splitCoef(species: string): [number, string] {
  const m = species.match(/^(\d*)(.+)$/)!;
  return [m[1] ? Number(m[1]) : 1, m[2]];
}

/** Đếm nguyên tử trong công thức (hỗ trợ ngoặc): "Al2(SO4)3" → { Al: 2, S: 3, O: 12 } */
export function parseFormula(f: string): Record<string, number> {
  const stack: Record<string, number>[] = [{}];
  const re = /([A-Z][a-z]?|\(|\))(\d*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(f))) {
    const [, tok, num] = m;
    const k = num ? Number(num) : 1;
    if (tok === '(') stack.push({});
    else if (tok === ')') {
      const inner = stack.pop()!;
      const top = stack[stack.length - 1];
      for (const el in inner) top[el] = (top[el] ?? 0) + inner[el] * k;
    } else {
      const top = stack[stack.length - 1];
      top[tok] = (top[tok] ?? 0) + k;
    }
  }
  return stack[0];
}

/** Khối lượng mol (g/mol) */
export function molarMass(f: string): number {
  const atoms = parseFormula(f);
  let M = 0;
  for (const el in atoms) M += ATOMIC[el] * atoms[el];
  return Math.round(M * 100) / 100;
}

/** "2Al2(SO4)3" → "2\mathrm{Al_2(SO_4)_3}" (hệ số 1 không viết) */
export function ce(species: string): string {
  const [k, f] = splitCoef(species);
  const body = f.replace(/(\d+)/g, '_{$1}');
  return `${k > 1 ? k : ''}\\mathrm{${body}}`;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** "Al2(SO4)3" → "Al₂(SO₄)₃" cho chữ trên canvas (giữ hệ số đứng đầu) */
export function cu(species: string): string {
  const [k, f] = splitCoef(species);
  return (k > 1 ? String(k) : '') + f.replace(/\d/g, (d) => SUB[Number(d)]);
}

/** n kèm công thức: n_{\mathrm{H_2}} */
export const nOf = (f: string) => `n_{${ce(f)}}`;
export const mOf = (f: string) => `m_{${ce(f)}}`;
export const VOf = (f: string) => `V_{${ce(f)}}`;

export interface Species {
  f: string;
  k: number;
}

/** Phương trình hóa học dạng TeX; cond: điều kiện trên mũi tên (vd "t^\\circ"); reversible: mũi tên hai chiều */
export function eqTex(left: Species[], right: Species[], cond?: string, reversible = false): string {
  const side = (xs: Species[]) => xs.map((s) => ce(`${s.k > 1 ? s.k : ''}${s.f}`)).join(' + ');
  const arrow = reversible
    ? cond ? `\\xrightleftharpoons{${cond}}` : '\\rightleftharpoons'
    : cond ? `\\xrightarrow{${cond}}` : '\\rightarrow';
  return `${side(left)} ${arrow} ${side(right)}`;
}

/** Phương trình hóa học dạng chữ Unicode cho canvas */
export function eqUni(left: Species[], right: Species[], cond?: string, reversible = false): string {
  const side = (xs: Species[]) => xs.map((s) => cu(`${s.k > 1 ? s.k : ''}${s.f}`)).join(' + ');
  const arrow = reversible ? '⇌' : '→';
  return `${side(left)} ${cond ? `${arrow}(${cond})` : arrow} ${side(right)}`;
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

/** Nhân các hệ số phân số lên số nguyên nhỏ nhất */
export function integerize(xs: number[]): number[] {
  for (let k = 1; k <= 60; k++) {
    const ys = xs.map((x) => x * k);
    if (ys.every((y) => Math.abs(y - Math.round(y)) < 1e-9)) {
      const ints = ys.map((y) => Math.round(y));
      const g = ints.reduce((a, b) => gcd(a, b));
      return ints.map((y) => y / g);
    }
  }
  return xs;
}

/** Gốc acid: hóa trị và có phải nhóm nhiều nguyên tử không */
export const ANIONS: Record<string, { charge: number; poly: boolean }> = {
  Cl: { charge: 1, poly: false },
  O: { charge: 2, poly: false },
  SO4: { charge: 2, poly: true },
  NO3: { charge: 1, poly: true },
  OH: { charge: 1, poly: true },
};

/** Công thức muối/oxide/base: ("Al", 3, "SO4") → "Al2(SO4)3" */
export function compound(cation: string, valence: number, anion: string): string {
  const { charge, poly } = ANIONS[anion];
  const g = gcd(valence, charge);
  const a = charge / g;
  const b = valence / g;
  const left = cation + (a > 1 ? a : '');
  const right = b > 1 ? (poly ? `(${anion})${b}` : `${anion}${b}`) : anion;
  return left + right;
}

/** Dãy hoạt động hóa học (SGK): K Na Ca Mg Al Zn Fe Pb H Cu Ag Au */
export const ACTIVITY = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Pb', 'H', 'Cu', 'Ag', 'Au'] as const;
export const activityIndex = (el: string) => ACTIVITY.indexOf(el as (typeof ACTIVITY)[number]);

/** Tên kim loại và hóa trị dùng trong các phản ứng của bài (Fe hóa trị II với acid, muối) */
export const METALS: Record<string, { name: string; valence: number }> = {
  Na: { name: 'sodium', valence: 1 },
  Mg: { name: 'magnesium', valence: 2 },
  Al: { name: 'aluminium', valence: 3 },
  Zn: { name: 'zinc', valence: 2 },
  Fe: { name: 'iron', valence: 2 },
  Cu: { name: 'copper', valence: 2 },
  Ag: { name: 'silver', valence: 1 },
  Ca: { name: 'calcium', valence: 2 },
};

export interface Reaction {
  left: Species[];
  right: Species[];
}

/**
 * Kim loại M (hóa trị p) đẩy N (hóa trị q) ra khỏi dung dịch acid/muối N–A.
 * Cân bằng theo số electron trao đổi; với acid, N là H và sản phẩm là H2.
 */
export function displacement(metal: string, cation: string, q: number, anion: string): Reaction {
  const p = METALS[metal].valence;
  const solute = compound(cation, q, anion);
  const salt = compound(metal, p, anion);
  const e = lcm(p, q);
  const aM = parseFormula(salt)[metal];
  const aN = parseFormula(solute)[cation];
  const isAcid = cation === 'H';
  const product = isAcid ? 'H2' : cation;
  const perN = isAcid ? 2 : 1;
  const [kM, kS, kT, kN] = integerize([e / p, e / q / aN, e / p / aM, e / q / perN]);
  return {
    left: [{ f: metal, k: kM }, { f: solute, k: kS }],
    right: [{ f: salt, k: kT }, { f: product, k: kN }],
  };
}

/** Kim loại/phi kim + O2 (hoặc Cl2) → sản phẩm cho sẵn công thức */
export function combine(el: string, gas: 'O2' | 'Cl2', product: string): Reaction {
  const atoms = parseFormula(product);
  const g = gas === 'O2' ? 'O' : 'Cl';
  const [kE, kG, kP] = integerize([atoms[el], atoms[g] / 2, 1]);
  return { left: [{ f: el, k: kE }, { f: gas, k: kG }], right: [{ f: product, k: kP }] };
}

/** Đốt cháy hoàn toàn CxHy(Oz) → CO2 + H2O */
export function combustion(f: string): Reaction {
  const a = parseFormula(f);
  const x = a.C ?? 0;
  const y = a.H ?? 0;
  const z = a.O ?? 0;
  const o2 = x + y / 4 - z / 2;
  const [k, kO, kC, kH] = integerize([1, o2, x, y / 2]);
  return {
    left: [{ f, k }, { f: 'O2', k: kO }],
    right: [{ f: 'CO2', k: kC }, ...(y ? [{ f: 'H2O', k: kH }] : [])],
  };
}

/** Hệ số của một chất trong phản ứng */
export function coefOf(r: Reaction, f: string): number {
  return [...r.left, ...r.right].find((s) => s.f === f)?.k ?? 0;
}

// ------------------------------------------------------------
// Dòng bài giải dùng chung (TeX)
// ------------------------------------------------------------

/** Số chính xác: giữ tối đa 4 chữ số thập phân (vd 3,7185 L); số gần đúng: làm tròn 2 chữ số */
export const N4 = (x: number) => (isExact(x, 4) ? N(x, 4) : N(x, 2));
/** Như N4 cho chữ thường (canvas, ô số liệu): 3,7185 hoặc 18,88 */
export const f4 = (x: number) => (isExact(x, 4) ? fmt(x, 4) : fmt(x, 2));

/** "=" hoặc "≈" theo 4 chữ số thập phân */
export const e4 = (x: number) => eq(isExact(x, 4));

/** n = m : M */
export const molFromMass = (f: string, m: number, n: number, show: boolean) =>
  `${nOf(f)} = m \\chia M = ${N4(m)} \\chia ${N(molarMass(f))} ${e4(n)} ${B(show, N4(n))}\\;(${T('mol')})`;

/** n = V : 24,79 */
export const molFromVolume = (f: string, V: number, n: number, show: boolean) =>
  `${nOf(f)} = V \\chia 24{,}79 = ${N4(V)} \\chia 24{,}79 ${e4(n)} ${B(show, N4(n))}\\;(${T('mol')})`;

/** Theo PTHH: n_B = n_A × kB : kA */
export function molRatio(target: string, kT: number, src: string, kS: number, nS: number, show: boolean, showSrc = show): string {
  const nT = (nS * kT) / kS;
  if (kT === kS) return `${nOf(target)} = ${nOf(src)} = ${B(showSrc, N4(nS))}\\;(${T('mol')})`;
  return `${nOf(target)} = ${nOf(src)} \\times ${kT} \\chia ${kS} = ${B(showSrc, N4(nS))} \\times ${kT} \\chia ${kS} ${e4(nT)} ${B(show, N4(nT))}\\;(${T('mol')})`;
}

/** m = n × M */
export const massOf = (f: string, n: number, show: boolean, showN = show) => {
  const m = n * molarMass(f);
  return `${mOf(f)} = n \\times M = ${B(showN, N4(n))} \\times ${N(molarMass(f))} ${e4(m)} ${B(show, N4(m))}\\;(${T('g')})`;
};

/** V = n × 24,79 */
export const volumeOf = (f: string, n: number, show: boolean, showN = show) => {
  const V = n * VM;
  return `${VOf(f)} = n \\times 24{,}79 = ${B(showN, N4(n))} \\times 24{,}79 ${e4(V)} ${B(show, N4(V))}\\;(${T('L')})`;
};
