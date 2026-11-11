import type { Metadata } from 'next';
import NhienLieuHoaThachLesson from '@/lessons/lop-9/hoa-hoc/vo-trai-dat/nhien-lieu-hoa-thach/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('nhien-lieu-hoa-thach').title };

export default function Page() {
  return <NhienLieuHoaThachLesson />;
}
