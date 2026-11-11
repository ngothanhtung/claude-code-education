import type { Metadata } from 'next';
import GioDenLesson from '@/lessons/gio-den-noi/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('gio-den-noi').title };

export default function Page() {
  return <GioDenLesson />;
}
