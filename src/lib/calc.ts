/**
 * Máy tính khoa học: biểu thức là một dãy "phím" (token) như trên máy tính cầm tay,
 * nên DEL xóa trọn một phím (vd. "sin(") và con trỏ đi theo từng phím.
 * Tự phân tích cú pháp (không dùng eval). Hàm thiếu dấu ")" ở cuối được tự đóng.
 *
 * Thứ tự ưu tiên: dấu ngoặc, hàm → lũy thừa và phép toán hậu tố (², ³, ⁻¹, !, %) → dấu âm
 * → nhân, chia (kể cả nhân ngầm như 2π, 3(4 + 1), 2sin(30)) → cộng, trừ.
 */

export type AngleMode = 'deg' | 'rad';

export const FUNCS = [
  'sin(', 'cos(', 'tan(', 'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(',
  'log(', 'ln(', '10^(', 'e^(', '√(', '∛(', 'Abs(',
] as const;
export type Func = (typeof FUNCS)[number];

/** Phép toán hậu tố, viết ngay sau số */
export const POSTFIX = ['²', '³', '⁻¹', '!', '%'] as const;
export const BINARY = ['+', '−', '×', ':'] as const;
export const CONSTS = ['π', 'e', 'Ans', 'M'] as const;

/** "^(" là lũy thừa: số mũ đặt trong ngoặc như máy tính cầm tay */
export const POW = '^(';
/** "ᴇ" là ×10ⁿ: ngay sau là số mũ nguyên (có thể âm) */
export const EXP = 'ᴇ';

export type Token = string;

export class CalcError extends Error {
  constructor(public kind: 'syntax' | 'math') {
    super(kind === 'syntax' ? 'Lỗi cú pháp' : 'Lỗi toán');
  }
}

export interface CalcEnv {
  angle: AngleMode;
  ans: number;
  mem: number;
}

// ------------------------------------------------------------
// Tách dãy phím thành các đơn vị: số, hằng, hàm, toán tử
// ------------------------------------------------------------
type Lex =
  | { t: 'num'; v: number }
  | { t: 'exp'; v: number }
  | { t: 'const'; v: (typeof CONSTS)[number] }
  | { t: 'func'; v: Func }
  | { t: 'pow' }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'bin'; v: (typeof BINARY)[number] }
  | { t: 'post'; v: (typeof POSTFIX)[number] };

const isDigit = (s: Token) => s.length === 1 && s >= '0' && s <= '9';

function lex(tokens: readonly Token[]): Lex[] {
  const out: Lex[] = [];
  let i = 0;
  while (i < tokens.length) {
    const k = tokens[i];
    if (isDigit(k) || k === ',') {
      let s = '';
      while (i < tokens.length && (isDigit(tokens[i]) || tokens[i] === ',')) s += tokens[i++];
      if ((s.match(/,/g) ?? []).length > 1 || s === ',') throw new CalcError('syntax');
      out.push({ t: 'num', v: parseFloat(s.replace(',', '.')) });
      continue;
    }
    if (k === EXP) {
      i++;
      let sign = 1;
      if (tokens[i] === '−') { sign = -1; i++; } else if (tokens[i] === '+') i++;
      let s = '';
      while (i < tokens.length && isDigit(tokens[i])) s += tokens[i++];
      if (!s) throw new CalcError('syntax');
      out.push({ t: 'exp', v: sign * parseInt(s, 10) });
      continue;
    }
    i++;
    if ((CONSTS as readonly string[]).includes(k)) out.push({ t: 'const', v: k as (typeof CONSTS)[number] });
    else if ((FUNCS as readonly string[]).includes(k)) out.push({ t: 'func', v: k as Func });
    else if (k === POW) out.push({ t: 'pow' });
    else if (k === '(') out.push({ t: 'lp' });
    else if (k === ')') out.push({ t: 'rp' });
    else if ((BINARY as readonly string[]).includes(k)) out.push({ t: 'bin', v: k as (typeof BINARY)[number] });
    else if ((POSTFIX as readonly string[]).includes(k)) out.push({ t: 'post', v: k as (typeof POSTFIX)[number] });
    else throw new CalcError('syntax');
  }
  return out;
}

// ------------------------------------------------------------
// Phân tích và tính
// ------------------------------------------------------------
const finite = (x: number) => {
  if (!Number.isFinite(x) || Number.isNaN(x)) throw new CalcError('math');
  return x;
};

