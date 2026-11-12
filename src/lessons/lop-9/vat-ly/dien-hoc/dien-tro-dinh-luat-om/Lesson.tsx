'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, isExact } from '@/lib/format';
import { B, N, SCI, U as Un, eq, u } from '@/lib/tex';
import { drawOhm, type OhmMode } from './sketch';

/** Điện trở suất ở 20 °C (bảng trong SGK KHTN 9): rho = mant × 10^exp (Ω.m) */
const MATERIALS = {
  dong: { name: 'đồng', mant: 1.7, exp: -8 },
  nhom: { name: 'nhôm', mant: 2.8, exp: -8 },
  vonfram: { name: 'vonfram', mant: 5.5, exp: -8 },
  nikelin: { name: 'nikêlin', mant: 0.4, exp: -6 },
  nicrom: { name: 'nicrom', mant: 1.1, exp: -6 },
} as const;
type MaterialId = keyof typeof MATERIALS;

export interface Params {
  mode: OhmMode;
  U: number;
  R: number;
  I: number;
  mat: MaterialId;
  l: number;
  S: number;
}

const MODE_OPTIONS = [
  { value: 'I', label: 'Tính cường độ dòng điện' },
  { value: 'R', label: 'Tính điện trở' },
  { value: 'rho', label: 'Điện trở dây dẫn' },
] as const;

const MAT_OPTIONS = (Object.keys(MATERIALS) as MaterialId[]).map((k) => ({ value: k, label: MATERIALS[k].name }));

const LABELS = playLabels('Đóng khóa K', 'Chạy tiếp', 'Đóng lại');

