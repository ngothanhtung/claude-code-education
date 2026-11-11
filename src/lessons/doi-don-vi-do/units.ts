/**
 * Bảng đơn vị đo và phép dời dấu phẩy, tính trên chuỗi chữ số (không dùng số thực
 * để tránh sai số kiểu 0,1 + 0,2).
 */

export type Kind = 'dai' | 'khoiluong' | 'dientich' | 'thetich';

export interface KindInfo {
  label: string;
  /** tên đại lượng dùng trong câu, ví dụ "diện tích" */
  name: string;
  /** đơn vị từ lớn đến bé */
  units: readonly string[];
  /** số chữ số ứng với mỗi đơn vị trong bảng (= số mũ của 10 giữa hai đơn vị liền nhau) */
  k: 1 | 2 | 3;
  /** đề mặc định khi chọn đại lượng này */
  preset: { value: string; from: number; to: number };
}

export const KINDS: Record<Kind, KindInfo> = {
  dai: {
    label: 'Độ dài',
    name: 'độ dài',
    units: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'],
    k: 1,
    preset: { value: '2.5', from: 0, to: 3 },
  },
  khoiluong: {
    label: 'Khối lượng',
    name: 'khối lượng',
    units: ['tấn', 'tạ', 'yến', 'kg', 'hg', 'dag', 'g'],
    k: 1,
    preset: { value: '3.2', from: 0, to: 3 },
  },
  dientich: {
    label: 'Diện tích',
    name: 'diện tích',
    units: ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'],
    k: 2,
    preset: { value: '3.5', from: 3, to: 4 },
  },
  thetich: {
    label: 'Thể tích',
    name: 'thể tích',
    units: ['m³', 'dm³', 'cm³'],
    k: 3,
    preset: { value: '1.25', from: 0, to: 1 },
  },
};

/** Tách "3.5" thành phần nguyên và phần thập phân */
export function splitDecimal(value: string) {
  const [int, frac = ''] = value.split('.');
  return { int, frac };
}

/** Nhân với 10^shift (shift âm là chia), trả về chuỗi chuẩn có dấu chấm */
export function shiftDecimal(value: string, shift: number): string {
  const { int, frac } = splitDecimal(value);
  let digits = int + frac;
  let point = int.length + shift;
  if (point > digits.length) digits = digits + '0'.repeat(point - digits.length);
  if (point <= 0) {
    digits = '0'.repeat(1 - point) + digits;
    point = 1;
  }
  let i = digits.slice(0, point).replace(/^0+(?=\d)/, '');
  const f = digits.slice(point).replace(/0+$/, '');
  if (i === '') i = '0';
  return f ? `${i}.${f}` : i;
}

/** "35000.5" -> "35 000,5" (nhóm 3 chữ số khi phần nguyên từ 5 chữ số trở lên, như SGK) */
export function viNumber(value: string): string {
  const { int, frac } = splitDecimal(value);
  const grouped = int.length >= 5 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : int;
  return frac ? `${grouped},${frac}` : grouped;
}

/** 10^n viết kiểu SGK: 100, 1000, 10 000… */
export const powerOf10 = (n: number) => viNumber('1' + '0'.repeat(n));

export interface Placement {
  /** tổng số ô chữ số của bảng */
  cells: number;
  /** ô chứa chữ số đầu tiên / cuối cùng của số ban đầu */
  first: number;
  last: number;
  /** chữ số theo thứ tự từ ô `first` */
  digits: string;
  /** vị trí dấu phẩy (ranh giới giữa ô b-1 và ô b) lúc đầu và lúc cuối */
  b0: number;
  b1: number;
  fits: boolean;
}

/** Viết số vào bảng: chữ số hàng đơn vị nằm ở ô cuối cùng của đơn vị `from` */
export function place(value: string, kind: KindInfo, from: number, to: number): Placement {
  const { int, frac } = splitDecimal(value);
  const cells = kind.units.length * kind.k;
  const ones = (from + 1) * kind.k - 1;
  const first = ones - int.length + 1;
  const last = ones + frac.length;
  return {
    cells,
    first,
    last,
    digits: int + frac,
    b0: (from + 1) * kind.k,
    b1: (to + 1) * kind.k,
    fits: first >= 0 && last <= cells - 1,
  };
}
