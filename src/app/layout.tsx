import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalComponents } from "@/components/providers/global-components";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PhishGuard - Phishing Awareness & Training Platform",
  description: "Gamified phishing awareness training through interactive simulations. Learn to recognize, analyze, and respond to phishing attacks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <GlobalComponents />
      </body>
    </html>
  );
}
