import type { Metadata } from 'next';
import CongSuatLesson from '@/lessons/lop-9/vat-ly/nang-luong-co-hoc/cong-suat/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('cong-suat').title };

export default function Page() {
  return <CongSuatLesson />;
}
