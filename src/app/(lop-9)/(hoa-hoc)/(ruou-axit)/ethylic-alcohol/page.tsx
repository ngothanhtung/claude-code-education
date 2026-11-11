import type { Metadata } from 'next';
import EthylicAlcoholLesson from '@/lessons/lop-9/hoa-hoc/ruou-axit/ethylic-alcohol/Lesson';
import { getLesson } from '@/lib/lessons';

export const metadata: Metadata = { title: getLesson('ethylic-alcohol').title };

export default function Page() {
  return <EthylicAlcoholLesson />;
}
