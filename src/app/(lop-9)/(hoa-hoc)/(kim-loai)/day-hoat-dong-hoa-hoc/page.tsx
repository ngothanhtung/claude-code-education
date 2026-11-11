import type { Metadata } from 'next';
import DayHoatDongLesson from '@/lessons/lop-9/hoa-hoc/kim-loai/day-hoat-dong-hoa-hoc/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('day-hoat-dong-hoa-hoc').title };

export default function Page() {
  return <DayHoatDongLesson />;
}
