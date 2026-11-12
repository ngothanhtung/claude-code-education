'use client';

import type p5 from 'p5';
import LessonLayout from '@/components/LessonLayout';
import { Num, RangeField, Segmented, playLabels } from '@/components/Controls';
import { Answer, Calc, Step, Summary } from '@/components/Notebook';
import { useExercises } from '@/hooks/useExercises';
import { EXERCISES } from './exercises';
import { useSimulation } from '@/hooks/useSimulation';
import { fmt, fmtG, isExact } from '@/lib/format';
import { B, N, U, eq, u } from '@/lib/tex';
import { drawKinetic, type Shape } from './sketch';

const WD = 'W_\\text{đ}';

type ObjId = 'bong' | 'cau' | 'xemay' | 'oto';
/** Đại lượng cần tìm */
type Find = 'W' | 'v' | 'm';

type Range = readonly [min: number, max: number, step: number];

/** Mỗi vật có khoảng số liệu riêng; xe cho vận tốc theo km/h để luyện đổi đơn vị */
const OBJECTS: Record<ObjId, { label: string; name: string; shape: Shape; kmh: boolean; m: Range; v: Range; W: Range; def: [m: number, v: number, W: number] }> = {
  bong: { label: 'Quả bóng', name: 'quả bóng', shape: 'ball', kmh: false, m: [0.1, 2, 0.1], v: [1, 20, 1], W: [1, 100, 1], def: [0.5, 4, 4] },
  cau: { label: 'Quả cầu sắt', name: 'quả cầu sắt', shape: 'iron', kmh: false, m: [0.5, 10, 0.5], v: [1, 10, 1], W: [1, 200, 1], def: [2, 3, 9] },
  xemay: { label: 'Xe máy', name: 'xe máy (tính cả người lái)', shape: 'moto', kmh: true, m: [100, 250, 10], v: [18, 72, 18], W: [1000, 60000, 500], def: [150, 36, 7500] },
  oto: { label: 'Ô tô', name: 'ô tô', shape: 'car', kmh: true, m: [500, 2000, 100], v: [18, 90, 18], W: [10000, 600000, 10000], def: [1200, 36, 60000] },
};

const OBJ_OPTIONS = (Object.keys(OBJECTS) as ObjId[]).map((k) => ({ value: k, label: OBJECTS[k].label }));

const FIND_OPTIONS = [
  { value: 'W', label: 'Tính động năng' },
  { value: 'v', label: 'Tính vận tốc' },
  { value: 'm', label: 'Tính khối lượng' },
] as const;

export interface Params {
  obj: ObjId;
  find: Find;
  m: number; // kg
  v: number; // m/s, hoặc km/h nếu vật là xe
  W: number; // J (dùng khi tìm v hoặc m)
}

/** Đổi vật thì nạp số liệu mặc định của vật đó */
function withObject(q: Params, obj: ObjId): Params {
  const [m, v, W] = OBJECTS[obj].def;
  return { ...q, obj, m, v, W };
}

const LABELS = playLabels('Cho vật chuyển động', 'Chạy tiếp', 'Chạy lại');

