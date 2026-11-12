'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import {
  METALS, VM, activityIndex, ce, coefOf, cu, displacement, e4, eqTex, eqUni, mOf, massOf, molFromMass, molRatio, molarMass, N4, VOf, volumeOf,
  f4,
} from '@/lib/chem';
import { fmt } from '@/lib/format';
import { B, N, T, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawSeries } from './sketch';

export type MetalId = 'Mg' | 'Al' | 'Zn' | 'Fe' | 'Cu' | 'Ag';
export type SolId = 'HCl' | 'H2SO4' | 'CuSO4' | 'AgNO3' | 'FeSO4';

export interface Params {
  metal: MetalId;
  sol: SolId;
  m: number; // g
}

/** Dung dịch: nguyên tố bị đẩy ra, hóa trị, gốc acid, tên và màu */
const SOLUTIONS: Record<SolId, { cation: string; q: number; anion: string; name: string; col: string }> = {
  HCl: { cation: 'H', q: 1, anion: 'Cl', name: 'dung dịch HCl', col: '#CFE1F3' },
  H2SO4: { cation: 'H', q: 1, anion: 'SO4', name: 'dung dịch H₂SO₄ loãng', col: '#CFE1F3' },
  CuSO4: { cation: 'Cu', q: 2, anion: 'SO4', name: 'dung dịch CuSO₄ (màu xanh lam)', col: '#7FB5E6' },
  AgNO3: { cation: 'Ag', q: 1, anion: 'NO3', name: 'dung dịch AgNO₃', col: '#DCE4EE' },
  FeSO4: { cation: 'Fe', q: 2, anion: 'SO4', name: 'dung dịch FeSO₄ (lục nhạt)', col: '#CFE7C9' },
};

const METAL_OPTIONS = (['Mg', 'Al', 'Zn', 'Fe', 'Cu', 'Ag'] as const).map((x) => ({ value: x, label: x }));
const SOL_OPTIONS = (Object.keys(SOLUTIONS) as SolId[]).map((k) => ({ value: k, label: cu(k) }));

const METAL_COL: Record<string, string> = { Mg: '#C9CFDA', Al: '#BFC6D2', Zn: '#AEB7C4', Fe: '#7A808C', Cu: '#B5562B', Ag: '#C9CED6' };
/** Mức hoạt động (tốc độ phản ứng, lượng bọt khí) theo dãy hoạt động */
const SPEED: Record<string, number> = { Mg: 1, Al: 0.7, Zn: 0.6, Fe: 0.4, Cu: 0.35, Ag: 0.3 };
/** màu dung dịch muối theo kim loại của muối */
const SALT_COL: Record<string, string> = { Cu: '#7FB5E6', Fe: '#CFE7C9' };

const LABELS = playLabels('Nhúng thanh kim loại', 'Tiếp tục', 'Làm lại thí nghiệm');

