import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "김정문알로에 내부 플랫폼",
  description: "사업자 및 카운셀러 전용 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased flex flex-col min-h-screen bg-[url('/watercolor.png')] bg-auto bg-repeat bg-fixed">
        <div className="fixed inset-0 bg-white/20 backdrop-blur-[2px] z-[-1] pointer-events-none" />

        {/* 네비게이션 헤더 — 스킨케어 스타일 */}
        <header className="sticky top-0 z-50 bg-[#c8d4b0] border-b border-[#a8b890]">
          <div className="max-w-6xl mx-auto flex items-center h-[58px]">

            {/* 로고 영역 */}
            <a href="/" className="flex items-center px-6 flex-shrink-0 h-full cursor-pointer">
              <img
                src="/logo.png"
                alt="Kim Jung Moon Aloe TheHB"
                className="h-8 object-contain"
              />
            </a>

            {/* 로고 우측 세로선 */}
            <div className="w-px h-full bg-[#a8b890]" />

            {/* 중앙 카테고리 nav — page.tsx 에서 렌더링되므로 여기선 spacer */}
            <div className="flex-1" />

            {/* 카테고리 nav 우측 세로선 */}
            <div className="w-px h-full bg-[#a8b890]" />

            {/* 우측 아이콘 그룹 */}
            <div className="flex items-center gap-5 px-6">
              <div className="hidden md:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a7a20] animate-pulse" />
                <span className="text-[11px] font-medium text-[#3a5a20]">실시간</span>
              </div>
              <button className="text-[#3a5a20] hover:text-[#1a3010] transition-colors text-[17px]">
                🔔
              </button>
              <button className="flex flex-col gap-[4px] group">
                <span className="block w-5 h-[1.5px] bg-[#3a5a20] group-hover:bg-[#1a3010] transition-colors" />
                <span className="block w-5 h-[1.5px] bg-[#3a5a20] group-hover:bg-[#1a3010] transition-colors" />
                <span className="block w-3.5 h-[1.5px] bg-[#3a5a20] group-hover:bg-[#1a3010] transition-colors" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
