'use client';

import { StoichSolution, computeStoich, stoichReadout, type Given, type Target } from '@/components/ChemSteps';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, REACT_LABELS } from '@/components/Controls';
import { useExercises } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { coefOf, cu, eqUni, f4, molarMass, type Reaction } from '@/lib/chem';
import { drawReactionScene, reactionBars } from '@/lib/draw/reaction';
import { EXERCISES } from './exercises';

/** base: trung hòa NaOH; kimloai: Mg/Zn; carbonate: Na2CO3; ester: ester hóa với ethylic alcohol */
export type Mode = 'base' | 'kimloai' | 'carbonate' | 'ester';

export interface Params {
  mode: Mode;
  n: number; // mol acetic acid
  metal: 'Mg' | 'Zn';
  H: number; // hiệu suất ester hóa %
}

const MODE_OPTIONS = [
  { value: 'base', label: 'Tác dụng với base' },
  { value: 'kimloai', label: 'Tác dụng với kim loại' },
  { value: 'carbonate', label: 'Tác dụng với muối carbonate' },
  { value: 'ester', label: 'Ester hóa' },
] as const;

const METAL_OPTIONS = [
  { value: 'Mg', label: 'Mg' },
  { value: 'Zn', label: 'Zn' },
] as const;

const A = 'CH3COOH';

function setup(q: Params): { r: Reaction; cond?: string; uni?: string; targets: Target[]; reversible?: boolean } {
  switch (q.mode) {
    case 'base':
      return {
        r: { left: [{ f: A, k: 1 }, { f: 'NaOH', k: 1 }], right: [{ f: 'CH3COONa', k: 1 }, { f: 'H2O', k: 1 }] },
        targets: [{ f: 'NaOH', kind: 'm' }, { f: 'CH3COONa', kind: 'm' }],
      };
    case 'kimloai': {
      const salt = `(CH3COO)2${q.metal}`;
      return {
        r: { left: [{ f: A, k: 2 }, { f: q.metal, k: 1 }], right: [{ f: salt, k: 1 }, { f: 'H2', k: 1 }] },
        targets: [{ f: 'H2', kind: 'V' }, { f: salt, kind: 'm' }],
      };
    }
    case 'carbonate':
      return {
        r: { left: [{ f: A, k: 2 }, { f: 'Na2CO3', k: 1 }], right: [{ f: 'CH3COONa', k: 2 }, { f: 'CO2', k: 1 }, { f: 'H2O', k: 1 }] },
        targets: [{ f: 'CO2', kind: 'V' }, { f: 'CH3COONa', kind: 'm' }],
      };
    default:
      return {
        r: { left: [{ f: A, k: 1 }, { f: 'C2H5OH', k: 1 }], right: [{ f: 'CH3COOC2H5', k: 1 }, { f: 'H2O', k: 1 }] },
        cond: '\\mathrm{H_2SO_4}\\text{ đặc}, t^\\circ',
        uni: 'H₂SO₄ đặc, t°',
        targets: [{ f: 'CH3COOC2H5', kind: 'm' }],
        reversible: true,
      };
  }
}

const NAMES: Record<string, string> = { CH3COOH: 'acetic acid' };

