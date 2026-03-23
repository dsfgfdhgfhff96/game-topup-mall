import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "极速卡 - 游戏充值点卡商城",
  description: "极速卡 - 专业的游戏充值点卡商城，提供各类游戏充值、点卡购买服务",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
