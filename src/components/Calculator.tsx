'use client';

import { useTool } from './tools-context';
import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
  type KeyboardEvent, type PointerEvent, type ReactNode,
} from 'react';
import {
  CalcError, EXP, POW, continuesAns, evaluate, numberTokens, show, toFraction, type AngleMode, type Shown, type Token,
} from '@/lib/calc';

/**
 * Máy tính khoa học dạng cửa sổ nổi cho các bài Vật lý 9.
 * Bấm phím trên máy hoặc gõ bàn phím khi cửa sổ đang được chọn (phím tắt của mô phỏng không bị kích hoạt).
 */

type Action =
  | { do: 'ins'; tok: Token | Token[] }
  | { do: 'shift' | 'angle' | 'left' | 'right' | 'del' | 'ac' | 'eq' | 'sd' | 'mplus' | 'mminus' | 'mc' };

interface Key {
  label: ReactNode;
  aria: string;
  act: Action;
  shift?: { label: ReactNode; aria: string; act: Action };
  kind?: 'fn' | 'num' | 'op' | 'ctl' | 'eq' | 'mem';
  wide?: boolean;
}

const ins = (tok: Token): Action => ({ do: 'ins', tok });
const sup = (base: string, s: string) => (
  <>
    {base}
    <sup>{s}</sup>
  </>
);

const KEYS: Key[] = [
  { label: 'SHIFT', aria: 'Shift: chức năng thứ hai', act: { do: 'shift' }, kind: 'ctl' },
  { label: 'DEG', aria: 'Đổi đơn vị góc độ hoặc radian', act: { do: 'angle' }, kind: 'ctl' },
  { label: '◀', aria: 'Con trỏ sang trái', act: { do: 'left' }, kind: 'ctl' },
  { label: '▶', aria: 'Con trỏ sang phải', act: { do: 'right' }, kind: 'ctl' },
  { label: 'S⇔D', aria: 'Đổi kết quả giữa phân số và số thập phân', act: { do: 'sd' }, kind: 'ctl' },

  { label: 'sin', aria: 'sin', act: ins('sin('), shift: { label: sup('sin', '−1'), aria: 'arcsin', act: ins('sin⁻¹(') }, kind: 'fn' },
  { label: 'cos', aria: 'cos', act: ins('cos('), shift: { label: sup('cos', '−1'), aria: 'arccos', act: ins('cos⁻¹(') }, kind: 'fn' },
  { label: 'tan', aria: 'tan', act: ins('tan('), shift: { label: sup('tan', '−1'), aria: 'arctan', act: ins('tan⁻¹(') }, kind: 'fn' },
  { label: 'log', aria: 'logarit thập phân', act: ins('log('), shift: { label: sup('10', 'x'), aria: '10 mũ x', act: ins('10^(') }, kind: 'fn' },
  { label: 'ln', aria: 'logarit tự nhiên', act: ins('ln('), shift: { label: sup('e', 'x'), aria: 'e mũ x', act: ins('e^(') }, kind: 'fn' },

  { label: sup('x', '2'), aria: 'bình phương', act: ins('²'), shift: { label: sup('x', '3'), aria: 'lập phương', act: ins('³') }, kind: 'fn' },
  { label: sup('x', 'y'), aria: 'lũy thừa', act: ins(POW), kind: 'fn' },
  { label: '√', aria: 'căn bậc hai', act: ins('√('), shift: { label: '∛', aria: 'căn bậc ba', act: ins('∛(') }, kind: 'fn' },
  { label: sup('x', '−1'), aria: 'nghịch đảo', act: ins('⁻¹'), shift: { label: '%', aria: 'phần trăm', act: ins('%') }, kind: 'fn' },
  { label: 'x!', aria: 'giai thừa', act: ins('!'), shift: { label: '|x|', aria: 'giá trị tuyệt đối', act: ins('Abs(') }, kind: 'fn' },

  { label: '(', aria: 'mở ngoặc', act: ins('('), kind: 'fn' },
  { label: ')', aria: 'đóng ngoặc', act: ins(')'), kind: 'fn' },
  { label: 'π', aria: 'pi', act: ins('π'), kind: 'fn' },
  { label: 'e', aria: 'số e', act: ins('e'), kind: 'fn' },
  { label: <>×10<sup>x</sup></>, aria: 'nhân 10 mũ', act: ins(EXP), kind: 'fn' },

  { label: 'MC', aria: 'Xóa bộ nhớ', act: { do: 'mc' }, kind: 'mem' },
  { label: 'MR', aria: 'Gọi bộ nhớ M', act: ins('M'), kind: 'mem' },
  { label: 'M+', aria: 'Cộng vào bộ nhớ', act: { do: 'mplus' }, kind: 'mem' },
  { label: 'M−', aria: 'Trừ khỏi bộ nhớ', act: { do: 'mminus' }, kind: 'mem' },
  { label: 'Ans', aria: 'Kết quả trước', act: ins('Ans'), kind: 'mem' },

  { label: '7', aria: '7', act: ins('7'), kind: 'num' },
  { label: '8', aria: '8', act: ins('8'), kind: 'num' },
  { label: '9', aria: '9', act: ins('9'), kind: 'num' },
  { label: 'DEL', aria: 'Xóa một phím', act: { do: 'del' }, kind: 'ctl' },
  { label: 'AC', aria: 'Xóa hết', act: { do: 'ac' }, kind: 'ctl' },

  { label: '4', aria: '4', act: ins('4'), kind: 'num' },
  { label: '5', aria: '5', act: ins('5'), kind: 'num' },
  { label: '6', aria: '6', act: ins('6'), kind: 'num' },
  { label: '×', aria: 'nhân', act: ins('×'), kind: 'op' },
  { label: ':', aria: 'chia', act: ins(':'), kind: 'op' },

  { label: '1', aria: '1', act: ins('1'), kind: 'num' },
  { label: '2', aria: '2', act: ins('2'), kind: 'num' },
  { label: '3', aria: '3', act: ins('3'), kind: 'num' },
  { label: '+', aria: 'cộng', act: ins('+'), kind: 'op' },
  { label: '−', aria: 'trừ hoặc dấu âm', act: ins('−'), kind: 'op' },

  { label: '0', aria: '0', act: ins('0'), kind: 'num', wide: true },
  { label: ',', aria: 'dấu phẩy thập phân', act: ins(','), kind: 'num' },
  { label: '=', aria: 'bằng', act: { do: 'eq' }, kind: 'eq', wide: true },
];

