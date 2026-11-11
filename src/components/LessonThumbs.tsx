import type { ReactElement } from 'react';
import type { LessonSlug } from '@/lib/lessons';

/** Hình thu nhỏ (sơ đồ đặc trưng của từng dạng bài) cho trang mục lục */
export const LESSON_THUMBS: Record<LessonSlug, ReactElement> = {
  'van-toc-quang-duong-thoi-gian': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Sơ đồ quãng đường AB chia thành từng giờ bằng nhau">
        <rect x="28" y="56" width="61" height="8" fill="#E0443F" />
        <rect x="89" y="56" width="61" height="8" fill="#F08A86" />
        <rect x="150" y="56" width="62" height="8" fill="#E0443F" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="10" fontWeight="700" fill="#C2302B" textAnchor="middle">
          <text x="58" y="48">45 km</text>
          <text x="120" y="48">45 km</text>
          <text x="181" y="48">45 km</text>
        </g>
        <line x1="28" y1="80" x2="212" y2="80" stroke="#1D2540" strokeWidth="2" />
        <line x1="28" y1="72" x2="28" y2="88" stroke="#1D2540" strokeWidth="2" />
        <line x1="212" y1="72" x2="212" y2="88" stroke="#1D2540" strokeWidth="2" />
        <line x1="89" y1="75" x2="89" y2="85" stroke="#5A6482" strokeWidth="1.5" />
        <line x1="150" y1="75" x2="150" y2="85" stroke="#5A6482" strokeWidth="1.5" />
        <g fontFamily="Be Vietnam Pro, sans-serif" textAnchor="middle">
          <text x="28" y="106" fontSize="13" fontWeight="700" fill="#1D2540">A</text>
          <text x="89" y="102" fontSize="10" fill="#5A6482">1 giờ</text>
          <text x="150" y="102" fontSize="10" fill="#5A6482">2 giờ</text>
          <text x="212" y="106" fontSize="13" fontWeight="700" fill="#1D2540">B</text>
        </g>
        <path d="M40 28 h28 m-6 -5 l6 5 l-6 5" stroke="#C2302B" strokeWidth="2.4" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  ),

  'gio-den-noi': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Đồng hồ và trục thời gian gồm đi, nghỉ, đi">
        <circle cx="50" cy="54" r="30" fill="#fff" stroke="#3B2A8C" strokeWidth="3" />
        <line x1="50" y1="54" x2="50" y2="32" stroke="#3B2A8C" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="50" y1="54" x2="36" y2="62" stroke="#1D2540" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="50" cy="54" r="3.5" fill="#E0443F" />
        <rect x="96" y="50" width="52" height="10" fill="#E0443F" />
        <rect x="148" y="50" width="16" height="10" fill="#E8A23A" />
        <rect x="164" y="50" width="52" height="10" fill="#E0443F" />
        <line x1="96" y1="44" x2="96" y2="66" stroke="#1D2540" strokeWidth="2" />
        <line x1="216" y1="44" x2="216" y2="66" stroke="#1D2540" strokeWidth="2" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="10" fontWeight="700">
          <text x="156" y="40" textAnchor="middle" fill="#8A4B00">nghỉ</text>
          <text x="96" y="84" fill="#1D2540">7 giờ 30</text>
          <text x="216" y="84" textAnchor="end" fill="#3B2A8C">? giờ</text>
        </g>
      </svg>
  ),

  'hai-xe-chuyen-dong-nguoc-chieu': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Sơ đồ hai xe đi ngược chiều gặp nhau tại C">
        <line x1="28" y1="78" x2="212" y2="78" stroke="#1D2540" strokeWidth="2" />
        <line x1="28" y1="70" x2="28" y2="86" stroke="#1D2540" strokeWidth="2" />
        <line x1="212" y1="70" x2="212" y2="86" stroke="#1D2540" strokeWidth="2" />
        <rect x="28" y="56" width="74" height="7" rx="3.5" fill="#E0443F" />
        <rect x="102" y="56" width="110" height="7" rx="3.5" fill="#0C9A88" />
        <path d="M40 38 h28 m-6 -5 l6 5 l-6 5" stroke="#C2302B" strokeWidth="2.4" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M200 38 h-28 m6 -5 l-6 5 l6 5" stroke="#08776A" strokeWidth="2.4" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        <line x1="102" y1="26" x2="102" y2="78" stroke="#3B2A8C" strokeWidth="1.6" strokeDasharray="4 4" />
        <circle cx="102" cy="78" r="4.5" fill="#3B2A8C" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="13" fontWeight="700" textAnchor="middle">
          <text x="28" y="104" fill="#1D2540">A</text>
          <text x="102" y="104" fill="#3B2A8C">C</text>
          <text x="212" y="104" fill="#1D2540">B</text>
        </g>
      </svg>
  ),

  'hai-xe-chuyen-dong-cung-chieu': (
      <svg className="thumb" viewBox="0 0 240 120" role="img"
        aria-label="Sơ đồ hai xe đi cùng chiều, ô tô đuổi kịp xe máy tại C">
        <line x1="28" y1="88" x2="212" y2="88" stroke="#1D2540" strokeWidth="2" />
        <line x1="28" y1="80" x2="28" y2="96" stroke="#1D2540" strokeWidth="2" />
        <line x1="82" y1="80" x2="82" y2="96" stroke="#08776A" strokeWidth="2" />
        <rect x="28" y="44" width="148" height="7" rx="3.5" fill="#0C9A88" />
        <rect x="28" y="64" width="148" height="7" rx="3.5" fill="#E0443F" />
        <path d="M184 47.5 h14 m-5 -4.5 l5 4.5 l-5 4.5" stroke="#08776A" strokeWidth="2.2" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M184 67.5 h14 m-5 -4.5 l5 4.5 l-5 4.5" stroke="#C2302B" strokeWidth="2.2" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        <line x1="176" y1="38" x2="176" y2="88" stroke="#3B2A8C" strokeWidth="1.6" strokeDasharray="4 4" />
        <circle cx="176" cy="88" r="4.5" fill="#3B2A8C" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="13" fontWeight="700" textAnchor="middle">
          <text x="28" y="113" fill="#1D2540">A</text>
          <text x="82" y="113" fill="#08776A">B</text>
          <text x="176" y="113" fill="#3B2A8C">C</text>
        </g>
        <text x="28" y="30" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="600"
          fill="#5A6482">xe máy đi trước, ô tô đuổi theo</text>
      </svg>
  ),
  'doi-don-vi-do': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Bảng đơn vị đo diện tích, dấu phẩy dời sang phải một cột">
        <path d="M95 26 Q125 6 155 26" stroke="#C2302B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M149 20 L155 26 L147 28" stroke="#C2302B" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="125" y="12" fontFamily="Be Vietnam Pro, sans-serif" fontSize="10" fontWeight="700" fill="#C2302B" textAnchor="middle">×100</text>
        <rect x="35" y="32" width="60" height="22" fill="#FBE1E0" stroke="#B9C4DA" strokeWidth="1.2" />
        <rect x="95" y="32" width="60" height="22" fill="#D6F1ED" stroke="#B9C4DA" strokeWidth="1.2" />
        <rect x="155" y="32" width="60" height="22" fill="#F4F6FB" stroke="#B9C4DA" strokeWidth="1.2" />
        <rect x="35" y="54" width="180" height="40" fill="#fff" stroke="#B9C4DA" strokeWidth="1.2" />
        <line x1="65" y1="54" x2="65" y2="94" stroke="#E1E7F2" />
        <line x1="95" y1="54" x2="95" y2="94" stroke="#B9C4DA" strokeWidth="1.2" />
        <line x1="125" y1="54" x2="125" y2="94" stroke="#E1E7F2" />
        <line x1="155" y1="54" x2="155" y2="94" stroke="#B9C4DA" strokeWidth="1.2" />
        <line x1="185" y1="54" x2="185" y2="94" stroke="#E1E7F2" />
        <rect x="128" y="57" width="24" height="34" rx="4" fill="#D6F1ED" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontWeight="700" textAnchor="middle">
          <text x="65" y="47" fontSize="12" fill="#C2302B">m²</text>
          <text x="125" y="47" fontSize="12" fill="#08776A">dm²</text>
          <text x="185" y="47" fontSize="12" fill="#1D2540">cm²</text>
          <text x="80" y="82" fontSize="20" fill="#1D2540">3</text>
          <text x="110" y="82" fontSize="20" fill="#1D2540">5</text>
          <text x="140" y="82" fontSize="20" fill="#08776A">0</text>
        </g>
        <circle cx="155" cy="86" r="4" fill="#E0443F" />
        <line x1="155.5" y1="88" x2="152" y2="95" stroke="#E0443F" strokeWidth="2.5" strokeLinecap="round" />
        <text x="125" y="113" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#1D2540" textAnchor="middle">3,5 m² = 350 dm²</text>
      </svg>
  ),
  'dien-tich-tam-giac-hinh-thang': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Tam giác và hai mảnh xoay ra ghép thành hình chữ nhật">
        <rect x="40" y="22" width="160" height="72" fill="none" stroke="#9AA6BE" strokeWidth="1.5" strokeDasharray="5 5" />
        <polygon points="40,94 200,94 101,22" fill="#F9D3D1" stroke="#C2302B" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="101,22 40,94 40,22" fill="#CDEFEA" stroke="#08776A" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="101,22 200,94 200,22" fill="#CDEFEA" stroke="#08776A" strokeWidth="2" strokeLinejoin="round" opacity="0.55" />
        <line x1="101" y1="22" x2="101" y2="94" stroke="#3B2A8C" strokeWidth="1.8" strokeDasharray="4 3" />
        <text x="120" y="112" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#1D2540" textAnchor="middle">đáy × chiều cao : 2</text>
      </svg>
  ),
  'hinh-tron': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Hình tròn cắt thành hình quạt xếp lại thành gần hình chữ nhật">
        <g strokeWidth="1.2" strokeLinejoin="round">
          <path d="M60 60 L96 60 A36 36 0 0 1 85.46 85.46 Z" fill="#F9D3D1" stroke="#C2302B" />
          <path d="M60 60 L85.46 85.46 A36 36 0 0 1 60 96 Z" fill="#F9D3D1" stroke="#C2302B" />
          <path d="M60 60 L60 96 A36 36 0 0 1 34.54 85.46 Z" fill="#F9D3D1" stroke="#C2302B" />
          <path d="M60 60 L34.54 85.46 A36 36 0 0 1 24 60 Z" fill="#F9D3D1" stroke="#C2302B" />
          <path d="M60 60 L24 60 A36 36 0 0 1 34.54 34.54 Z" fill="#CDEFEA" stroke="#08776A" />
          <path d="M60 60 L34.54 34.54 A36 36 0 0 1 60 24 Z" fill="#CDEFEA" stroke="#08776A" />
          <path d="M60 60 L60 24 A36 36 0 0 1 85.46 34.54 Z" fill="#CDEFEA" stroke="#08776A" />
          <path d="M60 60 L85.46 34.54 A36 36 0 0 1 96 60 Z" fill="#CDEFEA" stroke="#08776A" />
          <polygon points="132.5,42 120,78 145,78" fill="#F9D3D1" stroke="#C2302B" />
          <polygon points="157.5,42 145,78 170,78" fill="#F9D3D1" stroke="#C2302B" />
          <polygon points="182.5,42 170,78 195,78" fill="#F9D3D1" stroke="#C2302B" />
          <polygon points="207.5,42 195,78 220,78" fill="#F9D3D1" stroke="#C2302B" />
          <polygon points="145,78 132.5,42 157.5,42" fill="#CDEFEA" stroke="#08776A" />
          <polygon points="170,78 157.5,42 182.5,42" fill="#CDEFEA" stroke="#08776A" />
          <polygon points="195,78 182.5,42 207.5,42" fill="#CDEFEA" stroke="#08776A" />
        </g>
        <path d="M100 60 h12 m-5 -4 l5 4 l-5 4" stroke="#3B2A8C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="170" y="100" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#1D2540" textAnchor="middle">r × r × 3,14</text>
      </svg>
  ),
  'the-tich-hinh-hop': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Hình hộp chữ nhật xếp đầy các hình lập phương 1 xăng-ti-mét khối">
        <g stroke="#08776A" strokeWidth="1.2" strokeLinejoin="round">
          <polygon points="70,50 146,50 162.5,40.5 86.5,40.5" fill="#CDEFEA" />
          <polygon points="146,50 162.5,40.5 162.5,97.5 146,107" fill="#7CC4B8" />
          <rect x="70" y="50" width="76" height="57" fill="#9FD9CF" />
          <line x1="89" y1="50" x2="89" y2="107" />
          <line x1="108" y1="50" x2="108" y2="107" />
          <line x1="127" y1="50" x2="127" y2="107" />
          <line x1="70" y1="69" x2="146" y2="69" />
          <line x1="70" y1="88" x2="146" y2="88" />
          <line x1="89" y1="50" x2="105.5" y2="40.5" />
          <line x1="108" y1="50" x2="124.5" y2="40.5" />
          <line x1="127" y1="50" x2="143.5" y2="40.5" />
          <line x1="78.25" y1="45.25" x2="154.25" y2="45.25" />
          <line x1="146" y1="69" x2="162.5" y2="59.5" />
          <line x1="146" y1="88" x2="162.5" y2="78.5" />
          <line x1="154.25" y1="45.25" x2="154.25" y2="102.25" />
        </g>
        <polygon points="70,50 146,50 162.5,40.5 162.5,97.5 146,107 70,107" fill="none" stroke="#3B2A8C" strokeWidth="2" strokeLinejoin="round" />
        <text x="200" y="78" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#1D2540" textAnchor="middle">a × b × c</text>
      </svg>
  ),
  'dong-nang': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Quả bóng lăn tới đẩy khúc gỗ">
        <line x1="10" y1="96" x2="230" y2="96" stroke="#8C7A60" strokeWidth="2" />
        <circle cx="60" cy="80" r="16" fill="#E0443F" />
        <path d="M84 60 h34 m-8 -6 l8 6 l-8 6" stroke="#C2302B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="150" y="66" width="44" height="30" rx="3" fill="#C99A62" />
        <path d="M150 108 h56 m-6 -5 l6 5 l-6 5" stroke="#3B2A8C" strokeWidth="2" fill="none" />
        <text x="100" y="32" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#C2302B" textAnchor="middle">Wđ = ½ × m × v²</text>
      </svg>
  ),
  'the-nang': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Ròng rọc nâng thùng hàng lên cao">
        <line x1="20" y1="104" x2="140" y2="104" stroke="#8C7A60" strokeWidth="2" />
        <line x1="50" y1="14" x2="110" y2="14" stroke="#1D2540" strokeWidth="3" />
        <circle cx="80" cy="22" r="7" fill="none" stroke="#1D2540" strokeWidth="2" />
        <line x1="80" y1="29" x2="80" y2="40" stroke="#1D2540" strokeWidth="1.2" />
        <rect x="66" y="40" width="28" height="24" rx="2" fill="#B98B52" />
        <path d="M34 104 V52" stroke="#3B2A8C" strokeWidth="2" />
        <text x="26" y="82" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="end">h</text>
        <rect x="170" y="40" width="34" height="64" rx="3" fill="#0C9A88" />
        <text x="187" y="30" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#08776A" textAnchor="middle">Wt = P × h</text>
      </svg>
  ),
  'co-nang': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Vật rơi và ba cột năng lượng thế năng, động năng, cơ năng">
        <line x1="20" y1="104" x2="110" y2="104" stroke="#8C7A60" strokeWidth="2" />
        <line x1="40" y1="104" x2="40" y2="18" stroke="#1D2540" strokeWidth="1.5" />
        <circle cx="70" cy="30" r="9" fill="#E0443F" opacity="0.35" />
        <circle cx="70" cy="66" r="9" fill="#E0443F" />
        <path d="M70 78 v16 m-5 -6 l5 6 l5 -6" stroke="#C2302B" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="130" y="62" width="24" height="42" rx="3" fill="#0C9A88" />
        <rect x="164" y="46" width="24" height="58" rx="3" fill="#E0443F" />
        <rect x="198" y="20" width="24" height="84" rx="3" fill="#3B2A8C" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">
          <text x="142" y="116" fill="#08776A">Wt</text>
          <text x="176" y="116" fill="#C2302B">Wđ</text>
          <text x="210" y="116" fill="#3B2A8C">W</text>
        </g>
      </svg>
  ),
  'cong-co-hoc': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Lực F kéo thùng hàng dịch chuyển quãng đường s">
        <line x1="10" y1="80" x2="230" y2="80" stroke="#8C7A60" strokeWidth="2" />
        <rect x="30" y="50" width="40" height="30" rx="3" fill="#B98B52" opacity="0.35" />
        <rect x="130" y="50" width="40" height="30" rx="3" fill="#B98B52" />
        <path d="M170 65 h40 m-8 -6 l8 6 l-8 6" stroke="#C2302B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M30 98 h100" stroke="#3B2A8C" strokeWidth="2" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" textAnchor="middle">
          <text x="200" y="50" fill="#C2302B">F</text>
          <text x="80" y="114" fill="#3B2A8C">s</text>
          <text x="120" y="28" fill="#3B2A8C">A = F × s</text>
        </g>
      </svg>
  ),
  'cong-suat': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Hai cần cẩu nâng hàng">
        <line x1="0" y1="104" x2="240" y2="104" stroke="#C9B79C" strokeWidth="4" />
        <g strokeLinecap="round">
          <line x1="40" y1="104" x2="40" y2="20" stroke="#C2302B" strokeWidth="4" />
          <line x1="28" y1="20" x2="100" y2="20" stroke="#C2302B" strokeWidth="3" />
          <line x1="90" y1="20" x2="90" y2="50" stroke="#1D2540" strokeWidth="1.2" />
          <line x1="150" y1="104" x2="150" y2="20" stroke="#08776A" strokeWidth="4" />
          <line x1="138" y1="20" x2="210" y2="20" stroke="#08776A" strokeWidth="3" />
          <line x1="200" y1="20" x2="200" y2="70" stroke="#1D2540" strokeWidth="1.2" />
        </g>
        <rect x="78" y="50" width="24" height="22" rx="2" fill="#E0443F" />
        <rect x="189" y="70" width="22" height="20" rx="2" fill="#0C9A88" />
        <text x="125" y="96" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">𝒫 = A : t</text>
      </svg>
  ),
  'nha-may-thuy-dien': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Đập thủy điện, nước chảy qua tuabin">
        <rect x="14" y="30" width="70" height="74" fill="#9CCBEF" />
        <polygon points="84,22 96,22 116,104 84,104" fill="#A7AFBF" />
        <line x1="90" y1="40" x2="160" y2="92" stroke="#5B6478" strokeWidth="9" strokeLinecap="round" />
        <line x1="90" y1="40" x2="160" y2="92" stroke="#9CCBEF" strokeWidth="5" strokeLinecap="round" />
        <circle cx="170" cy="94" r="12" fill="#5B6478" />
        <rect x="186" y="84" width="22" height="20" rx="3" fill="#3A4152" />
        <polygon points="222,50 214,66 220,66 214,80 228,60 222,60" fill="#F2C200" />
        <line x1="0" y1="105" x2="240" y2="105" stroke="#C9B79C" strokeWidth="3" />
        <text x="160" y="26" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">thế năng → điện năng</text>
      </svg>
  ),
  'khuc-xa-anh-sang': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Tia sáng khúc xạ khi đi từ không khí vào nước">
        <rect x="0" y="60" width="240" height="60" fill="#DCEEFB" />
        <line x1="0" y1="60" x2="240" y2="60" stroke="#7FA7C9" strokeWidth="1.5" />
        <line x1="120" y1="8" x2="120" y2="112" stroke="#5A6482" strokeWidth="1.2" strokeDasharray="4 4" />
        <line x1="70" y1="12" x2="120" y2="60" stroke="#E5532B" strokeWidth="2.5" />
        <line x1="120" y1="60" x2="150" y2="114" stroke="#E5532B" strokeWidth="2.5" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700">
          <text x="103" y="38" fill="#C2302B">i</text>
          <text x="127" y="90" fill="#08776A">r</text>
          <text x="10" y="50" fill="#5A6482" fontSize="10">không khí</text>
          <text x="10" y="76" fill="#5A6482" fontSize="10">nước</text>
        </g>
      </svg>
  ),
  'phan-xa-toan-phan': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Tia sáng phản xạ toàn phần liên tiếp trong sợi quang">
        <rect x="10" y="38" width="220" height="44" rx="4" fill="#DDF2F1" stroke="#7FA7C9" strokeWidth="1.5" />
        <polyline points="10,60 42,38 86,82 130,38 174,82 218,38 230,46" fill="none" stroke="#E5532B" strokeWidth="2.5" strokeLinejoin="round" />
        <text x="120" y="104" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">i ≥ i_gh: ánh sáng không lọt ra</text>
      </svg>
  ),
  'lang-kinh': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Lăng kính tách ánh sáng trắng thành dải màu">
        <polygon points="104,14 58,104 150,104" fill="#DDF2F1" stroke="#7FA7C9" strokeWidth="1.5" />
        <line x1="10" y1="64" x2="82" y2="58" stroke="#8A93A6" strokeWidth="4" strokeLinecap="round" />
        <g strokeWidth="2">
          <line x1="128" y1="64" x2="230" y2="74" stroke="#E53935" />
          <line x1="128" y1="65" x2="230" y2="80" stroke="#FB8C00" />
          <line x1="128" y1="66" x2="230" y2="86" stroke="#F2C200" />
          <line x1="128" y1="67" x2="230" y2="92" stroke="#43A047" />
          <line x1="128" y1="68" x2="230" y2="98" stroke="#1E88E5" />
          <line x1="128" y1="69" x2="230" y2="104" stroke="#3949AB" />
          <line x1="128" y1="70" x2="230" y2="110" stroke="#8E24AA" />
        </g>
        <polygon points="82,58 128,64 128,70" fill="#C9C2E8" opacity="0.8" />
      </svg>
  ),
  'thau-kinh': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Dựng ảnh của vật qua thấu kính hội tụ">
        <line x1="6" y1="64" x2="234" y2="64" stroke="#1D2540" strokeWidth="1.2" />
        <ellipse cx="120" cy="64" rx="7" ry="52" fill="#DDF2F1" />
        <line x1="120" y1="12" x2="120" y2="116" stroke="#3B2A8C" strokeWidth="2" />
        <line x1="44" y1="64" x2="44" y2="34" stroke="#E0443F" strokeWidth="3" />
        <line x1="44" y1="34" x2="120" y2="34" stroke="#E5532B" strokeWidth="1.8" />
        <line x1="120" y1="34" x2="196" y2="94" stroke="#E5532B" strokeWidth="1.8" />
        <line x1="44" y1="34" x2="196" y2="94" stroke="#E5532B" strokeWidth="1.8" />
        <line x1="182" y1="64" x2="182" y2="88" stroke="#0C9A88" strokeWidth="3" />
        <g fill="#3B2A8C">
          <circle cx="82" cy="64" r="3" />
          <circle cx="158" cy="64" r="3" />
        </g>
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="10" fontWeight="700" fill="#3B2A8C" textAnchor="middle">
          <text x="82" y="78">F</text>
          <text x="158" y="78">F'</text>
        </g>
      </svg>
  ),
  'kinh-lup-do-tieu-cu': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Kính lúp phóng to vật nhỏ">
        <circle cx="96" cy="54" r="34" fill="#DDF2F1" stroke="#3B2A8C" strokeWidth="4" />
        <line x1="120" y1="78" x2="150" y2="108" stroke="#3B2A8C" strokeWidth="8" strokeLinecap="round" />
        <text x="96" y="66" fontFamily="Be Vietnam Pro, sans-serif" fontSize="34" fontWeight="800" fill="#E0443F" textAnchor="middle">A</text>
        <text x="40" y="60" fontFamily="Be Vietnam Pro, sans-serif" fontSize="10" fontWeight="800" fill="#E0443F" textAnchor="middle">A</text>
        <text x="196" y="58" fontFamily="Be Vietnam Pro, sans-serif" fontSize="13" fontWeight="700" fill="#3B2A8C" textAnchor="middle">G = 25 : f</text>
      </svg>
  ),
  'dien-tro-dinh-luat-om': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Mạch điện có điện trở và đồ thị I theo U">
        <g fill="none" stroke="#1D2540" strokeWidth="2">
          <polyline points="20,40 20,20 120,20 120,95 20,95 20,70" />
        </g>
        <line x1="10" y1="48" x2="30" y2="48" stroke="#1D2540" strokeWidth="2" />
        <line x1="14" y1="58" x2="26" y2="58" stroke="#1D2540" strokeWidth="5" />
        <rect x="50" y="12" width="44" height="16" rx="2" fill="#fff" stroke="#3B2A8C" strokeWidth="2.2" />
        <circle cx="70" cy="95" r="12" fill="#fff" stroke="#3B2A8C" strokeWidth="2" />
        <text x="70" y="99" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">A</text>
        <line x1="150" y1="100" x2="228" y2="100" stroke="#1D2540" strokeWidth="1.5" />
        <line x1="150" y1="100" x2="150" y2="18" stroke="#1D2540" strokeWidth="1.5" />
        <line x1="150" y1="100" x2="220" y2="30" stroke="#E0443F" strokeWidth="2.5" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="10" fontWeight="700" fill="#1D2540">
          <text x="222" y="112">U</text>
          <text x="140" y="20">I</text>
        </g>
      </svg>
  ),
  'mach-noi-tiep-song-song': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Hai điện trở mắc song song, dòng điện chia hai nhánh">
        <g fill="none" stroke="#1D2540" strokeWidth="2">
          <polyline points="20,45 20,25 70,25" />
          <polyline points="70,25 170,25" />
          <polyline points="70,25 70,65 170,65 170,25" />
          <polyline points="170,25 220,25 220,100 20,100 20,72" />
        </g>
        <line x1="10" y1="52" x2="30" y2="52" stroke="#1D2540" strokeWidth="2" />
        <line x1="14" y1="62" x2="26" y2="62" stroke="#1D2540" strokeWidth="5" />
        <rect x="98" y="17" width="44" height="16" rx="2" fill="#fff" stroke="#C2302B" strokeWidth="2.2" />
        <rect x="98" y="57" width="44" height="16" rx="2" fill="#fff" stroke="#08776A" strokeWidth="2.2" />
        <g fill="#E0443F"><circle cx="82" cy="25" r="3" /><circle cx="160" cy="25" r="3" /></g>
        <g fill="#0C9A88"><circle cx="85" cy="65" r="3" /><circle cx="155" cy="65" r="3" /></g>
        <g fill="#1D2540"><circle cx="70" cy="25" r="3.5" /><circle cx="170" cy="25" r="3.5" /></g>
        <text x="120" y="92" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">I = I₁ + I₂</text>
      </svg>
  ),
  'cong-suat-dien': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Bóng đèn ghi 220 V – 100 W mắc với ampe kế">
        <circle cx="80" cy="56" r="34" fill="#FFE9A6" opacity="0.6" />
        <circle cx="80" cy="56" r="18" fill="#FFECA0" stroke="#1D2540" strokeWidth="2.2" />
        <line x1="67" y1="43" x2="93" y2="69" stroke="#1D2540" strokeWidth="2.2" />
        <line x1="67" y1="69" x2="93" y2="43" stroke="#1D2540" strokeWidth="2.2" />
        <line x1="98" y1="56" x2="150" y2="56" stroke="#1D2540" strokeWidth="2" />
        <circle cx="170" cy="56" r="18" fill="#fff" stroke="#1D2540" strokeWidth="2" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontWeight="700" textAnchor="middle">
          <text x="170" y="61" fontSize="14" fill="#1D2540">A</text>
          <text x="80" y="108" fontSize="11" fill="#3B2A8C">220 V – 100 W</text>
          <text x="170" y="108" fontSize="11" fill="#3B2A8C">𝒫 = U × I</text>
        </g>
      </svg>
  ),
  'dien-nang': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Bóng đèn sáng và công tơ điện">
        <circle cx="60" cy="56" r="34" fill="#FFE9A6" opacity="0.6" />
        <circle cx="60" cy="56" r="18" fill="#FFECA0" stroke="#1D2540" strokeWidth="2.2" />
        <line x1="47" y1="43" x2="73" y2="69" stroke="#1D2540" strokeWidth="2.2" />
        <line x1="47" y1="69" x2="73" y2="43" stroke="#1D2540" strokeWidth="2.2" />
        <rect x="128" y="22" width="92" height="80" rx="8" fill="#F1F3F8" stroke="#1D2540" strokeWidth="2" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontWeight="700" textAnchor="middle">
          <rect x="138" y="38" width="72" height="22" rx="3" fill="#22283A" />
          <text x="174" y="54" fontSize="14" fill="#fff">0120,5</text>
          <text x="174" y="78" fontSize="11" fill="#1D2540">kWh</text>
        </g>
        <text x="60" y="108" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">A = 𝒫 × t</text>
      </svg>
  ),
  'cam-ung-dien-tu': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Nam châm đưa vào cuộn dây và đồ thị dòng điện xoay chiều">
        <rect x="14" y="40" width="34" height="24" rx="3" fill="#3B6FD8" />
        <rect x="48" y="40" width="34" height="24" rx="3" fill="#E0443F" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">
          <text x="31" y="56">S</text>
          <text x="65" y="56">N</text>
        </g>
        <g fill="none" stroke="#B07A3A" strokeWidth="2.5">
          <ellipse cx="96" cy="52" rx="5" ry="22" />
          <ellipse cx="108" cy="52" rx="5" ry="22" />
          <ellipse cx="120" cy="52" rx="5" ry="22" />
        </g>
        <line x1="140" y1="60" x2="232" y2="60" stroke="#1D2540" strokeWidth="1.5" />
        <path d="M140 60 C 151 20, 163 20, 174 60 S 197 100, 208 60 S 220 30, 230 45" fill="none" stroke="#E0443F" strokeWidth="2.5" />
        <text x="120" y="108" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">dòng điện cảm ứng, xoay chiều</text>
      </svg>
  ),
  'tinh-chat-kim-loai': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Kim loại tan trong ống nghiệm acid, có bọt khí">
        <rect x="58" y="40" width="34" height="62" fill="#E3EEF8" />
        <path d="M56 14 V100 a19 19 0 0 0 38 0 V14" fill="none" stroke="#7C8AA5" strokeWidth="2.5" />
        <circle cx="68" cy="104" r="6" fill="#B8C0CC" /><circle cx="82" cy="106" r="5" fill="#B8C0CC" />
        <g fill="none" stroke="#7C8AA5" strokeWidth="1.5"><circle cx="70" cy="80" r="3" /><circle cx="80" cy="66" r="3.5" /><circle cx="73" cy="52" r="2.5" /></g>
        <text x="168" y="56" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">Zn + 2HCl →</text>
        <text x="168" y="76" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">ZnCl₂ + H₂↑</text>
      </svg>
  ),
  'day-hoat-dong-hoa-hoc': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Dãy hoạt động hóa học của kim loại">
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">
          {['K', 'Na', 'Mg', 'Al', 'Zn', 'Fe', 'H', 'Cu', 'Ag'].map((el, i) => (
            <g key={el}>
              <rect x={8 + i * 25} y="24" width="22" height="24" rx="4" fill={el === 'Fe' ? '#FDE3E1' : el === 'Cu' ? '#D8F2EE' : '#fff'} stroke={el === 'Fe' ? '#E0443F' : el === 'Cu' ? '#0C9A88' : '#C9D3EA'} strokeWidth="1.5" />
              <text x={19 + i * 25} y="40" fill="#1D2540">{el}</text>
            </g>
          ))}
        </g>
        <rect x="80" y="64" width="80" height="44" rx="4" fill="#7FB5E6" />
        <rect x="114" y="54" width="12" height="50" rx="2" fill="#7A808C" />
        <rect x="114" y="74" width="12" height="30" fill="#B5562B" />
        <text x="200" y="92" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">Fe đẩy Cu</text>
      </svg>
  ),
  'tach-kim-loai-hop-kim': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Lò cao luyện gang">
        <polygon points="70,10 120,10 150,80 135,112 55,112 40,80" fill="#8E8E96" />
        <polygon points="78,16 112,16 140,80 128,106 62,106 50,80" fill="#3A3F4B" />
        <ellipse cx="95" cy="80" rx="40" ry="24" fill="#F28C28" opacity="0.4" />
        <rect x="62" y="94" width="66" height="12" fill="#F2A65A" />
        <text x="196" y="56" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">Fe₂O₃ + 3CO</text>
        <text x="196" y="74" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">→ 2Fe + 3CO₂</text>
      </svg>
  ),
  'kim-loai-va-phi-kim': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Quỳ tím hóa đỏ với acid, hóa xanh với base">
        <rect x="40" y="60" width="60" height="44" rx="4" fill="#CFE6F7" />
        <rect x="140" y="60" width="60" height="44" rx="4" fill="#CFE6F7" />
        <rect x="64" y="30" width="12" height="54" rx="2" fill="#D9443F" />
        <rect x="164" y="30" width="12" height="54" rx="2" fill="#3D6FD8" />
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">
          <text x="70" y="20" fill="#C2302B">phi kim → acid</text>
          <text x="170" y="20" fill="#2D5BBF">kim loại → base</text>
        </g>
      </svg>
  ),
  'hop-chat-huu-co': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Mô hình phân tử methane">
        <g stroke="#8D96A8" strokeWidth="4"><line x1="80" y1="60" x2="80" y2="22" /><line x1="80" y1="60" x2="80" y2="98" /><line x1="80" y1="60" x2="42" y2="60" /><line x1="80" y1="60" x2="118" y2="60" /></g>
        <g fill="#fff" stroke="#8D96A8" strokeWidth="1.5"><circle cx="80" cy="22" r="9" /><circle cx="80" cy="98" r="9" /><circle cx="42" cy="60" r="9" /><circle cx="118" cy="60" r="9" /></g>
        <circle cx="80" cy="60" r="15" fill="#3A3F4B" />
        <text x="80" y="65" fontFamily="Be Vietnam Pro, sans-serif" fontSize="13" fontWeight="700" fill="#fff" textAnchor="middle">C</text>
        <text x="182" y="66" fontFamily="Be Vietnam Pro, sans-serif" fontSize="13" fontWeight="700" fill="#3B2A8C" textAnchor="middle">%C = 75%</text>
      </svg>
  ),
  'alkane': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Phân tử ethane cháy tạo CO2 và nước">
        <g stroke="#8D96A8" strokeWidth="3">
          <line x1="50" y1="60" x2="90" y2="60" /><line x1="50" y1="60" x2="50" y2="30" /><line x1="50" y1="60" x2="50" y2="90" /><line x1="50" y1="60" x2="22" y2="60" />
          <line x1="90" y1="60" x2="90" y2="30" /><line x1="90" y1="60" x2="90" y2="90" /><line x1="90" y1="60" x2="118" y2="60" />
        </g>
        <g fill="#fff" stroke="#8D96A8" strokeWidth="1.5">
          <circle cx="50" cy="30" r="7" /><circle cx="50" cy="90" r="7" /><circle cx="22" cy="60" r="7" /><circle cx="90" cy="30" r="7" /><circle cx="90" cy="90" r="7" /><circle cx="118" cy="60" r="7" />
        </g>
        <circle cx="50" cy="60" r="12" fill="#3A3F4B" /><circle cx="90" cy="60" r="12" fill="#3A3F4B" />
        <text x="184" y="66" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">CₙH₂ₙ₊₂</text>
      </svg>
  ),
  'alkene': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Ethylene làm mất màu nước bromine">
        <rect x="150" y="50" width="34" height="52" fill="#E9A23B" opacity="0.55" />
        <path d="M148 14 V100 a19 19 0 0 0 38 0 V14" fill="none" stroke="#7C8AA5" strokeWidth="2.5" />
        <g stroke="#8D96A8" strokeWidth="3"><line x1="40" y1="56" x2="84" y2="56" /><line x1="40" y1="64" x2="84" y2="64" />
          <line x1="40" y1="60" x2="20" y2="40" /><line x1="40" y1="60" x2="20" y2="80" /><line x1="84" y1="60" x2="104" y2="40" /><line x1="84" y1="60" x2="104" y2="80" /></g>
        <g fill="#fff" stroke="#8D96A8" strokeWidth="1.5"><circle cx="20" cy="40" r="7" /><circle cx="20" cy="80" r="7" /><circle cx="104" cy="40" r="7" /><circle cx="104" cy="80" r="7" /></g>
        <circle cx="40" cy="60" r="12" fill="#3A3F4B" /><circle cx="84" cy="60" r="12" fill="#3A3F4B" />
        <text x="62" y="108" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">C₂H₄ + Br₂</text>
      </svg>
  ),
  'nguon-nhien-lieu': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Bếp gas đun nồi nước">
        <rect x="50" y="34" width="100" height="50" rx="6" fill="#9AA3B5" />
        <rect x="56" y="42" width="88" height="38" rx="4" fill="#CFE6F7" />
        <g fill="#4F7BFF" opacity="0.85"><path d="M70 104 q6 -16 12 0 z" /><path d="M94 104 q6 -18 12 0 z" /><path d="M118 104 q6 -16 12 0 z" /></g>
        <rect x="44" y="104" width="112" height="10" rx="3" fill="#3A3F4B" />
        <text x="200" y="56" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">Q = n × Q(1 mol)</text>
        <text x="200" y="80" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#5A6482" textAnchor="middle">CH₄ · C₄H₁₀ · C</text>
      </svg>
  ),
  'ethylic-alcohol': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Chai rượu và ngọn lửa xanh của ethylic alcohol">
        <rect x="50" y="34" width="44" height="74" rx="8" fill="#CFE6F7" stroke="#7C8AA5" strokeWidth="2" />
        <rect x="62" y="12" width="20" height="24" rx="3" fill="#CFE6F7" stroke="#7C8AA5" strokeWidth="2" />
        <rect x="52" y="70" width="40" height="36" rx="6" fill="#B7A6EE" />
        <text x="72" y="62" fontFamily="Be Vietnam Pro, sans-serif" fontSize="13" fontWeight="700" fill="#5B45B8" textAnchor="middle">40°</text>
        <path d="M150 100 q-16 -26 0 -54 q16 28 0 54z" fill="#4F7BFF" opacity="0.8" />
        <text x="190" y="66" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">C₂H₅OH</text>
      </svg>
  ),
  'acetic-acid': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Giấm ăn chứa acetic acid">
        <rect x="46" y="40" width="50" height="68" rx="10" fill="#FFF4D6" stroke="#7C8AA5" strokeWidth="2" />
        <rect x="60" y="20" width="22" height="22" rx="3" fill="#C2302B" />
        <text x="71" y="80" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#8A4B00" textAnchor="middle">giấm</text>
        <text x="170" y="52" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">CH₃COOH</text>
        <text x="170" y="76" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#C2302B" textAnchor="middle">quỳ tím → đỏ</text>
      </svg>
  ),
  'lipid': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Xà phòng hóa chất béo">
        <rect x="30" y="50" width="80" height="54" rx="6" fill="#CFE6F7" />
        <rect x="30" y="40" width="80" height="14" rx="4" fill="#F2D27A" />
        <rect x="150" y="50" width="56" height="40" rx="10" fill="#E9E2FF" stroke="#9B8BD9" strokeWidth="2" />
        <text x="178" y="75" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#5B45B8" textAnchor="middle">xà phòng</text>
        <path d="M118 70 h24 m-8 -6 l8 6 l-8 6" stroke="#3B2A8C" strokeWidth="2.5" fill="none" />
        <text x="70" y="28" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">chất béo + NaOH</text>
      </svg>
  ),
  'glucose-saccharose': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Phản ứng tráng bạc của glucose">
        <path d="M56 14 V96 a20 20 0 0 0 40 0 V14" fill="#E3E6EC" stroke="#7C8AA5" strokeWidth="2.5" />
        <path d="M60 60 V96 a16 16 0 0 0 32 0 V60" fill="#C9CED8" />
        <text x="170" y="52" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">C₆H₁₂O₆</text>
        <text x="170" y="76" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#5A6482" textAnchor="middle">tráng bạc</text>
      </svg>
  ),
  'tinh-bot-cellulose': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Tinh bột thủy phân thành glucose">
        <g fill="#F1E9D2" stroke="#B98B52" strokeWidth="1.5"><ellipse cx="44" cy="64" rx="12" ry="8" /><ellipse cx="66" cy="54" rx="12" ry="8" /><ellipse cx="62" cy="76" rx="12" ry="8" /></g>
        <path d="M92 64 h40 m-8 -6 l8 6 l-8 6" stroke="#3B2A8C" strokeWidth="2.5" fill="none" />
        <text x="112" y="52" fontFamily="Be Vietnam Pro, sans-serif" fontSize="10" fontWeight="700" fill="#5A6482" textAnchor="middle">thủy phân</text>
        <text x="186" y="58" fontFamily="Be Vietnam Pro, sans-serif" fontSize="13" fontWeight="700" fill="#08776A" textAnchor="middle">glucose</text>
        <text x="186" y="78" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#08776A" textAnchor="middle">C₆H₁₂O₆</text>
      </svg>
  ),
  'protein': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Chuỗi amino acid tạo thành protein">
        <g stroke="#3B2A8C" strokeWidth="3"><line x1="30" y1="60" x2="210" y2="60" /></g>
        <g><circle cx="30" cy="60" r="13" fill="#E0443F" /><circle cx="66" cy="60" r="13" fill="#0C9A88" /><circle cx="102" cy="60" r="13" fill="#3D6FD8" /><circle cx="138" cy="60" r="13" fill="#E8873A" /><circle cx="174" cy="60" r="13" fill="#9B8BD9" /><circle cx="210" cy="60" r="13" fill="#E0443F" /></g>
        <text x="120" y="100" fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#3B2A8C" textAnchor="middle">amino acid nối thành protein</text>
      </svg>
  ),
  'polymer': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Mạch polymer gồm nhiều mắt xích">
        <g fill="#fff" stroke="#3DBE5A" strokeWidth="2"><rect x="18" y="44" width="44" height="28" rx="14" /><rect x="70" y="44" width="44" height="28" rx="14" /><rect x="122" y="44" width="44" height="28" rx="14" /><rect x="174" y="44" width="44" height="28" rx="14" /></g>
        <g stroke="#3B2A8C" strokeWidth="3"><line x1="62" y1="58" x2="70" y2="58" /><line x1="114" y1="58" x2="122" y2="58" /><line x1="166" y1="58" x2="174" y2="58" /></g>
        <text x="120" y="100" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">(–CH₂–CHCl–)ₙ</text>
      </svg>
  ),
  'vo-trai-dat': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Thành phần nguyên tố trong vỏ Trái Đất">
        <g fontFamily="Be Vietnam Pro, sans-serif" fontSize="11" fontWeight="700" fill="#1D2540" textAnchor="end">
          <text x="40" y="30">O</text><text x="40" y="52">Si</text><text x="40" y="74">Al</text><text x="40" y="96">Fe</text>
        </g>
        <rect x="46" y="20" width="150" height="14" rx="5" fill="#3B2A8C" /><rect x="46" y="42" width="89" height="14" rx="5" fill="#3B2A8C" />
        <rect x="46" y="64" width="26" height="14" rx="5" fill="#9AA3B5" /><rect x="46" y="86" width="16" height="14" rx="5" fill="#E0443F" />
      </svg>
  ),
  'da-voi-silicate': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Lò nung vôi">
        <polygon points="70,14 120,14 146,108 44,108" fill="#B5562B" />
        <polygon points="78,22 112,22 134,100 56,100" fill="#3A3F4B" />
        <rect x="58" y="88" width="74" height="12" fill="#F4F4F0" />
        <g fill="#F28C28" opacity="0.85"><path d="M78 88 q6 -16 12 0z" /><path d="M98 88 q6 -18 12 0z" /></g>
        <text x="194" y="52" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">CaCO₃ →</text>
        <text x="194" y="72" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#3B2A8C" textAnchor="middle">CaO + CO₂</text>
      </svg>
  ),
  'nhien-lieu-hoa-thach': (
      <svg className="thumb" viewBox="0 0 240 120" role="img" aria-label="Chu trình carbon và nhiệt kế Trái Đất ấm lên">
        <ellipse cx="110" cy="30" rx="80" ry="20" fill="#9AA3B5" opacity="0.35" />
        <text x="110" y="34" fontFamily="Be Vietnam Pro, sans-serif" fontSize="12" fontWeight="700" fill="#1D2540" textAnchor="middle">CO₂</text>
        <rect x="30" y="66" width="34" height="44" fill="#5B6478" /><rect x="40" y="46" width="10" height="22" fill="#5B6478" />
        <path d="M60 60 L90 42" stroke="#E0443F" strokeWidth="3" /><path d="M140 44 L160 74" stroke="#0C9A88" strokeWidth="3" />
        <circle cx="166" cy="84" r="16" fill="#4FA85A" /><rect x="162" y="96" width="8" height="16" fill="#8C6A2A" />
        <rect x="206" y="20" width="10" height="72" rx="5" fill="#fff" stroke="#7C8AA5" strokeWidth="1.5" /><circle cx="211" cy="96" r="9" fill="#E0443F" /><rect x="208" y="50" width="6" height="44" fill="#E0443F" />
      </svg>
  ),
};
