'use client';

import type p5 from 'p5';
import { StoichSolution, computeStoich, type Given, type Target } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { coefOf, cu, e4, eqTex, eqUni, f4, molarMass, N4, type Reaction } from '@/lib/chem';
import { drawReactionScene, reactionBars } from '@/lib/draw/reaction';
import { B, U, u } from '@/lib/tex';
import { EXERCISES } from './exercises';

/** xaphong: tính sản phẩm xà phòng hóa; baotoan: tìm khối lượng chất béo bằng bảo toàn khối lượng */
export type Mode = 'xaphong' | 'baotoan';
export type FatId = 'stearin' | 'palmitin' | 'olein';

export interface Params {
  mode: Mode;
  fat: FatId;
  n: number; // mol chất béo
  H: number; // %
}

const FATS: Record<FatId, { name: string; f: string; soap: string; soapName: string }> = {
  stearin: { name: 'tristearin', f: '(C17H35COO)3C3H5', soap: 'C17H35COONa', soapName: 'sodium stearate' },
  palmitin: { name: 'tripalmitin', f: '(C15H31COO)3C3H5', soap: 'C15H31COONa', soapName: 'sodium palmitate' },
  olein: { name: 'triolein', f: '(C17H33COO)3C3H5', soap: 'C17H33COONa', soapName: 'sodium oleate' },
};

const MODE_OPTIONS = [
  { value: 'xaphong', label: 'Xà phòng hóa' },
  { value: 'baotoan', label: 'Bảo toàn khối lượng' },
] as const;
const FAT_OPTIONS = (Object.keys(FATS) as FatId[]).map((k) => ({ value: k, label: FATS[k].name }));

const GLY = 'C3H5(OH)3';
const LABELS: PlayLabels = { start: 'Đun với kiềm', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };

export default function LipidLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };
  const show = sim.revealed;

  const F = FATS[q.fat];
  const r: Reaction = { left: [{ f: F.f, k: 1 }, { f: 'NaOH', k: 3 }], right: [{ f: F.soap, k: 3 }, { f: GLY, k: 1 }] };
  const cond = 't^\\circ';
  const H = q.mode === 'xaphong' ? q.H : 100;
  const given: Given = { f: F.f, kind: 'm', value: q.n * molarMass(F.f) };
  const targets: Target[] = [{ f: 'NaOH', kind: 'm' }, { f: F.soap, kind: 'm' }, { f: GLY, kind: 'm' }];
  const st = computeStoich(r, given, targets, H);
  const nOf = (f: string) => (q.n * coefOf(r, f)) / coefOf(r, F.f);
  const mNaOH = nOf('NaOH') * 40;
  const mSoap = nOf(F.soap) * molarMass(F.soap);
  const mGly = nOf(GLY) * 92;
  const mFat = mSoap + mGly - mNaOH;

  const draw = (p: p5) =>
    drawReactionScene(p, {
      reaction: r,
      equation: eqUni(r.left, r.right, 't°'),
      bars: reactionBars(r, nOf, q.mode === 'baotoan' ? ['NaOH', F.soap, GLY] : [F.f], show, f4),
      captions: ['Đun chất béo với dung dịch sodium hydroxide', 'Chất béo bị thủy phân trong môi trường kiềm', 'Sản phẩm: xà phòng (muối của acid béo) và glycerol'],
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const problem =
    q.mode === 'xaphong' ? (
      <p>
        Đun nóng <Num tone="a">{f4(given.value)} g</Num> chất béo {F.name} ({cu(F.f)}) với dung dịch NaOH vừa đủ. Tính khối
        lượng NaOH cần dùng, khối lượng xà phòng {F.soapName} và glycerol thu được
        {H < 100 ? <>, biết hiệu suất phản ứng là <Num tone="b">{H}%</Num></> : ''}.
      </p>
    ) : (
      <p>
        Xà phòng hóa hoàn toàn m gam chất béo cần vừa đủ <Num tone="a">{f4(mNaOH)} g</Num> NaOH, thu được{' '}
        <Num tone="t">{f4(mSoap)} g</Num> xà phòng và <Num tone="b">{f4(mGly)} g</Num> glycerol. Tính m.
      </p>
    );

  const solution =
    q.mode === 'xaphong' ? (
      <StoichSolution r={r} cond={cond} given={given} targets={targets} H={H} show={show} names={{ [F.f]: F.name }} />
    ) : (
      <>
        <Summary given={[`m_\\text{NaOH} = ${N4(mNaOH)}${u('g')};\\ m_\\text{xà phòng} = ${N4(mSoap)}${u('g')};\\ m_\\text{glycerol} = ${N4(mGly)}${u('g')}`]} find={['m']} />
        <Step>Phương trình hóa học (chất béo + kiềm):</Step>
        <Calc tex={eqTex(r.left, r.right, cond)} />
        <Step>Theo định luật bảo toàn khối lượng:</Step>
        <Calc tex={'m_\\text{chất béo} + m_\\text{NaOH} = m_\\text{xà phòng} + m_\\text{glycerol}'} />
        <Calc tex={`m = ${N4(mSoap)} + ${N4(mGly)} - ${N4(mNaOH)} ${e4(mFat)} ${B(show, N4(mFat))}${U('g')}`} />
        <Answer show={show} items={[`$m ${e4(mFat)} ${N4(mFat)}${u('g')}$`]} />
      </>
    );

  return (
    <LessonLayout
      slug="lipid"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Phản ứng xà phòng hóa: chất béo và sodium hydroxide tạo xà phòng và glycerol; các thanh dưới là số mol từng chất."
      readout={[
        { label: 'Chất béo', value: q.mode === 'baotoan' && !show ? '? g' : `${f4(given.value)} g`, tone: 'time' },
        { label: 'Xà phòng', value: q.mode === 'baotoan' || show ? `${f4(st.items[1].value)} g` : '? g', tone: 'a' },
        { label: 'Glycerol', value: q.mode === 'baotoan' || show ? `${f4(st.items[2].value)} g` : '? g', tone: 'b' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          <Segmented name="fat" legend="Chất béo" options={FAT_OPTIONS} value={q.fat} onChange={(v) => update({ fat: v })} />
        </>
      }
      fields={
        <>
          <RangeField id="n" label="Khối lượng chất béo" tone="a" min={0.01} max={0.5} step={0.01}
            value={q.n} display={`${f4(given.value)} g`} onChange={(x) => update({ n: x })} />
          <RangeField id="H" label="Hiệu suất" tone="b" min={50} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => update({ H: x })} hidden={q.mode !== 'xaphong'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Lipid', text: 'chất béo, sáp, steroid…; không tan trong nước, tan trong dung môi hữu cơ' },
        { term: 'Chất béo', text: 'ester của glycerol với acid béo: $(\\mathrm{RCOO})_3\\mathrm{C_3H_5}$' },
        { term: 'Xà phòng hóa', text: '$(\\mathrm{RCOO})_3\\mathrm{C_3H_5} + 3\\mathrm{NaOH} \\rightarrow 3\\mathrm{RCOONa} + \\mathrm{C_3H_5(OH)_3}$' },
      ]}
      playLabels={LABELS}
    />
  );
}
