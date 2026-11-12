'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { LIGHT_LABELS, Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { B, D, N } from '@/lib/tex';

const IGH = 'i_\\text{gh}';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { caption } from '@/lib/draw/geometry';
import { drawBoundary } from '@/lib/draw/optics';
import { deg, fmt } from '@/lib/format';
import { MEDIA, MEDIUM_OPTIONS, criticalAngle, refractionAngle, type MediumId } from '@/lib/media';
import { drawFiber } from './sketch';

type Mode = 'mat' | 'soi';

export interface Params {
  mode: Mode;
  medium: MediumId;
  i: number;
}

const MODE_OPTIONS = [
  { value: 'mat', label: 'Mặt phân cách' },
  { value: 'soi', label: 'Sợi quang' },
] as const;

export default function PhanXaToanPhanLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 4, resetOn: ex.params });

  const med = MEDIA[q.medium];
  const igh = criticalAngle(med.n);
  const sinIgh = 1 / med.n;
  const total = q.i >= igh;
  const { sinR, r } = refractionAngle(q.i, med.n, 1);
  const show = sim.revealed;
  const ratio = Math.min(1, q.i / igh) ** 4;

  const draw = (p: p5) => {
    if (q.mode === 'soi') {
      drawFiber(p, { n: med.n, fill: med.fill, name: med.name, i: q.i, igh, t: sim.t });
      return;
    }
    drawBoundary(p, {
      lowerName: med.name,
      lowerFill: med.fill,
      n: med.n,
      fromBelow: true,
      i: q.i,
      r,
      t: sim.t,
      reflAlpha: total ? 1 : 0.2 + 0.8 * ratio,
      refrAlpha: total ? 0 : 1 - 0.8 * ratio,
      critical: igh,
      showAngles: true,
    });
    if (sim.t <= 0) caption(p, 'Ánh sáng đi từ môi trường chiết quang hơn ra không khí');
    else if (total) caption(p, 'i ≥ i_gh: tia khúc xạ biến mất, ánh sáng phản xạ toàn phần');
    else caption(p, 'i < i_gh: vẫn có tia khúc xạ; tăng i thì tia khúc xạ mờ dần, tia phản xạ sáng dần');
  };

  const problem =
    q.mode === 'soi' ? (
      <p>
        Lõi một sợi quang làm bằng {med.name.toLowerCase()} có chiết suất <Num tone="b">n = {fmt(med.n)}</Num>, bên
        ngoài là không khí. Tia sáng trong lõi gặp mặt bên với góc tới <Num tone="a">i = {q.i}°</Num>. Tính góc tới
        hạn và cho biết ánh sáng có truyền được dọc sợi quang mà không lọt ra ngoài không?
      </p>
    ) : (
      <p>
        Chiếu tia sáng từ {med.name.toLowerCase()} (chiết suất <Num tone="b">n = {fmt(med.n)}</Num>) ra không khí với
        góc tới <Num tone="a">i = {q.i}°</Num>. Tính góc tới hạn. Có xảy ra hiện tượng phản xạ toàn phần không?
      </p>
    );

  const solution = (
    <>
      <Summary given={[`n_1 = ${N(med.n)};\\ n_2 = 1`, `i = ${q.i}^\\circ`]} find={[IGH]} />
      <Step>{`Ánh sáng đi từ môi trường chiết quang hơn ($n_1 = ${N(med.n)}$) sang môi trường kém hơn ($n_2 = 1$).`}</Step>
      <Step>Góc tới hạn:</Step>
      <Calc tex={`\\sin ${IGH} = n_2 \\chia n_1 = 1 \\chia ${N(med.n)} \\approx ${B(show, N(sinIgh, 4))}`} />
      <Calc tex={`\\Rightarrow ${IGH} \\approx ${B(show, D(igh))}`} />
      {total ? (
        <Step>
          {show
            ? `Vì $i = ${q.i}^\\circ \\ge ${IGH} \\approx ${D(igh)}$ nên xảy ra phản xạ toàn phần${q.mode === 'soi' ? ': ánh sáng truyền được dọc sợi quang.' : ', không có tia khúc xạ.'}`
            : <span className="blank">?</span>}
        </Step>
      ) : (
        <>
          <Step>
            {show
              ? `Vì $i = ${q.i}^\\circ < ${IGH} \\approx ${D(igh)}$ nên chưa xảy ra phản xạ toàn phần. Tia khúc xạ:`
              : <span className="blank">?</span>}
          </Step>
          <Calc
            tex={`\\sin r = n_1 \\times \\sin i =${N(med.n)} \\times \\sin ${q.i}^\\circ \\approx ${B(show, N(sinR, 4))} \\Rightarrow r \\approx ${B(show, r === null ? '-' : D(r))}`}
          />
        </>
      )}
      <Answer
        show={show}
        items={[
          `$${IGH} \\approx ${D(igh)}$`,
          total
            ? q.mode === 'soi' ? 'có phản xạ toàn phần, ánh sáng không lọt ra' : 'có phản xạ toàn phần'
            : q.mode === 'soi' ? 'không, ánh sáng lọt ra ngoài' : 'không có phản xạ toàn phần',
        ]}
      />
    </>
  );

  return (
    <LessonLayout
      exercises={ex}
      slug="phan-xa-toan-phan"
      sim={sim}
      problem={problem}
      draw={draw}
      canvasLabel={
        q.mode === 'soi'
          ? 'Tia sáng đi dọc lõi sợi quang, phản xạ toàn phần ở mặt bên nếu góc tới lớn hơn góc tới hạn.'
          : 'Tia sáng đi từ môi trường chiết quang hơn ra không khí, có đường nét đứt chỉ góc tới hạn.'
      }
      readout={[
        { label: 'Góc tới i', value: `${q.i}°`, tone: 'a' },
        { label: 'Góc tới hạn', value: show ? deg(igh) : '?', tone: 'time' },
        { label: 'Tia khúc xạ', value: total ? 'không có' : 'có', sub: total ? 'phản xạ toàn phần' : 'còn lọt ra', tone: 'b' },
        { label: 'Chiết suất', value: fmt(med.n), sub: med.name },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(m) => ex.edit({ mode: m })} />
          <Segmented name="medium" legend="Môi trường" options={MEDIUM_OPTIONS} value={q.medium} onChange={(m) => ex.edit({ medium: m })} />
        </>
      }
      fields={
        <RangeField id="i" label="Góc tới i" tone="a" min={5} max={89} step={1}
          value={q.i} display={`${q.i}°`} onChange={(v) => ex.edit({ i: v })} />
      }
      solution={solution}
      rules={[
        { term: 'Điều kiện phản xạ toàn phần', text: `ánh sáng đi từ môi trường chiết quang hơn sang kém hơn và $i \\ge ${IGH}$` },
        { term: 'Góc tới hạn', text: `$\\sin ${IGH} = n_2 \\chia n_1$ (ra không khí: $\\sin ${IGH} = 1 \\chia n$)` },
        { term: 'Ứng dụng', text: 'cáp quang truyền internet, ống nội soi trong y học, lăng kính phản xạ toàn phần' },
      ]}
      playLabels={LIGHT_LABELS}
    />
  );
}
