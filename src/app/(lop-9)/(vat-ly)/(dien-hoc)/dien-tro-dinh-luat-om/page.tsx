import type { Metadata } from 'next';
import DinhLuatOmLesson from '@/lessons/lop-9/vat-ly/dien-hoc/dien-tro-dinh-luat-om/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('dien-tro-dinh-luat-om').title };

export default function Page() {
  return <DinhLuatOmLesson />;
}
