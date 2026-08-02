import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "National Museum Survey",
  description: "Survey for the National Museum of Korea",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      {/* 기본 언어를 영어(font-en)로 설정합니다. Screen0에서 언어 선택 시 동적으로 변경됩니다. */}
      <body className="min-h-full flex flex-col font-en">{children}</body>
    </html>
  );
}
