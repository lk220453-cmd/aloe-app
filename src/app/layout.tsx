import type { Metadata } from "next";
import "./globals.css";
import InstallPWA from "@/components/InstallPWA";

export const metadata: Metadata = {
  title: "김정문알로에 더HB",
  description: "사업자 및 카운셀러 전용 프리미엄 자료 플랫폼",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "알로에HB",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
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
          <div className="max-w-6xl mx-auto flex items-center h-[44px] md:h-[58px]">

            {/* 로고 영역 */}
            <a href="/" className="flex items-center px-3 md:px-6 flex-shrink-0 h-full cursor-pointer">
              <img
                src="/logo.png"
                alt="Kim Jung Moon Aloe TheHB"
                className="h-6 md:h-8 object-contain"
              />
            </a>

            {/* 로고 우측 세로선 */}
            <div className="w-px h-full bg-[#a8b890]" />

            {/* 중앙 카테고리 nav — page.tsx 에서 렌더링되므로 여기선 spacer */}
            <div className="flex-1" />

            {/* 카테고리 nav 우측 세로선 */}
            <div className="w-px h-full bg-[#a8b890]" />

            {/* 우측 아이콘 그룹 */}
            <div className="flex items-center gap-3 md:gap-5 px-3 md:px-6">
              <div className="hidden md:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a7a20] animate-pulse" />
                <span className="text-[11px] font-medium text-[#3a5a20]">실시간</span>
              </div>
              <button className="text-[#3a5a20] hover:text-[#1a3010] transition-colors text-[15px] md:text-[17px]">
                🔔
              </button>
              <button className="flex flex-col gap-[3px] md:gap-[4px] group">
                <span className="block w-4 md:w-5 h-[1.5px] bg-[#3a5a20] group-hover:bg-[#1a3010] transition-colors" />
                <span className="block w-4 md:w-5 h-[1.5px] bg-[#3a5a20] group-hover:bg-[#1a3010] transition-colors" />
                <span className="block w-3 md:w-3.5 h-[1.5px] bg-[#3a5a20] group-hover:bg-[#1a3010] transition-colors" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full pb-[56px] md:pb-[88px]">
          {children}
        </main>

        {/* 하단 고정 푸터 */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#ebebeb] border-t border-[#d0d0d0]">
          {/* 모바일: 1줄 간략 표시 */}
          <div className="md:hidden px-4 py-2 text-[10px] text-[#888] text-center leading-[1.6]">
            <span className="font-semibold text-[#666]">김정문알로에</span> · TEL 080-022-9191 · 사업자 220-81-08624
            <span className="ml-2">COPYRIGHT (c) 김정문알로에 ALL RIGHTS RESERVED.</span>
          </div>
          {/* 데스크탑: 전체 표시 */}
          <div className="hidden md:block max-w-6xl mx-auto px-6 py-2.5 text-[11px] text-[#888] leading-[1.8] tracking-tight">
            <div className="flex flex-wrap gap-x-7">
              <span><span className="font-semibold text-[#666]">COMPANY</span> : 김정문알로에</span>
              <span><span className="font-semibold text-[#666]">CEO</span> : 최연매</span>
              <span><span className="font-semibold text-[#666]">ADDRESS</span> : 서울특별시 서초구 사임당로 15 (백재빌딩)</span>
              <span><span className="font-semibold text-[#666]">TEL</span> : 080-022-9191 &gt;</span>
              <span><span className="font-semibold text-[#666]">FAX</span> : 02-400-9754</span>
              <span><span className="font-semibold text-[#666]">BUSINESS LICENCE</span> : 220-81-08624</span>
            </div>
            <div className="flex flex-wrap gap-x-7">
              <span><span className="font-semibold text-[#666]">ONLINE LICENCE</span> : 2008-서울서초-0094</span>
              <span><span className="font-semibold text-[#666]">PRIVACY OFFICER</span> : 이윤섭 (yslee@aloe.co.kr)</span>
            </div>
            <div>COPYRIGHT (c) 김정문알로에&nbsp; ALL RIGHTS RESERVED.</div>
          </div>
        </footer>
        {/* PWA 설치 버튼 및 서비스워커 등록부 */}
        <InstallPWA />
      </body>
    </html>
  );
}
