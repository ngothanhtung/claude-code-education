'use client';

import { Fragment, type ReactNode } from 'react';
import {
  VM, ce, coefOf, cu, e4, eqTex, f4, mOf, massOf, molFromMass, molFromVolume, molRatio, molarMass, N4, VOf, volumeOf,
  type Reaction,
} from '@/lib/chem';
import { B, N, T, U, u } from '@/lib/tex';
import type { ReadoutItem } from './Controls';
import { Answer, Calc, Step, Summary } from './Notebook';

/**
 * Bài giải Hóa học dùng chung, trình bày như vở theo SGK KHTN 9:
 * - StoichSolution: tính theo số mol (n = m : M hoặc V : 24,79 → tỉ lệ PTHH → hiệu suất → m, V)
 * - MassSolution: bài toán sản xuất tính theo tỉ lệ khối lượng (tấn, kg) có hàm lượng và hiệu suất
 */

export type Kind = 'm' | 'V';

export interface Given {
  f: string;
  kind: Kind;
  /** khối lượng (g) hoặc thể tích (L, đkc) */
  value: number;
}

export interface Target {
  f: string;
  kind: Kind;
}

export interface StoichItem extends Target {
  /** số mol theo lí thuyết và thực tế (sau hiệu suất, chỉ với sản phẩm) */
  nTheory: number;
  n: number;
  value: number;
  product: boolean;
}

export interface Stoich {
  nGiven: number;
  items: StoichItem[];
}

const sym = (t: Target) => (t.kind === 'V' ? VOf(t.f) : mOf(t.f));
const unit = (t: Target) => (t.kind === 'V' ? 'L' : 'g');

/** Tính số mol và đáp số; H (%) chỉ áp dụng cho sản phẩm */
export function computeStoich(r: Reaction, given: Given, targets: Target[], H = 100): Stoich {
  const nGiven = given.kind === 'V' ? given.value / VM : given.value / molarMass(given.f);
  const kG = coefOf(r, given.f);
  const items = targets.map((t) => {
    const product = r.right.some((s) => s.f === t.f);
    const nTheory = (nGiven * coefOf(r, t.f)) / kG;
    const n = product ? (nTheory * H) / 100 : nTheory;
    return { ...t, nTheory, n, product, value: t.kind === 'V' ? n * VM : n * molarMass(t.f) };
  });
  return { nGiven, items };
}

/**
 * Ô số liệu dưới mô phỏng cho bài tính theo PTHH: số mol chất đã cho, rồi tối đa hai đại lượng cần tìm
 * ("Khối lượng …" / "Thể tích …", ẩn bằng "?" cho tới khi hiện đáp án). `nameOf` đổi công thức thành tên hiển thị.
 */
export function stoichReadout(st: Stoich, show: boolean, givenName: string, nameOf: (f: string) => string = cu): ReadoutItem[] {
  return [
    { label: `Số mol ${givenName}`, value: `${f4(st.nGiven)} mol`, tone: 'time' },
    ...st.items.slice(0, 2).map((it, i): ReadoutItem => ({
      label: `${it.kind === 'V' ? 'Thể tích' : 'Khối lượng'} ${nameOf(it.f)}`,
      value: `${show ? f4(it.value) : '?'} ${unit(it)}`,
      tone: i === 0 ? 'a' : 'b',
    })),
  ];
}

/** Dòng đáp số của một đại lượng */
export const answerOf = (it: StoichItem) => `$${sym(it)} ${e4(it.value)} ${N4(it.value)}${u(unit(it))}$`;

interface StoichProps {
  r: Reaction;
  cond?: string;
  given: Given;
  targets: Target[];
  H?: number;
  show: boolean;
  /** tên chất trong câu dẫn, ví dụ { C2H5OH: 'ethylic alcohol' } */
  names?: Record<string, string>;
  /** dòng giải thích chèn sau phương trình (vd. "Na dư nên…") */
  note?: ReactNode;
  extraGiven?: string[];
  /** phản ứng thuận nghịch (ester hóa) */
  reversible?: boolean;
  /** phương trình TeX viết tay (khi cần ghi chú tên chất, vd glucose + fructose) */
  equation?: string;
}

export function StoichSolution({ r, cond, given, targets, H = 100, show, names = {}, note, extraGiven = [], reversible = false, equation }: StoichProps) {
  const s = computeStoich(r, given, targets, H);
  const kG = coefOf(r, given.f);
  const name = (f: string) => names[f] ?? `$${ce(f)}$`;
  const givenTex = given.kind === 'V' ? `${VOf(given.f)} = ${N4(given.value)}${u('L')}` : `${mOf(given.f)} = ${N4(given.value)}${u('g')}`;
  const withH = H < 100 && s.items.some((it) => it.product);
  return (
    <>
      <Summary given={[[givenTex, ...extraGiven, ...(H < 100 ? [`H = ${N(H)}\\%`] : [])].join(';\\ ')]} find={targets.map(sym)} />
      <Step>{`Số mol ${name(given.f)}:`}</Step>
      <Calc tex={given.kind === 'V' ? molFromVolume(given.f, given.value, s.nGiven, true) : molFromMass(given.f, given.value, s.nGiven, true)} />
      <Step>Phương trình hóa học:</Step>
      <Calc tex={equation ?? eqTex(r.left, r.right, cond, reversible)} />
      {note && <Step>{note}</Step>}
      <Step>Theo phương trình hóa học:</Step>
      {s.items.map((it) => (
        <Calc key={`r${it.f}`} tex={molRatio(it.f, coefOf(r, it.f), given.f, kG, s.nGiven, show, true)} />
      ))}
      {withH && <Step>{`Hiệu suất ${N(H).replace('{,}', ',')}% nên số mol sản phẩm thực tế:`}</Step>}
      {withH &&
        s.items.filter((it) => it.product).map((it) => (
          <Calc key={`h${it.f}`} tex={`n_{${ce(it.f)}} = ${B(show, N4(it.nTheory))} \\times ${N(H)} \\chia 100 ${e4(it.n)} ${B(show, N4(it.n))}\\;(${T('mol')})`} />
        ))}
      <Step>{targets.every((t) => t.kind === 'V') ? 'Thể tích các khí (đkc):' : targets.every((t) => t.kind === 'm') ? 'Khối lượng các chất:' : 'Khối lượng và thể tích các chất:'}</Step>
      {s.items.map((it) => (
        <Calc key={`v${it.f}`} tex={it.kind === 'V' ? volumeOf(it.f, it.n, show) : massOf(it.f, it.n, show)} />
      ))}
      <Answer show={show} items={s.items.map(answerOf)} />
    </>
  );
}

