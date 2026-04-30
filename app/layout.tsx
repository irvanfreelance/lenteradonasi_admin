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
};

import { SWRProvider } from "@/components/providers/swr-provider";
import DynamicBranding from "@/components/admin/dynamic-branding";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${sourceSans.variable} antialiased`}>
      <body className="bg-slate-50 min-h-screen font-source-sans text-slate-800">
        <SWRProvider>
          <DynamicBranding />
          {children}
        </SWRProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

