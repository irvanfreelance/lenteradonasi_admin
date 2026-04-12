import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Lentera Donasi | Admin Panel",
  description: "Administrative dashboard for the Lentera Donasi Philanthropy ecosystem.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕯️</text></svg>",
  }
};

import { SWRProvider } from "@/components/providers/swr-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${sourceSans.variable} antialiased`}>
      <body className="bg-slate-50 min-h-screen font-source-sans text-slate-800">
        <SWRProvider>
          {children}
        </SWRProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

