import type { Metadata } from 'next';
import GioDenLesson from '@/lessons/lop-5/toan/chuyen-dong/gio-den-noi/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('gio-den-noi').title };

export default function Page() {
  return <GioDenLesson />;
}
