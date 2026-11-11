import type { Metadata } from 'next';
import VoTraiDatLesson from '@/lessons/lop-9/hoa-hoc/vo-trai-dat/vo-trai-dat/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('vo-trai-dat').title };

export default function Page() {
  return <VoTraiDatLesson />;
}
