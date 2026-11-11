import type { Metadata } from 'next';
import DoiDonViLesson from '@/lessons/doi-don-vi-do/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('doi-don-vi-do').title };

export default function Page() {
  return <DoiDonViLesson />;
}