/** Gõ bàn phím → phím máy tính */
const KEYBOARD: Record<string, Action> = {
  ...Object.fromEntries('0123456789'.split('').map((d) => [d, ins(d)])),
  ',': ins(','), '.': ins(','), '+': ins('+'), '-': ins('−'), '*': ins('×'), x: ins('×'), '/': ins(':'), ':': ins(':'),
  '(': ins('('), ')': ins(')'), '^': ins(POW), '!': ins('!'), '%': ins('%'), p: ins('π'), e: ins('e'),
  s: ins('sin('), c: ins('cos('), t: ins('tan('), l: ins('log('), n: ins('ln('), q: ins('√('), E: ins(EXP),
  Enter: { do: 'eq' }, '=': { do: 'eq' }, Backspace: { do: 'del' }, Delete: { do: 'ac' },
  ArrowLeft: { do: 'left' }, ArrowRight: { do: 'right' },
};

interface HistoryItem {
  expr: string;
  value: number;
}

interface Saved {
  angle: AngleMode;
  ans: number;
  mem: number;
  history: HistoryItem[];
}

const STORE = 'vo-mo-phong:may-tinh';

function Result({ s }: { s: Shown }) {
  if (s.kind === 'dec') return <span>{s.text}</span>;
  if (s.kind === 'sci')
    return (
      <span>
        {s.mant} × 10<sup>{s.exp < 0 ? `−${-s.exp}` : s.exp}</sup>
      </span>
    );
  return (
    <span>
      {s.neg && '−'}
      <span className="calc-frac">
        <span>{s.num}</span>
        <span>{s.den}</span>
      </span>
    </span>
  );
}


