'use client';

import type p5 from 'p5';
import { MassSolution, computeMass, type MassSpecies } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { ATOMIC, f4, molarMass, parseFormula } from '@/lib/chem';
import { fmt, fmtG, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawChain } from './sketch';

/** heso: hệ số polymer hóa; trunghop: khối lượng polymer theo hiệu suất; phantram: % nguyên tố */
export type Mode = 'heso' | 'trunghop' | 'phantram';
export type PolyId = 'PE' | 'PVC' | 'PS';

export interface Params {
  mode: Mode;
  poly: PolyId;
  deg: number; // hệ số polymer hóa n
  mRaw: number; // tấn monomer
  H: number; // %
}

const POLYS: Record<PolyId, {
  name: string; monomerName: string; formula: string; monoTex: string; unitTex: string; monoUni: string; unitUni: string; el: string; col: string;
}> = {
  PE: {
    name: 'polyethylene (PE)', monomerName: 'ethylene', formula: 'C2H4',
    monoTex: '\\mathrm{CH_2{=}CH_2}', unitTex: '(-\\mathrm{CH_2{-}CH_2}-)_n', monoUni: 'CH₂=CH₂', unitUni: '–CH₂–CH₂–', el: 'C', col: '#3D6FD8',
  },
  PVC: {
    name: 'poly(vinyl chloride) (PVC)', monomerName: 'vinyl chloride', formula: 'C2H3Cl',
    monoTex: '\\mathrm{CH_2{=}CHCl}', unitTex: '(-\\mathrm{CH_2{-}CHCl}-)_n', monoUni: 'CH₂=CHCl', unitUni: '–CH₂–CHCl–', el: 'Cl', col: '#3DBE5A',
  },
  PS: {
    name: 'polystyrene (PS)', monomerName: 'styrene', formula: 'C8H8',
    monoTex: '\\mathrm{CH_2{=}CH{-}C_6H_5}', unitTex: '(-\\mathrm{CH_2{-}CH(C_6H_5)}-)_n', monoUni: 'CH₂=CH–C₆H₅', unitUni: '–CH₂–CH(C₆H₅)–', el: 'C', col: '#E8873A',
  },
};

const MODE_OPTIONS = [
  { value: 'heso', label: 'Hệ số polymer hóa' },
  { value: 'trunghop', label: 'Trùng hợp theo hiệu suất' },
  { value: 'phantram', label: '% nguyên tố' },
] as const;
const POLY_OPTIONS = (Object.keys(POLYS) as PolyId[]).map((k) => ({ value: k, label: k }));

const EL_NAME: Record<string, string> = { C: 'carbon', Cl: 'chlorine' };
const LABELS: PlayLabels = { start: 'Trùng hợp', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };

