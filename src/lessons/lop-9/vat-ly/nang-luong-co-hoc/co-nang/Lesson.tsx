'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, fmtG, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { drawFall } from './sketch';

/** Ký hiệu như SGK: chỉ số "t" (thế năng), "đ" (động năng) viết đứng */
const WT = 'W_\\text{t}';
const WD = 'W_\\text{đ}';
const WTM = 'W_{\\text{t}M}';
const WDM = 'W_{\\text{đ}M}';

export interface Params {
  m: number; // kg
  h0: number; // m
  hM: number; // m
}

const LABELS = playLabels('Thả vật', 'Rơi tiếp', 'Thả lại');
const g = 10;

/** Điểm M luôn thấp hơn chỗ thả vật */
function fix(q: Params): Params {
  return q.hM >= q.h0 ? { ...q, hM: Math.max(0, q.h0 - 0.5) } : q;
}

export default function CoNangLesson() {
  const ex = useExercises(EXERCISES, fix);
  const { m, h0, hM } = ex.params;

  const T = Math.sqrt((2 * h0) / g); // thời gian rơi (giây)
  const sim = useSimulation({ total: T, defaultDuration: 5, resetOn: ex.params });

  const tau = sim.t;
  const h = Math.max(0, h0 - (g * tau * tau) / 2);
  const v = g * tau;

  const P = 10 * m;
  const Wt0 = P * h0;
  const W = Wt0;
  const WtM = P * hM;
  const WdM = W - WtM;
  const v2 = (2 * WdM) / m;
  const vM = Math.sqrt(v2);
  const vExact = isExact(vM, 2);
  const show = sim.revealed;

  const draw = (p: p5) =>
    drawFall(p, { m, h0, hM, h, v, started: sim.started, done: sim.done });

  const problem = (
    <>
      <p>
        Một vật có khối lượng <Num tone="a">{fmt(m)} kg</Num> được thả rơi từ độ cao <Num tone="t">{fmt(h0)} m</Num>{' '}
        so với mặt đất. Bỏ qua sức cản của không khí. Hỏi:
      </p>
      <ol>
        <li>Thế năng và cơ năng của vật lúc bắt đầu thả?</li>
        <li>
          Động năng và vận tốc của vật khi rơi tới điểm M ở độ cao <Num tone="t">{fmt(hM)} m</Num>?
        </li>
      </ol>
    </>
  );

  const solution = (
    <>
      <Summary
        given={[`m = ${N(m)}${u('kg')}`, `h = ${N(h0)}${u('m')}`, `h_M = ${N(hM)}${u('m')}`]}
        find={[WT, 'W', WDM, 'v_M']}
      />
      <Step>Trọng lượng của vật:</Step>
      <Calc tex={`P = 10 \\times m = 10 \\times ${N(m)} = ${B(show, N(P))}${U('N')}`} />
      <Step>Thế năng của vật lúc thả:</Step>
      <Calc tex={`${WT} = P \\times h = ${N(P)} \\times ${N(h0)} = ${B(show, N(Wt0))}${U('J')}`} />
      <Step>{`Lúc thả vật đứng yên nên $${WD} = 0$. Cơ năng:`}</Step>
      <Calc tex={`W = ${WT} + ${WD} = ${B(show, N(W))}${U('J')}`} />
      <Step>Thế năng tại M:</Step>
      <Calc tex={`${WTM} = P \\times h_M = ${N(P)} \\times ${N(hM)} = ${B(show, N(WtM))}${U('J')}`} />
      <Step>Bỏ qua sức cản, cơ năng được bảo toàn:</Step>
      <Calc tex={`${WDM} = W - ${WTM} = ${B(show, N(WdM))}${U('J')}`} />
      <Step>{`Từ $${WDM} = \\frac{1}{2} \\times m \\times v_M^2$ suy ra:`}</Step>
      <Calc
        tex={`v_M = \\sqrt{2 \\times ${WDM} \\chia m} = \\sqrt{${B(show, N(v2))}} ${eq(vExact)} ${B(show, N(vM))}${U('m/s')}`}
      />
      <Answer
        show={show}
        items={[`$${WT} = W = ${N(W)}${u('J')}$`, `$${WDM} = ${N(WdM)}${u('J')}$`, `$v_M ${eq(vExact)} ${N(vM)}${u('m/s')}$`]}
      />
    </>
  );

  return (
    <LessonLayout
      slug="co-nang"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Vật rơi từ độ cao h; ba cột năng lượng cho thấy thế năng giảm, động năng tăng, cơ năng không đổi."
      readout={[
        { label: 'Độ cao', value: `${fmt(h, 2)} m`, tone: 'time' },
        { label: 'Vận tốc', value: `${fmt(v, 2)} m/s`, tone: 'a' },
        { label: 'Thế năng Wt', value: `${fmtG(P * h, 1)} J`, tone: 'b' },
        { label: 'Động năng Wđ', value: `${fmtG(W - P * h, 1)} J`, tone: 'a' },
      ]}
      fields={
        <>
          <RangeField id="sM" label="Khối lượng" tone="a" min={0.5} max={10} step={0.5}
            value={m} display={`${fmt(m)} kg`} onChange={(x) => ex.edit({ m: x })} />
          <RangeField id="sH" label="Độ cao thả vật" tone="t" min={1} max={20} step={1}
            value={h0} display={`${fmt(h0)} m`} onChange={(x) => ex.edit({ h0: x })} />
          <RangeField id="sHM" label="Độ cao điểm M" tone="t" min={0} max={19.5} step={0.5}
            value={hM} display={`${fmt(hM)} m`} onChange={(x) => ex.edit({ hM: x })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Động năng', text: `$${WD} = \\frac{1}{2} \\times m \\times v^2$` },
        { term: 'Thế năng trọng trường', text: `$${WT} = P \\times h = 10 \\times m \\times h$` },
        { term: 'Cơ năng', text: `$W = ${WD} + ${WT}$, được bảo toàn khi bỏ qua ma sát, sức cản` },
      ]}
      playLabels={LABELS}
    />
  );
}
