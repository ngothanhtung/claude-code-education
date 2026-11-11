'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, isExact, round2 } from '@/lib/format';
import { B, N, U as Un, eq, u } from '@/lib/tex';
import { drawCircuit } from './sketch';

type Mode = 'noitiep' | 'songsong';

export interface Params {
  mode: Mode;
  U: number;
  R1: number;
  R2: number;
}

const MODE_OPTIONS = [
  { value: 'noitiep', label: 'Mắc nối tiếp' },
  { value: 'songsong', label: 'Mắc song song' },
] as const;

const LABELS: PlayLabels = { start: 'Đóng mạch', pause: 'Tạm dừng', resume: 'Chạy tiếp', again: 'Đóng lại' };

export default function MachDienLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 4 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const parallel = q.mode === 'songsong';
  const { U, R1, R2 } = q;
  const Rtd = parallel ? (R1 * R2) / (R1 + R2) : R1 + R2;
  const I = U / Rtd;
  const I1 = parallel ? U / R1 : I;
  const I2 = parallel ? U / R2 : I;
  const U1 = parallel ? U : I * R1;
  const U2 = parallel ? U : I * R2;
  const show = sim.revealed;
  const e = (x: number) => eq(isExact(x));

  const draw = (p: p5) => drawCircuit(p, { parallel, U, R1, R2, I, I1, I2, U1, U2, show, t: sim.t });

  const R1n = <Num tone="a">R₁ = {fmt(R1)} Ω</Num>;
  const R2n = <Num tone="b">R₂ = {fmt(R2)} Ω</Num>;
  const Un_ = <Num tone="t">U = {fmt(U)} V</Num>;
  const problem = parallel ? (
    <>
      <p>
        Hai điện trở {R1n} và {R2n} mắc song song vào hiệu điện thế {Un_}. Tính:
      </p>
      <ol>
        <li>Điện trở tương đương của đoạn mạch.</li>
        <li>Cường độ dòng điện qua mỗi điện trở và qua mạch chính.</li>
      </ol>
    </>
  ) : (
    <>
      <p>
        Hai điện trở {R1n} và {R2n} mắc nối tiếp vào hiệu điện thế {Un_}. Tính:
      </p>
      <ol>
        <li>Điện trở tương đương của đoạn mạch.</li>
        <li>Cường độ dòng điện trong mạch và hiệu điện thế giữa hai đầu mỗi điện trở.</li>
      </ol>
    </>
  );

  // Làm tròn I đến 2 chữ số rồi dùng tiếp, như học sinh làm trong vở
  const Ir = round2(I);
  const solution = parallel ? (
    <>
      <Summary given={[`R_1 = ${N(R1)}${u('Ω')};\\ R_2 = ${N(R2)}${u('Ω')};\\ U = ${N(U)}${u('V')}`]} find={['R_\\text{tđ}', 'I_1', 'I_2', 'I']} />
      <Step>Điện trở tương đương của đoạn mạch song song:</Step>
      <Calc
        tex={`R_\\text{tđ} = R_1 \\times R_2 \\chia (R_1 + R_2) = ${N(R1)} \\times ${N(R2)} \\chia (${N(R1)} + ${N(R2)}) ${e(Rtd)} ${B(show, N(Rtd))}${Un('Ω')}`}
      />
      <Step>Hai điện trở mắc song song nên có cùng hiệu điện thế $U$. Cường độ dòng điện qua mỗi điện trở:</Step>
      <Calc tex={`I_1 = U \\chia R_1 = ${N(U)} \\chia ${N(R1)} ${e(I1)} ${B(show, N(I1))}${Un('A')}`} />
      <Calc tex={`I_2 = U \\chia R_2 = ${N(U)} \\chia ${N(R2)} ${e(I2)} ${B(show, N(I2))}${Un('A')}`} />
      <Step>Cường độ dòng điện qua mạch chính:</Step>
      <Calc tex={`I = I_1 + I_2 = ${B(show, N(I1))} + ${B(show, N(I2))} ${e(I)} ${B(show, N(I))}${Un('A')}`} />
      <Answer
        show={show}
        items={[
          `$R_\\text{tđ} ${e(Rtd)} ${N(Rtd)}${u('Ω')}$`,
          `$I_1 ${e(I1)} ${N(I1)}${u('A')},\\ I_2 ${e(I2)} ${N(I2)}${u('A')},\\ I ${e(I)} ${N(I)}${u('A')}$`,
        ]}
      />
    </>
  ) : (
    <>
      <Summary given={[`R_1 = ${N(R1)}${u('Ω')};\\ R_2 = ${N(R2)}${u('Ω')};\\ U = ${N(U)}${u('V')}`]} find={['R_\\text{tđ}', 'I', 'U_1', 'U_2']} />
      <Step>Điện trở tương đương của đoạn mạch nối tiếp:</Step>
      <Calc tex={`R_\\text{tđ} = R_1 + R_2 = ${N(R1)} + ${N(R2)} = ${B(show, N(Rtd))}${Un('Ω')}`} />
      <Step>Cường độ dòng điện chạy trong mạch (bằng nhau tại mọi điểm):</Step>
      <Calc tex={`I = U \\chia R_\\text{tđ} = ${N(U)} \\chia ${B(show, N(Rtd))} ${e(I)} ${B(show, N(I))}${Un('A')}`} />
      <Step>Hiệu điện thế giữa hai đầu mỗi điện trở:</Step>
      <Calc tex={`U_1 = I \\times R_1 = ${B(show, N(Ir))} \\times ${N(R1)} ${e(U1)} ${B(show, N(U1))}${Un('V')}`} />
      <Calc tex={`U_2 = I \\times R_2 = ${B(show, N(Ir))} \\times ${N(R2)} ${e(U2)} ${B(show, N(U2))}${Un('V')}`} />
      <Answer
        show={show}
        items={[
          `$R_\\text{tđ} = ${N(Rtd)}${u('Ω')}$`,
          `$I ${e(I)} ${N(I)}${u('A')}$`,
          `$U_1 ${e(U1)} ${N(U1)}${u('V')},\\ U_2 ${e(U2)} ${N(U2)}${u('V')}$`,
        ]}
      />
    </>
  );

  return (
    <LessonLayout
      exercises={ex}
      slug="mach-noi-tiep-song-song"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel={
        parallel
          ? 'Hai điện trở mắc song song; dòng điện mạch chính chia thành hai nhánh, nhánh có điện trở nhỏ có dòng điện lớn hơn.'
          : 'Hai điện trở mắc nối tiếp với nguồn và ampe kế; hai vôn kế đo hiệu điện thế giữa hai đầu mỗi điện trở.'
      }
      readout={[
        { label: 'Điện trở tương đương', value: show ? `${fmt(Rtd)} Ω` : '? Ω', tone: 'time' },
        { label: 'Cường độ mạch chính', value: show ? `${fmt(I)} A` : '? A', tone: 'time' },
        parallel
          ? { label: 'Dòng qua R₁', value: show ? `${fmt(I1)} A` : '? A', tone: 'a' }
          : { label: 'Hiệu điện thế U₁', value: show ? `${fmt(U1)} V` : '? V', tone: 'a' },
        parallel
          ? { label: 'Dòng qua R₂', value: show ? `${fmt(I2)} A` : '? A', tone: 'b' }
          : { label: 'Hiệu điện thế U₂', value: show ? `${fmt(U2)} V` : '? V', tone: 'b' },
      ]}
      mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => update({ mode: v })} />}
      fields={
        <>
          <RangeField id="U" label="Hiệu điện thế U" tone="t" min={2} max={24} step={1}
            value={U} display={`${fmt(U)} V`} onChange={(v) => update({ U: v })} />
          <RangeField id="R1" label="Điện trở R₁" tone="a" min={2} max={60} step={2}
            value={R1} display={`${fmt(R1)} Ω`} onChange={(v) => update({ R1: v })} />
          <RangeField id="R2" label="Điện trở R₂" tone="b" min={2} max={60} step={2}
            value={R2} display={`${fmt(R2)} Ω`} onChange={(v) => update({ R2: v })} />
        </>
      }
      solution={solution}
      rules={[
        { key: 'noitiep', term: 'Mắc nối tiếp', text: '$R_\\text{tđ} = R_1 + R_2$; $I = I_1 = I_2$; $U = U_1 + U_2$' },
        { key: 'songsong', term: 'Mắc song song', text: '$R_\\text{tđ} = R_1 \\times R_2 \\chia (R_1 + R_2)$; $U = U_1 = U_2$; $I = I_1 + I_2$' },
        { term: 'Định luật Ôm', text: '$I = U \\chia R$' },
      ]}
      activeRule={q.mode}
      playLabels={LABELS}
    />
  );
}
