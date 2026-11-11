/**
 * Viết công thức LaTeX theo cách trình bày của SGK Việt Nam:
 * dấu phẩy thập phân (1{,}2), nhóm nghìn bằng khoảng trắng hẹp (10\,000),
 * đơn vị và chữ tiếng Việt đứng thẳng trong \text{...}.
 */
import { fmtG, hm } from './format';

/** Số → TeX: 1.2 → "1{,}2"; 10000 → "10\,000"; -3 → "-3" */
export function N(x: number, d = 2): string {
  return fmtG(x, d).replace(/−/g, '-').replace(/,/g, '{,}').replace(/ /g, '\\,');
}

/** Chuỗi số đã định dạng kiểu Việt Nam ("35 000,5") → TeX */
export const NS = (s: string) => s.replace(/,/g, '{,}').replace(/ /g, '\\,');

/** Đơn vị có số mũ: "m²" → \text{m}^2, "cm³" → \text{cm}^3, "kg" → \text{kg} */
export function UN(unit: string): string {
  const m = unit.match(/^(.*?)([²³])$/);
  return m ? `${T(m[1])}^${m[2] === '²' ? 2 : 3}` : T(unit);
}

/** Chữ thường trong công thức (giữ dấu tiếng Việt, thoát ký tự đặc biệt của TeX) */
export function T(s: string): string {
  return `\\text{${s.replace(/([%&#_{}$])/g, '\\$1')}}`;
}

/** Đơn vị đặt trong ngoặc sau phép tính, kiểu Toán tiểu học: "(km/giờ)" */
export const U = (unit: string) => `\\;(${T(unit)})`;

/** Đơn vị đi liền sau số, kiểu Vật lý: "10 m" */
export const u = (unit: string) => `\\,${T(unit)}`;

/** Ô trống "?" khi chưa hiện đáp án */
export const B = (show: boolean, tex: string) => (show ? tex : '\\blank');

/** Thời lượng bằng chữ: 1,2 giờ → \text{1 giờ 12 phút} */
export const H = (hours: number) => T(hm(hours));

/** Góc: 32,1° */
export const D = (a: number, d = 1) => `${N(a, d)}^\\circ`;

/** Dấu "=" hoặc "≈" tùy kết quả có chính xác không */
export const eq = (exact: boolean) => (exact ? '=' : '\\approx');

/** Số dạng a × 10^n: SCI(1.1, -6) → 1{,}1 \times 10^{-6} */
export const SCI = (mant: number, exp: number) => `${N(mant)} \\times 10^{${exp}}`;

/** Tiền tố "≈ " cho đáp số gần đúng */
export const ap = (exact: boolean) => (exact ? '' : '\\approx ');
