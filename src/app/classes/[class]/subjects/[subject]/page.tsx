import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Arrow, CatalogHead, LessonCards, Tabs, TeacherTip } from '@/components/Catalog';
import {
  SUBJECTS, classHref, getGrade, gradeByNo, lessonsOf, subjectBySlug, topicHref, topicsOf,
} from '@/lib/lessons';

type Props = { params: Promise<{ class: string; subject: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ class: getGrade(s.grade).no, subject: s.slug }));
}

async function resolve(params: Props['params']) {
  const p = await params;
  const grade = gradeByNo(p.class);
  const subject = grade && subjectBySlug(grade.id, p.subject);
  return grade && subject ? { grade, subject } : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  return { title: r ? `${r.subject.title} ${r.grade.no} – Các chủ đề` : 'Không tìm thấy môn' };
}

/** Một môn: các chủ đề, mỗi chủ đề kèm thẻ bài */
export default async function SubjectPage({ params }: Props) {
  const r = await resolve(params);
  if (!r) notFound();
  const { grade, subject } = r;
  const topics = topicsOf(subject.id);

  return (
    <main className="sheet">
      <CatalogHead
        crumbs={[
          { label: 'Chọn lớp', href: '/' },
          { label: grade.title, href: classHref(grade.id) },
          { label: subject.title },
        ]}
        title={`${subject.title} ${grade.no}`}
        intro={subject.note || 'Chọn một chủ đề hoặc mở ngay một bài bên dưới.'}
      >
        <Tabs label="Các chủ đề" variant="topic"
          items={topics.map((t) => ({ key: t.id, label: `${t.title} (${lessonsOf(t.id).length})`, href: topicHref(t.id) }))} />
      </CatalogHead>

      {topics.map((topic) => (
        <section key={topic.id} id={topic.id} className="topic" aria-labelledby={`${topic.id}-title`}>
          <h2 id={`${topic.id}-title`} className="topic-title">
            <Link href={topicHref(topic.id)}>
              {topic.title}
              <Arrow />
            </Link>
          </h2>
          <LessonCards topic={topic.id} />
        </section>
      ))}

      <TeacherTip />
    </main>
  );
}
