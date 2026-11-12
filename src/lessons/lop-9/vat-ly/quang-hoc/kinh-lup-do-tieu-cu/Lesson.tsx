'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { LIGHT_LABELS, Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { B, N, U, eq as teq, u } from '@/lib/tex';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { computeImage } from '@/lib/draw/lens';
import { fmt, isExact } from '@/lib/format';
import { benchState, drawBench, drawMagnifier } from './sketch';

type Mode = 'kinhlup' | 'dotieucu';
type LensId = 'k1' | 'k2' | 'k3';

export interface Params {
  mode: Mode;
  f: number; // tiêu cự kính lúp
  d: number; // khoảng cách vật (kính lúp)
  lens: LensId;
  bd: number; // băng quang học: vật – thấu kính
  bdp: number; // thấu kính – màn
}

const MODE_OPTIONS = [
  { value: 'kinhlup', label: 'Kính lúp' },
  { value: 'dotieucu', label: 'Đo tiêu cự' },
] as const;

/** Tiêu cự thật của các thấu kính dùng khi thực hành (học sinh phải đo) */
const LENSES: Record<LensId, number> = { k1: 10, k2: 12, k3: 15 };
const LENS_OPTIONS = [
  { value: 'k1', label: 'Thấu kính 1' },
  { value: 'k2', label: 'Thấu kính 2' },
  { value: 'k3', label: 'Thấu kính 3' },
] as const;

/** Kính lúp: vật luôn nằm trong khoảng tiêu cự */
function fix(q: Params): Params {
  return q.d >= q.f ? { ...q, d: Math.max(0.5, q.f - 0.5) } : q;
}

