'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { ATOMIC, ce, cu, molarMass, parseFormula } from '@/lib/chem';
import { fmt, isExact } from '@/lib/format';
import { B, N, T, eq, u } from '@/lib/tex';
import { EXERCISES } from './exercises';
import { drawOrganic } from '@/lib/draw/organic';

/** phantram: tính % khối lượng nguyên tố; ctpt: tìm công thức phân tử */
export type Mode = 'phantram' | 'ctpt';
export type MolId = 'CH4' | 'C2H6' | 'C3H8' | 'C2H4' | 'C2H2' | 'C2H6O' | 'C2H4O2';

export interface Params {
  mode: Mode;
  mol: MolId;
}

/** Tên gọi và công thức thu gọn để hiển thị */
const MOLS: Record<MolId, { name: string; display: string }> = {
  CH4: { name: 'methane', display: 'CH4' },
  C2H6: { name: 'ethane', display: 'C2H6' },
  C3H8: { name: 'propane', display: 'C3H8' },
  C2H4: { name: 'ethylene', display: 'C2H4' },
  C2H2: { name: 'acetylene', display: 'C2H2' },
  C2H6O: { name: 'ethanol', display: 'C2H5OH' },
  C2H4O2: { name: 'acetic acid', display: 'CH3COOH' },
};

const MODE_OPTIONS = [
  { value: 'phantram', label: 'Tính % khối lượng' },
  { value: 'ctpt', label: 'Tìm công thức phân tử' },
] as const;

const MOL_OPTIONS = (Object.keys(MOLS) as MolId[]).map((k) => ({ value: k, label: cu(MOLS[k].display) }));

const LABELS: PlayLabels = { start: 'Lắp phân tử', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Lắp lại' };
const LABELS_CT: PlayLabels = { start: 'Tìm công thức', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };

const EL_NAME: Record<string, string> = { C: 'carbon', H: 'hydrogen', O: 'oxygen' };

export default function HopChatHuuCoLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 6 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const show = sim.revealed;
  const ctpt = q.mode === 'ctpt';
  const atoms = parseFormula(q.mol);
  const els = (['C', 'H', 'O'] as const).filter((el) => atoms[el]);
  const M = molarMass(q.mol);
  const pct = (el: string) => (atoms[el] * ATOMIC[el] * 100) / M;
  /** % làm tròn 2 chữ số, dùng như số liệu đề cho */
  const pctR = (el: string) => Math.round(pct(el) * 100) / 100;
  const info = MOLS[q.mol];
  const e = (x: number) => eq(isExact(x, 2));

  const draw = (p: p5) =>
    drawOrganic(p, {
      formula: q.mol,
      label: cu(info.display),
      findFormula: ctpt,
      parts: els.map((el) => ({ el, pct: pct(el), text: ctpt || show ? `${fmt(pct(el), 2)}%` : '?%' })),
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const mSum = els.map((el) => `${atoms[el]} \\times ${ATOMIC[el]}`).join(' + ');

  let problem;
  let solution;
  if (!ctpt) {
    problem = (
      <p>
        Tính phần trăm khối lượng mỗi nguyên tố trong phân tử <Num tone="a">{info.name} ({cu(info.display)})</Num>.
      </p>
    );
    solution = (
      <>
        <Summary given={[`${T(info.name)}:\\ ${ce(q.mol)}`]} find={els.map((el) => `\\%\\mathrm{${el}}`)} />
        <Step>{`Khối lượng mol của $${ce(q.mol)}$:`}</Step>
        <Calc tex={`M = ${mSum} = ${N(M)}${u('g/mol')}`} />
        <Step>Phần trăm khối lượng mỗi nguyên tố:</Step>
        {els.map((el) => (
          <Calc
            key={el}
            tex={`\\%\\mathrm{${el}} = ${atoms[el]} \\times ${ATOMIC[el]} \\times 100 \\chia ${N(M)} ${e(pct(el))} ${B(show, N(pct(el)))}\\%`}
          />
        ))}
        <Answer show={show} items={els.map((el) => `$\\%\\mathrm{${el}} ${e(pct(el))} ${N(pct(el))}\\%$`)} />
      </>
    );
  } else {
    const hasO = els.includes('O');
    problem = (
      <p>
        Hợp chất hữu cơ A chứa các nguyên tố {els.map((el) => EL_NAME[el]).join(', ')}, trong đó{' '}
        {els.map((el, i) => (
          <span key={el}>
            {i > 0 && (i === els.length - 1 ? ' và ' : ', ')}
            <Num tone="a">%{el} = {fmt(pctR(el))}%</Num>
          </span>
        ))}
        . Khối lượng mol của A là <Num tone="t">{fmt(M)} g/mol</Num>. Tìm công thức phân tử của A
        {hasO ? '' : ' và viết công thức cấu tạo'}.
      </p>
    );
    const div: Record<string, string> = { C: '1200', H: '100', O: '1600' };
    solution = (
      <>
        <Summary given={[...els.map((el) => `\\%\\mathrm{${el}} = ${N(pctR(el))}\\%`), `M = ${N(M)}${u('g/mol')}`]} find={[T('CTPT của A')]} />
        <Step>{'Gọi công thức phân tử của A là $\\mathrm{C_xH_y' + (hasO ? 'O_z' : '') + '}$. Số nguyên tử mỗi nguyên tố:'}</Step>
        {els.map((el) => {
          const sym = { C: 'x', H: 'y', O: 'z' }[el]!;
          const k = (M * pctR(el)) / (ATOMIC[el] * 100);
          return (
            <Calc
              key={el}
              tex={`${sym} = M \\times \\%\\mathrm{${el}} \\chia ${div[el]} = ${N(M)} \\times ${N(pctR(el))} \\chia ${div[el]} ${e(k)} ${B(show, N(atoms[el], 0))}`}
            />
          );
        })}
        <Step>{show ? `Vậy công thức phân tử của A là $${ce(q.mol)}$ (${info.name}).` : <span className="blank">?</span>}</Step>
        <Answer show={show} items={[`$${ce(q.mol)}$`]} />
      </>
    );
  }

  return (
    <LessonLayout
      slug="hop-chat-huu-co"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Mô hình phân tử dạng quả cầu – thanh nối được lắp từng nguyên tử; cột bên phải là phần trăm khối lượng mỗi nguyên tố."
      readout={[
        { label: 'Khối lượng mol', value: `${fmt(M)} g/mol`, tone: 'time' },
        { label: 'Công thức phân tử', value: !ctpt || show ? cu(q.mol) : '?', tone: 'a' },
        { label: '% carbon', value: ctpt || show ? `${fmt(pct('C'))}%` : '?', tone: 'b' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          <Segmented name="mol" legend="Chất" options={MOL_OPTIONS} value={q.mol} onChange={(v) => update({ mol: v })} />
        </>
      }
      fields={null}
      solution={solution}
      rules={[
        { term: 'Hợp chất hữu cơ', text: 'hợp chất của carbon (trừ CO, CO₂, muối carbonate…)' },
        { term: 'Hóa trị', text: 'trong hợp chất hữu cơ C luôn hóa trị IV, H hóa trị I, O hóa trị II' },
        { term: '% khối lượng', text: '$\\%\\mathrm{C} = 12 \\times x \\times 100 \\chia M$' },
        { term: 'Tìm công thức', text: '$x = M \\times \\%\\mathrm{C} \\chia 1200$; $y = M \\times \\%\\mathrm{H} \\chia 100$' },
      ]}
      playLabels={ctpt ? LABELS_CT : LABELS}
    />
  );
}