export default function AceticAcidLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 1, defaultDuration: 5, resetOn: ex.params });
  const show = sim.revealed;

  const S = setup(q);
  const H = q.mode === 'ester' ? q.H : 100;
  const given: Given = { f: A, kind: 'm', value: q.n * molarMass(A) };
  const st = computeStoich(S.r, given, S.targets, H);
  const nOf = (f: string) => (q.n * coefOf(S.r, f)) / coefOf(S.r, A);
  const g = f4(given.value);

  const problem =
    q.mode === 'base' ? (
      <p>
        Trung hòa <Num tone="a">{g} g</Num> acetic acid (CH₃COOH) bằng dung dịch sodium hydroxide. Tính khối lượng NaOH
        cần dùng và khối lượng muối sodium acetate (CH₃COONa) tạo thành.
      </p>
    ) : q.mode === 'kimloai' ? (
      <p>
        Cho <Num tone="a">{g} g</Num> acetic acid tác dụng hết với <Num tone="t">{q.metal === 'Mg' ? 'magnesium' : 'zinc'}</Num>{' '}
        dư. Tính thể tích khí hydrogen (đkc) và khối lượng muối {cu(`(CH3COO)2${q.metal}`)} tạo thành.
      </p>
    ) : q.mode === 'carbonate' ? (
      <p>
        Nhỏ giấm chứa <Num tone="a">{g} g</Num> acetic acid vào sodium carbonate (Na₂CO₃) dư. Tính thể tích khí carbon
        dioxide thoát ra (đkc) và khối lượng sodium acetate tạo thành.
      </p>
    ) : (
      <p>
        Đun nóng <Num tone="a">{g} g</Num> acetic acid với ethylic alcohol dư (có H₂SO₄ đặc làm xúc tác). Tính khối lượng
        ethyl acetate (CH₃COOC₂H₅) thu được, biết hiệu suất phản ứng là <Num tone="b">{q.H}%</Num>.
      </p>
    );

  const draw = (p: import('p5')) =>
    drawReactionScene(p, {
      reaction: S.r,
      equation: eqUni(S.r.left, S.r.right, S.uni, S.reversible),
      bars: reactionBars(S.r, nOf, [A], show, f4),
      captions:
        q.mode === 'base'
          ? ['Nhỏ dung dịch NaOH vào acetic acid', 'Phản ứng trung hòa tạo muối và nước', 'Sản phẩm: sodium acetate và nước']
          : q.mode === 'kimloai'
            ? ['Cho kim loại vào acetic acid', 'Kim loại tan, có bọt khí hydrogen thoát ra', 'Acetic acid có tính chất của acid']
            : q.mode === 'carbonate'
              ? ['Nhỏ giấm vào sodium carbonate', 'Sủi bọt khí carbon dioxide', 'Acetic acid mạnh hơn carbonic acid']
              : ['Đun acetic acid với ethylic alcohol, có H₂SO₄ đặc', 'Phản ứng ester hóa xảy ra chậm và thuận nghịch', 'Ethyl acetate có mùi thơm, ít tan trong nước'],
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  return (
    <LessonLayout
      slug="acetic-acid"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Phương trình hóa học bằng mô hình phân tử; các thanh dưới là số mol từng chất."
      readout={stoichReadout(st, show, 'CH₃COOH')}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />
          {q.mode === 'kimloai' && <Segmented name="metal" legend="Kim loại" options={METAL_OPTIONS} value={q.metal} onChange={(v) => ex.edit({ metal: v })} />}
        </>
      }
      fields={
        <>
          <RangeField id="n" label="Khối lượng acetic acid" tone="a" min={0.05} max={2} step={0.05}
            value={q.n} display={`${g} g`} onChange={(x) => ex.edit({ n: x })} />
          <RangeField id="H" label="Hiệu suất ester hóa" tone="b" min={30} max={100} step={5}
            value={q.H} display={`${q.H}%`} onChange={(x) => ex.edit({ H: x })} hidden={q.mode !== 'ester'} />
        </>
      }
      solution={<StoichSolution r={S.r} cond={S.cond} reversible={S.reversible} given={given} targets={S.targets} H={H} show={show} names={NAMES} />}
      rules={[
        { term: 'Acetic acid', text: '$\\mathrm{CH_3COOH}$, có nhóm –COOH; giấm ăn là dung dịch acetic acid 2–5%' },
        { term: 'Tính acid', text: 'làm quỳ tím hóa đỏ; tác dụng với base, kim loại đứng trước H, muối carbonate' },
        { term: 'Ester hóa', text: 'acid + alcohol ⇌ ester + nước (xúc tác $\\mathrm{H_2SO_4}$ đặc, đun nóng)' },
      ]}
      playLabels={REACT_LABELS}
    />
  );
}
