'use client';

import { Fragment, type ReactNode } from 'react';
import type { Simulation } from '@/hooks/useSimulation';
import { fmt, hm, isExact, round2 } from '@/lib/format';

// ------------------------------------------------------------
// Các dòng của bài giải trình bày như trong vở
// ------------------------------------------------------------

/** Ô trống "?" khi chưa hiện đáp án */
export const Blank = () => <span className="blank">?</span>;

/** Hiện giá trị khi đã có đáp án, ngược lại là ô trống */
export function Val({ show, children }: { show: boolean; children: ReactNode }) {
  return show ? <>{children}</> : <Blank />;
}

/** Câu dẫn, ví dụ "Tổng vận tốc của hai ô tô là:" */
export function Step({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

/** Dòng phép tính (thụt vào) */
export function Calc({ children }: { children: ReactNode }) {
  return <p className="calc">{children}</p>;
}

/** "Đổi: 2 giờ 30 phút = 2,5 giờ" khi số giờ không tròn */
export function ConvLine({ hours }: { hours: number }) {
  if (Number.isInteger(hours)) return null;
  return <Step>Đổi: {hm(hours)} = {fmt(hours)} giờ</Step>;
}

/** "1,2 giờ = 1 giờ 12 phút" khi đã hiện đáp án và số giờ không tròn */
export function MinutesLine({ hours, show }: { hours: number; show: boolean }) {
  if (!show || Number.isInteger(round2(hours))) return null;
  return (
    <Calc>
      {fmt(hours)} giờ {isExact(hours * 60, 0) ? '=' : '≈'} {hm(hours)}
    </Calc>
  );
}

/** Dòng "Đáp số:" – các ý được tô dạ quang lần lượt */
export function Answer({ show, items }: { show: boolean; items: string[] }) {
  return (
    <p className="answer">
      <span className="u">Đáp số:</span>{' '}
      {show ? (
        <>
          {items.map((x, i) => (
            <Fragment key={i}>
              {i > 0 && '; '}
              <mark className="hl" style={{ animationDelay: `${(0.05 + i * 0.3).toFixed(2)}s` }}>
                {x}
              </mark>
            </Fragment>
          ))}
          .
        </>
      ) : (
        <Blank />
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
  text: string;
}

export function Rules({ items, active }: { items: RuleItem[]; active?: string }) {
  return (
    <section className="rules" aria-labelledby="can-nho">
      <h2 id="can-nho">Cần nhớ</h2>
      {items.map((r) => (
        <p key={r.key ?? r.term} className={r.key && r.key === active ? 'active' : undefined}>
          <b>{r.term}</b> = {r.text}
        </p>
      ))}
    </section>
  );
}
