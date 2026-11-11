'use client';

import type p5 from 'p5';
import { StoichSolution, computeStoich, type Given, type Target } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import Molecule3D from '@/components/Molecule3D';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { ATOMIC, ce, coefOf, cu, e4, eqUni, f4, molarMass, N4, parseFormula, type Reaction } from '@/lib/chem';
import { drawOrganic } from '@/lib/draw/organic';
import { drawFlow, drawReactionScene, reactionBars } from '@/lib/draw/reaction';
import { fmt, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { EXERCISES } from './exercises';

/** phantram: % nguyên tố trong amino acid; thuyphan: thủy phân peptide; nhucau: nhu cầu protein mỗi ngày */
export type Mode = 'phantram' | 'thuyphan' | 'nhucau';
export type AminoId = 'gly' | 'ala';
export type PeptideId = 'glygly' | 'glyglygly';
export type FoodId = 'thitbo' | 'trung' | 'dauphu' | 'ca';

export interface Params {
  mode: Mode;
  amino: AminoId;
  peptide: PeptideId;
  n: number; // mol peptide
  body: number; // kg
  need: number; // g protein / kg / ngày
  food: FoodId;
}

const AMINOS: Record<AminoId, { name: string; f: string; display: string }> = {
  gly: { name: 'glycine', f: 'C2H5NO2', display: 'H₂N–CH₂–COOH' },
  ala: { name: 'alanine', f: 'C3H7NO2', display: 'CH₃–CH(NH₂)–COOH' },
};
const PEPTIDES: Record<PeptideId, { name: string; f: string; water: number; units: number }> = {
  glygly: { name: 'Gly-Gly', f: 'C4H8N2O3', water: 1, units: 2 },
  glyglygly: { name: 'Gly-Gly-Gly', f: 'C6H11N3O4', water: 2, units: 3 },
};
/** Hàm lượng protein (g trong 100 g thực phẩm), số liệu tham khảo */
const FOODS: Record<FoodId, { name: string; pct: number }> = {
  thitbo: { name: 'thịt bò nạc', pct: 26 },
  ca: { name: 'cá', pct: 20 },
  trung: { name: 'trứng gà', pct: 13 },
  dauphu: { name: 'đậu phụ', pct: 8 },
};

const MODE_OPTIONS = [
  { value: 'phantram', label: '% nguyên tố trong amino acid' },
  { value: 'thuyphan', label: 'Thủy phân peptide' },
  { value: 'nhucau', label: 'Nhu cầu protein' },
] as const;

const LABELS: PlayLabels = { start: 'Bắt đầu', pause: 'Tạm dừng', resume: 'Tiếp tục', again: 'Làm lại' };
const GLY = 'C2H5NO2';

export default function ProteinLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: q.mode === 'phantram' ? 2 : 1, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };
  const show = sim.revealed;
  const e2 = (x: number) => eq(isExact(x, 2));

  let problem;
  let solution;
  let draw: (p: p5) => void;
  let readout;
  let fields = null;
  let extraMode = null;

  if (q.mode === 'phantram') {
    const A = AMINOS[q.amino];
    const atoms = parseFormula(A.f);
    const els = ['C', 'H', 'N', 'O'];
    const M = molarMass(A.f);
    const pct = (el: string) => (atoms[el] * ATOMIC[el] * 100) / M;
    problem = (
      <p>
        Amino acid <Num tone="a">{A.name}</Num> có công thức {A.display} ({cu(A.f)}). Tính phần trăm khối lượng các nguyên
        tố, đặc biệt là nitrogen, trong {A.name}.
      </p>
    );
    solution = (
      <>
        <Summary given={[`\\text{${A.name}}:\\ ${ce(A.f)}`]} find={els.map((el) => `\\%\\mathrm{${el}}`)} />
        <Step>{`Khối lượng mol của ${A.name}:`}</Step>
        <Calc tex={`M = ${els.map((el) => `${atoms[el]} \\times ${ATOMIC[el]}`).join(' + ')} = ${N(M)}${U('g/mol')}`} />
        <Step>Phần trăm khối lượng các nguyên tố:</Step>
        {els.map((el) => (
          <Calc key={el} tex={`\\%\\mathrm{${el}} = ${atoms[el]} \\times ${ATOMIC[el]} \\times 100 \\chia ${N(M)} ${e2(pct(el))} ${B(show, N(pct(el)))}\\%`} />
        ))}
        <Answer show={show} items={els.map((el) => `$\\%\\mathrm{${el}} ${e2(pct(el))} ${N(pct(el))}\\%$`)} />
      </>
    );
    draw = (p) =>
      drawOrganic(p, {
        formula: A.f,
        label: A.display,
        findFormula: false,
        parts: els.map((el) => ({ el, pct: pct(el), text: show ? `${fmt(pct(el))}%` : '?%' })),
        t: sim.t,
        started: sim.started,
        done: sim.done,
      });
    readout = [
      { label: 'Khối lượng mol', value: `${fmt(M)} g/mol`, tone: 'time' as const },
      { label: '% nitrogen', value: show ? `${fmt(pct('N'))}%` : '?', tone: 'a' as const },
      { label: '% carbon', value: show ? `${fmt(pct('C'))}%` : '?', tone: 'b' as const },
    ];
    extraMode = (
      <Segmented name="amino" legend="Amino acid" options={(Object.keys(AMINOS) as AminoId[]).map((k) => ({ value: k, label: AMINOS[k].name }))}
        value={q.amino} onChange={(v) => update({ amino: v })} />
    );
  } else if (q.mode === 'thuyphan') {
    const P = PEPTIDES[q.peptide];
    const r: Reaction = { left: [{ f: P.f, k: 1 }, { f: 'H2O', k: P.water }], right: [{ f: GLY, k: P.units }] };
    const given: Given = { f: P.f, kind: 'm', value: q.n * molarMass(P.f) };
    const targets: Target[] = [{ f: GLY, kind: 'm' }, { f: 'H2O', kind: 'm' }];
    const st = computeStoich(r, given, targets);
    const nOf = (f: string) => (q.n * coefOf(r, f)) / coefOf(r, P.f);
    problem = (
      <p>
        Thủy phân hoàn toàn <Num tone="a">{f4(given.value)} g</Num> peptide {P.name} ({cu(P.f)}) thu được glycine (
        {cu(GLY)}). Tính khối lượng glycine thu được và khối lượng nước đã tham gia phản ứng.
      </p>
    );
    solution = <StoichSolution r={r} cond={'\\text{acid},\\ t^\\circ'} given={given} targets={targets} show={show} names={{ [P.f]: P.name, [GLY]: 'glycine' }} />;
    draw = (p) =>
      drawReactionScene(p, {
        reaction: r,
        equation: eqUni(r.left, r.right, 'acid, t°'),
        bars: reactionBars(r, nOf, [P.f], show, f4),
        captions: ['Đun peptide với acid (hoặc nhờ enzyme)', 'Các liên kết peptide bị cắt, mỗi liên kết cần một phân tử nước', 'Sản phẩm: các amino acid'],
        t: sim.t,
        started: sim.started,
        done: sim.done,
      });
    readout = [
      { label: `Số mol ${P.name}`, value: `${f4(st.nGiven)} mol`, tone: 'time' as const },
      { label: 'Glycine', value: show ? `${f4(st.items[0].value)} g` : '? g', tone: 'a' as const },
      { label: 'Nước phản ứng', value: show ? `${f4(st.items[1].value)} g` : '? g', tone: 'b' as const },
    ];
    extraMode = (
      <Segmented name="peptide" legend="Peptide" options={(Object.keys(PEPTIDES) as PeptideId[]).map((k) => ({ value: k, label: PEPTIDES[k].name }))}
        value={q.peptide} onChange={(v) => update({ peptide: v })} />
    );
    fields = (
      <RangeField id="n" label={`Khối lượng ${P.name}`} tone="a" min={0.01} max={1} step={0.01}
        value={q.n} display={`${f4(given.value)} g`} onChange={(x) => update({ n: x })} />
    );
  } else {
    const F = FOODS[q.food];
    const protein = q.body * q.need;
    const food = (protein * 100) / F.pct;
    problem = (
      <p>
        Một học sinh nặng <Num tone="a">{fmt(q.body)} kg</Num> cần khoảng <Num tone="t">{fmt(q.need)} g</Num> protein cho mỗi
        kg cơ thể mỗi ngày. Biết 100 g {F.name} chứa khoảng <Num tone="b">{F.pct} g</Num> protein. Tính lượng protein cần
        mỗi ngày và khối lượng {F.name} cần ăn nếu chỉ lấy protein từ thực phẩm này.
      </p>
    );
    solution = (
      <>
        <Summary given={[`m = ${N(q.body)}${u('kg')};\\ ${N(q.need)}${u('g protein mỗi kg')};\\ ${F.pct}\\%\\ \\text{protein}`]} find={['m_\\text{protein}', 'm_\\text{thực phẩm}']} />
        <Step>Lượng protein cần mỗi ngày:</Step>
        <Calc tex={`m_\\text{protein} = ${N(q.body)} \\times ${N(q.need)} ${e4(protein)} ${B(show, N4(protein))}${U('g')}`} />
        <Step>{`Cứ 100 g ${F.name} có ${F.pct} g protein, nên khối lượng ${F.name} cần ăn:`}</Step>
        <Calc tex={`m_\\text{thực phẩm} = ${B(show, N4(protein))} \\times 100 \\chia ${F.pct} ${e4(food)} ${B(show, N4(food))}${U('g')}`} />
        <Answer show={show} items={[`$m_\\text{protein} ${e4(protein)} ${N4(protein)}${u('g')}$`, `$m_\\text{thực phẩm} ${e4(food)} ${N4(food)}${u('g')}$`]} />
      </>
    );
    draw = (p) =>
      drawFlow(
        p,
        [
          { title: 'cơ thể', value: `${fmt(q.body)} kg`, col: '#5B6478' },
          { title: 'protein mỗi ngày', value: show ? `${f4(protein)} g` : '? g', col: '#C2302B' },
          { title: F.name, value: show ? `${f4(food)} g` : '? g', col: '#B98B52' },
        ],
        [`${fmt(q.need)} g mỗi kg`, `${F.pct} g trong 100 g`],
        sim.t,
        ['Protein cần cho sự phát triển và tái tạo tế bào', 'Tính lượng protein, rồi lượng thực phẩm tương ứng', 'Nên ăn đa dạng: thịt, cá, trứng, đậu, sữa'],
        sim.started,
        sim.done,
      );
    readout = [
      { label: 'Cân nặng', value: `${fmt(q.body)} kg`, tone: 'time' as const },
      { label: 'Protein mỗi ngày', value: show ? `${f4(protein)} g` : '? g', tone: 'a' as const },
      { label: F.name, value: show ? `${f4(food)} g` : '? g', tone: 'b' as const },
    ];
    extraMode = (
      <Segmented name="food" legend="Thực phẩm" options={(Object.keys(FOODS) as FoodId[]).map((k) => ({ value: k, label: FOODS[k].name }))}
        value={q.food} onChange={(v) => update({ food: v })} />
    );
    fields = (
      <>
        <RangeField id="body" label="Cân nặng" tone="a" min={20} max={80} step={1}
          value={q.body} display={`${q.body} kg`} onChange={(x) => update({ body: x })} />
        <RangeField id="need" label="Protein cho mỗi kg cơ thể" tone="t" min={0.8} max={2} step={0.1}
          value={q.need} display={`${fmt(q.need)} g`} onChange={(x) => update({ need: x })} />
      </>
    );
  }

  return (
    <LessonLayout
      slug="protein"
      sim={sim}
      exercises={ex}
      media={<Molecule3D
          files={['glycine', 'alanine', 'glycylglycine']}
          value={q.mode === 'thuyphan' ? 'glycylglycine' : q.amino === 'ala' ? 'alanine' : 'glycine'}
          groups={[{ label: 'glycine → Gly-Gly (liên kết peptide)', files: ['glycine', 'glycylglycine'] }]}
        />}
      problem={problem}
      draw={draw}
      canvasLabel="Mô hình amino acid, phương trình thủy phân peptide hoặc sơ đồ nhu cầu protein tùy dạng đề."
      readout={readout}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />
          {extraMode}
        </>
      }
      fields={fields}
      solution={solution}
      rules={[
        { term: 'Protein', text: 'hợp chất cao phân tử tạo từ nhiều amino acid; chứa C, H, O, N' },
        { term: 'Thủy phân', text: 'protein + nước → amino acid (đun với acid, base hoặc nhờ enzyme)' },
        { term: 'Đông tụ', text: 'đun nóng hoặc cho acid vào lòng trắng trứng, protein bị đông tụ' },
        { term: 'Đốt cháy', text: 'protein bị cháy có mùi khét như tóc cháy' },
      ]}
      playLabels={LABELS}
    />
  );
}
