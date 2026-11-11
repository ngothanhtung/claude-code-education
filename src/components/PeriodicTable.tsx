'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  CATEGORY_NAME, ELEMENTS, VALENCE, calcMass, formulaMass, groupName, shells,
  type Category, type ElementInfo,
} from '@/lib/elements';
import { fmt } from '@/lib/format';

/**
 * Bảng tuần hoàn dạng cửa sổ nổi cho các bài Hóa học: tra cứu nhanh nguyên tố
 * (số hiệu, nhóm, chu kì, nguyên tử khối, hóa trị, lớp electron) và tính khối lượng mol.
 * Phím mũi tên chuyển ô, gõ để tìm, Esc để đóng; phím tắt của mô phỏng không bị kích hoạt.
 */

const STORE = 'vo-mo-phong:bang-tuan-hoan';
const massText = (e: ElementInfo) => (e.radio ? `(${e.mass})` : String(e.mass).replace('.', ','));

/** Vị trí ô trong lưới: cột 1 là số chu kì, cột 2–19 là nhóm 1–18; hàng 1 là tên nhóm */
function cellPos(e: ElementInfo) {
  if (e.fRow) {
    const first = e.period === 6 ? 57 : 89;
    return { gridColumn: 4 + (e.z - first), gridRow: e.period === 6 ? 10 : 11 };
  }
  return { gridColumn: e.group + 1, gridRow: e.period + 1 };
}

function matches(e: ElementInfo, q: string) {
  if (!q) return true;
  if (/^\d+$/.test(q)) return e.z === Number(q);
  const l = q.toLowerCase();
  return e.symbol.toLowerCase() === l || e.name.startsWith(l) || (l.length >= 3 && e.name.includes(l));
}

