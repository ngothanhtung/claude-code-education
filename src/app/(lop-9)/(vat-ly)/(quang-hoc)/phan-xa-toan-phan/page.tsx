import type { Metadata } from 'next';
import PhanXaToanPhanLesson from '@/lessons/lop-9/vat-ly/quang-hoc/phan-xa-toan-phan/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('phan-xa-toan-phan').title };

export default function Page() {
  return <PhanXaToanPhanLesson />;
}
