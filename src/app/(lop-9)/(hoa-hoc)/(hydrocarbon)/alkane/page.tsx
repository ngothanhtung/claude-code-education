import type { Metadata } from 'next';
import AlkaneLesson from '@/lessons/lop-9/hoa-hoc/hydrocarbon/alkane/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('alkane').title };

export default function Page() {
  return <AlkaneLesson />;
}
