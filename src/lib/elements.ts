/**
 * Bảng tuần hoàn các nguyên tố hóa học (118 nguyên tố) cho popup tra cứu môn Hóa học.
 * Tên theo IUPAC như SGK KHTN (Kết nối tri thức). Khối lượng nguyên tử theo IUPAC (rút gọn);
 * nguyên tố không có đồng vị bền ghi số khối của đồng vị bền nhất, `radio: true`.
 * Khi tính toán trong bài dùng `calcMass` (làm tròn như SGK: H = 1, Cl = 35,5, Cu = 64…).
 */

export type Category = 'kimloai' | 'phikim' | 'khihiem';

export interface ElementInfo {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  radio: boolean;
  period: number;
  /** nhóm 1…18; nguyên tố họ lanthan/actini có group = 3 và fRow = true */
  group: number;
  fRow: boolean;
  category: Category;
}

// Z|ký hiệu|tên|khối lượng (ngoặc: không có đồng vị bền)
const RAW = `1|H|hydrogen|1.008 2|He|helium|4.0026 3|Li|lithium|6.94 4|Be|beryllium|9.0122 5|B|boron|10.81
6|C|carbon|12.011 7|N|nitrogen|14.007 8|O|oxygen|15.999 9|F|fluorine|18.998 10|Ne|neon|20.180
11|Na|sodium|22.990 12|Mg|magnesium|24.305 13|Al|aluminium|26.982 14|Si|silicon|28.085 15|P|phosphorus|30.974
16|S|sulfur|32.06 17|Cl|chlorine|35.45 18|Ar|argon|39.95 19|K|potassium|39.098 20|Ca|calcium|40.078
21|Sc|scandium|44.956 22|Ti|titanium|47.867 23|V|vanadium|50.942 24|Cr|chromium|51.996 25|Mn|manganese|54.938
26|Fe|iron|55.845 27|Co|cobalt|58.933 28|Ni|nickel|58.693 29|Cu|copper|63.546 30|Zn|zinc|65.38
31|Ga|gallium|69.723 32|Ge|germanium|72.630 33|As|arsenic|74.922 34|Se|selenium|78.971 35|Br|bromine|79.904
36|Kr|krypton|83.798 37|Rb|rubidium|85.468 38|Sr|strontium|87.62 39|Y|yttrium|88.906 40|Zr|zirconium|91.224
41|Nb|niobium|92.906 42|Mo|molybdenum|95.95 43|Tc|technetium|(98) 44|Ru|ruthenium|101.07 45|Rh|rhodium|102.91
46|Pd|palladium|106.42 47|Ag|silver|107.87 48|Cd|cadmium|112.41 49|In|indium|114.82 50|Sn|tin|118.71
51|Sb|antimony|121.76 52|Te|tellurium|127.60 53|I|iodine|126.90 54|Xe|xenon|131.29 55|Cs|caesium|132.91
56|Ba|barium|137.33 57|La|lanthanum|138.91 58|Ce|cerium|140.12 59|Pr|praseodymium|140.91 60|Nd|neodymium|144.24
61|Pm|promethium|(145) 62|Sm|samarium|150.36 63|Eu|europium|151.96 64|Gd|gadolinium|157.25 65|Tb|terbium|158.93
66|Dy|dysprosium|162.50 67|Ho|holmium|164.93 68|Er|erbium|167.26 69|Tm|thulium|168.93 70|Yb|ytterbium|173.05
71|Lu|lutetium|174.97 72|Hf|hafnium|178.49 73|Ta|tantalum|180.95 74|W|tungsten|183.84 75|Re|rhenium|186.21
76|Os|osmium|190.23 77|Ir|iridium|192.22 78|Pt|platinum|195.08 79|Au|gold|196.97 80|Hg|mercury|200.59
81|Tl|thallium|204.38 82|Pb|lead|207.2 83|Bi|bismuth|208.98 84|Po|polonium|(209) 85|At|astatine|(210)
86|Rn|radon|(222) 87|Fr|francium|(223) 88|Ra|radium|(226) 89|Ac|actinium|(227) 90|Th|thorium|232.04
91|Pa|protactinium|231.04 92|U|uranium|238.03 93|Np|neptunium|(237) 94|Pu|plutonium|(244) 95|Am|americium|(243)
96|Cm|curium|(247) 97|Bk|berkelium|(247) 98|Cf|californium|(251) 99|Es|einsteinium|(252) 100|Fm|fermium|(257)
101|Md|mendelevium|(258) 102|No|nobelium|(259) 103|Lr|lawrencium|(266) 104|Rf|rutherfordium|(267) 105|Db|dubnium|(268)
106|Sg|seaborgium|(269) 107|Bh|bohrium|(270) 108|Hs|hassium|(269) 109|Mt|meitnerium|(278) 110|Ds|darmstadtium|(281)
111|Rg|roentgenium|(282) 112|Cn|copernicium|(285) 113|Nh|nihonium|(286) 114|Fl|flerovium|(289) 115|Mc|moscovium|(290)
116|Lv|livermorium|(293) 117|Ts|tennessine|(294) 118|Og|oganesson|(294)`;