export default function PeriodicTable() {
  const [open, setOpen] = useState(false);
  const [z, setZ] = useState(26);
  const [query, setQuery] = useState('');
  const [focusCat, setFocusCat] = useState<Category | null>(null);
  const [formula, setFormula] = useState('');
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  // Nhớ nguyên tố đang chọn và công thức vừa tính giữa các bài
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? 'null') as { z?: number; formula?: string } | null;
      if (s?.z && s.z >= 1 && s.z <= 118) setZ(s.z);
      if (typeof s?.formula === 'string') setFormula(s.formula);
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ z, formula }));
    } catch {}
  }, [z, formula]);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  const el = ELEMENTS[z - 1];
  const q = query.trim();
  const hits = useMemo(() => ELEMENTS.filter((e) => matches(e, q)), [q]);
  const mass = useMemo(() => formulaMass(formula), [formula]);

  const select = (next: ElementInfo) => {
    setZ(next.z);
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-z="${next.z}"]`)?.focus());
  };

  /** Mũi tên: trái/phải theo số hiệu, lên/xuống cùng nhóm */
  const move = (key: string) => {
    if (key === 'ArrowLeft' && z > 1) return select(ELEMENTS[z - 2]);
    if (key === 'ArrowRight' && z < 118) return select(ELEMENTS[z]);
    const dir = key === 'ArrowUp' ? -1 : 1;
    if (el.fRow) {
      const other = ELEMENTS[z - 1 + dir * 32];
      if (other?.fRow) select(other);
      return;
    }
    const target = ELEMENTS.find((e) => !e.fRow && e.group === el.group && e.period === el.period + dir);
    if (target) select(target);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Tab') return;
    // phím gõ trong cửa sổ không lọt ra phím tắt của mô phỏng
    e.stopPropagation();
    const inInput = (e.target as HTMLElement).tagName === 'INPUT';
    if (!inInput && e.key.startsWith('Arrow')) {
      e.preventDefault();
      move(e.key);
    }
  };

  // Kéo cửa sổ bằng thanh tiêu đề
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const onDragStart = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || !panel.current) return;
    const r = panel.current.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = useCallback((e: PointerEvent) => {
    if (!drag.current || !panel.current) return;
    const r = panel.current.getBoundingClientRect();
    setPos({
      x: Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - Math.min(r.width, 120)),
      y: Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 48),
    });
  }, []);
  const onDragEnd = () => {
    drag.current = null;
  };

  const sh = shells(el.z);
  const mainGroup = !el.fRow && (el.group <= 2 || el.group >= 13);
  const outer = el.z === 2 ? 2 : el.group <= 2 ? el.group : el.group - 10;

  return (
    <>
      <button type="button" className="calc-toggle ptable-toggle" aria-expanded={open} aria-controls="bang-tuan-hoan" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <rect x="2.5" y="4" width="5" height="5" rx="1" />
          <rect x="16.5" y="4" width="5" height="5" rx="1" />
          <rect x="2.5" y="10" width="5" height="5" rx="1" />
          <rect x="9.5" y="10" width="5" height="5" rx="1" />
          <rect x="16.5" y="10" width="5" height="5" rx="1" />
          <path d="M5 18.5h14" />
        </svg>
        Bảng tuần hoàn
      </button>

      {open && (
        <div
          id="bang-tuan-hoan"
          ref={panel}
          className="ptable"
          role="dialog"
          aria-label="Bảng tuần hoàn các nguyên tố hóa học"
          tabIndex={-1}
          data-own-keys=""
          onKeyDown={onKeyDown}
          style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
        >
          <div className="calc-bar" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd}>
            <span>Bảng tuần hoàn các nguyên tố hóa học</span>
            <button type="button" className="calc-close" aria-label="Đóng bảng tuần hoàn" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className="ptable-tools">
            <label className="ptable-search">
              <span>Tìm</span>
              <input
                type="search"
                value={query}
                placeholder="Ký hiệu, tên hoặc số hiệu: Fe, iron, 26"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && hits[0]) select(hits[0]);
                }}
              />
            </label>
            <div className="ptable-legend" role="group" aria-label="Tô đậm theo loại nguyên tố">
              {(Object.keys(CATEGORY_NAME) as Category[]).map((c) => (
                <button key={c} type="button" className={`cat-${c}`} aria-pressed={focusCat === c} onClick={() => setFocusCat((f) => (f === c ? null : c))}>
                  {CATEGORY_NAME[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="ptable-scroll">
            <div className="ptable-grid" ref={grid} role="grid" aria-label="Các nguyên tố xếp theo nhóm và chu kì">
              {Array.from({ length: 18 }, (_, i) => (
                <span key={`g${i}`} className="ptable-head" style={{ gridColumn: i + 2, gridRow: 1 }}>
                  {groupName(i + 1)}
                </span>
              ))}
              {Array.from({ length: 7 }, (_, i) => (
                <span key={`p${i}`} className="ptable-period" style={{ gridColumn: 1, gridRow: i + 2 }}>
                  {i + 1}
                </span>
              ))}
              <span className="ptable-gap" style={{ gridColumn: 4, gridRow: 7 }}>57–71</span>
              <span className="ptable-gap" style={{ gridColumn: 4, gridRow: 8 }}>89–103</span>
              <span className="ptable-frow" style={{ gridColumn: '1 / 4', gridRow: 10 }}>Họ lanthan</span>
              <span className="ptable-frow" style={{ gridColumn: '1 / 4', gridRow: 11 }}>Họ actini</span>

              {ELEMENTS.map((e) => {
                const dim = (q && !matches(e, q)) || (focusCat && e.category !== focusCat);
                return (
                  <button
                    key={e.z}
                    type="button"
                    data-z={e.z}
                    className={`ptable-cell cat-${e.category}${e.z === z ? ' is-selected' : ''}${dim ? ' is-dim' : ''}`}
                    style={cellPos(e)}
                    aria-label={`${e.z} ${e.name}`}
                    aria-pressed={e.z === z}
                    tabIndex={e.z === z ? 0 : -1}
                    title={`${e.name} – ${massText(e)}`}
                    onClick={() => setZ(e.z)}
                  >
                    <span className="z">{e.z}</span>
                    <span className="sym">{e.symbol}</span>
                    <span className="m">{massText(e)}</span>
                  </button>
                );
              })}

              {/* Thẻ chi tiết nằm ở khoảng trống phía trên các nhóm B */}
              <div className={`ptable-info cat-${el.category}`} style={{ gridColumn: '4 / 14', gridRow: '2 / 5' }} aria-live="polite">
                <div className="ptable-big">
                  <span className="z">{el.z}</span>
                  <span className="sym">{el.symbol}</span>
                  <span className="name">{el.name}</span>
                </div>
                <dl>
                  <dt>Nguyên tử khối</dt>
                  <dd>
                    {massText(el)} amu{!el.radio && <> · khi tính: <b>{fmt(calcMass(el.symbol)!)}</b></>}
                  </dd>
                  <dt>Vị trí</dt>
                  <dd>
                    {el.fRow ? `Họ ${el.period === 6 ? 'lanthan' : 'actini'}, ` : `Nhóm ${groupName(el.group)} (${el.group}), `}chu kì {el.period}
                  </dd>
                  <dt>Loại</dt>
                  <dd>{CATEGORY_NAME[el.category]}</dd>
                  <dt>Electron</dt>
                  <dd>
                    {el.z} e, {el.period} lớp{sh ? ` (${sh.join(', ')})` : ''}
                    {mainGroup && `, ${outer} e lớp ngoài cùng`}
                  </dd>
                  {VALENCE[el.symbol] && (
                    <>
                      <dt>Hóa trị</dt>
                      <dd>{VALENCE[el.symbol]}</dd>
                    </>
                  )}
                </dl>
                <button type="button" className="ptable-add" onClick={() => setFormula((f) => f + el.symbol)}>
                  + Thêm {el.symbol} vào công thức
                </button>
              </div>
            </div>
          </div>

          <div className="ptable-mass">
            <label>
              <span>Khối lượng mol</span>
              <input
                type="text"
                value={formula}
                spellCheck={false}
                autoComplete="off"
                placeholder="Gõ công thức: Al2(SO4)3, CuSO4.5H2O"
                onChange={(e) => setFormula(e.target.value)}
              />
            </label>
            <output aria-live="polite">
              {'error' in mass ? (
                mass.error && <span className="err">{mass.error}</span>
              ) : (
                <>
                  <span className="parts">
                    {mass.parts.map((p, i) => (
                      <Fragment key={p.symbol}>
                        {i > 0 && ' + '}
                        {p.count > 1 ? `${p.count} × ${fmt(p.mass)}` : fmt(p.mass)} ({p.symbol})
                      </Fragment>
                    ))}
                  </span>
                  <span className="res">
                    M = <b>{fmt(mass.M)}</b> g/mol
                  </span>
                </>
              )}
            </output>
          </div>
          <p className="ptable-note">
            Mũi tên để chuyển ô, Enter trong ô tìm để chọn. Nguyên tử khối khi tính lấy như SGK (Cl = 35,5; Cu = 64).
          </p>
        </div>
      )}
    </>
  );
}

