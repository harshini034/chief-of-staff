import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chief of Staff – Autonomous Email Agent",
  description: "AI‑powered email triage and drafting demo for hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-stone-900 text-gray-100" >
        {children}
      </body>
    </html>
  );
}
