import type { Metadata } from 'next';
import HinhTronLesson from '@/lessons/lop-5/toan/do-luong/hinh-tron/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('hinh-tron').title };

export default function Page() {
  return <HinhTronLesson />;
}
