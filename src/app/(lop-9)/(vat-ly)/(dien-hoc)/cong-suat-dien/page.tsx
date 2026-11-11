import type { Metadata } from 'next';
import CongSuatDienLesson from '@/lessons/lop-9/vat-ly/dien-hoc/cong-suat-dien/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('cong-suat-dien').title };

export default function Page() {
  return <CongSuatDienLesson />;
}
