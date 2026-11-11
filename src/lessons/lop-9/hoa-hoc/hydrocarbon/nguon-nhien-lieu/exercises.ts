import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Nguồn nhiên liệu (KHTN 9, Bài 25)
 * lop-9 / hoa-hoc / hydrocarbon
 * Nhiệt đốt cháy 1 mol: CH₄ 890 kJ, C₄H₁₀ 2878 kJ, C 394 kJ; nước c = 4,2 kJ/(kg.°C).
 */
export const EXERCISES: Params[] = [
  { mode: 'nhiet', fuel: 'CH4', m: 32, water: 2, t1: 25, t2: 100, H: 60 },
  { mode: 'nhiet', fuel: 'C', m: 1200, water: 2, t1: 25, t2: 100, H: 60 },
  { mode: 'dunnuoc', fuel: 'CH4', m: 32, water: 2, t1: 25, t2: 100, H: 60 },
  { mode: 'dunnuoc', fuel: 'C4H10', m: 32, water: 5, t1: 20, t2: 100, H: 80 },
  { mode: 'co2', fuel: 'C4H10', m: 580, water: 2, t1: 25, t2: 100, H: 60 },
];
