'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels, type PlayLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmtG } from '@/lib/format';
import { B, N, U as Un, u } from '@/lib/tex';
import { drawCoil, drawGenerator, magnetState } from './sketch';

type Mode = 'namcham' | 'xoaychieu';

export interface Params {
  mode: Mode;
  pole: 'N' | 'S';
  speed: number;
  turns: number;
  n: number; // vòng mỗi giây
  time: number; // giây
}

const MODE_OPTIONS = [
  { value: 'namcham', label: 'Nam châm và cuộn dây' },
  { value: 'xoaychieu', label: 'Máy phát xoay chiều' },
] as const;

const POLE_OPTIONS = [
  { value: 'N', label: 'Cực Bắc (N)' },
  { value: 'S', label: 'Cực Nam (S)' },
] as const;

const LABELS: Record<Mode, PlayLabels> = {
  namcham: playLabels('Di chuyển nam châm', 'Chạy tiếp', 'Làm lại thí nghiệm'),
  xoaychieu: playLabels('Quay máy phát', 'Quay tiếp', 'Quay lại'),
};

const blank = <span className="blank">?</span>;

export default function CamUngLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const coil = q.mode === 'namcham';
  const sim = useSimulation({ total: coil ? 3 : 2, defaultDuration: coil ? 7 : 6, resetOn: ex.params });

  const show = sim.revealed;
  const perSecond = 2 * q.n;
  const total = perSecond * q.time;

  const draw = (p: p5) =>
    coil
      ? drawCoil(p, { pole: q.pole, speed: q.speed, turns: q.turns, t: sim.t })
      : drawGenerator(p, { n: q.n, turnsDone: sim.t, done: sim.done });

  const st = magnetState({ pole: q.pole, speed: q.speed, turns: q.turns, t: sim.t });
  const strength = Math.min(1, (q.speed * q.turns) / 2500);
  const needle = st.moving === 0 ? 'chỉ số 0' : (st.moving > 0) === (q.pole === 'N') ? 'lệch sang phải' : 'lệch sang trái';
  const poleName = q.pole === 'N' ? 'cực Bắc' : 'cực Nam';

  const problem = coil ? (
    <p>
      Một cuộn dây dẫn kín có <Num tone="t">{q.turns} vòng</Num> nối với điện kế G. Đưa <Num tone="a">{poleName}</Num> của
      một nam châm thẳng vào trong lòng cuộn dây, giữ yên một lúc rồi kéo ra. Trong mỗi giai đoạn, có dòng điện cảm ứng
      trong cuộn dây không? Chiều của dòng điện cảm ứng thay đổi thế nào?
    </p>
  ) : (
    <p>
      Khung dây của một máy phát điện xoay chiều quay đều <Num tone="a">{q.n} vòng mỗi giây</Num>. Tính tần số của dòng
      điện do máy phát ra và số lần dòng điện đổi chiều trong <Num tone="t">{q.time} giây</Num>.
    </p>
  );

  const solution = coil ? (
    <>
      <Step>Dòng điện cảm ứng xuất hiện khi số đường sức từ xuyên qua tiết diện cuộn dây dẫn kín biến thiên.</Step>
      <Step>Khi đưa nam châm vào: số đường sức từ qua cuộn dây tăng</Step>
      <Calc tex={`\\Rightarrow ${B(show, '\\text{có dòng điện cảm ứng, kim điện kế lệch}')}`} />
      <Step>Khi giữ yên nam châm: số đường sức từ không đổi</Step>
      <Calc tex={`\\Rightarrow ${B(show, '\\text{không có dòng điện cảm ứng, kim chỉ số 0}')}`} />
      <Step>Khi kéo nam châm ra: số đường sức từ giảm</Step>
      <Calc tex={`\\Rightarrow ${B(show, '\\text{có dòng điện cảm ứng ngược chiều lúc đưa vào}')}`} />
      <Step>{show ? 'Di chuyển nam châm càng nhanh, cuộn dây càng nhiều vòng thì dòng điện cảm ứng càng mạnh.' : blank}</Step>
      <Answer
        show={show}
        items={['đưa vào và kéo ra: có dòng điện cảm ứng, hai lần ngược chiều nhau', 'giữ yên: không có dòng điện cảm ứng']}
      />
    </>
  ) : (
    <>
      <Summary given={[`n = ${q.n}${u('vòng/s')};\\ t = ${q.time}${u('s')}`]} find={['f', '\\text{số lần đổi chiều}']} />
      <Step>Mỗi vòng quay của khung dây, dòng điện đổi chiều 2 lần.</Step>
      <Step>Tần số của dòng điện bằng số vòng quay trong 1 giây:</Step>
      <Calc tex={`f = n = ${B(show, N(q.n))}${Un('Hz')}`} />
      <Step>Số lần dòng điện đổi chiều trong 1 giây:</Step>
      <Calc tex={`2 \\times ${q.n} = ${B(show, N(perSecond))}${Un('lần')}`} />
      <Step>{`Số lần dòng điện đổi chiều trong ${q.time} giây:`}</Step>
      <Calc tex={`${B(show, N(perSecond))} \\times ${q.time} = ${B(show, N(total))}${Un('lần')}`} />
      <Answer show={show} items={[`$f = ${N(q.n)}${u('Hz')}$`, `$${N(total)}${u('lần')}$`]} />
    </>
  );

  return (
    <LessonLayout
      exercises={ex}
      slug="cam-ung-dien-tu"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel={
        coil
          ? 'Nam châm thẳng được đưa vào, giữ yên rồi kéo ra khỏi cuộn dây nối với điện kế; kim điện kế lệch khi nam châm chuyển động.'
          : 'Khung dây quay giữa hai cực nam châm; đồ thị cường độ dòng điện theo thời gian có dạng hình sin, đổi chiều sau mỗi nửa vòng.'
      }
      readout={
        coil
          ? [
              { label: 'Nam châm', value: st.phase === 'in' ? (st.moving ? 'đang đưa vào' : 'ở ngoài') : st.phase === 'hold' ? 'giữ yên' : st.moving ? 'đang kéo ra' : 'đã ra ngoài', tone: 'time' },
              { label: 'Kim điện kế', value: sim.t > 0 ? needle : 'chỉ số 0', tone: 'a' },
              { label: 'Độ mạnh dòng cảm ứng', value: st.moving ? `${Math.round(strength * 100)}%` : '0%', tone: 'b' },
              { label: 'Số vòng dây', value: `${q.turns} vòng` },
            ]
          : [
              { label: 'Số vòng quay mỗi giây', value: `${q.n} vòng`, tone: 'time' },
              { label: 'Tần số', value: show ? `${q.n} Hz` : '? Hz', tone: 'a' },
              { label: 'Đổi chiều mỗi giây', value: show ? `${perSecond} lần` : '? lần', tone: 'b' },
              { label: `Đổi chiều trong ${q.time} s`, value: show ? `${fmtG(total, 0)} lần` : '? lần' },
            ]
      }
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(v) => ex.edit({ mode: v })} />
          {coil && <Segmented name="pole" legend="Cực đưa vào" options={POLE_OPTIONS} value={q.pole} onChange={(v) => ex.edit({ pole: v })} />}
        </>
      }
      fields={
        <>
          <RangeField id="speed" label="Tốc độ di chuyển nam châm" tone="a" min={1} max={5} step={1}
            value={q.speed} display={['', 'rất chậm', 'chậm', 'vừa', 'nhanh', 'rất nhanh'][q.speed]} onChange={(v) => ex.edit({ speed: v })} hidden={!coil} />
          <RangeField id="turns" label="Số vòng dây" tone="t" min={100} max={1000} step={100}
            value={q.turns} display={`${q.turns} vòng`} onChange={(v) => ex.edit({ turns: v })} hidden={!coil} />
          <RangeField id="n" label="Số vòng quay mỗi giây" tone="a" min={1} max={60} step={1}
            value={q.n} display={`${q.n} vòng`} onChange={(v) => ex.edit({ n: v })} hidden={coil} />
          <RangeField id="time" label="Thời gian" tone="t" min={1} max={60} step={1}
            value={q.time} display={`${q.time} giây`} onChange={(v) => ex.edit({ time: v })} hidden={coil} />
        </>
      }
      solution={solution}
      rules={[
        { key: 'namcham', term: 'Dòng điện cảm ứng', text: 'xuất hiện khi số đường sức từ xuyên qua tiết diện cuộn dây dẫn kín biến thiên' },
        { key: 'xoaychieu', term: 'Dòng điện xoay chiều', text: 'luân phiên đổi chiều; mỗi vòng quay của máy phát đổi chiều 2 lần' },
        { term: 'Tần số', text: '$f = n$ (số vòng quay trong 1 giây), đơn vị héc (Hz)' },
        { term: 'Lưới điện Việt Nam', text: '$220\\,\\text{V}$, tần số $50\\,\\text{Hz}$' },
      ]}
      activeRule={q.mode}
      playLabels={LABELS[q.mode]}
    />
  );
}
