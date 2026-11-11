'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { VM, ce, coefOf, combustion, cu, e4, eqTex, eqUni, mOf, massOf, molFromMass, molRatio, molarMass, N4, VOf } from '@/lib/chem';
import { fmt, fmtG, isExact } from '@/lib/format';
import { B, N, T, U, eq, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawFuel } from './sketch';

/** nhiet: nhiệt lượng tỏa ra; dunnuoc: khối lượng nhiên liệu cần để đun nước; co2: khí CO2 thải ra */
export type Mode = 'nhiet' | 'dunnuoc' | 'co2';
export type FuelId = 'CH4' | 'C4H10' | 'C';

export interface Params {
  mode: Mode;
  fuel: FuelId;
  m: number; // g nhiên liệu
  water: number; // kg nước
  t1: number; // °C
  t2: number; // °C
  H: number; // % nhiệt lượng có ích
}

/** Nhiệt lượng tỏa ra khi đốt cháy hoàn toàn 1 mol (kJ) */
const FUELS: Record<FuelId, { name: string; label: string; q: number; flame: string; coal: boolean }> = {
  CH4: { name: 'khí methane', label: 'khí methane (khí thiên nhiên, biogas)', q: 890, flame: '#4F7BFF', coal: false },
  C4H10: { name: 'khí gas (butane)', label: 'khí gas (butane)', q: 2878, flame: '#4F7BFF', coal: false },
  C: { name: 'than (carbon)', label: 'than đá (coi là carbon)', q: 394, flame: '#F28C28', coal: true },
};

const MODE_OPTIONS = [
  { value: 'nhiet', label: 'Nhiệt lượng tỏa ra' },
  { value: 'dunnuoc', label: 'Đun sôi nước' },
  { value: 'co2', label: 'Khí CO₂ thải ra' },
] as const;
const FUEL_OPTIONS = (Object.keys(FUELS) as FuelId[]).map((k) => ({ value: k, label: k === 'C' ? 'Than (C)' : cu(k) }));

