'use client';

import { Fragment, type ReactNode } from 'react';
import type { Simulation } from '@/hooks/useSimulation';
import { isExact, round2 } from '@/lib/format';
import { H, N, T, eq } from '@/lib/tex';
import { Rich, Tex } from './Tex';

// ------------------------------------------------------------
// Các dòng của bài giải trình bày như trong vở.
// Chuỗi có thể chứa công thức LaTeX đặt giữa hai dấu $…$.
// ------------------------------------------------------------

/** Câu dẫn, ví dụ "Tổng vận tốc của hai ô tô là:" (có thể lẫn $công thức$) */
export function Step({ children }: { children: ReactNode }) {
  return <p>{typeof children === 'string' ? <Rich text={children} /> : children}</p>;
}

/** Dòng phép tính (thụt vào), viết bằng LaTeX */
export function Calc({ tex }: { tex: string }) {
  return (
    <p className="calc">
      <Tex src={tex} />
    </p>
  );
}

/**
 * Phần "Tóm tắt" của bài giải Vật lý: dữ kiện đã cho, đại lượng cần tìm, rồi "Giải".
 * given: ["m = 2\\,\\text{kg}", "h = 5\\,\\text{m}"], find: ["W_t = ?"] (mỗi phần tử là LaTeX)
 */
export function Summary({ given, find }: { given: string[]; find: string[] }) {
  return (
    <>
      <Step>
        <span className="u">Tóm tắt</span>
      </Step>
      <Calc tex={given.join(';\\quad ')} />
      <Calc tex={find.map((f) => `${f} = \\text{?}`).join(';\\quad ')} />
      <Step>
        <span className="u">Giải</span>
      </Step>
    </>
  );
}

/** "Đổi: 2 giờ 30 phút = 2,5 giờ" khi số giờ không tròn */
export function ConvLine({ hours }: { hours: number }) {
  if (Number.isInteger(hours)) return null;
  return <Step>{`Đổi: $${H(hours)} = ${N(hours)}${T(' giờ')}$`}</Step>;
}

/** "1,2 giờ = 1 giờ 12 phút" khi đã hiện đáp án và số giờ không tròn */
export function MinutesLine({ hours, show }: { hours: number; show: boolean }) {
  if (!show || Number.isInteger(round2(hours))) return null;
  return <Calc tex={`${N(hours)}${T(' giờ')} ${eq(isExact(hours * 60, 0))} ${H(hours)}`} />;
}

/** Dòng "Đáp số:" – các ý được tô dạ quang lần lượt (mỗi ý có thể lẫn $công thức$) */
export function Answer({ show, items }: { show: boolean; items: string[] }) {
  return (
    <p className="answer">
      <span className="u">Đáp số:</span>{' '}
      {show ? (
        <>
          {items.map((x, i) => (
            <Fragment key={i}>
              {i > 0 && '; '}
              <mark
                className={x.replace(/\$[^$]*\$/g, 'xxxxxx').length > 18 ? 'hl hl-wrap' : 'hl'}
                style={{ animationDelay: `${(0.05 + i * 0.3).toFixed(2)}s` }}
              >
                <Rich text={x} />
              </mark>
            </Fragment>
          ))}
          .
        </>
      ) : (
        <span className="blank">?</span>
      )}
    </p>
  );
}

// ------------------------------------------------------------
// Vở "Bài giải" + mục "Cần nhớ"
// ------------------------------------------------------------
export function Notebook({ sim, children }: { sim: Simulation; children: ReactNode }) {
  return (
    <section className="notebook" aria-labelledby="bai-giai">
      <div className="notebook-head">
        <h2 id="bai-giai">Bài giải</h2>
        <button className="link-btn" type="button" onClick={sim.toggleReveal} hidden={sim.done || !sim.enabled}>
          {sim.revealed ? 'Ẩn đáp án' : 'Hiện đáp án'}
        </button>
      </div>
      <div className="solution" aria-live="polite">
        {children}
      </div>
    </section>
  );
}

export interface RuleItem {
  /** khóa để tô nổi quy tắc đang dùng */
  key?: string;
  term: string;
  /** quy tắc bằng lời ("quãng đường : thời gian") hoặc công thức bắt đầu bằng $ */
  text: string;
}

export function Rules({ items, active }: { items: RuleItem[]; active?: string }) {
  return (
    <section className="rules" aria-labelledby="can-nho">
      <h2 id="can-nho">Cần nhớ</h2>
      {items.map((r) => (
        <p key={r.key ?? r.term} className={r.key && r.key === active ? 'active' : undefined}>
          <b>{r.term}</b>
          {r.text.startsWith('$') ? ': ' : ' = '}
          <Rich text={r.text} />
        </p>
      ))}
    </section>
  );
}
