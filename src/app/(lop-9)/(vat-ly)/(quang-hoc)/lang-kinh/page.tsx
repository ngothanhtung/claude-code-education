import type { Metadata } from 'next';
import LangKinhLesson from '@/lessons/lop-9/vat-ly/quang-hoc/lang-kinh/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('lang-kinh').title };

export default function Page() {
  return <LangKinhLesson />;
}
