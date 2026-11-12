import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';

export const metadata: Metadata = { title: 'Máy tính khoa học' };

/** Bản toàn trang của máy tính (mở từ sidebar "Tiện ích & công cụ" trong tab mới) */
export default function Page() {
  return (
    <>
      <header className="tool-page-head">
        <nav className="breadcrumb" aria-label="Vị trí">
          <span>Tiện ích &amp; công cụ</span>
        </nav>
        <h1>Máy tính khoa học</h1>
        <p>Phím lớn để trình chiếu, gõ được bằng bàn phím; lịch sử phép tính dùng chung với máy tính nổi trong các bài học.</p>
      </header>
      <Calculator page />
    </>
  );
}