export default function DinhLuatOmLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 4, resetOn: ex.params });

  const m = MATERIALS[q.mat];
  const rho = m.mant * 10 ** m.exp;
  let R: number;
  let I: number;
  if (q.mode === 'I') {
    R = q.R;
    I = q.U / q.R;
  } else if (q.mode === 'R') {
    I = q.I;
    R = q.U / q.I;
  } else {
    R = (rho * q.l) / (q.S * 1e-6);
    I = q.U / R;
  }
  const show = sim.revealed;
  const hideI = q.mode !== 'R' && !show;
  const hideR = q.mode !== 'I' && !show;
  const draw = (p: p5) =>
    drawOhm(p, { mode: q.mode, U: q.U, R, I, hideI, hideR, material: m.name, l: q.l, S: q.S, t: sim.t, done: sim.done });

  const UNum = <Num tone="t">U = {fmt(q.U)} V</Num>;
  let problem;
  let solution;
  if (q.mode === 'I') {
    problem = (
      <p>
        Mắc điện trở <Num tone="a">R = {fmt(q.R)} Ω</Num> vào hai đầu đoạn mạch có hiệu điện thế {UNum}. Tính cường độ
        dòng điện chạy qua điện trở.
      </p>
    );
    solution = (
      <>
        <Summary given={[`R = ${N(q.R)}${u('Ω')};\\ U = ${N(q.U)}${u('V')}`]} find={['I']} />
        <Step>Theo định luật Ôm, cường độ dòng điện chạy qua điện trở là:</Step>
        <Calc tex={`I = U \\chia R = ${N(q.U)} \\chia ${N(q.R)} ${eq(isExact(I))} ${B(show, N(I))}${Un('A')}`} />
        <Answer show={show} items={[`$I ${eq(isExact(I))} ${N(I)}${u('A')}$`]} />
      </>
    );
  } else if (q.mode === 'R') {
    problem = (
      <p>
        Đặt hiệu điện thế {UNum} vào hai đầu một dây dẫn thì cường độ dòng điện chạy qua dây là{' '}
        <Num tone="b">I = {fmt(q.I)} A</Num>. Tính điện trở của dây dẫn.
      </p>
    );
    solution = (
      <>
        <Summary given={[`U = ${N(q.U)}${u('V')};\\ I = ${N(q.I)}${u('A')}`]} find={['R']} />
        <Step>Từ định luật Ôm, điện trở của dây dẫn là:</Step>
        <Calc tex={`R = U \\chia I = ${N(q.U)} \\chia ${N(q.I)} ${eq(isExact(R))} ${B(show, N(R))}${Un('Ω')}`} />
        <Answer show={show} items={[`$R ${eq(isExact(R))} ${N(R)}${u('Ω')}$`]} />
      </>
    );
  } else {
    const rhoT = SCI(m.mant, m.exp);
    problem = (
      <p>
        Một dây dẫn bằng {m.name} dài <Num tone="t">l = {fmt(q.l)} m</Num>, tiết diện <Num tone="t">S = {fmt(q.S)} mm²</Num>,
        điện trở suất <Num tone="a">ρ = {fmt(m.mant)} × 10<sup>{m.exp}</sup> Ω.m</Num>. Tính điện trở của dây. Mắc dây vào
        hiệu điện thế {UNum}, tính cường độ dòng điện chạy qua dây.
      </p>
    );
    solution = (
      <>
        <Summary
          given={[`l = ${N(q.l)}${u('m')};\\ S = ${N(q.S)}${u('mm')}^2`, `\\rho = ${rhoT}${u('Ω.m')};\\ U = ${N(q.U)}${u('V')}`]}
          find={['R', 'I']}
        />
        <Step>{`Đổi: $S = ${N(q.S)}${u('mm')}^2 = ${SCI(q.S, -6)}${u('m')}^2$`}</Step>
        <Step>Điện trở của dây dẫn là:</Step>
        <Calc
          tex={`R = \\rho \\times l \\chia S = ${rhoT} \\times ${N(q.l)} \\chia (${SCI(q.S, -6)}) ${eq(isExact(R))} ${B(show, N(R))}${Un('Ω')}`}
        />
        <Step>Cường độ dòng điện chạy qua dây là:</Step>
        <Calc tex={`I = U \\chia R = ${N(q.U)} \\chia ${B(show, N(R))} ${eq(isExact(I))} ${B(show, N(I))}${Un('A')}`} />
        <Answer show={show} items={[`$R ${eq(isExact(R))} ${N(R)}${u('Ω')}$`, `$I ${eq(isExact(I))} ${N(I)}${u('A')}$`]} />
      </>
    );
  }

  return (
    <LessonLayout
      exercises={ex}
      slug="dien-tro-dinh-luat-om"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel="Mạch điện gồm nguồn, khóa K, điện trở R, ampe kế mắc nối tiếp và vôn kế mắc song song với R; bên phải là đồ thị cường độ dòng điện theo hiệu điện thế."
      readout={[
        { label: 'Hiệu điện thế', value: `${fmt(q.U)} V`, tone: 'time' },
        { label: 'Cường độ dòng điện', value: hideI ? '? A' : `${fmt(I)} A`, tone: 'b' },
        { label: 'Điện trở', value: hideR ? '? Ω' : `${fmt(R)} Ω`, tone: 'a' },
        { label: 'Khóa K', value: sim.t >= 0.4 ? 'đóng' : 'mở', sub: sim.t >= 0.4 ? 'có dòng điện' : 'chưa có dòng điện' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />
          {q.mode === 'rho' && (
            <Segmented name="mat" legend="Vật liệu" options={MAT_OPTIONS} value={q.mat} onChange={(v) => ex.edit({ mat: v })} />
          )}
        </>
      }
      fields={
        <>
          <RangeField id="U" label="Hiệu điện thế U" tone="t" min={1} max={24} step={1}
            value={q.U} display={`${fmt(q.U)} V`} onChange={(v) => ex.edit({ U: v })} />
          <RangeField id="R" label="Điện trở R" tone="a" min={2} max={60} step={1}
            value={q.R} display={`${fmt(q.R)} Ω`} onChange={(v) => ex.edit({ R: v })} hidden={q.mode !== 'I'} />
          <RangeField id="I" label="Cường độ dòng điện I" tone="b" min={0.1} max={3} step={0.1}
            value={q.I} display={`${fmt(q.I)} A`} onChange={(v) => ex.edit({ I: v })} hidden={q.mode !== 'R'} />
          <RangeField id="l" label="Chiều dài dây l" tone="t" min={1} max={50} step={1}
            value={q.l} display={`${fmt(q.l)} m`} onChange={(v) => ex.edit({ l: v })} hidden={q.mode !== 'rho'} />
          <RangeField id="S" label="Tiết diện dây S" tone="t" min={0.1} max={2} step={0.1}
            value={q.S} display={`${fmt(q.S)} mm²`} onChange={(v) => ex.edit({ S: v })} hidden={q.mode !== 'rho'} />
        </>
      }
      solution={solution}
      rules={[
        { key: 'I', term: 'Định luật Ôm', text: '$I = U \\chia R$' },
        { key: 'R', term: 'Điện trở', text: '$R = U \\chia I$, đơn vị là ôm ($\\Omega$)' },
        { key: 'rho', term: 'Điện trở dây dẫn', text: '$R = \\rho \\times l \\chia S$ ($l$ tính bằng m, $S$ tính bằng m²)' },
        { term: 'Đổi đơn vị', text: '$1\\,\\text{mm}^2 = 10^{-6}\\,\\text{m}^2$' },
      ]}
      activeRule={q.mode}
      playLabels={LABELS}
    />
  );
}

