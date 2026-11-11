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
};