export default function DayHoatDongLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 6, resetOn: ex.params });

  const show = sim.revealed;
  const sol = SOLUTIONS[q.sol];
  const isAcid = sol.cation === 'H';
  const reacts = q.metal !== sol.cation && activityIndex(q.metal) < activityIndex(sol.cation);
  const r = displacement(q.metal, sol.cation, sol.q, sol.anion);
  const salt = r.right[0].f;
  const freed = r.right[1].f; // H2 hoặc kim loại bị đẩy ra
  const kM = coefOf(r, q.metal);
  const kF = coefOf(r, freed);
  const nM = q.m / molarMass(q.metal);
  const nF = (nM * kF) / kM;
  const mF = nF * molarMass(freed);
  const V = nF * VM;
  const metalName = `${METALS[q.metal].name} (${q.metal})`;
  const before = sol.cation === 'H' ? 'H' : sol.cation;
  const relation = reacts ? 'đứng trước' : 'đứng sau';

  const draw = (p: p5) =>
    drawSeries(p, {
      metal: q.metal,
      cation: sol.cation,
      reacts,
      isAcid,
      metalCol: METAL_COL[q.metal],
      speed: SPEED[q.metal],
      coatCol: METAL_COL[sol.cation] ?? '#B5562B',
      solCol: sol.col,
      solAfter: SALT_COL[q.metal] ?? '#EEF2F7',
      solLabel: cu(q.sol),
      equation: eqUni(r.left, r.right),
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const ask = isAcid ? 'thể tích khí hydrogen sinh ra (đkc)' : `khối lượng kim loại ${sol.cation} tạo thành`;
  const problem = (
    <p>
      Cho <Num tone="a">{fmt(q.m)} g</Num> {metalName} vào <Num tone="b">{sol.name}</Num> dư. Phản ứng có xảy ra
      không? Nếu có, viết phương trình hóa học và tính {ask}.
    </p>
  );

  const reason = isAcid
    ? `Trong dãy hoạt động hóa học, ${q.metal} ${relation} H nên ${reacts ? 'đẩy được' : 'không đẩy được'} hydrogen ra khỏi dung dịch acid.`
    : `Trong dãy hoạt động hóa học, ${q.metal} ${relation} ${before} nên ${reacts ? 'đẩy được' : 'không đẩy được'} ${before} ra khỏi dung dịch muối.`;

  const solution = reacts ? (
    <>
      <Summary given={[`${mOf(q.metal)} = ${N(q.m)}${u('g')}`]} find={[isAcid ? VOf('H2') : mOf(freed)]} />
      <Step>{reason}</Step>
      <Step>{`Số mol ${q.metal}:`}</Step>
      <Calc tex={molFromMass(q.metal, q.m, nM, true)} />
      <Step>Phương trình hóa học:</Step>
      <Calc tex={eqTex(r.left, r.right)} />
      <Step>Theo phương trình hóa học:</Step>
      <Calc tex={molRatio(freed, kF, q.metal, kM, nM, show, true)} />
      <Step>{isAcid ? 'Thể tích khí hydrogen (đkc):' : `Khối lượng ${sol.cation} tạo thành:`}</Step>
      <Calc tex={isAcid ? volumeOf('H2', nF, show) : massOf(freed, nF, show)} />
      <Step>{show ? `Dung dịch sau phản ứng chứa muối $${ce(salt)}$.` : <span className="blank">?</span>}</Step>
      <Answer
        show={show}
        items={[
          'có phản ứng',
          isAcid ? `$${VOf('H2')} ${e4(V)} ${N4(V)}${u('L')}$` : `$${mOf(freed)} ${e4(mF)} ${N4(mF)}${u('g')}$`,
        ]}
      />
    </>
  ) : (
    <>
      <Step>{reason}</Step>
      <Calc tex={`\\Rightarrow ${B(show, T('không xảy ra phản ứng, không có hiện tượng gì'))}`} />
      <Answer show={show} items={['không xảy ra phản ứng']} />
    </>
  );

  return (
    <LessonLayout
      slug="day-hoat-dong-hoa-hoc"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Dãy hoạt động hóa học ở trên; thanh kim loại nhúng vào cốc dung dịch, kim loại mới bám vào thanh hoặc có bọt khí nếu có phản ứng."
      readout={[
        { label: 'Vị trí trong dãy', value: `${q.metal} ${reacts ? 'trước' : 'sau'} ${before}`, tone: 'time' },
        { label: 'Phản ứng', value: show ? (reacts ? 'có' : 'không') : '?', tone: 'a' },
        {
          label: isAcid ? 'Thể tích H₂' : `Khối lượng ${sol.cation}`,
          value: !reacts ? '0' : show ? (isAcid ? `${f4(V)} L` : `${f4(mF)} g`) : '?',
          tone: 'b',
        },
      ]}
      mode={
        <>
          <Segmented name="metal" legend="Kim loại" options={METAL_OPTIONS} value={q.metal} onChange={(v) => ex.edit({ metal: v })} />
          <Segmented name="sol" legend="Dung dịch" options={SOL_OPTIONS} value={q.sol} onChange={(v) => ex.edit({ sol: v })} />
        </>
      }
      fields={
        <RangeField id="m" label={`Khối lượng ${q.metal}`} tone="a" min={0.1} max={30} step={0.1}
          value={q.m} display={`${fmt(q.m)} g`} onChange={(x) => ex.edit({ m: x })} />
      }
      solution={solution}
      rules={[
        { term: 'Dãy hoạt động hóa học', text: 'K, Na, Ca, Mg, Al, Zn, Fe, Pb, H, Cu, Ag, Au' },
        { term: 'Kim loại + acid', text: 'kim loại đứng trước H đẩy được hydrogen ra khỏi dung dịch acid' },
        { term: 'Kim loại + muối', text: 'kim loại đứng trước (trừ K, Na, Ca…) đẩy được kim loại đứng sau ra khỏi dung dịch muối' },
      ]}
      playLabels={LABELS}
    />
  );
}
