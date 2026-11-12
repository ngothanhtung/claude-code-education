'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { B, N, T, U, UN, u } from '@/lib/tex';

const PD = '\\mathscr{P}_\\text{đ}';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, fmtG } from '@/lib/format';
import { drawDam } from './sketch';

export interface Params {
  h: number; // m
  V: number; // m³ nước mỗi giây
  H: number; // hiệu suất %
}

const LABELS = playLabels('Mở cửa đập', 'Chạy tiếp', 'Chạy lại');

export default function ThuyDienLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 7, resetOn: ex.params });

  const m = 1000 * q.V; // kg mỗi giây
  const A = 10 * m * q.h; // J mỗi giây
  const Pw = A;
  const Pe = (q.H / 100) * Pw;
  const show = sim.revealed;

  const draw = (p: p5) =>
    drawDam(p, { h: q.h, efficiency: q.H, Pw, Pe, t: sim.t, started: sim.started, done: sim.done });

  const problem = (
    <p>
      Mực nước trong hồ chứa của một nhà máy thủy điện cao hơn tuabin <Num tone="t">{q.h} m</Num>. Mỗi giây có{' '}
      <Num tone="b">{q.V} m³</Num> nước chảy qua tuabin. Hiệu suất của nhà máy là <Num tone="a">{q.H}%</Num>. Biết khối
      lượng riêng của nước là 1000 kg/m³. Tính công suất điện của nhà máy.
    </p>
  );

  const solution = (
    <>
      <Summary
        given={[
          `h = ${q.h}${u('m')};\\ V = ${q.V}\\,${UN('m³')}\\ ${T('(trong')}\\ t = 1${u('s')})`,
          `H = ${q.H}\\%;\\ D = 1000\\,\\text{kg/m}^3`,
        ]}
        find={[PD]}
      />
      <Step>Khối lượng nước chảy qua tuabin trong 1 giây:</Step>
      <Calc tex={`m = D \\times V = 1000 \\times ${q.V} = ${B(show, N(m))}${U('kg')}`} />
      <Step>Công do nước sinh ra trong 1 giây (bằng thế năng của nước):</Step>
      <Calc tex={`A = 10 \\times m \\times h = 10 \\times ${B(show, N(m))} \\times ${q.h} = ${B(show, N(A))}${U('J')}`} />
      <Step>Công suất của dòng nước:</Step>
      <Calc tex={`\\mathscr{P} = A \\chia t = ${B(show, N(Pw))}${U('W')}`} />
      <Step>Công suất điện của nhà máy:</Step>
      <Calc tex={`${PD} = H \\times \\mathscr{P} = ${q.H}\\% \\times ${B(show, N(Pw))} = ${B(show, N(Pe))}${U('W')}`} />
      <Answer show={show} items={[`$${PD} = ${N(Pe)}${u('W')} = ${N(Pe / 1e6, 3)}${u('MW')}$`]} />
    </>
  );

  return (
    <LessonLayout
      exercises={ex}
      slug="nha-may-thuy-dien"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel="Nước từ hồ chứa trên cao chảy qua ống xuống làm quay tuabin và máy phát điện; sơ đồ phía trên cho thấy thế năng chuyển thành động năng rồi điện năng."
      readout={[
        { label: 'Độ chênh mực nước', value: `${q.h} m`, tone: 'time' },
        { label: 'Nước mỗi giây', value: `${q.V} m³`, sub: `= ${fmtG(m)} kg`, tone: 'b' },
        { label: 'Hiệu suất', value: `${q.H}%`, tone: 'a' },
        { label: 'Công suất điện', value: show ? `${fmt(Pe / 1e6, 3)} MW` : '? MW' },
      ]}
      fields={
        <>
          <RangeField id="h" label="Độ chênh mực nước" tone="t" min={10} max={200} step={10}
            value={q.h} display={`${q.h} m`} onChange={(v) => ex.edit({ h: v })} />
          <RangeField id="V" label="Nước chảy mỗi giây" tone="b" min={1} max={50} step={1}
            value={q.V} display={`${q.V} m³`} onChange={(v) => ex.edit({ V: v })} />
          <RangeField id="H" label="Hiệu suất" tone="a" min={50} max={95} step={5}
            value={q.H} display={`${q.H}%`} onChange={(v) => ex.edit({ H: v })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Thủy điện', text: 'thế năng của nước → động năng → điện năng' },
        { term: 'Công của trọng lực', text: '$A = P \\times h = 10 \\times m \\times h$' },
        { term: 'Hiệu suất', text: '$H = \\mathscr{P}_\\text{có ích} \\chia \\mathscr{P}_\\text{toàn phần}$' },
        { term: 'Mê-ga-oát', text: '$1\\,\\text{MW} = 1\\,000\\,000\\,\\text{W}$' },
      ]}
      playLabels={LABELS}
    />
  );
}
