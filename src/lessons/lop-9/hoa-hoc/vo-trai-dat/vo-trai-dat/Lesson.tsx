'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { ATOMIC, ce, cu, e4, f4, molarMass, N4, parseFormula } from '@/lib/chem';
import { fmt, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawCrust } from './sketch';

/** phantram: % kim loại trong khoáng vật; quang: khối lượng kim loại trong quặng */
export type Mode = 'phantram' | 'quang';
export type MineralId = 'hematite' | 'magnetite' | 'bauxite' | 'pyrite' | 'calcite';

export interface Params {
  mode: Mode;
  mineral: MineralId;
  mRaw: number; // tấn quặng
  pct: number; // % khoáng vật trong quặng
}

const MINERALS: Record<MineralId, { name: string; f: string; metal: string }> = {
  hematite: { name: 'hematite', f: 'Fe2O3', metal: 'Fe' },
  magnetite: { name: 'magnetite', f: 'Fe3O4', metal: 'Fe' },
  bauxite: { name: 'bauxite', f: 'Al2O3', metal: 'Al' },
  pyrite: { name: 'pyrite', f: 'FeS2', metal: 'Fe' },
  calcite: { name: 'calcite (đá vôi)', f: 'CaCO3', metal: 'Ca' },
};

const MODE_OPTIONS = [
  { value: 'phantram', label: '% kim loại trong khoáng vật' },
  { value: 'quang', label: 'Kim loại trong quặng' },
] as const;
const MIN_OPTIONS = (Object.keys(MINERALS) as MineralId[]).map((k) => ({ value: k, label: `${MINERALS[k].name.split(' ')[0]} (${cu(MINERALS[k].f)})` }));

const LABELS = playLabels('Phân tích');

