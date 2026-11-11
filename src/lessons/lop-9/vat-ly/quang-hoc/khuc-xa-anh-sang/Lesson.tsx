'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { LIGHT_LABELS, Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { B, D, N } from '@/lib/tex';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { caption } from '@/lib/draw/geometry';
import { drawBoundary } from '@/lib/draw/optics';
import { deg, fmt } from '@/lib/format';
import { MEDIA, MEDIUM_OPTIONS, refractionAngle, type MediumId } from '@/lib/media';

type Dir = 'vao' | 'ra';

export interface Params {
  medium: MediumId;
  dir: Dir;
  i: number;
}

const DIR_OPTIONS = [
  { value: 'vao', label: 'Từ không khí vào' },
  { value: 'ra', label: 'Từ môi trường ra không khí' },
] as const;

export default function KhucXaLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 4 });
  const update = (patch: Partial<Params>) => {
    ex.edit(patch);
    sim.reset();
  };

  const med = MEDIA[q.medium];
  const fromBelow = q.dir === 'ra';
  const n1 = fromBelow ? med.n : 1;
  const n2 = fromBelow ? 1 : med.n;
  const { sinI, sinR, r } = refractionAngle(q.i, n1, n2);
  const show = sim.revealed;
  const nTxt = (n: number) => fmt(n);
  const n1Name = fromBelow ? med.name.toLowerCase() : 'không khí';
  const n2Name = fromBelow ? 'không khí' : med.name.toLowerCase();

  const draw = (p: p5) => {
    drawBoundary(p, {
      lowerName: med.name,
      lowerFill: med.fill,
      n: med.n,
      fromBelow,
      i: q.i,
      r,
      t: sim.t,
      reflAlpha: r === null ? 1 : 0.25,
      refrAlpha: 1,
      showAngles: true,
    });
    if (sim.t <= 0) caption(p, 'Tia sáng chiếu tới mặt phân cách tại điểm I');
    else if (sim.t < 1) caption(p, 'Tia tới truyền đến điểm I');
    else if (r === null) caption(p, 'Không có tia khúc xạ: toàn bộ ánh sáng bị phản xạ');
    else if (r < q.i - 0.05) caption(p, 'Tia khúc xạ lệch lại gần pháp tuyến: r < i');
    else if (r > q.i + 0.05) caption(p, 'Tia khúc xạ lệch xa pháp tuyến: r > i');
    else caption(p, 'Tia sáng vuông góc với mặt phân cách đi thẳng');
  };

  const problem = (
    <p>
      Chiếu một tia sáng từ <Num tone="t">{n1Name}</Num> vào <Num tone="t">{n2Name}</Num> với góc tới{' '}
      <Num tone="a">i = {q.i}°</Num>. Biết chiết suất của {med.name.toLowerCase()} là{' '}
      <Num tone="b">n = {nTxt(med.n)}</Num>, của không khí là 1. Tính góc khúc xạ r.
    </p>
  );

  const solution = (
    <>
      <Summary given={[`n_1 = ${N(n1)};\\ n_2 = ${N(n2)}`, `i = ${q.i}^\\circ`]} find={['r']} />
      <Step>Theo định luật khúc xạ ánh sáng:</Step>
      <Calc tex={'\\sin i \\chia \\sin r = n_2 \\chia n_1'} />
      <Calc
        tex={`\\Rightarrow \\sin r = n_1 \\times \\sin i \\chia n_2 = ${N(n1)} \\times ${N(sinI, 4)} \\chia ${N(n2)} \\approx ${B(show, N(sinR, 4))}`}
      />
      {r === null ? (
        <>
          <Step>
            {show
              ? 'Vì $\\sin r > 1$ nên không có góc $r$ nào thỏa mãn: không có tia khúc xạ, ánh sáng bị phản xạ toàn phần.'
              : <span className="blank">?</span>}
          </Step>
          <Answer show={show} items={['không có tia khúc xạ (phản xạ toàn phần)']} />
        </>
      ) : (
        <>
          <Calc tex={`\\Rightarrow r \\approx ${B(show, D(r))}`} />
          <Step>
            {!show
              ? <span className="blank">?</span>
              : q.i === 0
                ? 'Tia tới vuông góc với mặt phân cách thì truyền thẳng ($r = i = 0^\\circ$).'
                : n2 > n1
                  ? 'Vì $n_2 > n_1$ nên $r < i$: tia khúc xạ lệch lại gần pháp tuyến.'
                  : 'Vì $n_2 < n_1$ nên $r > i$: tia khúc xạ lệch xa pháp tuyến.'}
          </Step>
          <Answer show={show} items={[`$r \\approx ${D(r)}$`]} />
        </>
      )}
    </>
  );

  return (
    <LessonLayout
      exercises={ex}
      slug="khuc-xa-anh-sang"
      sim={sim}
      problem={problem}
      notice={r === null ? 'Với góc tới này không có tia khúc xạ. Xem thêm bài Phản xạ toàn phần.' : null}
      draw={draw}
      canvasLabel="Tia sáng đi qua mặt phân cách giữa không khí và một môi trường trong suốt, có pháp tuyến, góc tới i và góc khúc xạ r."
      readout={[
        { label: 'Góc tới i', value: `${q.i}°`, tone: 'a' },
        { label: 'Góc khúc xạ r', value: show ? (r === null ? 'không có' : deg(r)) : '?', tone: 'b' },
        { label: 'Chiết suất', value: `${nTxt(n1)} → ${nTxt(n2)}`, sub: `${n1Name} → ${n2Name}`, tone: 'time' },
        { label: 'sin i', value: fmt(sinI, 4) },
      ]}
      mode={
        <>
          <Segmented name="medium" legend="Môi trường" options={MEDIUM_OPTIONS} value={q.medium} onChange={(m) => update({ medium: m })} />
          <Segmented name="dir" legend="Chiều truyền" options={DIR_OPTIONS} value={q.dir} onChange={(d) => update({ dir: d })} />
        </>
      }
      fields={
        <RangeField id="i" label="Góc tới i" tone="a" min={0} max={89} step={1}
          value={q.i} display={`${q.i}°`} onChange={(v) => update({ i: v })} />
      }
      solution={solution}
      rules={[
        { term: 'Tia khúc xạ', text: 'nằm trong mặt phẳng tới, ở bên kia pháp tuyến so với tia tới' },
        { term: 'Định luật khúc xạ', text: '$\\sin i \\chia \\sin r = n_2 \\chia n_1$' },
        { term: 'Chiết suất', text: '$n = c \\chia v$ ($c$ là tốc độ ánh sáng trong chân không)' },
        { term: 'Vào môi trường chiết quang hơn', text: '$r < i$, tia lệch lại gần pháp tuyến' },
      ]}
      playLabels={LIGHT_LABELS}
    />
  );
}
