import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalLoader from "@/components/layout/GlobalLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeakPath AI - Your Academic Journey",
  description: "Empowering your academic journey with AI-driven discovery.",
  icons: {
    icon: '/assets/logo_peak_path_ai.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        {/* Global Background Image Layer */}
        <div className="fixed inset-0 -z-50 bg-[#0b0e1a]">
          <picture>
            <img 
              src="/assets/background.jpg" 
              alt="Global Background" 
              className="absolute inset-0 h-full w-full object-cover opacity-65 blur-[4px] grayscale-[30%] contrast-110" 
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0b0e1a]/80" />
          <div className="absolute inset-0 page-grid opacity-70" />
        </div>
        <GlobalLoader />
        {children}
      </body>
    </html>
  );
}
