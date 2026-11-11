import type { Metadata } from 'next';
import AlkeneLesson from '@/lessons/lop-9/hoa-hoc/hydrocarbon/alkene/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('alkene').title };

export default function Page() {
  return <AlkeneLesson />;
}