export default function VoTraiDatLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 4, resetOn: ex.params });
  const show = sim.revealed;

  const Mi = MINERALS[q.mineral];
  const atoms = parseFormula(Mi.f);
  const x = atoms[Mi.metal];
  const M = molarMass(Mi.f);
  const mMetal = x * ATOMIC[Mi.metal];
  const pct = (mMetal * 100) / M;
  const mMin = (q.mRaw * q.pct) / 100;
  const mOut = (mMin * mMetal) / M;
  const e2 = (v: number) => eq(isExact(v, 2));
  const mSum = Object.keys(atoms).map((el) => `${atoms[el]} \\times ${N(ATOMIC[el])}`).join(' + ');

  const problem =
    q.mode === 'phantram' ? (
      <p>
        Khoáng vật <Num tone="a">{Mi.name}</Num> có thành phần chính là {cu(Mi.f)}. Tính phần trăm khối lượng {Mi.metal} trong{' '}
        {cu(Mi.f)}.
      </p>
    ) : (
      <p>
        Một mỏ có <Num tone="a">{fmt(q.mRaw)} tấn</Num> quặng {Mi.name.split(' ')[0]} chứa <Num tone="t">{q.pct}%</Num>{' '}
        {cu(Mi.f)} (còn lại là tạp chất không chứa {Mi.metal}). Tính khối lượng {Mi.metal} có trong lượng quặng đó.
      </p>
    );

  const solution =
    q.mode === 'phantram' ? (
      <>
        <Summary given={[`${ce(Mi.f)}`]} find={[`\\%\\mathrm{${Mi.metal}}`]} />
        <Step>{`Khối lượng mol của $${ce(Mi.f)}$:`}</Step>
        <Calc tex={`M = ${mSum} = ${N(M)}${U('g/mol')}`} />
        <Step>{`Phần trăm khối lượng ${Mi.metal}:`}</Step>
        <Calc tex={`\\%\\mathrm{${Mi.metal}} = ${x} \\times ${N(ATOMIC[Mi.metal])} \\times 100 \\chia ${N(M)} ${e2(pct)} ${B(show, N(pct))}\\%`} />
        <Answer show={show} items={[`$\\%\\mathrm{${Mi.metal}} ${e2(pct)} ${N(pct)}\\%$`]} />
      </>
    ) : (
      <>
        <Summary given={[`m_\\text{quặng} = ${N(q.mRaw)}${u('tấn')};\\ ${q.pct}\\%\\ ${ce(Mi.f)}`]} find={[`m_{\\mathrm{${Mi.metal}}}`]} />
        <Step>{`Khối lượng $${ce(Mi.f)}$ trong quặng:`}</Step>
        <Calc tex={`m_{${ce(Mi.f)}} = ${N(q.mRaw)} \\times ${q.pct} \\chia 100 ${e4(mMin)} ${B(show, N4(mMin))}${U('tấn')}`} />
        <Step>{`Cứ ${fmt(M)} tấn $${ce(Mi.f)}$ chứa ${x > 1 ? `$${x} \\times ${N(ATOMIC[Mi.metal])} = ${N(mMetal)}$` : fmt(mMetal)} tấn ${Mi.metal}, nên:`}</Step>
        <Calc tex={`m_{\\mathrm{${Mi.metal}}} = ${B(show, N4(mMin))} \\times ${N(mMetal)} \\chia ${N(M)} ${e4(mOut)} ${B(show, N4(mOut))}${U('tấn')}`} />
        <Answer show={show} items={[`$m_{\\mathrm{${Mi.metal}}} ${e4(mOut)} ${N4(mOut)}${u('tấn')}$`]} />
      </>
    );

  const draw = (p: p5) =>
    drawCrust(p, {
      metal: Mi.metal,
      mineral: `${Mi.name.split(' ')[0]}: ${cu(Mi.f)}`,
      pct,
      pctText: show ? `${fmt(pct)}%` : '?%',
      oreLines:
        q.mode === 'quang'
          ? [`${fmt(q.mRaw)} tấn quặng`, `→ ${f4(mMin)} tấn ${cu(Mi.f)} (${q.pct}%)`, `→ ${show ? f4(mOut) : '?'} tấn ${Mi.metal}`]
          : [`M(${cu(Mi.f)}) = ${fmt(M)} g/mol`, `${Mi.metal}: ${x} × ${fmt(ATOMIC[Mi.metal])} = ${fmt(mMetal)} g`],
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  return (
    <LessonLayout
      slug="vo-trai-dat"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Thành phần khối lượng các nguyên tố trong vỏ Trái Đất và phần khối lượng kim loại trong khoáng vật."
      readout={[
        { label: `M ${cu(Mi.f)}`, value: `${fmt(M)} g/mol`, tone: 'time' },
        { label: `% ${Mi.metal}`, value: q.mode === 'quang' || show ? `${fmt(pct)}%` : '?', tone: 'a' },
        { label: q.mode === 'quang' ? `${Mi.metal} trong quặng` : 'Kim loại', value: q.mode === 'quang' ? (show ? `${f4(mOut)} tấn` : '? tấn') : Mi.metal, tone: 'b' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />
          <Segmented name="mineral" legend="Khoáng vật" options={MIN_OPTIONS} value={q.mineral} onChange={(v) => ex.edit({ mineral: v })} />
        </>
      }
      fields={
        <>
          <RangeField id="mRaw" label="Khối lượng quặng" tone="a" min={0.5} max={100} step={0.5}
            value={q.mRaw} display={`${fmt(q.mRaw)} tấn`} onChange={(v) => ex.edit({ mRaw: v })} hidden={q.mode !== 'quang'} />
          <RangeField id="pct" label="Hàm lượng khoáng vật" tone="t" min={10} max={100} step={1}
            value={q.pct} display={`${q.pct}%`} onChange={(v) => ex.edit({ pct: v })} hidden={q.mode !== 'quang'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Vỏ Trái Đất', text: 'chủ yếu là oxygen và silicon; kim loại nhiều nhất là aluminium, sau đó là iron' },
        { term: 'Khoáng vật, quặng', text: 'quặng là đất đá chứa khoáng vật có hàm lượng kim loại đủ lớn để khai thác' },
        { term: '% kim loại', text: '$x \\times M_\\text{kim loại} \\times 100 \\chia M_\\text{khoáng vật}$' },
        { term: 'Khai thác bền vững', text: 'tài nguyên có hạn: tiết kiệm, tái chế kim loại, bảo vệ môi trường' },
      ]}
      playLabels={LABELS}
    />
  );
}
