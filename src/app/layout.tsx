import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'katex/dist/katex.min.css';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToolsProvider } from '@/components/tools-context';
import { bookFont, uiFont } from './fonts';
import './shadcn.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SimBook – Vở mô phỏng: Toán lớp 5, Vật lý và Hóa học lớp 9',
    template: '%s – SimBook',
  },
  applicationName: 'SimBook',
  description:
    'Mô phỏng tương tác cho Toán lớp 5 (chuyển động, đo lường), Vật lý lớp 9 (năng lượng, quang học, điện học) và Hóa học lớp 9.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${uiFont.variable} ${bookFont.variable}`}>
      <body>
        {/* ToolsProvider: cửa sổ Máy tính + Bảng tuần hoàn dùng chung cho mọi trang. Mục lục theo block sidebar-07 của shadcn/ui: mặc định thu gọn thành dải icon để trang bài học rộng khi trình chiếu */}
        <TooltipProvider delayDuration={0}>
          <ToolsProvider>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarInset className="bg-transparent">
                <header data-slot="site-header" className="site-header">
                  <SidebarTrigger aria-label="Thu gọn hoặc mở mục lục" />
                  <span className="site-header-title">Mục lục</span>
                  <kbd>Ctrl/⌘ + B</kbd>
                </header>
                <div className="page-body">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </ToolsProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
