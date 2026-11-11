/** Định dạng số và thời gian kiểu Việt Nam (dấu phẩy thập phân, "giờ", "phút"). */

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** 1.25 -> "1,25" (tối đa d chữ số thập phân, bỏ số 0 thừa) */
export function fmt(n: number, d = 2): string {
  const r = Math.round(n * 10 ** d) / 10 ** d;
  return String(r).replace('.', ',');
}

/** Số có biểu diễn chính xác với d chữ số thập phân hay không */
export function isExact(n: number, d = 2): boolean {
  const k = n * 10 ** d;
  return Math.abs(k - Math.round(k)) < 1e-7;
}

/** 1.2 -> "1 giờ 12 phút" */
export function hm(hours: number): string {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

/** Số phút tính từ 0 giờ -> "7 giờ 30 phút" */
export function clockStr(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

/** Thời lượng dùng trong đáp số, thêm "khoảng" khi số phút không tròn */
export function durationAns(hours: number): string {
  return (isExact(hours * 60, 0) ? '' : 'khoảng ') + hm(hours);
}

/** Độ dài thang km "đẹp", chia được thành 5 vạch */
export function niceLength(km: number): number {
  const x = km / 5;
  const mag = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * mag >= x) return m * mag * 5;
  return 50 * mag;
}
