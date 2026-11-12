'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { VM, ce, coefOf, combine, cu, e4, eqTex, eqUni, mOf, massOf, molFromMass, molRatio, molarMass, N4, VOf, volumeOf, f4, type Reaction } from '@/lib/chem';
import { fmt } from '@/lib/format';
import { B, N, T, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawElements } from './sketch';

export type ElId = 'S' | 'C' | 'P' | 'Na' | 'Ca';

export interface Params {
  el: ElId;
  m: number; // g
}

/** Nguyên tố, oxide, chất tạo thành với nước */
const ELEMENTS: Record<ElId, {
  name: string; metal: boolean; oxide: string; gas: boolean; water: Reaction; product: string; kind: string;
  col: string; flame: string; smoke: string;
}> = {
  S: {
    name: 'sulfur', metal: false, oxide: 'SO2', gas: true, product: 'H2SO3', kind: 'acid', col: '#E3C02E', flame: '#4F7BFF', smoke: '#D9DDE5',
    water: { left: [{ f: 'SO2', k: 1 }, { f: 'H2O', k: 1 }], right: [{ f: 'H2SO3', k: 1 }] },
  },
  C: {
    name: 'carbon', metal: false, oxide: 'CO2', gas: true, product: 'H2CO3', kind: 'acid', col: '#2B2B2B', flame: '#F28C28', smoke: '#E3E8F0',
    water: { left: [{ f: 'CO2', k: 1 }, { f: 'H2O', k: 1 }], right: [{ f: 'H2CO3', k: 1 }] },
  },
  P: {
    name: 'phosphorus', metal: false, oxide: 'P2O5', gas: false, product: 'H3PO4', kind: 'acid', col: '#C0392B', flame: '#FFE36E', smoke: '#FFFFFF',
    water: { left: [{ f: 'P2O5', k: 1 }, { f: 'H2O', k: 3 }], right: [{ f: 'H3PO4', k: 2 }] },
  },
  Na: {
    name: 'sodium', metal: true, oxide: 'Na2O', gas: false, product: 'NaOH', kind: 'base', col: '#E6E2D3', flame: '#FFC83D', smoke: '#FFFFFF',
    water: { left: [{ f: 'Na2O', k: 1 }, { f: 'H2O', k: 1 }], right: [{ f: 'NaOH', k: 2 }] },
  },
  Ca: {
    name: 'calcium', metal: true, oxide: 'CaO', gas: false, product: 'Ca(OH)2', kind: 'base', col: '#D9DDE5', flame: '#FF6A3D', smoke: '#FFFFFF',
    water: { left: [{ f: 'CaO', k: 1 }, { f: 'H2O', k: 1 }], right: [{ f: 'Ca(OH)2', k: 1 }] },
  },
};

const EL_OPTIONS = (Object.keys(ELEMENTS) as ElId[]).map((k) => ({ value: k, label: `${k} (${ELEMENTS[k].metal ? 'kim loại' : 'phi kim'})` }));

const LABELS = playLabels('Đốt rồi hòa vào nước', 'Tiếp tục', 'Làm lại thí nghiệm');

