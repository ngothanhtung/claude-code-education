import { GLASS, WATER } from '@/lib/draw/optics';

/** Môi trường trong suốt và chiết suất (theo bảng của KHTN 9) */
export type MediumId = 'nuoc' | 'thuytinh' | 'kimcuong';

export const MEDIA: Record<MediumId, { name: string; n: number; fill: string }> = {
  nuoc: { name: 'Nước', n: 1.33, fill: WATER },
  thuytinh: { name: 'Thủy tinh', n: 1.5, fill: GLASS },
  kimcuong: { name: 'Kim cương', n: 2.42, fill: '#E9E6F7' },
};

export const MEDIUM_OPTIONS = (Object.keys(MEDIA) as MediumId[]).map((k) => ({ value: k, label: MEDIA[k].name }));

const rad = (d: number) => (d * Math.PI) / 180;
const degOf = (r: number) => (r * 180) / Math.PI;

/** sin r = n1 · sin i : n2; trả về null nếu > 1 (phản xạ toàn phần) */
export function refractionAngle(i: number, n1: number, n2: number) {
  const sinR = (n1 * Math.sin(rad(i))) / n2;
  return { sinI: Math.sin(rad(i)), sinR, r: sinR > 1 ? null : degOf(Math.asin(sinR)) };
}

/** Góc tới hạn khi đi từ môi trường n ra không khí */
export const criticalAngle = (n: number) => degOf(Math.asin(1 / n));
