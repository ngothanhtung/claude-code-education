import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Đường dẫn cũ của các bài đã tách (giữ cho liên kết giáo viên đã lưu) */
  async redirects() {
    return [
      { source: '/dong-nang-the-nang-co-nang', destination: '/co-nang', permanent: true },
      { source: '/cong-va-cong-suat', destination: '/cong-suat', permanent: true },
      { source: '/cong-suat-dien-dien-nang', destination: '/cong-suat-dien', permanent: true },
    ];
  },
};

export default nextConfig;
