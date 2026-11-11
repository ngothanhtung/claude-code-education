import type { Metadata } from 'next';
import NguocChieuLesson from '@/lessons/lop-5/toan/chuyen-dong/hai-xe-chuyen-dong-nguoc-chieu/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('hai-xe-chuyen-dong-nguoc-chieu').title };

export default function Page() {
  return <NguocChieuLesson />;
}
