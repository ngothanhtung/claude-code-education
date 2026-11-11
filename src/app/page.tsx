import Link from 'next/link';
import { LESSON_THUMBS } from '@/components/LessonThumbs';
import { TOPICS, lessonsOf } from '@/lib/lessons';

/** Trang mục lục: chọn bài toán, chia theo chủ đề */
export default function HomePage() {
  return (
    <main className="sheet">
      <header className="sheet-head">
        <div className="sheet-subject">Toán lớp 5</div>
        <h1>Mô phỏng bài toán</h1>
        <p>
          Chọn một bài để mở mô phỏng. Mỗi bài có đề bài đổi được số liệu, hình minh họa chuyển động và bài giải mẫu
          theo cách trình bày trong vở.
        </p>
      </header>

      {TOPICS.map((topic) => (
        <section key={topic.id} className="topic" aria-labelledby={`topic-${topic.id}`}>
          <h2 id={`topic-${topic.id}`} className="topic-title">
            {topic.title}
          </h2>
          <ol className="lesson-list">
            {lessonsOf(topic.id).map((l, i) => (
              <li key={l.slug}>
                <Link className="lesson-card" href={`/${l.slug}`}>
                  {LESSON_THUMBS[l.slug]}
                  <div>
                    <div className="lesson-no">Bài {i + 1}</div>
                    <h3>{l.title}</h3>
                    <p>{l.summary}</p>
                    <span className="lesson-rule">
                      <b>{l.rule.term}</b> = {l.rule.text}
                    </span>
                    <div className="lesson-open">
                      Mở mô phỏng
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                        strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <footer className="sheet-foot">
        Gợi ý cho giáo viên: mở bài trên màn chiếu, cho học sinh tự tính trước, rồi bấm nút phát để kiểm tra. Phím{' '}
        <b>Space</b> để chạy hoặc tạm dừng, <b>R</b> để làm lại.
      </footer>
    </main>
  );
}