export default function KimLoaiPhiKimLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 7, resetOn: ex.params });

  const show = sim.revealed;
  const E = ELEMENTS[q.el];
  const r = combine(q.el, 'O2', E.oxide);
  const kE = coefOf(r, q.el);
  const kO = coefOf(r, E.oxide);
  const n = q.m / molarMass(q.el);
  const nOx = (n * kO) / kE;
  const mOx = nOx * molarMass(E.oxide);
  const V = nOx * VM;
  const color = E.metal ? 'xanh' : 'đỏ';
  const amount = E.gas ? `$${VOf(E.oxide)} ${e4(V)} ${N4(V)}${u('L')}$` : `$${mOf(E.oxide)} ${e4(mOx)} ${N4(mOx)}${u('g')}$`;

  const draw = (p: p5) =>
    drawElements(p, {
      el: q.el,
      isMetal: E.metal,
      elCol: E.col,
      flameCol: E.flame,
      oxideCol: E.smoke,
      oxideLabel: cu(E.oxide),
      productLabel: cu(E.product),
      eq1: eqUni(r.left, r.right, 't°'),
      eq2: eqUni(E.water.left, E.water.right),
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const problem = (
    <>
      <p>
        Đốt cháy hoàn toàn <Num tone="a">{fmt(q.m)} g</Num> {E.name} ({q.el}) trong khí oxygen dư. Cho toàn bộ oxide tạo
        thành vào nước có sẵn mẩu giấy quỳ tím.
      </p>
      <ol>
        <li>Tính {E.gas ? `thể tích khí ${cu(E.oxide)} (đkc)` : `khối lượng ${cu(E.oxide)}`} tạo thành.</li>
        <li>Giấy quỳ tím chuyển sang màu gì? Giải thích.</li>
      </ol>
    </>
  );

  const solution = (
    <>
      <Summary given={[`${mOf(q.el)} = ${N(q.m)}${u('g')}`]} find={[E.gas ? VOf(E.oxide) : mOf(E.oxide), T('màu quỳ tím')]} />
      <Step>{`Số mol ${q.el}:`}</Step>
      <Calc tex={molFromMass(q.el, q.m, n, true)} />
      <Step>Phương trình hóa học:</Step>
      <Calc tex={eqTex(r.left, r.right, 't^\\circ')} />
      <Calc tex={molRatio(E.oxide, kO, q.el, kE, n, show, true)} />
      <Calc tex={E.gas ? volumeOf(E.oxide, nOx, show) : massOf(E.oxide, nOx, show)} />
      <Step>{`${E.metal ? 'Oxide base' : 'Oxide acid'} $${ce(E.oxide)}$ tác dụng với nước:`}</Step>
      <Calc tex={eqTex(E.water.left, E.water.right)} />
      <Step>{`Dung dịch $${ce(E.product)}$ là ${E.kind} nên quỳ tím hóa ${show ? color : '…'}.`}</Step>
      <Calc tex={`\\Rightarrow ${B(show, T(E.metal ? 'kim loại tạo oxide base' : 'phi kim tạo oxide acid'))}`} />
      <Answer show={show} items={[amount, `quỳ tím hóa ${color}`]} />
    </>
  );

  return (
    <LessonLayout
      slug="kim-loai-va-phi-kim"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Nguyên tố cháy trong bình oxygen tạo oxide; oxide cho vào cốc nước có giấy quỳ tím, quỳ đổi màu đỏ hoặc xanh."
      readout={[
        { label: `Số mol ${q.el}`, value: `${f4(n)} mol`, tone: 'time' },
        { label: cu(E.oxide), value: show ? (E.gas ? `${f4(V)} L` : `${f4(mOx)} g`) : '?', tone: 'a' },
        { label: 'Quỳ tím', value: show ? `hóa ${color}` : '?', tone: 'b' },
      ]}
      mode={<Segmented name="el" legend="Nguyên tố" options={EL_OPTIONS} value={q.el} onChange={(v) => ex.edit({ el: v })} />}
      fields={
        <RangeField id="m" label={`Khối lượng ${q.el}`} tone="a" min={0.1} max={20} step={0.1}
          value={q.m} display={`${fmt(q.m)} g`} onChange={(x) => ex.edit({ m: x })} />
      }
      solution={solution}
      rules={[
        { term: 'Kim loại', text: 'dẫn điện, dẫn nhiệt tốt, có ánh kim; oxide là oxide base, tan trong nước tạo base' },
        { term: 'Phi kim', text: 'thường không dẫn điện (trừ than chì); oxide là oxide acid, tan trong nước tạo acid' },
        { term: 'Quỳ tím', text: 'acid làm quỳ hóa đỏ, base (kiềm) làm quỳ hóa xanh' },
      ]}
      playLabels={LABELS}
    />
  );
}
