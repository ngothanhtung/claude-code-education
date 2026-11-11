import type { Metadata } from 'next';
import KhucXaLesson from '@/lessons/lop-9/vat-ly/quang-hoc/khuc-xa-anh-sang/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('khuc-xa-anh-sang').title };

export default function Page() {
  return <KhucXaLesson />;
}