export default function PolymerLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };
  const show = sim.revealed;
  const P = POLYS[q.poly];
  const Mu = molarMass(P.formula);
  const atoms = parseFormula(P.formula);
  const mSum = Object.keys(atoms).map((el) => `${atoms[el]} \\times ${N(ATOMIC[el])}`).join(' + ');
  const e2 = (x: number) => eq(isExact(x, 2));

  let problem;
  let solution;
  let lines: string[];
  let readout;

  if (q.mode === 'heso') {
    const Mp = q.deg * Mu;
    problem = (
      <p>
        Một mẫu {P.name} có khối lượng mol phân tử trung bình là <Num tone="a">{fmtG(Mp)} g/mol</Num>. Tính hệ số polymer
        hóa (số mắt xích n) của mẫu polymer này.
      </p>
    );
    solution = (
      <>
        <Summary given={[`M_\\text{polymer} = ${N(Mp)}${u('g/mol')}`]} find={['n']} />
        <Step>{`Mắt xích của ${q.poly} là $${P.unitTex.replace(/_n$/, '')}$, có khối lượng:`}</Step>
        <Calc tex={`M_\\text{mắt xích} = ${mSum} = ${N(Mu)}${U('g/mol')}`} />
        <Step>Hệ số polymer hóa:</Step>
        <Calc tex={`n = M_\\text{polymer} \\chia M_\\text{mắt xích} = ${N(Mp)} \\chia ${N(Mu)} = ${B(show, N(q.deg, 0))}`} />
        <Answer show={show} items={[`$n = ${N(q.deg, 0)}$`]} />
      </>
    );
    lines = [`M(polymer) = ${fmtG(Mp)} g/mol`, `mỗi mắt xích ${P.unitUni} = ${fmt(Mu)} g/mol  →  n = ${show ? fmtG(q.deg, 0) : '?'}`];
    readout = [
      { label: 'M polymer', value: `${fmtG(Mp)} g/mol`, tone: 'time' as const },
      { label: 'M mắt xích', value: `${fmt(Mu)} g/mol`, tone: 'a' as const },
      { label: 'Hệ số n', value: show ? fmtG(q.deg, 0) : '?', tone: 'b' as const },
    ];
  } else if (q.mode === 'trunghop') {
    const A: MassSpecies = { f: P.formula, k: 1, tex: P.monoTex, M: Mu };
    const T: MassSpecies = { f: `${q.poly}`, k: 1, tex: P.unitTex, M: Mu };
    const res = computeMass(q.mRaw, 100, A, [T], q.H);
    const out = res.items[0].value;
    problem = (
      <p>
        Trùng hợp <Num tone="a">{fmt(q.mRaw)} tấn</Num> {P.monomerName} ({P.monoUni}) để sản xuất {P.name}. Tính khối
        lượng polymer thu được, biết hiệu suất phản ứng là <Num tone="b">{q.H}%</Num>.
      </p>
    );
    solution = (
      <MassSolution
        raw={P.monomerName}
        mRaw={q.mRaw}
        pct={100}
        A={A}
        targets={[T]}
        H={q.H}
        unitName="tấn"
        equation={`n${P.monoTex} \\xrightarrow{t^\\circ,\\ p,\\ \\text{xt}} ${P.unitTex}`}
        ratioIntro="Theo định luật bảo toàn khối lượng"
        show={show}
      />
    );
    lines = [`${fmt(q.mRaw)} tấn ${P.monomerName}`, `${q.poly} thu được: ${show ? `${f4(out)} tấn` : '? tấn'} (H = ${q.H}%)`];
    readout = [
      { label: 'Monomer', value: `${fmt(q.mRaw)} tấn`, tone: 'time' as const },
      { label: 'Theo lí thuyết', value: show ? `${f4(res.items[0].theory)} tấn` : '? tấn', tone: 'a' as const },
      { label: `${q.poly} thu được`, value: show ? `${f4(out)} tấn` : '? tấn', tone: 'b' as const },
    ];
  } else {
    const el = P.el;
    const pct = (atoms[el] * ATOMIC[el] * 100) / Mu;
    problem = (
      <p>
        Tính phần trăm khối lượng {EL_NAME[el]} trong {P.name}, có mắt xích {P.unitUni}.
      </p>
    );
    solution = (
      <>
        <Summary given={[`\\text{mắt xích}\\ ${P.unitTex.replace(/_n$/, '')}`]} find={[`\\%\\mathrm{${el}}`]} />
        <Step>Phần trăm khối lượng trong polymer bằng phần trăm khối lượng trong một mắt xích:</Step>
        <Calc tex={`M_\\text{mắt xích} = ${mSum} = ${N(Mu)}${U('g/mol')}`} />
        <Calc tex={`\\%\\mathrm{${el}} = ${atoms[el]} \\times ${N(ATOMIC[el])} \\times 100 \\chia ${N(Mu)} ${e2(pct)} ${B(show, N(pct))}\\%`} />
        <Answer show={show} items={[`$\\%\\mathrm{${el}} ${e2(pct)} ${N(pct)}\\%$`]} />
      </>
    );
    lines = [`mắt xích ${P.unitUni}: M = ${fmt(Mu)} g/mol`, `%${el} = ${show ? `${fmt(pct)}%` : '?'}`];
    readout = [
      { label: 'M mắt xích', value: `${fmt(Mu)} g/mol`, tone: 'time' as const },
      { label: `% ${el}`, value: show ? `${fmt(pct)}%` : '?', tone: 'a' as const },
      { label: 'Polymer', value: q.poly, tone: 'b' as const },
    ];
  }

  const draw = (p: p5) => drawChain(p, { monomer: P.monoUni, unit: P.unitUni, col: P.col, lines, t: sim.t, started: sim.started, done: sim.done });

  return (
    <LessonLayout
      slug="polymer"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Các phân tử monomer nối với nhau thành mạch polymer gồm n mắt xích lặp lại."
      readout={readout}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          <Segmented name="poly" legend="Polymer" options={POLY_OPTIONS} value={q.poly} onChange={(v) => update({ poly: v })} />
        </>
      }
      fields={
        <>
          <RangeField id="deg" label="Hệ số polymer hóa" tone="a" min={100} max={5000} step={100}
            value={q.deg} display={`M = ${fmtG(q.deg * Mu)} g/mol`} onChange={(x) => update({ deg: x })} hidden={q.mode !== 'heso'} />
          <RangeField id="mRaw" label="Khối lượng monomer" tone="a" min={0.1} max={20} step={0.1}
            value={q.mRaw} display={`${fmt(q.mRaw)} tấn`} onChange={(x) => update({ mRaw: x })} hidden={q.mode !== 'trunghop'} />
          <RangeField id="H" label="Hiệu suất" tone="b" min={50} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => update({ H: x })} hidden={q.mode !== 'trunghop'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Polymer', text: 'chất có phân tử rất lớn, gồm nhiều mắt xích liên kết với nhau' },
        { term: 'Hệ số polymer hóa', text: '$n = M_\\text{polymer} \\chia M_\\text{mắt xích}$' },
        { term: 'Ứng dụng', text: 'chất dẻo (PE, PVC, PS), tơ, cao su; cần thu gom, tái chế để giảm ô nhiễm' },
      ]}
      playLabels={LABELS}
    />
  );
}