const NONMETALS = new Set(['H', 'B', 'C', 'N', 'O', 'F', 'Si', 'P', 'S', 'Cl', 'As', 'Se', 'Br', 'Te', 'I', 'At']);
const NOBLE = new Set(['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og']);
const PERIOD_END = [2, 10, 18, 36, 54, 86, 118];

/** Chu kì, nhóm và hàng họ f từ số hiệu nguyên tử */
function place(z: number): { period: number; group: number; fRow: boolean } {
  const period = PERIOD_END.findIndex((e) => z <= e) + 1;
  const start = period === 1 ? 1 : PERIOD_END[period - 2] + 1;
  const o = z - start + 1;
  if (period === 1) return { period, group: z === 1 ? 1 : 18, fRow: false };
  if (period <= 3) return { period, group: o <= 2 ? o : o + 10, fRow: false };
  if (period <= 5) return { period, group: o, fRow: false };
  if (o <= 2) return { period, group: o, fRow: false };
  if (o <= 17) return { period, group: 3, fRow: true };
  return { period, group: o - 14, fRow: false };
}

export const ELEMENTS: ElementInfo[] = RAW.trim().split(/\s+/).map((tok) => {
  const [z, symbol, name, m] = tok.split('|');
  const radio = m.startsWith('(');
  const n = Number(z);
  return {
    z: n,
    symbol,
    name,
    mass: Number(m.replace(/[()]/g, '')),
    radio,
    ...place(n),
    category: NOBLE.has(symbol) ? 'khihiem' : NONMETALS.has(symbol) ? 'phikim' : 'kimloai',
  };
});

export const BY_SYMBOL: Record<string, ElementInfo> = Object.fromEntries(ELEMENTS.map((e) => [e.symbol, e]));

/** Nguyên tử khối làm tròn dùng trong bài tập (theo SGK) */
const ROUNDED: Record<string, number> = { Cl: 35.5, Cu: 64, Zn: 65 };
export function calcMass(symbol: string): number | undefined {
  const e = BY_SYMBOL[symbol];
  if (!e) return undefined;
  return ROUNDED[symbol] ?? Math.round(e.mass);
}

export const CATEGORY_NAME: Record<Category, string> = { kimloai: 'Kim loại', phikim: 'Phi kim', khihiem: 'Khí hiếm' };

