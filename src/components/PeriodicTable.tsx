'use client';

import {
  Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent,
} from 'react';
import {
  CATEGORY_NAME, ELEMENTS, FAMILY_NAME, VALENCE, calcMass, formulaMass, groupName, shells,
  type Category, type ElementInfo, type Family,
} from '@/lib/elements';
import { cu } from '@/lib/chem';
import { fmt } from '@/lib/format';
import { solidOf, view3dOfFormula, type SolidView } from '@/lib/molecules3d';
import BohrModel from './BohrModel';
import { useTool } from './tools-context';
import Molecule3D from './Molecule3D';

/**
 * Bảng tuần hoàn dạng cửa sổ nổi cho các bài Hóa học: tra cứu nhanh nguyên tố
 * (số hiệu, nhóm, chu kì, nguyên tử khối, hóa trị, lớp electron) và tính khối lượng mol.
 * Phím mũi tên chuyển ô, gõ để tìm, Esc để đóng; phím tắt của mô phỏng không bị kích hoạt.
 * `page`: bản toàn trang /bang-tuan-hoan (mở từ sidebar, tab mới): ô lớn hơn, tô màu theo loại / kim loại–phi kim /
 * nguyên tử khối, làm nổi bật cùng nhóm hoặc cùng chu kì, đường dẫn ?z=26 để chia sẻ.
 */

type ColorMode = 'family' | 'category' | 'mass';
type Highlight = 'none' | 'group' | 'period';

const CATEGORY_VAR: Record<Category, [string, string]> = {
  kimloai: ['var(--kl)', 'var(--kl-line)'],
  phikim: ['var(--pk)', 'var(--pk-line)'],
  khihiem: ['var(--kh)', 'var(--kh-line)'],
};

/** Màu ô theo nguyên tử khối: nhẹ = nhạt, nặng = tím đậm */
const massColor = (m: number) => {
  const t = Math.min(1, Math.max(0, (m - 1) / 293));
  return [`hsl(252 70% ${96 - t * 38}%)`, `hsl(252 45% ${72 - t * 30}%)`];
};

function cellColor(e: ElementInfo, mode: ColorMode): CSSProperties | undefined {
  if (mode === 'family') return undefined;
  const [fam, line] = mode === 'category' ? CATEGORY_VAR[e.category] : massColor(e.mass);
  return { '--fam': fam, '--fam-line': line } as CSSProperties;
}

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

