'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented } from '@/components/Controls';
import { Answer, Calc, ConvLine, MinutesLine, Step } from '@/components/Notebook';
import { B, N, U, ap, eq, u } from '@/lib/tex';
import { useParams } from '@/hooks/useExercises';
import { useSimulation } from '@/hooks/useSimulation';
import { durationAns, fmt, hm, isExact, niceLength, round2 } from '@/lib/format';
import { drawCung } from './sketch';

type Mode = 'late' | 'gap';

interface Params {
  mode: Mode;
  v1: number; // xe máy (đi trước)
  t0: number; // dạng 1: xe máy đi trước bao nhiêu giờ
  g: number; // dạng 2: quãng đường AB
  v2: number; // ô tô (đuổi theo)
}

const MODE_OPTIONS = [
  { value: 'late', label: 'Xe sau xuất phát muộn' },
  { value: 'gap', label: 'Cùng lúc, cách nhau' },
] as const;

export default function CungChieuLesson() {
  const { params, edit } = useParams<Params>({ mode: 'late', v1: 40, t0: 3, g: 48, v2: 60 });
  const { mode, v1, t0, g, v2 } = params;

  const delay = mode === 'late' ? t0 : 0; // ô tô chờ bao lâu
  const offset = mode === 'gap' ? g : 0; // xe máy xuất phát cách A
  const valid = v2 > v1;
  const headStart = offset + v1 * delay; // khoảng cách lúc ô tô bắt đầu đuổi
  const dv = v2 - v1;
  const catchTime = headStart / dv;
  const meetHour = delay + catchTime;
  const meetDist = v2 * catchTime;
  const L = niceLength(valid ? meetDist * 1.15 : Math.max(headStart, 10) * 3);

  const sim = useSimulation({ total: meetHour, enabled: valid, resetOn: params });

  const t = sim.t;
  const show = sim.revealed;
  const carT = Math.max(t - delay, 0);
  const sMoto = offset + v1 * t;
  const sCar = v2 * carT;

  const draw = (p: p5) =>
    drawCung(p, {
      mode, v1, v2, t0, g, L, valid, delay, offset, headStart, catchTime, meetDist,
      t, met: sim.done, metAt: sim.doneAt,
    });

  const V1 = <Num tone="b">{v1} km/giờ</Num>;
  const V2 = <Num tone="a">{v2} km/giờ</Num>;
  const problem =
    mode === 'gap' ? (
      <>
        <p>
          Quãng đường AB dài <Num tone="t">{g} km</Num>. Cùng một lúc, một ô tô đi từ A với vận tốc {V2} và một xe
          máy đi từ B với vận tốc {V1}. Hai xe đi cùng chiều, ô tô đuổi theo xe máy. Hỏi:
        </p>
        <ol>
          <li>Sau bao lâu ô tô đuổi kịp xe máy?</li>
          <li>Chỗ đuổi kịp cách A bao nhiêu ki-lô-mét?</li>
        </ol>
      </>
    ) : (
      <>
        <p>
          Một xe máy đi từ A với vận tốc {V1}. Sau <Num tone="t">{hm(t0)}</Num>, một ô tô cũng đi từ A đuổi theo
          xe máy với vận tốc {V2}. Hỏi:
        </p>
        <ol>
          <li>Ô tô đuổi kịp xe máy sau bao lâu?</li>
          <li>Lúc hai xe gặp nhau, chỗ gặp cách A bao nhiêu ki-lô-mét?</li>
        </ol>
      </>
    );

  let solution;
  if (!valid) {
    solution = (
      <>
        <Step>Ô tô đi chậm hơn hoặc bằng xe máy,</Step>
        <Step>nên khoảng cách giữa hai xe không giảm.</Step>
        <Step>Ô tô không đuổi kịp xe máy.</Step>
      </>
    );
  } else {
    // Làm tròn thời gian đến 2 chữ số rồi dùng chính số đó để tính tiếp, như học sinh làm trong vở
    const Tr = round2(catchTime);
    const D = round2(v2 * Tr);
    const eqT = show ? eq(isExact(catchTime)) : '=';
    const apx = ap(isExact(catchTime));
    solution = (
      <>
        {mode === 'late' && (
          <>
            <ConvLine hours={t0} />
            <Step>Quãng đường xe máy đi trước là:</Step>
            <Calc tex={`${v1} \\times ${N(t0)} = ${B(show, N(headStart))}${U('km')}`} />
          </>
        )}
        <Step>Hiệu vận tốc của hai xe là:</Step>
        <Calc tex={`${v2} - ${v1} = ${B(show, N(dv))}${U('km/giờ')}`} />
        <Step>Thời gian ô tô đuổi kịp xe máy là:</Step>
        <Calc
          tex={`${B(show || mode === 'gap', N(headStart))} \\chia ${B(show, N(dv))} ${eqT} ${B(show, N(catchTime))}${U('giờ')}`}
        />
        <MinutesLine hours={catchTime} show={show} />
        <Step>Chỗ {mode === 'gap' ? 'đuổi kịp' : 'gặp nhau'} cách A là:</Step>
        <Calc tex={`${v2} \\times ${B(show, N(Tr))} = ${B(show, N(D))}${U('km')}`} />
        <Answer show={show} items={[durationAns(catchTime), `$${apx}${N(D)}${u('km')}$`]} />
      </>
    );
  }

  return (
    <LessonLayout
      slug="hai-xe-chuyen-dong-cung-chieu"
      sim={sim}
      problem={problem}
      notice={
        valid
          ? null
          : `Vận tốc ô tô (${v2} km/giờ) không lớn hơn vận tốc xe máy (${v1} km/giờ) nên ô tô không bao giờ đuổi kịp. Hãy tăng vận tốc ô tô hoặc giảm vận tốc xe máy.`
      }
      draw={draw}
      canvasLabel="Hình mô phỏng: xe máy đi trước, ô tô đuổi theo cùng chiều. Bên dưới là sơ đồ đoạn thẳng."
      readout={[
        {
          label: 'Ô tô đã đi',
          value: (sim.done && !isExact(carT * 60, 0) ? '≈ ' : '') + hm(carT),
          sub: delay > 0 ? `xe máy: ${hm(t)}` : 'hai xe cùng xuất phát',
          tone: 'time',
        },
        { label: 'Xe máy cách A', value: `${fmt(sMoto, 1)} km`, tone: 'b' },
        { label: 'Ô tô cách A', value: `${fmt(sCar, 1)} km`, tone: 'a' },
        { label: 'Hai xe cách nhau', value: `${fmt(Math.max(sMoto - sCar, 0), 1)} km` },
      ]}
      mode={
        <Segmented name="mode" legend="Dạng đề" options={MODE_OPTIONS} value={mode} onChange={(m) => edit({ mode: m })} />
      }
      fields={
        <>
          <RangeField id="sV1" label="Vận tốc xe máy" tone="b" min={20} max={60} step={5}
            value={v1} display={`${v1} km/giờ`} onChange={(v) => edit({ v1: v })} />
          <RangeField id="sT0" label="Xe máy đi trước" tone="t" min={0.5} max={5} step={0.5}
            value={t0} display={hm(t0)} onChange={(v) => edit({ t0: v })} hidden={mode !== 'late'} />
          <RangeField id="sG" label="Quãng đường AB" tone="t" min={10} max={150} step={2}
            value={g} display={`${g} km`} onChange={(v) => edit({ g: v })} hidden={mode !== 'gap'} />
          <RangeField id="sV2" label="Vận tốc ô tô" tone="a" min={30} max={120} step={5}
            value={v2} display={`${v2} km/giờ`} onChange={(v) => edit({ v2: v })} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Hiệu vận tốc', text: 'vận tốc xe đi sau − vận tốc xe đi trước, $v = v_2 - v_1$' },
        { term: 'Thời gian đuổi kịp', text: 'khoảng cách lúc xe sau bắt đầu đuổi : hiệu vận tốc, $t = s \\chia (v_2 - v_1)$' },
        { term: 'Chỗ gặp nhau cách A', text: 'vận tốc xe đi sau × thời gian đuổi kịp' },
      ]}
    />
  );
}
