import Link from 'next/link';
import { Arrow, TeacherTip } from '@/components/Catalog';
import { GRADES, classHref, lessonCountOfSubject, subjectHref, subjectsOf, topicsOf } from '@/lib/lessons';

/** Trang đầu: chọn lớp. Mỗi lớp dẫn tới /classes/<no>/subjects */
export default function HomePage() {
  return (
    <main className="sheet">
      <header className="sheet-head">
        <div className="sheet-subject">Vở mô phỏng</div>
        <h1>Chọn lớp</h1>
        <p>
          Mỗi bài có đề bài đổi được số liệu, hình minh họa chuyển động và bài giải mẫu theo cách trình bày trong vở.
        </p>
      </header>

      <ul className="grade-cards">
        {GRADES.map((grade) => {
          const subjects = subjectsOf(grade.id);
          const total = subjects.reduce((n, s) => n + lessonCountOfSubject(s.id), 0);
          return (
            <li key={grade.id} id={grade.id} className="grade-card">
              <div className="grade-card-head">
                <span className="grade-level">{grade.level}</span>
                <h2>
                  <Link href={classHref(grade.id)}>{grade.title}</Link>
                </h2>
                <span className="grade-count">{total} bài</span>
              </div>

              <ul className="grade-subjects" aria-label={`Các môn ${grade.title}`}>
                {subjects.map((s) => (
                  <li key={s.id}>
                    <Link href={subjectHref(s.id)}>
                      <b>{s.title}</b>
                      <span>{topicsOf(s.id).map((t) => t.title).join(' · ')}</span>
                      <em>{lessonCountOfSubject(s.id)} bài</em>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link className="grade-open" href={classHref(grade.id)}>
                Vào {grade.title.toLowerCase()}
                <Arrow />
              </Link>
            </li>
          );
        })}
      </ul>

      <TeacherTip />
    </main>
  );
}
