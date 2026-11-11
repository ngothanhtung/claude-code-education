import type { Metadata } from 'next';
import AceticAcidLesson from '@/lessons/lop-9/hoa-hoc/ruou-axit/acetic-acid/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('acetic-acid').title };

export default function Page() {
  return <AceticAcidLesson />;
}
