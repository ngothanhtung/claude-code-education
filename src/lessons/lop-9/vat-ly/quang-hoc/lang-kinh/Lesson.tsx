'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { LIGHT_LABELS, Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { B, D, N as TN } from '@/lib/tex';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { deg, fmt } from '@/lib/format';
import { SPECTRUM, drawPrism, tracePrism } from './sketch';

type Light = 'don' | 'trang';

export interface Params {
  light: Light;
  A: number;
  i1: number;
}

const LIGHT_OPTIONS = [
  { value: 'don', label: 'Ánh sáng đơn sắc' },
  { value: 'trang', label: 'Ánh sáng trắng' },
] as const;

const N = 1.5;

export default function LangKinhLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 3, defaultDuration: 5 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const white = q.light === 'trang';
  const tr = tracePrism(q.A, N, q.i1);
  const red = tracePrism(q.A, SPECTRUM[0][2], q.i1);
  const violet = tracePrism(q.A, SPECTRUM[6][2], q.i1);
  const show = sim.revealed;
  const sinI1 = Math.sin((q.i1 * Math.PI) / 180);
  const exits = tr.exitDir !== null && tr.exitFace === 'mặt bên thứ hai';

  const draw = (p: p5) => drawPrism(p, { white, A: q.A, i1: q.i1, n: N, t: sim.t, done: sim.done });

  const problem = white ? (
    <p>
      Chiếu một chùm ánh sáng trắng hẹp tới mặt bên của lăng kính thủy tinh có góc chiết quang{' '}
      <Num tone="t">A = {q.A}°</Num> với góc tới <Num tone="a">i = {q.i1}°</Num>. Mô tả chùm tia ló ra khỏi lăng kính.
      Màu nào bị lệch nhiều nhất, màu nào ít nhất?
    </p>
  ) : (
    <p>
      Chiếu một tia sáng đơn sắc tới mặt bên của lăng kính thủy tinh (chiết suất <Num tone="b">n = 1,5</Num>) có góc
      chiết quang <Num tone="t">A = {q.A}°</Num>, với góc tới <Num tone="a">i₁ = {q.i1}°</Num>. Vẽ đường truyền của tia
      sáng và cho biết tia ló lệch về phía nào.
    </p>
  );

  const solution = white ? (
    <>
      <Step>Ánh sáng trắng gồm nhiều ánh sáng màu từ đỏ đến tím.</Step>
      <Step>Thủy tinh có chiết suất khác nhau với mỗi màu: nhỏ nhất với đỏ, lớn nhất với tím.</Step>
      <Step>Qua lăng kính, mỗi màu khúc xạ một góc khác nhau nên chùm sáng bị tách ra:</Step>
      <Step>{show ? 'đỏ, da cam, vàng, lục, lam, chàm, tím.' : <span className="blank">?</span>}</Step>
      <Step>Góc lệch (đo trên hình):</Step>
      <Calc tex={`D_\\text{đỏ} \\approx ${B(show, D(red.D))};\\quad D_\\text{tím} \\approx ${B(show, D(violet.D))}`} />
      <Step>{show ? 'Đây là hiện tượng tán sắc ánh sáng, giống cầu vồng sau mưa.' : <span className="blank">?</span>}</Step>
      <Answer show={show} items={['dải màu từ đỏ đến tím', 'tím lệch nhiều nhất, đỏ lệch ít nhất']} />
    </>
  ) : (
    <>
      <Summary given={[`n = 1{,}5;\\ A = ${q.A}^\\circ`, `i_1 = ${q.i1}^\\circ`]} find={['D']} />
      <Step>Tại mặt bên thứ nhất, ánh sáng đi từ không khí vào thủy tinh:</Step>
      <Calc
        tex={`\\sin r_1 = \\sin i_1 \\chia n = ${TN(sinI1, 4)} \\chia 1{,}5 \\approx ${B(show, TN(sinI1 / N, 4))} \\Rightarrow r_1 \\approx ${B(show, D(tr.r1))}`}
      />
      <Step>Tia khúc xạ lệch lại gần pháp tuyến, tức là lệch về phía đáy.</Step>
      {exits ? (
        <>
          <Step>{`Tại mặt bên thứ hai, ánh sáng đi từ thủy tinh ra không khí với góc tới $i_2 \\approx ${D(tr.i2)}$:`}</Step>
          <Calc
            tex={`\\sin e = n \\times \\sin i_2 \\approx ${B(show, TN(N * Math.sin((tr.i2 * Math.PI) / 180), 4))} \\Rightarrow e \\approx ${B(show, D(tr.e))}`}
          />
          <Step>Tia ló lệch xa pháp tuyến, tức là lại lệch thêm về phía đáy.</Step>
          <Answer show={show} items={['tia ló lệch về phía đáy lăng kính', `$D \\approx ${D(tr.D)}$`]} />
        </>
      ) : (
        <>
          <Step>
            {show
              ? `Tại mặt bên thứ hai góc tới quá lớn nên xảy ra phản xạ toàn phần; tia sáng ló ra ở ${tr.exitFace || 'mặt khác'}.`
              : <span className="blank">?</span>}
          </Step>
          <Answer show={show} items={['phản xạ toàn phần ở mặt bên thứ hai']} />
        </>
      )}
    </>
  );

  return (
    <LessonLayout
      exercises={ex}
      slug="lang-kinh"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel={
        white
          ? 'Chùm ánh sáng trắng qua lăng kính bị tách thành bảy màu chiếu lên màn.'
          : 'Tia sáng đơn sắc khúc xạ hai lần qua lăng kính và lệch về phía đáy.'
      }
      readout={[
        { label: 'Góc chiết quang A', value: `${q.A}°`, tone: 'time' },
        { label: 'Góc tới', value: `${q.i1}°`, tone: 'a' },
        white
          ? { label: 'Góc lệch tia đỏ và tia tím', value: show ? `${deg(red.D)} và ${deg(violet.D)}` : '? và ?', tone: 'b' }
          : { label: 'Góc lệch D', value: show && exits ? deg(tr.D) : '?', tone: 'b' },
        { label: 'Chiết suất', value: white ? '1,47 → 1,56' : '1,5', sub: white ? 'đỏ → tím (phóng đại)' : 'thủy tinh' },
      ]}
      mode={
        <Segmented name="light" legend="Dạng đề" options={LIGHT_OPTIONS} value={q.light} onChange={(l) => update({ light: l })} />
      }
      fields={
        <>
          <RangeField id="A" label="Góc chiết quang A" tone="t" min={30} max={75} step={5}
            value={q.A} display={`${q.A}°`} onChange={(v) => update({ A: v })} />
          <RangeField id="i1" label="Góc tới" tone="a" min={20} max={80} step={1}
            value={q.i1} display={`${q.i1}°`} onChange={(v) => update({ i1: v })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Lăng kính', text: 'khối trong suốt có hai mặt bên phẳng không song song' },
        { term: 'Tia ló', text: 'lệch về phía đáy lăng kính so với tia tới' },
        { term: 'Tán sắc ánh sáng', text: 'ánh sáng trắng qua lăng kính tách thành dải màu từ đỏ đến tím' },
      ]}
      playLabels={LIGHT_LABELS}
    />
  );
}
