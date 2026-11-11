import type { Metadata } from 'next';
import HinhTronLesson from '@/lessons/hinh-tron/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('hinh-tron').title };

export default function Page() {
  return <HinhTronLesson />;
}
