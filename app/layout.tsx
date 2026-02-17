import "./globals.css";
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "補助金・助成金 自動診断",
  description: "会社情報から補助金・助成金候補を自動抽出する診断フォーム",
  icons: [{ rel: "icon", url: "/icon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={orbitron.variable}>{children}</body>
    </html>
  );
}