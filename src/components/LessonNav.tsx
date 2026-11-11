import Link from 'next/link';
import { getLesson, lessonsOf, type LessonSlug } from '@/lib/lessons';

/** Thanh chuyển bài trên đầu mỗi trang: các bài cùng chủ đề + về mục lục */
export default function LessonNav({ current }: { current: LessonSlug }) {
  const { topic } = getLesson(current);
  return (
    <nav className="lesson-nav" aria-label="Các bài cùng chủ đề">
      <Link href="/">Tất cả bài</Link>
      {lessonsOf(topic).map((l) => (
        <Link key={l.slug} href={`/${l.slug}`} aria-current={l.slug === current ? 'page' : undefined}>
          {l.nav}
        </Link>
      ))}
    </nav>
  );
}
