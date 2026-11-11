'use client';

import { Fragment, useState, type ReactNode } from 'react';
import type { Simulation } from '@/hooks/useSimulation';

/** Màu theo vai trò: t = mực tím (số liệu chung), a = xe đỏ, b = xe xanh */
export type Tone = 't' | 'a' | 'b';

/** Số liệu tô màu trong đề bài */
export function Num({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`num num-${tone}`}>{children}</span>;
}

// ------------------------------------------------------------
// Thanh trượt có nhãn và giá trị
// ------------------------------------------------------------
interface RangeFieldProps {
  id: string;
  label: string;
  tone: Tone;
  min: number;
  max: number;
  step: number;
  value: number;
  /** giá trị hiển thị, ví dụ "120 km" */
  display: string;
  onChange: (value: number) => void;
  hidden?: boolean;
}

export function RangeField({ id, label, tone, min, max, step, value, display, onChange, hidden }: RangeFieldProps) {
  return (
    <div className={`field field-${tone}`} hidden={hidden}>
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display}</output>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// ------------------------------------------------------------
// Ô nhập số thập phân kiểu Việt Nam (dấu phẩy). Chỉ báo giá trị khi hợp lệ.
// ------------------------------------------------------------
interface DecimalFieldProps {
  id: string;
  label: string;
  tone: Tone;
  /** giá trị đang dùng, dạng chuỗi chuẩn với dấu chấm, ví dụ "3.5" */
  value: string;
  onChange: (normalized: string) => void;
  hint?: string;
  /** tối đa bao nhiêu chữ số (không kể dấu phẩy) */
  maxDigits?: number;
}

/** "03,50" -> "3.5"; trả về null nếu không phải số thập phân dương hợp lệ */
export function parseDecimal(raw: string, maxDigits = 9): string | null {
  const s = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  let [int, frac = ''] = s.split('.');
  int = int.replace(/^0+(?=\d)/, '');
  frac = frac.replace(/0+$/, '');
  if (int.length + frac.length > maxDigits) return null;
  if (int === '0' && frac === '') return null;
  return frac ? `${int}.${frac}` : int;
}

export function DecimalField({ id, label, tone, value, onChange, hint, maxDigits = 9 }: DecimalFieldProps) {
  const [text, setText] = useState(value.replace('.', ','));
  const [invalid, setInvalid] = useState(false);
  return (
    <div className={`field field-${tone}`}>
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
      </div>
      <input
        type="text"
        inputMode="decimal"
        id={id}
        value={text}
        aria-invalid={invalid}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseDecimal(e.target.value, maxDigits);
          setInvalid(n === null);
          if (n !== null && n !== value) onChange(n);
        }}
      />
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {invalid ? `Hãy nhập một số dương, tối đa ${maxDigits} chữ số, ví dụ 3,5` : hint}
        </p>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Nhóm nút chọn một (dạng đề / đại lượng cần tìm / tốc độ phát)
// ------------------------------------------------------------
interface SegmentedProps<V extends string | number> {
  name: string;
  legend: string;
  options: readonly { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
}

export function Segmented<V extends string | number>({ name, legend, options, value, onChange, className = 'mode' }: SegmentedProps<V>) {
  return (
    <fieldset className={className}>
      <legend>{legend}</legend>
      <div className="seg">
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          return (
            <Fragment key={String(o.value)}>
              <input type="radio" name={name} id={id} checked={o.value === value} onChange={() => onChange(o.value)} />
              <label htmlFor={id}>{o.label}</label>
            </Fragment>
          );
        })}
      </div>
    </fieldset>
  );
}

// ------------------------------------------------------------
// Chạy / tạm dừng / làm lại + tốc độ phát
// ------------------------------------------------------------
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4.5" height="16" rx="1.2" />
    <rect x="13.5" y="4" width="4.5" height="16" rx="1.2" />
  </svg>
);

const ResetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

/** Nhãn nút phát theo trạng thái; mỗi bài có thể đổi cho hợp nội dung */
export interface PlayLabels {
  start: string;
  pause: string;
  resume: string;
  again: string;
}

export const DRIVE_LABELS: PlayLabels = { start: 'Cho xe chạy', pause: 'Tạm dừng', resume: 'Chạy tiếp', again: 'Chạy lại' };

export function PlaybackControls({ sim, labels = DRIVE_LABELS }: { sim: Simulation; labels?: PlayLabels }) {
  let label = labels.start;
  if (sim.running) label = labels.pause;
  else if (sim.done) label = labels.again;
  else if (sim.started) label = labels.resume;

  const rates = [
    { value: 14, label: 'Chậm' },
    { value: sim.defaultDuration, label: 'Vừa' },
    { value: 4, label: 'Nhanh' },
  ] as const;

  return (
    <div className="actions">
      <button className="btn btn-primary" type="button" onClick={sim.toggle} disabled={!sim.enabled}>
        {sim.running ? <PauseIcon /> : <PlayIcon />}
        {label}
      </button>
      <button className="btn btn-secondary" type="button" onClick={sim.reset}>
        <ResetIcon />
        Làm lại
      </button>
      <Segmented
        className="rate"
        name="rate"
        legend="Tốc độ phát"
        options={rates}
        value={sim.duration}
        onChange={sim.setDuration}
      />
    </div>
  );
}

// ------------------------------------------------------------
// Ô số liệu trực tiếp dưới canvas
// ------------------------------------------------------------
export interface ReadoutItem {
  label: string;
  value: string;
  sub?: string;
  /** time = mực tím, a = đỏ, b = xanh, plain = chữ thường */
  tone?: 'time' | 'a' | 'b' | 'plain';
}

export function Readout({ items }: { items: ReadoutItem[] }) {
  return (
    <dl className="readout">
      {items.map((it) => (
        <div key={it.label} className={`r-${it.tone ?? 'plain'}`}>
          <dt>{it.label}</dt>
          <dd>
            {it.value}
            {it.sub !== undefined && <small>{it.sub}</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
