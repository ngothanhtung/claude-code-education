import type { Metadata } from 'next';
import KinhLupLesson from '@/lessons/lop-9/vat-ly/quang-hoc/kinh-lup-do-tieu-cu/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('kinh-lup-do-tieu-cu').title };

export default function Page() {
  return <KinhLupLesson />;
}
