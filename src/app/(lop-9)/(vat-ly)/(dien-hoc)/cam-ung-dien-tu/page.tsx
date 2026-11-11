import type { Metadata } from 'next';
import CamUngLesson from '@/lessons/lop-9/vat-ly/dien-hoc/cam-ung-dien-tu/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('cam-ung-dien-tu').title };

export default function Page() {
  return <CamUngLesson />;
}
