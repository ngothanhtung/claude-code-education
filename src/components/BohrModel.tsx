import { shells } from '@/lib/elements';

/**
 * Mô hình nguyên tử Rutherford – Bohr như SGK KHTN: hạt nhân mang điện tích +Z ở tâm,
 * electron xếp trên các lớp vòng tròn đồng tâm (2, 8, 8, 2 với Z ≤ 20). Electron quay chậm trên lớp
 * (tắt khi hệ điều hành bật giảm chuyển động). Z > 20: chỉ vẽ số lớp electron (bằng số thứ tự chu kì).
 */
export default function BohrModel({ z, period, symbol }: { z: number; period: number; symbol: string }) {
  const sh = shells(z);
  const layers = sh ? sh.length : period;
  /** bán kính lớp thứ i: từ 25 (lớp trong) tới 66 (lớp ngoài) */
  const radius = (i: number) => (layers === 1 ? 34 : 25 + (i * (66 - 25)) / (layers - 1));
  return (
    <svg className="bohr" viewBox="0 0 140 140" role="img" aria-label={sh ? `Mô hình nguyên tử ${symbol}: hạt nhân +${z}, các lớp electron ${sh.join(', ')}` : `Nguyên tử ${symbol} có ${period} lớp electron`}>
      {Array.from({ length: layers }, (_, i) => (
        <circle key={`r${i}`} cx="70" cy="70" r={radius(i)} className={sh ? 'ring' : 'ring faint'} />
      ))}
      {sh?.map((count, i) => (
        <g key={`e${i}`} className="shell" style={{ animationDuration: `${14 + i * 8}s` }}>
          {Array.from({ length: count }, (_, j) => {
            const a = (j / count) * Math.PI * 2 - Math.PI / 2 + i * 0.4;
            return <circle key={j} cx={70 + radius(i) * Math.cos(a)} cy={70 + radius(i) * Math.sin(a)} r="3.4" className="electron" />;
          })}
        </g>
      ))}
      <circle cx="70" cy="70" r="15" className="nucleus" />
      <text x="70" y="70" className="charge">+{z}</text>
    </svg>
  );
}