export default function DongNangLesson() {
  const ex = useExercises(EXERCISES);
  const q = ex.params;
  const sim = useSimulation({ total: 2, defaultDuration: 4, resetOn: ex.params });

  const o = OBJECTS[q.obj];
  const show = sim.revealed;
  const vKmh = (ms: number) => ms * 3.6;

  // Số liệu đề cho và đáp án, luôn tính theo m/s
  const vGiven = o.kmh ? q.v / 3.6 : q.v;
  const m = q.find === 'm' ? (2 * q.W) / (vGiven * vGiven) : q.m;
  const v = q.find === 'v' ? Math.sqrt((2 * q.W) / q.m) : vGiven;
  const W = q.find === 'W' ? 0.5 * q.m * vGiven * vGiven : q.W;
  const v2 = (2 * q.W) / q.m;
  const e = (x: number) => eq(isExact(x));

  const hide = (unknown: boolean, text: string) => (unknown && !show ? '?' : text);
  const vText = o.kmh ? `${fmt(vKmh(v), 1)} km/h` : `${fmt(v)} m/s`;
  const draw = (p: p5) =>
    drawKinetic(p, {
      shape: o.shape,
      mText: hide(q.find === 'm', `${fmtG(m)} kg`),
      vText: hide(q.find === 'v', vText),
      WText: hide(q.find === 'W', `${fmtG(W)} J`),
      ratio: W / o.W[1],
      t: sim.t,
      started: sim.started,
      done: sim.done,
    });

  const name = o.name;
  const vGivenTex = o.kmh ? `v = ${N(q.v)}${u('km/h')}` : `v = ${N(q.v)}${u('m/s')}`;
  const convert = o.kmh && q.find !== 'v' && (
    <Step>{`Đổi: $${N(q.v)}${u('km/h')} = ${N(q.v)} \\chia 3{,}6${u('m/s')} = ${N(vGiven)}${u('m/s')}$`}</Step>
  );

  let problem;
  let solution;
  if (q.find === 'W') {
    problem = (
      <p>
        Một {name} có khối lượng <Num tone="a">{fmtG(q.m)} kg</Num> đang chuyển động với vận tốc{' '}
        <Num tone="t">{fmt(q.v)} {o.kmh ? 'km/h' : 'm/s'}</Num>. Tính động năng của {name}.
      </p>
    );
    solution = (
      <>
        <Summary given={[`m = ${N(q.m)}${u('kg')};\\ ${vGivenTex}`]} find={[WD]} />
        {convert}
        <Step>Động năng của {name}:</Step>
        <Calc tex={`${WD} = \\frac{1}{2} \\times m \\times v^2 = \\frac{1}{2} \\times ${N(q.m)} \\times ${N(vGiven)}^2 ${e(W)} ${B(show, N(W))}${U('J')}`} />
        <Answer show={show} items={[`$${WD} ${e(W)} ${N(W)}${u('J')}$`]} />
      </>
    );
  } else if (q.find === 'v') {
    problem = (
      <p>
        Một {name} có khối lượng <Num tone="a">{fmtG(q.m)} kg</Num> đang chuyển động với động năng{' '}
        <Num tone="b">{fmtG(q.W)} J</Num>. Tính vận tốc của {name}{o.kmh ? ' theo m/s và km/h' : ''}.
      </p>
    );
    const vk = vKmh(v);
    solution = (
      <>
        <Summary given={[`m = ${N(q.m)}${u('kg')};\\ ${WD} = ${N(q.W)}${u('J')}`]} find={['v']} />
        <Step>{`Từ $${WD} = \\frac{1}{2} \\times m \\times v^2$ suy ra:`}</Step>
        <Calc tex={`v^2 = 2 \\times ${WD} \\chia m = 2 \\times ${N(q.W)} \\chia ${N(q.m)} ${e(v2)} ${B(show, N(v2))}`} />
        <Calc tex={`v = \\sqrt{${B(show, N(v2))}} ${e(v)} ${B(show, N(v))}${U('m/s')}`} />
        {o.kmh && <Step>{`Đổi: $${show ? N(v) : '\\blank'}${u('m/s')} = ${show ? N(v) : '\\blank'} \\times 3{,}6${u('km/h')} ${e(vk)} ${B(show, N(vk))}${u('km/h')}$`}</Step>}
        <Answer show={show} items={[`$v ${e(v)} ${N(v)}${u('m/s')}${o.kmh ? ` ${e(vk)} ${N(vk)}${u('km/h')}` : ''}$`]} />
      </>
    );
  } else {
    problem = (
      <p>
        Một {name} đang chuyển động với vận tốc <Num tone="t">{fmt(q.v)} {o.kmh ? 'km/h' : 'm/s'}</Num> thì có động
        năng <Num tone="b">{fmtG(q.W)} J</Num>. Tính khối lượng của {name}.
      </p>
    );
    solution = (
      <>
        <Summary given={[`${vGivenTex};\\ ${WD} = ${N(q.W)}${u('J')}`]} find={['m']} />
        {convert}
        <Step>{`Từ $${WD} = \\frac{1}{2} \\times m \\times v^2$ suy ra:`}</Step>
        <Calc tex={`m = 2 \\times ${WD} \\chia v^2 = 2 \\times ${N(q.W)} \\chia ${N(vGiven)}^2 ${e(m)} ${B(show, N(m))}${U('kg')}`} />
        <Answer show={show} items={[`$m ${e(m)} ${N(m)}${u('kg')}$`]} />
      </>
    );
  }

  const [mMin, mMax, mStep] = o.m;
  const [vMin, vMax, vStep] = o.v;
  const [wMin, wMax, wStep] = o.W;
  const vUnit = o.kmh ? 'km/h' : 'm/s';

  return (
    <LessonLayout
      slug="dong-nang"
      sim={sim}
      exercises={ex}
      problem={problem}
      draw={draw}
      canvasLabel="Vật chuyển động lao vào khúc gỗ và đẩy khúc gỗ đi một đoạn; thanh dưới cho biết động năng của vật."
      readout={[
        { label: 'Khối lượng', value: hide(q.find === 'm', `${fmtG(m)} kg`), tone: 'a' },
        { label: 'Vận tốc', value: hide(q.find === 'v', `${fmt(v)} m/s`), tone: 'time', sub: o.kmh ? hide(q.find === 'v', `${fmt(vKmh(v), 1)} km/h`) : undefined },
        { label: 'Động năng', value: hide(q.find === 'W', `${fmtG(W)} J`), tone: 'b' },
      ]}
      mode={
        <>
          <Segmented name="find" legend="Dạng đề" options={FIND_OPTIONS} value={q.find} onChange={(v) => ex.edit({ find: v })} />
          <Segmented name="obj" legend="Vật" options={OBJ_OPTIONS} value={q.obj} onChange={(k) => ex.edit(withObject(q, k))} />
        </>
      }
      fields={
        <>
          <RangeField id="m" label="Khối lượng" tone="a" min={mMin} max={mMax} step={mStep}
            value={q.m} display={`${fmtG(q.m)} kg`} onChange={(x) => ex.edit({ m: x })} hidden={q.find === 'm'} />
          <RangeField id="v" label="Vận tốc" tone="t" min={vMin} max={vMax} step={vStep}
            value={q.v} display={`${fmt(q.v)} ${vUnit}`} onChange={(x) => ex.edit({ v: x })} hidden={q.find === 'v'} />
          <RangeField id="W" label="Động năng" tone="b" min={wMin} max={wMax} step={wStep}
            value={q.W} display={`${fmtG(q.W)} J`} onChange={(x) => ex.edit({ W: x })} hidden={q.find === 'W'} />
        </>
      }
      solution={solution}
      rules={[
        { term: 'Động năng', text: 'năng lượng vật có được do chuyển động; vật đứng yên thì $W_\\text{đ} = 0$' },
        { term: 'Công thức', text: `$${WD} = \\frac{1}{2} \\times m \\times v^2$ ($m$: kg, $v$: m/s, $${WD}$: J)` },
        { term: 'Phụ thuộc', text: 'vận tốc tăng 2 lần thì động năng tăng 4 lần; khối lượng tăng 2 lần thì động năng tăng 2 lần' },
        { term: 'Đổi vận tốc', text: '$1\\,\\text{m/s} = 3{,}6\\,\\text{km/h}$' },
      ]}
      playLabels={LABELS}
    />
  );
}