export default function KinhLupLesson() {
  const ex = useExercises(EXERCISES, fix);
  const q = ex.params;
  const sim = useSimulation({ total: q.mode === 'kinhlup' ? 3 : 1, defaultDuration: 5, resetOn: ex.params });
  const show = sim.revealed;

  if (q.mode === 'kinhlup') {
    const G = 25 / q.f;
    const img = computeImage('hoitu', q.f, q.d, 1);
    const dp = img.dp ?? 0;
    const draw = (p: p5) => drawMagnifier(p, { f: q.f, d: q.d, t: sim.t, G });
    return (
      <LessonLayout
        exercises={ex}
        slug="kinh-lup-do-tieu-cu"
        sim={sim}
        problem={
          <p>
            Một kính lúp có tiêu cự <Num tone="t">f = {fmt(q.f)} cm</Num>. Vật nhỏ AB cao <Num tone="a">1 cm</Num> đặt
            vuông góc với trục chính, cách kính <Num tone="a">d = {fmt(q.d)} cm</Num>. Tính số bội giác của kính, nêu
            tính chất ảnh, khoảng cách từ ảnh đến kính và chiều cao của ảnh.
          </p>
        }
        draw={draw}
        canvasLabel="Vật nhỏ đặt trong khoảng tiêu cự của kính lúp cho ảnh ảo, cùng chiều, lớn hơn vật; mắt đặt sau kính."
        readout={[
          { label: 'Tiêu cự f', value: `${fmt(q.f)} cm`, tone: 'time' },
          { label: 'Khoảng cách vật d', value: `${fmt(q.d)} cm`, tone: 'a' },
          { label: 'Số bội giác G', value: show ? `${fmt(G)}x` : '?', tone: 'b' },
          { label: "Chiều cao ảnh h'", value: show ? `${fmt(img.hp)} cm` : '?' },
        ]}
        mode={<Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(m) => ex.edit({ mode: m })} />}
        fields={
          <>
            <RangeField id="f" label="Tiêu cự kính lúp" tone="t" min={2.5} max={12.5} step={2.5}
              value={q.f} display={`${fmt(q.f)} cm`} onChange={(v) => ex.edit({ f: v })} />
            <RangeField id="d" label="Khoảng cách vật" tone="a" min={0.5} max={12} step={0.5}
              value={q.d} display={`${fmt(q.d)} cm`} onChange={(v) => ex.edit({ d: v })} />
          </>
        }
        solution={
          <>
            <Summary
              given={[`OF' = f = ${N(q.f)}${u('cm')};\\ OA = d = ${N(q.d)}${u('cm')}`, `AB = 1${u('cm')}`]}
              find={['G', "OA'", "A'B'"]}
            />
            <Step>Số bội giác của kính lúp:</Step>
            <Calc tex={`G = 25 \\chia f = 25 \\chia ${N(q.f)} ${teq(isExact(G))} ${B(show, N(G))}\\,\\text{x}`} />
            <Step>
              {'Vật nằm trong khoảng tiêu cự ($d < f$) nên '}
              {show ? 'ảnh là ảnh ảo, cùng chiều, lớn hơn vật.' : <span className="blank">?</span>}
            </Step>
            <Step>Tương tự bài thấu kính hội tụ, với ảnh ảo:</Step>
            <Calc
              tex={`OA' = OA \\times OF' \\chia (OF' - OA) = ${N(q.d)} \\times ${N(q.f)} \\chia (${N(q.f)} - ${N(q.d)}) ${teq(isExact(dp))} ${B(show, N(dp))}${U('cm')}`}
            />
            <Calc
              tex={`A'B' = AB \\times OA' \\chia OA = 1 \\times ${B(show, N(dp))} \\chia ${N(q.d)} ${teq(isExact(img.hp))} ${B(show, N(img.hp))}${U('cm')}`}
            />
            <Answer
              show={show}
              items={[
                `$G ${teq(isExact(G))} ${N(G)}\\,\\text{x}$`,
                `$OA' ${teq(isExact(dp))} ${N(dp)}${u('cm')}$`,
                `$A'B' ${teq(isExact(img.hp))} ${N(img.hp)}${u('cm')}$`,
              ]}
            />
          </>
        }
        rules={[
          { term: 'Kính lúp', text: 'thấu kính hội tụ có tiêu cự ngắn, dùng quan sát vật nhỏ' },
          { term: 'Cách dùng', text: 'đặt vật trong khoảng tiêu cự để có ảnh ảo, cùng chiều, lớn hơn vật' },
          { term: 'Số bội giác', text: '$G = 25 \\chia f$ ($f$ tính bằng cm)' },
        ]}
        playLabels={LIGHT_LABELS}
      />
    );
  }

  // ---------------- Đo tiêu cự ----------------
  const fTrue = LENSES[q.lens];
  const { sharp, equal } = benchState(fTrue, q.bd, q.bdp);
  const fMeasured = (q.bd + q.bdp) / 4;
  const draw = (p: p5) => drawBench(p, { f: fTrue, d: q.bd, dp: q.bdp, t: sim.t });

  return (
    <LessonLayout
      exercises={ex}
      slug="kinh-lup-do-tieu-cu"
      sim={sim}
      problem={
        <p>
          Thực hành đo tiêu cự của <Num tone="t">thấu kính hội tụ số {q.lens.slice(1)}</Num>: đặt vật sáng, thấu kính và
          màn trên băng quang học. Dịch chuyển thấu kính và màn để thu được ảnh rõ nét, cao bằng vật trên màn, rồi tính
          tiêu cự.
        </p>
      }
      draw={draw}
      canvasLabel="Băng quang học với vật sáng, thấu kính hội tụ và màn chắn; ảnh trên màn rõ nét khi màn đặt đúng vị trí ảnh."
      readout={[
        { label: 'Vật – thấu kính d', value: `${q.bd} cm`, tone: 'a' },
        { label: "Thấu kính – màn d'", value: `${q.bdp} cm`, tone: 'b' },
        { label: 'Ảnh trên màn', value: sharp ? 'rõ nét' : 'mờ', tone: 'time' },
        { label: 'So với vật', value: sharp ? (equal ? 'bằng vật' : q.bdp > q.bd ? 'lớn hơn' : 'nhỏ hơn') : '–' },
      ]}
      mode={
        <>
          <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={q.mode} onChange={(m) => ex.edit({ mode: m })} />
          <Segmented name="lens" legend="Dụng cụ" options={LENS_OPTIONS} value={q.lens} onChange={(l) => ex.edit({ lens: l })} />
        </>
      }
      fields={
        <>
          <RangeField id="bd" label="Khoảng cách vật – thấu kính" tone="a" min={8} max={50} step={1}
            value={q.bd} display={`${q.bd} cm`} onChange={(v) => ex.edit({ bd: v })} />
          <RangeField id="bdp" label="Khoảng cách thấu kính – màn" tone="b" min={8} max={55} step={1}
            value={q.bdp} display={`${q.bdp} cm`} onChange={(v) => ex.edit({ bdp: v })} />
        </>
      }
      solution={
        <>
          <Step>
            <span className="u">Cách làm</span>
          </Step>
          <Step>{"Dịch thấu kính và màn tới khi ảnh trên màn rõ nét và cao bằng vật. Khi đó $d = d' = 2f$."}</Step>
          {equal ? (
            <>
              <Step>Kết quả đo:</Step>
              <Calc tex={`d = ${q.bd}${u('cm')};\\quad d' = ${q.bdp}${u('cm')}`} />
              <Step>Tiêu cự của thấu kính:</Step>
              <Calc tex={`f = (d + d') \\chia 4 = (${q.bd} + ${q.bdp}) \\chia 4 =${N(fMeasured)}${U('cm')}`} />
              <Answer show items={[`$f = ${N(fMeasured)}${u('cm')}$`]} />
            </>
          ) : (
            <>
              <Step>
                {`Chưa đạt: ${sharp ? 'ảnh đã rõ nét nhưng chưa cao bằng vật.' : 'ảnh trên màn còn mờ.'} Hãy dịch tiếp thấu kính hoặc màn.`}
              </Step>
              <Step>{"Gợi ý: giữ $d = d'$ rồi tăng dần cả hai cho tới khi ảnh rõ nét."}</Step>
              <Answer show={show} items={[`$f = ${fTrue}${u('cm')}$ (giá trị đúng của thấu kính số ${q.lens.slice(1)})`]} />
            </>
          )}
        </>
      }
      rules={[
        { term: 'Ảnh rõ nét, bằng vật', text: "khi $d = d' = 2f$" },
        { term: 'Tiêu cự', text: "$f = (d + d') \\chia 4$" },
        { term: 'Lưu ý', text: 'vật phải đặt ngoài khoảng tiêu cự ($d > f$) mới hứng được ảnh trên màn' },
      ]}
      playLabels={LIGHT_LABELS}
    />
  );
}
