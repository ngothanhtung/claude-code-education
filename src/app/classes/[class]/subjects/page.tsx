import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Arrow, CatalogHead, Tabs, TeacherTip } from '@/components/Catalog';
import {
  GRADES, classHref, gradeByNo, lessonCountOfSubject, lessonsOf, subjectHref, subjectsOf, topicHref, topicsOf,
} from '@/lib/lessons';

type Props = { params: Promise<{ class: string }> };

/** Chỉ các lớp có trong GRADES; lớp khác trả 404 */
export const dynamicParams = false;

export function generateStaticParams() {
  return GRADES.map((g) => ({ class: g.no }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const grade = gradeByNo((await params).class);
  return { title: grade ? `${grade.title} – Các môn học` : 'Không tìm thấy lớp' };
}

/** Các môn của một lớp: mỗi môn một thẻ, liệt kê chủ đề dẫn tới trang chủ đề */
export default async function ClassSubjectsPage({ params }: Props) {
  const grade = gradeByNo((await params).class);
  if (!grade) notFound();

  return (
    <main className="sheet">
      <CatalogHead
        crumbs={[{ label: 'Chọn lớp', href: '/' }, { label: grade.title }]}
        title={`${grade.title}: các môn học`}
        intro="Chọn môn, rồi chọn chủ đề để xem các bài mô phỏng."
      >
        <Tabs label="Chọn lớp" variant="grade"
          items={GRADES.map((g) => ({ key: g.id, label: g.title, href: classHref(g.id), current: g.id === grade.id }))} />
      </CatalogHead>

      <ul className="grade-cards">
        {subjectsOf(grade.id).map((s) => (
          <li key={s.id} id={s.id} className="grade-card">
            <div className="grade-card-head">
              <span className="grade-level">{grade.title}</span>
              <h2>
                <Link href={subjectHref(s.id)}>{s.title}</Link>
              </h2>
              <span className="grade-count">{lessonCountOfSubject(s.id)} bài</span>
            </div>
            {s.note && <p className="subject-note">{s.note}</p>}

            <ul className="grade-subjects" aria-label={`Các chủ đề môn ${s.title}`}>
              {topicsOf(s.id).map((t) => (
                <li key={t.id}>
                  <Link href={topicHref(t.id)}>
                    <b>{t.title}</b>
                    <span>{lessonsOf(t.id).map((l) => l.nav).join(' · ')}</span>
                    <em>{lessonsOf(t.id).length} bài</em>
                  </Link>
                </li>
              ))}
            </ul>

            <Link className="grade-open" href={subjectHref(s.id)}>
              Vào môn {s.title}
              <Arrow />
            </Link>
          </li>
        ))}
      </ul>

      <TeacherTip />
    </main>
  );
}
