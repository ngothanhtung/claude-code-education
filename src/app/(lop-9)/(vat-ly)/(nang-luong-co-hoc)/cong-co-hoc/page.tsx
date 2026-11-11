import type { Metadata } from 'next';
import CongCoHocLesson from '@/lessons/lop-9/vat-ly/nang-luong-co-hoc/cong-co-hoc/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('cong-co-hoc').title };

export default function Page() {
  return <CongCoHocLesson />;
}
