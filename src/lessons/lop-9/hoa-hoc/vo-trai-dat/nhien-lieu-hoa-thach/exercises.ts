import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Nhiên liệu hóa thạch. Chu trình carbon và sự ấm lên toàn cầu (KHTN 9, Bài 35)
 * lop-9 / hoa-hoc / vo-trai-dat
 * Lượng CO₂ một cây hấp thụ mỗi năm là số liệu tham khảo, ghi rõ trong đề.
 */
export const EXERCISES: Params[] = [
  { mode: 'xang', km: 100, cons: 2, coal: 1, pctC: 80, co2: 1100, absorb: 22 },
  { mode: 'xang', km: 1500, cons: 2, coal: 1, pctC: 80, co2: 1100, absorb: 22 },
  { mode: 'than', km: 100, cons: 2, coal: 1, pctC: 80, co2: 1100, absorb: 22 },
  { mode: 'cay', km: 100, cons: 2, coal: 1, pctC: 80, co2: 1100, absorb: 22 },
  { mode: 'than', km: 100, cons: 2, coal: 100, pctC: 90, co2: 1100, absorb: 22 },
];