const LABELS: PlayLabels = { start: 'Đốt nhiên liệu', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Đốt lại' };
const C_WATER = 4.2; // kJ/(kg.°C)

export default function NguonNhienLieuLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 6 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const show = sim.revealed;
  const F = FUELS[q.fuel];
  const M = molarMass(q.fuel);
  const r = combustion(q.fuel);
  const kF = coefOf(r, q.fuel);
  const kC = coefOf(r, 'CO2');
  const e = (x: number) => eq(isExact(x, 4));
  const Q1 = `Q_\\text{1 mol}`;

  // Đun nước
  const dT = q.t2 - q.t1;
  const Qw = q.water * C_WATER * dT;
  const Qtp = (Qw * 100) / q.H;
  const nNeed = Qtp / F.q;
  const mNeed = nNeed * M;
  // Nhiệt lượng / CO2 từ khối lượng cho trước
  const n = q.mode === 'dunnuoc' ? nNeed : q.m / M;
  const Q = n * F.q;
  const nCO2 = (n * kC) / kF;
  const mCO2 = nCO2 * 44;
  const VCO2 = nCO2 * VM;
  const burned = q.mode === 'dunnuoc' ? mNeed : q.m;

  const draw = (p: p5) =>
    drawFuel(p, {
      mode: q.mode,
      coal: F.coal,
      flameCol: F.flame,
      fuelLabel: F.label,
      equation: eqUni(r.left, r.right, 't°'),
      t1: q.t1,
      t2: q.t2,
      fuelText: q.mode === 'dunnuoc' && !show ? '? g' : `${fmtG(burned, 2)} g`,
      heatText: q.mode === 'nhiet' && !show ? '? kJ' : `${fmtG(q.mode === 'dunnuoc' ? Qtp : Q, 2)} kJ`,
      co2Text: show ? `${fmtG(mCO2, 2)} g` : '? g',
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  let problem;
  let solution;
  if (q.mode === 'nhiet') {
    problem = (
      <p>
        Đốt cháy hoàn toàn <Num tone="a">{fmtG(q.m)} g</Num> {F.name}. Tính nhiệt lượng tỏa ra, biết đốt cháy 1 mol{' '}
        {cu(q.fuel)} tỏa ra <Num tone="t">{fmtG(F.q)} kJ</Num>.
      </p>
    );
    solution = (
      <>
        <Summary given={[`${mOf(q.fuel)} = ${N(q.m)}${u('g')};\\ ${Q1} = ${N(F.q)}${u('kJ')}`]} find={['Q']} />
        <Calc tex={eqTex(r.left, r.right, 't^\\circ')} />
        <Calc tex={molFromMass(q.fuel, q.m, n, true)} />
        <Step>Nhiệt lượng tỏa ra:</Step>
        <Calc tex={`Q = n \\times ${Q1} = ${N4(n)} \\times ${N(F.q)} ${e(Q)} ${B(show, N(Q, 2))}${U('kJ')}`} />
        <Answer show={show} items={[`$Q ${eq(isExact(Q, 2))} ${N(Q, 2)}${u('kJ')}$`]} />
      </>
    );
  } else if (q.mode === 'dunnuoc') {
    problem = (
      <p>
        Dùng {F.name} để đun <Num tone="b">{fmt(q.water)} kg</Num> nước từ <Num tone="t">{q.t1} °C</Num> lên{' '}
        <Num tone="t">{q.t2} °C</Num>. Biết nhiệt dung riêng của nước là 4,2 kJ/(kg.°C), đốt 1 mol {cu(q.fuel)} tỏa ra{' '}
        {fmtG(F.q)} kJ và chỉ <Num tone="a">{q.H}%</Num> nhiệt lượng được nước hấp thụ. Tính khối lượng {cu(q.fuel)}{' '}
        cần đốt.
      </p>
    );
    solution = (
      <>
        <Summary
          given={[`m_\\text{nước} = ${N(q.water)}${u('kg')};\\ t_1 = ${q.t1}^\\circ\\text{C};\\ t_2 = ${q.t2}^\\circ\\text{C};\\ H = ${q.H}\\%`, `${Q1} = ${N(F.q)}${u('kJ')}`]}
          find={[mOf(q.fuel)]}
        />
        <Step>Nhiệt lượng nước cần thu vào:</Step>
        <Calc tex={`Q_\\text{nước} = m \\times c \\times (t_2 - t_1) = ${N(q.water)} \\times 4{,}2 \\times ${dT} ${e(Qw)} ${B(show, N4(Qw))}${U('kJ')}`} />
        <Step>Nhiệt lượng nhiên liệu cần tỏa ra:</Step>
        <Calc tex={`Q = Q_\\text{nước} \\times 100 \\chia H = ${B(show, N4(Qw))} \\times 100 \\chia ${q.H} ${e(Qtp)} ${B(show, N4(Qtp))}${U('kJ')}`} />
        <Step>{`Số mol và khối lượng $${ce(q.fuel)}$ cần đốt:`}</Step>
        <Calc tex={`n = Q \\chia ${Q1} = ${B(show, N4(Qtp))} \\chia ${N(F.q)} ${e(nNeed)} ${B(show, N4(nNeed))}\\;(${T('mol')})`} />
        <Calc tex={massOf(q.fuel, nNeed, show)} />
        <Answer show={show} items={[`$${mOf(q.fuel)} ${e4(mNeed)} ${N4(mNeed)}${u('g')}$`]} />
      </>
    );
  } else {
    problem = (
      <p>
        Đốt cháy hoàn toàn <Num tone="a">{fmtG(q.m)} g</Num> {F.name}. Tính khối lượng và thể tích (đkc) khí carbon
        dioxide thải vào không khí.
      </p>
    );
    solution = (
      <>
        <Summary given={[`${mOf(q.fuel)} = ${N(q.m)}${u('g')}`]} find={[mOf('CO2'), VOf('CO2')]} />
        <Calc tex={molFromMass(q.fuel, q.m, n, true)} />
        <Step>Phương trình hóa học:</Step>
        <Calc tex={eqTex(r.left, r.right, 't^\\circ')} />
        <Calc tex={molRatio('CO2', kC, q.fuel, kF, n, show, true)} />
        <Calc tex={massOf('CO2', nCO2, show)} />
        <Calc tex={`${VOf('CO2')} = n \\times 24{,}79 = ${B(show, N4(nCO2))} \\times 24{,}79 ${e(VCO2)} ${B(show, N4(VCO2))}${U('L')}`} />
        <Answer show={show} items={[`$${mOf('CO2')} ${e4(mCO2)} ${N4(mCO2)}${u('g')}$`, `$${VOf('CO2')} ${e4(VCO2)} ${N4(VCO2)}${u('L')}$`]} />
      </>
    );
  }

  return (
    <LessonLayout
      slug="nguon-nhien-lieu"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Bếp đốt nhiên liệu; thanh bên phải cho biết nhiên liệu đã cháy, nhiệt lượng tỏa ra và khí carbon dioxide thải ra."
      readout={[
        { label: 'Nhiên liệu', value: q.mode === 'dunnuoc' && !show ? '? g' : `${fmtG(burned, 2)} g`, tone: 'time' },
        { label: 'Nhiệt lượng', value: q.mode === 'nhiet' && !show ? '? kJ' : `${fmtG(q.mode === 'dunnuoc' ? Qtp : Q, 2)} kJ`, tone: 'a' },
        { label: 'CO₂ thải ra', value: show ? `${fmtG(mCO2, 2)} g` : '? g', tone: 'b' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          <Segmented name="fuel" legend="Nhiên liệu" options={FUEL_OPTIONS} value={q.fuel} onChange={(v) => update({ fuel: v })} />
        </>
      }
      fields={
        <>
          <RangeField id="m" label="Khối lượng nhiên liệu" tone="a" min={1} max={2000} step={1}
            value={q.m} display={`${fmtG(q.m)} g`} onChange={(x) => update({ m: x })} hidden={q.mode === 'dunnuoc'} />
          <RangeField id="water" label="Khối lượng nước" tone="b" min={0.5} max={10} step={0.5}
            value={q.water} display={`${fmt(q.water)} kg`} onChange={(x) => update({ water: x })} hidden={q.mode !== 'dunnuoc'} />
          <RangeField id="t1" label="Nhiệt độ ban đầu" tone="t" min={10} max={40} step={1}
            value={q.t1} display={`${q.t1} °C`} onChange={(x) => update({ t1: x })} hidden={q.mode !== 'dunnuoc'} />
          <RangeField id="H" label="Hiệu suất sử dụng nhiệt" tone="a" min={30} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => update({ H: x })} hidden={q.mode !== 'dunnuoc'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Nhiên liệu hóa thạch', text: 'dầu mỏ, khí thiên nhiên, than đá: cháy tỏa nhiều nhiệt nhưng thải CO₂ gây hiệu ứng nhà kính' },
        { term: 'Nhiệt lượng', text: `$Q = n \\times ${Q1}$; nước thu nhiệt $Q = m \\times c \\times (t_2 - t_1)$` },
        { term: 'Sử dụng hiệu quả', text: 'cung cấp đủ không khí, tăng diện tích tiếp xúc, điều chỉnh lượng nhiên liệu' },
      ]}
      playLabels={LABELS}
    />
  );
}
