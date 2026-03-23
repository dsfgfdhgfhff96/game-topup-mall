import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Header />
              <main className="min-h-screen pt-16">{children}</main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