export default function PeriodicTable({ page = false }: { page?: boolean }) {
  const tool = useTool('periodicTable');
  const open = page || tool.open;
  const setOpen = tool.setOpen;
  const [z, setZ] = useState(26);
  const [query, setQuery] = useState('');
  const [focusCat, setFocusCat] = useState<Family | Category | null>(null);
  const [mode, setMode] = useState<ColorMode>('family');
  const [hl, setHl] = useState<Highlight>('none');
  const [formula, setFormula] = useState('');
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  /** ô 3D trong cửa sổ: đơn chất của nguyên tố, hoặc chất có công thức vừa gõ */
  const [view3d, setView3d] = useState<{ key: string; title: string; view: SolidView; el?: ElementInfo } | null>(null);
  const panel3d = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const urlZ = useRef<number | null>(null);

  // Nhớ nguyên tố đang chọn và công thức vừa tính giữa các bài
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? 'null') as { z?: number; formula?: string } | null;
      if (s?.z && s.z >= 1 && s.z <= 118) setZ(s.z);
      if (typeof s?.formula === 'string') setFormula(s.formula);
    } catch {}
    // trang đầy đủ: ?z=26 trên đường dẫn được ưu tiên (đọc một lần, trước khi effect dưới ghi lại đường dẫn)
    if (page) {
      urlZ.current ??= Number(new URLSearchParams(window.location.search).get('z'));
      if (urlZ.current >= 1 && urlZ.current <= 118) setZ(urlZ.current);
    }
    loaded.current = true;
  }, [page]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ z, formula }));
    } catch {}
    if (page) window.history.replaceState(null, '', `?z=${z}`);
  }, [z, formula, page]);

  useEffect(() => {
    if (open && !page) panel.current?.focus();
  }, [open, page]);

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
      if (!page) setOpen(false);
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
  const formula3d = 'error' in mass ? undefined : view3dOfFormula(formula);
  const show3d = (key: string, title: string, view: SolidView, of?: ElementInfo) => {
    setView3d({ key, title, view, el: of });
    requestAnimationFrame(() => panel3d.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };
  // nguyên tố chưa rõ tính chất (Z ≥ 109): không suy ra số electron ngoài cùng
  const mainGroup = !el.fRow && el.family !== 'chuaro' && (el.group <= 2 || el.group >= 13);
  const outer = el.z === 2 ? 2 : el.group <= 2 ? el.group : el.group - 10;

  return (
    <>
      {open && (
        <div
          id={page ? undefined : 'bang-tuan-hoan'}
          ref={panel}
          className={`ptable${page ? ' is-page' : ''}`}
          role={page ? 'region' : 'dialog'}
          aria-label="Bảng tuần hoàn các nguyên tố hóa học"
          tabIndex={-1}
          data-own-keys=""
          onKeyDown={onKeyDown}
          style={pos && !page ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
        >
          {!page && (
            <div className="calc-bar" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd}>
              <span>Bảng tuần hoàn các nguyên tố hóa học</span>
              <button type="button" className="calc-close" aria-label="Đóng bảng tuần hoàn" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
          )}

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
            {page && (
              <>
                <Choice
                  legend="Tô màu theo"
                  value={mode}
                  onChange={(m) => {
                    setMode(m);
                    setFocusCat(null);
                  }}
                  options={[
                    ['family', 'Họ nguyên tố'],
                    ['category', 'Kim loại – phi kim'],
                    ['mass', 'Nguyên tử khối'],
                  ]}
                />
                <Choice
                  legend="Làm nổi bật"
                  value={hl}
                  onChange={setHl}
                  options={[
                    ['none', 'Không'],
                    ['group', `Cùng nhóm với ${el.symbol}`],
                    ['period', `Cùng chu kì với ${el.symbol}`],
                  ]}
                />
              </>
            )}
          </div>

          <div className="ptable-body">
            {/* Panel chi tiết nguyên tố đang chọn */}
            <aside className={`ptable-info fam-${el.family}`} aria-live="polite">
              <div className="ptable-big">
                <BohrModel z={el.z} period={el.period} symbol={el.symbol} />
              </div>
              <div className="ptable-title">
                <span className="z">{el.z}</span>
                <span className="sym">{el.symbol}</span>
                <span className="name">{el.name}</span>
                <span className="pn">
                  {el.z} p, {Math.round(el.mass) - el.z} n
                </span>
              </div>
              <dl>
                <dt>Nguyên tử khối</dt>
                <dd>
                  {massText(el)} amu
                  {!el.radio && (
                    <>
                      {' · '}khi tính: <b>{fmt(calcMass(el.symbol)!)}</b>
                    </>
                  )}
                </dd>
                <dt>Vị trí</dt>
                <dd>
                  {el.fRow ? `Họ ${el.period === 6 ? 'lanthan' : 'actini'}, ` : `Nhóm ${groupName(el.group)} (${el.group}), `}chu kì {el.period}
                </dd>
                <dt>Loại</dt>
                <dd>
                  {FAMILY_NAME[el.family]}
                  {el.family !== 'chuaro' && FAMILY_NAME[el.family] !== CATEGORY_NAME[el.category] && ` · ${CATEGORY_NAME[el.category].toLowerCase()}`}
                </dd>
                <dt>Electron</dt>
                <dd>
                  {el.period} lớp{sh ? ` (${sh.join(', ')})` : ''}
                  {mainGroup && `, ${outer} e ngoài cùng`}
                </dd>
                {VALENCE[el.symbol] && (
                  <>
                    <dt>Hóa trị</dt>
                    <dd>{VALENCE[el.symbol]}</dd>
                  </>
                )}
              </dl>
              <div className="ptable-actions">
                <button type="button" className="ptable-add" onClick={() => setFormula((f) => f + el.symbol)}>
                  + Thêm {el.symbol} vào công thức
                </button>
                {solidOf(el.symbol) && (
                  <button type="button" className="ptable-add" onClick={() => show3d(`el-${el.symbol}`, `Đơn chất ${el.name}`, solidOf(el.symbol)!, el)}>
                    Xem đơn chất 3D
                  </button>
                )}
              </div>
            </aside>

            {/* Bảng 18 nhóm */}
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

                {/* Chú giải màu ở khoảng trống phía trên các nhóm B */}
                <div className="ptable-legend in-grid" style={{ gridColumn: '4 / 14', gridRow: '2 / 5' }} role="group" aria-label="Tô đậm theo loại nguyên tố">
                  {mode === 'family' &&
                    (Object.keys(FAMILY_NAME) as Family[]).map((c) => (
                      <button key={c} type="button" className={`fam-${c}`} aria-pressed={focusCat === c} onClick={() => setFocusCat((f) => (f === c ? null : c))}>
                        <i aria-hidden="true" />
                        {FAMILY_NAME[c]}
                      </button>
                    ))}
                  {mode === 'category' &&
                    (Object.keys(CATEGORY_NAME) as Category[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        style={{ '--fam': CATEGORY_VAR[c][0], '--fam-line': CATEGORY_VAR[c][1] } as CSSProperties}
                        className="fam-custom"
                        aria-pressed={focusCat === c}
                        onClick={() => setFocusCat((f) => (f === c ? null : c))}
                      >
                        <i aria-hidden="true" />
                        {CATEGORY_NAME[c]}
                      </button>
                    ))}
                  {mode === 'mass' && (
                    <span className="ptable-scale">
                      <span>1 (nhẹ)</span>
                      <i aria-hidden="true" />
                      <span>294 (nặng)</span>
                    </span>
                  )}
                </div>

                {ELEMENTS.map((e) => {
                  const off =
                    (hl === 'group' && (el.fRow ? !(e.fRow && e.period === el.period) : e.fRow || e.group !== el.group)) ||
                    (hl === 'period' && e.period !== el.period);
                  const dim = (q && !matches(e, q)) || (focusCat && (mode === 'category' ? e.category : e.family) !== focusCat) || off;
                  return (
                    <button
                      key={e.z}
                      type="button"
                      data-z={e.z}
                      className={`ptable-cell fam-${e.family}${e.z === z ? ' is-selected' : ''}${dim ? ' is-dim' : ''}`}
                      style={{ ...cellPos(e), ...cellColor(e, mode) }}
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
              </div>
            </div>
          </div>

          {view3d && (
            <div className={`ptable-3d${view3d.el ? ` fam-${view3d.el.family}` : ''}`} ref={panel3d}>
              <Molecule3D
                key={view3d.key}
                files={view3d.view.files}
                groups={view3d.view.groups}
                initialGroup={view3d.view.initialGroup}
                title={
                  <span className="ptable-3d-title">
                    {view3d.el ? (
                      <span className="ptable-3d-badge" aria-hidden="true">
                        <small>{view3d.el.z}</small>
                        {view3d.el.symbol}
                      </span>
                    ) : (
                      <span className="ptable-3d-badge is-formula" aria-hidden="true">3D</span>
                    )}
                    <span>
                      <b>{view3d.title}</b>
                      {view3d.view.kind && <em>{view3d.view.kind}</em>}
                    </span>
                  </span>
                }
                actions={
                  <button type="button" className="ptable-3d-close" aria-label="Đóng mô hình 3D" onClick={() => setView3d(null)}>
                    ×
                  </button>
                }
              />
            </div>
          )}

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
                  {formula3d && (
                    <button type="button" className="ptable-add" onClick={() => show3d(`f-${formula}`, `Mô hình 3D: ${cu(formula.trim())}`, formula3d)}>
                      Xem 3D
                    </button>
                  )}
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

/** Nhóm nút chọn một (giống Segmented của bài học) cho thanh công cụ của trang bảng tuần hoàn */
function Choice<T extends string>({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <fieldset className="ptable-choice">
      <legend>{legend}</legend>
      {options.map(([v, label]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </fieldset>
  );
}