/** Khử sai số dấu phẩy động của hàm lượng giác: sin 30° = 0,5; cos 90° = 0 */
const snap = (x: number) => (Math.abs(x) < 1e-13 ? 0 : parseFloat(x.toPrecision(14)));

function factorial(n: number) {
  if (n < 0 || n > 170 || !Number.isInteger(n)) throw new CalcError('math');
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function applyFunc(f: Func, x: number, angle: AngleMode): number {
  const toRad = (a: number) => (angle === 'deg' ? (a * Math.PI) / 180 : a);
  const fromRad = (a: number) => (angle === 'deg' ? (a * 180) / Math.PI : a);
  switch (f) {
    case 'sin(': return snap(Math.sin(toRad(x)));
    case 'cos(': return snap(Math.cos(toRad(x)));
    case 'tan(': {
      const c = snap(Math.cos(toRad(x)));
      if (c === 0) throw new CalcError('math');
      return snap(Math.sin(toRad(x)) / Math.cos(toRad(x)));
    }
    case 'sin⁻¹(':
      if (x < -1 || x > 1) throw new CalcError('math');
      return snap(fromRad(Math.asin(x)));
    case 'cos⁻¹(':
      if (x < -1 || x > 1) throw new CalcError('math');
      return snap(fromRad(Math.acos(x)));
    case 'tan⁻¹(': return snap(fromRad(Math.atan(x)));
    case 'log(':
      if (x <= 0) throw new CalcError('math');
      return Math.log10(x);
    case 'ln(':
      if (x <= 0) throw new CalcError('math');
      return Math.log(x);
    case '10^(': return 10 ** x;
    case 'e^(': return Math.exp(x);
    case '√(':
      if (x < 0) throw new CalcError('math');
      return Math.sqrt(x);
    case '∛(': return Math.cbrt(x);
    case 'Abs(': return Math.abs(x);
  }
}

function power(b: number, e: number) {
  // căn bậc lẻ của số âm: (−8)^(1:3) = −2
  if (b < 0 && !Number.isInteger(e)) {
    const inv = 1 / e;
    if (Number.isInteger(Math.round(inv)) && Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0) {
      return -((-b) ** e);
    }
    throw new CalcError('math');
  }
  if (b === 0 && e < 0) throw new CalcError('math');
  return b ** e;
}

export function evaluate(tokens: readonly Token[], env: CalcEnv): number {
  const L = lex(tokens);
  let i = 0;
  const peek = () => L[i];

  /** Đơn vị có thể bắt đầu một thừa số (dùng cho phép nhân ngầm) */
  const startsFactor = (x: Lex | undefined) =>
    !!x && (x.t === 'num' || x.t === 'exp' || x.t === 'const' || x.t === 'func' || x.t === 'lp');

  const closeParen = () => {
    const x = peek();
    if (x?.t === 'rp') i++;
    else if (x !== undefined) throw new CalcError('syntax');
    // hết biểu thức: tự đóng ngoặc
  };

  function expr(): number {
    let v = term();
    for (let x = peek(); x?.t === 'bin' && (x.v === '+' || x.v === '−'); x = peek()) {
      i++;
      const r = term();
      v = x.v === '+' ? v + r : v - r;
    }
    return v;
  }

  function term(): number {
    let v = unary();
    for (;;) {
      const x = peek();
      if (x?.t === 'bin' && (x.v === '×' || x.v === ':')) {
        i++;
        const r = unary();
        if (x.v === ':' && r === 0) throw new CalcError('math');
        v = x.v === '×' ? v * r : v / r;
      } else if (startsFactor(x)) {
        v *= unary();
      } else return v;
    }
  }

  function unary(): number {
    const x = peek();
    if (x?.t === 'bin' && x.v === '−') { i++; return -unary(); }
    if (x?.t === 'bin' && x.v === '+') { i++; return unary(); }
    return postfix();
  }

  function postfix(): number {
    let v = primary();
    for (;;) {
      const x = peek();
      if (x?.t === 'post') {
        i++;
        if (x.v === '²') v = v * v;
        else if (x.v === '³') v = v * v * v;
        else if (x.v === '⁻¹') {
          if (v === 0) throw new CalcError('math');
          v = 1 / v;
        } else if (x.v === '!') v = factorial(v);
        else v = v / 100;
      } else if (x?.t === 'pow') {
        i++;
        const e = expr();
        closeParen();
        v = power(v, e);
      } else return v;
    }
  }

  function primary(): number {
    const x = peek();
    if (!x) throw new CalcError('syntax');
    i++;
    switch (x.t) {
      case 'num': {
        const e = peek();
        if (e?.t === 'exp') { i++; return x.v * 10 ** e.v; }
        return x.v;
      }
      case 'exp': return 10 ** x.v;
      case 'const':
        return x.v === 'π' ? Math.PI : x.v === 'e' ? Math.E : x.v === 'Ans' ? env.ans : env.mem;
      case 'func': {
        const a = expr();
        closeParen();
        return finite(applyFunc(x.v, a, env.angle));
      }
      case 'lp': {
        const a = expr();
        closeParen();
        return a;
      }
      default:
        throw new CalcError('syntax');
    }
  }

  if (L.length === 0) throw new CalcError('syntax');
  const v = expr();
  if (i < L.length) throw new CalcError('syntax');
  return clean(finite(v));
}

/** Bỏ đuôi sai số: 0,1 + 0,2 = 0,3 */
export const clean = (x: number) => (x === 0 ? 0 : parseFloat(x.toPrecision(12)));

// ------------------------------------------------------------
// Hiển thị kết quả theo cách viết Việt Nam
// ------------------------------------------------------------
export type Shown =
  | { kind: 'dec'; text: string }
  | { kind: 'sci'; mant: string; exp: number }
  | { kind: 'frac'; neg: boolean; num: number; den: number };

/** Số thập phân dấu phẩy, phần nguyên từ 5 chữ số tách nhóm bằng khoảng trắng hẹp (10 000) */
function decText(x: number, sig = 10) {
  const s = parseFloat(x.toPrecision(sig)).toString();
  const neg = s.startsWith('-');
  const [int, frac] = (neg ? s.slice(1) : s).split('.');
  const grouped = int.length >= 5 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : int;
  return (neg ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

export function show(x: number): Shown {
  const a = Math.abs(x);
  if (x !== 0 && (a >= 1e10 || a < 1e-3)) {
    let exp = Math.floor(Math.log10(a));
    let m = parseFloat((x / 10 ** exp).toPrecision(10));
    if (Math.abs(m) >= 10) { m /= 10; exp += 1; }
    return { kind: 'sci', mant: decText(m), exp };
  }
  return { kind: 'dec', text: decText(x) };
}

/** Đổi sang phân số tối giản (mẫu ≤ 10 000) nếu giá trị đúng là một phân số; không được thì undefined */
export function toFraction(x: number): Shown | undefined {
  if (Number.isInteger(x) || !Number.isFinite(x)) return undefined;
  const neg = x < 0;
  const a = Math.abs(x);
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let b = a;
  for (let n = 0; n < 30; n++) {
    const q = Math.floor(b);
    [h0, h1] = [h1, q * h1 + h0];
    [k0, k1] = [k1, q * k1 + k0];
    if (k1 > 10000) return undefined;
    if (Math.abs(a - h1 / k1) < 1e-10 * Math.max(1, a)) return { kind: 'frac', neg, num: h1, den: k1 };
    b = 1 / (b - q);
    if (!Number.isFinite(b)) break;
  }
  return undefined;
}

/** Phím nối tiếp kết quả trước: bấm ngay sau dấu = thì máy tự thêm Ans phía trước (Ans + …, Ans² …) */
export const continuesAns = (t: Token) =>
  (BINARY as readonly string[]).includes(t) || t === POW || (POSTFIX as readonly string[]).includes(t);

/** Một số → dãy phím để chèn lại vào biểu thức (vd. từ lịch sử): −1,1ᴇ−6 */
export function numberTokens(x: number): Token[] {
  const s = parseFloat(x.toPrecision(12)).toString(); // "-1.1e-6", "0.45"
  const [m, e] = s.split('e');
  const out: Token[] = [];
  for (const ch of m) out.push(ch === '-' ? '−' : ch === '.' ? ',' : ch);
  if (e) {
    out.push(EXP);
    for (const ch of e) if (ch !== '+') out.push(ch === '-' ? '−' : ch);
  }
  return x < 0 ? ['(', ...out, ')'] : out;
}