/** `page`: bản toàn trang /may-tinh (mở từ sidebar, tab mới): phím lớn, cả lịch sử 20 phép tính bên cạnh */
export default function Calculator({ page = false }: { page?: boolean }) {
  const tool = useTool('calculator');
  const open = page || tool.open;
  const setOpen = tool.setOpen;
  const [tokens, setTokens] = useState<Token[]>([]);
  const [cursor, setCursor] = useState(0);
  const [shift, setShift] = useState(false);
  const [angle, setAngle] = useState<AngleMode>('deg');
  const [ans, setAns] = useState(0);
  const [mem, setMem] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  /** Kết quả đang hiện (sau dấu =) hoặc lỗi; null khi đang nhập */
  const [result, setResult] = useState<{ value: number } | { error: string } | null>(null);
  const [frac, setFrac] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const loaded = useRef(false);

  // Nhớ đơn vị góc, Ans, M và lịch sử giữa các bài
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? 'null') as Saved | null;
      if (s) {
        setAngle(s.angle === 'rad' ? 'rad' : 'deg');
        setAns(Number(s.ans) || 0);
        setMem(Number(s.mem) || 0);
        setHistory(Array.isArray(s.history) ? s.history.slice(0, 20) : []);
      }
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ angle, ans, mem, history } satisfies Saved));
    } catch {}
  }, [angle, ans, mem, history]);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);
  // trang máy tính: gõ phím ở bất kỳ đâu trên trang cũng vào máy tính
  useEffect(() => {
    if (page) panel.current?.focus();
  }, [page]);

  useLayoutEffect(() => {
    caret.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [tokens, cursor]);

  const env = { angle, ans, mem };

  /** Tính biểu thức hiện tại; trả về giá trị hoặc undefined nếu lỗi (đã hiện lỗi) */
  const compute = (): number | undefined => {
    try {
      const v = evaluate(tokens, env);
      setResult({ value: v });
      setAns(v);
      setFrac(false);
      setHistory((h) => [{ expr: tokens.join(''), value: v }, ...h].slice(0, 20));
      return v;
    } catch (e) {
      setResult({ error: e instanceof CalcError ? e.message : 'Lỗi' });
      return undefined;
    }
  };

  const run = (a: Action) => {
    const done = result !== null && 'value' in result;
    switch (a.do) {
      case 'shift':
        setShift((s) => !s);
        return;
      case 'angle':
        setAngle((m) => (m === 'deg' ? 'rad' : 'deg'));
        break;
      case 'ac':
        setTokens([]);
        setCursor(0);
        setResult(null);
        break;
      case 'del':
        if (result) {
          setResult(null);
          setCursor(tokens.length);
        } else if (cursor > 0) {
          setTokens((t) => [...t.slice(0, cursor - 1), ...t.slice(cursor)]);
          setCursor(cursor - 1);
        }
        break;
      case 'left':
        if (result) { setResult(null); setCursor(tokens.length); }
        else setCursor(cursor === 0 ? tokens.length : cursor - 1);
        break;
      case 'right':
        if (result) { setResult(null); setCursor(0); }
        else setCursor(cursor === tokens.length ? 0 : cursor + 1);
        break;
      case 'eq':
        if (tokens.length) compute();
        break;
      case 'sd':
        if (done) setFrac((f) => !f);
        break;
      case 'mc':
        setMem(0);
        break;
      case 'mplus':
      case 'mminus': {
        const v = done ? (result as { value: number }).value : tokens.length ? compute() : undefined;
        if (v !== undefined) setMem((m) => m + (a.do === 'mplus' ? v : -v));
        break;
      }
      case 'ins': {
        const toks = Array.isArray(a.tok) ? a.tok : [a.tok];
        if (result) {
          // Sau dấu = (hoặc lỗi): phép toán nối tiếp Ans, phím khác bắt đầu biểu thức mới
          const next = done && continuesAns(toks[0]) ? ['Ans', ...toks] : toks;
          setTokens(next);
          setCursor(next.length);
          setResult(null);
        } else {
          setTokens((t) => [...t.slice(0, cursor), ...toks, ...t.slice(cursor)]);
          setCursor(cursor + toks.length);
        }
        break;
      }
    }
    setShift(false);
  };

  const press = (k: Key) => run(shift && k.shift ? k.shift.act : k.act);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (!page) setOpen(false);
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Tab') return;
    // Không để phím (Space, R…) lọt ra phím tắt của mô phỏng
    e.stopPropagation();
    const a = KEYBOARD[e.key];
    if (a && !(e.target instanceof HTMLButtonElement && e.key === 'Enter')) {
      e.preventDefault();
      run(a);
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
      x: Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - r.width),
      y: Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - 48),
    });
  }, []);
  const onDragEnd = () => {
    drag.current = null;
  };

  const shown = result && 'value' in result ? (frac && toFraction(result.value)) || show(result.value) : null;
  const canFrac = result && 'value' in result && toFraction(result.value) !== undefined;

  const body = open && (
        <div
          id={page ? undefined : 'may-tinh'}
          ref={panel}
          className={`calculator${page ? ' is-page' : ''}`}
          role={page ? 'region' : 'dialog'}
          aria-label="Máy tính khoa học"
          tabIndex={-1}
          data-own-keys=""
          onKeyDown={onKeyDown}
          style={pos && !page ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
        >
          {!page && (
            <div className="calc-bar" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd}>
              <span>Máy tính khoa học</span>
              <button type="button" className="calc-close" aria-label="Đóng máy tính" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
          )}

          <div className="calc-screen">
            <div className="calc-status" aria-hidden="true">
              <span className={shift ? 'on' : ''}>S</span>
              <span className={mem !== 0 ? 'on' : ''}>M</span>
              <span className="on">{angle === 'deg' ? 'D' : 'R'}</span>
              {canFrac && <span className="on hint">S⇔D</span>}
            </div>
            {history.length > 0 && (
              <ol className="calc-history" aria-label="Phép tính gần đây">
                {history.slice(0, 3).reverse().map((h, i) => (
                  <li key={`${i}-${h.expr}`}>
                    <button type="button" title="Chèn kết quả này" onClick={() => run({ do: 'ins', tok: numberTokens(h.value) })}>
                      <span>{h.expr}</span> = <b><Result s={show(h.value)} /></b>
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <div className="calc-input" aria-label="Biểu thức">
              {tokens.slice(0, cursor).join('')}
              {!result && <span ref={caret} className="calc-caret" aria-hidden="true" />}
              {tokens.slice(cursor).join('')}
              {tokens.length === 0 && result === null && <span className="calc-placeholder">0</span>}
            </div>
            <output className={`calc-result${result && 'error' in result ? ' err' : ''}`} aria-live="polite">
              {result && 'error' in result ? result.error : shown ? <Result s={shown} /> : ' '}
            </output>
          </div>

          <div className={`calc-keys${shift ? ' shifted' : ''}`}>
            {KEYS.map((k) => {
              const alt = k.shift;
              const label = k.act.do === 'angle' ? (angle === 'deg' ? 'DEG' : 'RAD') : shift && alt ? alt.label : k.label;
              return (
                <button
                  key={k.aria}
                  type="button"
                  className={`calc-key ${k.kind ?? ''}${k.wide ? ' wide' : ''}${k.act.do === 'shift' && shift ? ' active' : ''}`}
                  aria-label={shift && alt ? alt.aria : k.aria}
                  onClick={() => press(k)}
                >
                  {alt && <small aria-hidden="true">{shift ? k.label : alt.label}</small>}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <p className="calc-note">
            Góc tính theo {angle === 'deg' ? 'độ' : 'radian'}. Gõ được bằng bàn phím: số, + − * /, ^, ( ), Enter, Backspace
            {page ? '.' : '; Esc để đóng.'}
          </p>
        </div>
  );

  if (!page) return <>{body}</>;

  return (
    <div className="tool-page-calc">
      {body}
      <aside className="calc-history-page" aria-label="Lịch sử phép tính">
        <h2>Lịch sử ({history.length})</h2>
        {history.length === 0 ? (
          <p className="empty">Chưa có phép tính nào. Bấm vào một dòng để chèn kết quả vào biểu thức.</p>
        ) : (
          <>
            <ol>
              {history.map((h, i) => (
                <li key={`${i}-${h.expr}`}>
                  <button
                    type="button"
                    title="Chèn kết quả này"
                    onClick={() => {
                      run({ do: 'ins', tok: numberTokens(h.value) });
                      panel.current?.focus();
                    }}
                  >
                    <span>{h.expr}</span> = <b><Result s={show(h.value)} /></b>
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="calc-clear" onClick={() => setHistory([])}>
              Xóa lịch sử
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