// ------------------------------------------------------------
// Bài toán sản xuất: tỉ lệ khối lượng
// ------------------------------------------------------------

export interface MassSpecies {
  f: string;
  k: number;
  /** công thức TeX thay cho ce(f), vd tinh bột (C6H10O5)n */
  tex?: string;
  /** khối lượng mol thay cho molarMass(f) (mắt xích polymer…) */
  M?: number;
}

export interface MassResult {
  mA: number;
  items: { sp: MassSpecies; theory: number; value: number; ratio: number }[];
}

const texOf = (s: MassSpecies) => s.tex ?? ce(s.f);
const massUnit = (s: MassSpecies) => s.k * (s.M ?? molarMass(s.f));

export function computeMass(mRaw: number, pct: number, A: MassSpecies, targets: MassSpecies[], H: number): MassResult {
  const mA = (mRaw * pct) / 100;
  return {
    mA,
    items: targets.map((sp) => {
      const ratio = massUnit(sp) / massUnit(A);
      const theory = mA * ratio;
      return { sp, ratio, theory, value: (theory * H) / 100 };
    }),
  };
}

interface MassProps {
  /** tên nguyên liệu: "đá vôi", "quặng", "gạo"… */
  raw: string;
  mRaw: number;
  pct: number;
  A: MassSpecies;
  targets: MassSpecies[];
  H: number;
  unitName: string;
  /** phương trình TeX (đã có điều kiện phản ứng) */
  equation: string;
  show: boolean;
  /** câu dẫn trước tỉ lệ khối lượng, mặc định "Theo phương trình hóa học" */
  ratioIntro?: string;
  /** nhãn trước phương trình, mặc định "Phương trình hóa học:" (vd "Sơ đồ phản ứng:") */
  eqLabel?: string;
  /** thay dữ kiện ở phần Tóm tắt, và các dòng chèn ngay sau "Giải" */
  given?: string[];
  lead?: ReactNode;
}

export function MassSolution({ raw, mRaw, pct, A, targets, H, unitName, equation, show, ratioIntro, eqLabel, given, lead }: MassProps) {
  const res = computeMass(mRaw, pct, A, targets, H);
  const mSym = (s: MassSpecies) => `m_{${texOf(s)}}`;
  const uA = massUnit(A);
  const coefMass = (s: MassSpecies) => (s.k > 1 ? `${s.k} \\times ${N(s.M ?? molarMass(s.f))} = ${N(massUnit(s))}` : N(massUnit(s)));
  return (
    <>
      <Summary
        given={given ?? [[`m_\\text{${raw}} = ${N(mRaw)}${u(unitName)}`, ...(pct < 100 ? [`${N(pct)}\\%\\ ${texOf(A)}`] : []), ...(H < 100 ? [`H = ${N(H)}\\%`] : [])].join(';\\ ')]}
        find={targets.map(mSym)}
      />
      {lead}
      {pct < 100 && (
        <>
          <Step>{`Khối lượng $${texOf(A)}$ có trong ${raw}:`}</Step>
          <Calc tex={`${mSym(A)} = ${N(mRaw)} \\times ${N(pct)} \\chia 100 ${e4(res.mA)} ${B(show, N4(res.mA))}${U(unitName)}`} />
        </>
      )}
      <Step>{eqLabel ?? 'Phương trình hóa học:'}</Step>
      <Calc tex={equation} />
      {res.items.map(({ sp, theory }) => (
        <Fragment key={sp.f}>
          <Step>{`${ratioIntro ?? 'Theo phương trình hóa học'}, cứ $${coefMass(A)}$ ${unitName} $${texOf(A)}$ tạo ra $${coefMass(sp)}$ ${unitName} $${texOf(sp)}$:`}</Step>
          <Calc tex={`${mSym(sp)}${H < 100 ? '\\,(\\text{lí thuyết})' : ''} = ${B(show || pct === 100, N4(res.mA))} \\times ${N(massUnit(sp))} \\chia ${N(uA)} ${e4(theory)} ${B(show, N4(theory))}${U(unitName)}`} />
        </Fragment>
      ))}
      {H < 100 && (
        <>
          <Step>{`Với hiệu suất ${N(H).replace('{,}', ',')}%, khối lượng thu được:`}</Step>
          {res.items.map(({ sp, theory, value }) => (
            <Calc key={`h${sp.f}`} tex={`${mSym(sp)} = ${B(show, N4(theory))} \\times ${N(H)} \\chia 100 ${e4(value)} ${B(show, N4(value))}${U(unitName)}`} />
          ))}
        </>
      )}
      <Answer show={show} items={res.items.map(({ sp, value }) => `$${mSym(sp)} ${e4(value)} ${N4(value)}${u(unitName)}$`)} />
    </>
  );
}
