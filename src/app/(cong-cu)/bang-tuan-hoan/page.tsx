import type { Metadata } from 'next';
import PeriodicTable from '@/components/PeriodicTable';

export const metadata: Metadata = { title: 'Bảng tuần hoàn các nguyên tố hóa học' };

/** Bản toàn trang của bảng tuần hoàn (mở từ sidebar "Tiện ích & công cụ" trong tab mới) */
export default function Page() {
  return (
    <>
      <header className="tool-page-head">
        <nav className="breadcrumb" aria-label="Vị trí">
          <span>Tiện ích &amp; công cụ</span>
        </nav>
        <h1>Bảng tuần hoàn các nguyên tố hóa học</h1>
        <p>
          Chọn một ô để xem số hiệu, vị trí, nguyên tử khối, lớp electron và hóa trị. Đổi cách tô màu, làm nổi bật cùng nhóm hoặc
          cùng chu kì, gõ công thức để tính khối lượng mol. Đường dẫn giữ nguyên tố đang chọn (?z=26) để gửi cho học sinh.
        </p>
      </header>
      <PeriodicTable page />
    </>
  );
}
