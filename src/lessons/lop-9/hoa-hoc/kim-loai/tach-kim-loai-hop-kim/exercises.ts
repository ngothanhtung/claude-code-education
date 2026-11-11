import type { Params } from './Lesson';

/**
 * Bài tập 1…5 – Tách kim loại và việc sử dụng hợp kim (KHTN 9, Bài 20)
 * lop-9 / hoa-hoc / kim-loai
 * zn là % kẽm trong đồng thau, dùng để tạo thể tích khí H₂ cho trong đề.
 */
export const EXERCISES: Params[] = [
  { mode: 'locao', ore: 1, pct: 80, H: 100, alloy: 20, zn: 32.5 },
  { mode: 'locao', ore: 10, pct: 60, H: 90, alloy: 20, zn: 32.5 },
  { mode: 'dienphan', ore: 10.2, pct: 80, H: 100, alloy: 20, zn: 32.5 },
  { mode: 'dienphan', ore: 20.4, pct: 80, H: 90, alloy: 20, zn: 32.5 },
  { mode: 'hopkim', ore: 1, pct: 80, H: 100, alloy: 20, zn: 32.5 },
];