/** Tên nhóm kiểu SGK Việt Nam: IA, IIA, IIIB… VIIIA */
const GROUP_NAME = ['IA', 'IIA', 'IIIB', 'IVB', 'VB', 'VIB', 'VIIB', 'VIIIB', 'VIIIB', 'VIIIB', 'IB', 'IIB', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA', 'VIIIA'];
export const groupName = (g: number) => GROUP_NAME[g - 1];

/** Hóa trị thường gặp (các nguyên tố hay dùng ở THCS) */
export const VALENCE: Record<string, string> = {
  H: 'I', Li: 'I', Na: 'I', K: 'I', Ag: 'I', F: 'I', Cl: 'I', Br: 'I', I: 'I',
  Be: 'II', Mg: 'II', Ca: 'II', Ba: 'II', Zn: 'II', O: 'II', Ni: 'II',
  Cu: 'I, II', Hg: 'I, II', Fe: 'II, III', Co: 'II, III', Cr: 'II, III, VI', Mn: 'II, IV, VII',
  Al: 'III', B: 'III', C: 'II, IV', Si: 'IV', N: 'III, V (II, IV)', P: 'III, V', S: 'II, IV, VI',
  Pb: 'II, IV', Sn: 'II, IV', Au: 'I, III',
};

/** Số electron trên từng lớp (Z ≤ 20, mô hình Bohr như SGK) */
export function shells(z: number): number[] | undefined {
  if (z > 20) return undefined;
  const caps = [2, 8, 8, 2];
  const out: number[] = [];
  let left = z;
  for (const c of caps) {
    if (left <= 0) break;
    out.push(Math.min(c, left));
    left -= c;
  }
  return out;
}

export interface MassPart {
  symbol: string;
  count: number;
  mass: number;
}

/**
 * Khối lượng mol từ công thức người dùng gõ: hỗ trợ ngoặc và tinh thể ngậm nước
 * ("CuSO4.5H2O", "CuSO4·5H2O"), chữ số chỉ số dạng thường hoặc dạng ₂.
 */
export function formulaMass(input: string): { M: number; parts: MassPart[] } | { error: string } {
  const src = input.trim().replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080)).replace(/\s+/g, '');
  if (!src) return { error: '' };
  if (!/^[A-Za-z0-9().·*]+$/.test(src)) return { error: 'Chỉ dùng ký hiệu nguyên tố, chữ số, ngoặc và dấu chấm' };
  const counts = new Map<string, number>();
  for (const piece of src.split(/[.·*]/)) {
    if (!piece) return { error: 'Thiếu công thức sau dấu chấm' };
    const m = piece.match(/^(\d*)(.*)$/)!;
    const k = m[1] ? Number(m[1]) : 1;
    const stack: Map<string, number>[] = [new Map()];
    const re = /([A-Z][a-z]?|\(|\)|[a-z]+)(\d*)/g;
    let t: RegExpExecArray | null;
    let consumed = 0;
    while ((t = re.exec(m[2]))) {
      if (t.index !== consumed) return { error: 'Công thức chưa đúng' };
      consumed = re.lastIndex;
      const [, tok, num] = t;
      const n = num ? Number(num) : 1;
      if (tok === '(') stack.push(new Map());
      else if (tok === ')') {
        if (stack.length < 2) return { error: 'Thiếu dấu mở ngoặc' };
        const inner = stack.pop()!;
        const top = stack[stack.length - 1];
        inner.forEach((v, el) => top.set(el, (top.get(el) ?? 0) + v * n));
      } else {
        if (!BY_SYMBOL[tok]) {
          return { error: /^[a-z]/.test(tok) ? `Viết hoa chữ cái đầu của ký hiệu: "${tok}"` : `Không có nguyên tố "${tok}"` };
        }
        const top = stack[stack.length - 1];
        top.set(tok, (top.get(tok) ?? 0) + n);
      }
    }
    if (consumed !== m[2].length || stack.length !== 1) return { error: stack.length !== 1 ? 'Thiếu dấu đóng ngoặc' : 'Công thức chưa đúng' };
    stack[0].forEach((v, el) => counts.set(el, (counts.get(el) ?? 0) + v * k));
  }
  const parts = [...counts].map(([symbol, count]) => ({ symbol, count, mass: calcMass(symbol)! }));
  const M = Math.round(parts.reduce((s, p) => s + p.count * p.mass, 0) * 100) / 100;
  return { M, parts };
}
