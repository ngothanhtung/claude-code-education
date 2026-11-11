import Link from 'next/link';
import { lessonsOf, topicHref, trailOf, type LessonSlug } from '@/lib/lessons';

/** Thanh chuyển bài trên đầu mỗi trang: các bài cùng chủ đề + về danh sách bài của lớp */
export default function LessonNav({ current }: { current: LessonSlug }) {
  const { topic } = trailOf(current);
  return (
    <nav className="lesson-nav" aria-label="Các bài cùng chủ đề">
      <Link href={topicHref(topic.id)}>Tất cả bài</Link>
      {lessonsOf(topic.id).map((l) => (
        <Link key={l.slug} href={`/${l.slug}`} aria-current={l.slug === current ? 'page' : undefined}>
          {l.nav}
        </Link>
      ))}
    </nav>
  );
}
