"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/admin/sidebar';
import Header from '@/components/admin/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Fixed */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
      >
        <Header title="Lentera Donasi Admin" />

        <main className="p-8 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {children}
        </main>

        {/* Footer */}
        <footer className="p-8 pt-0 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            &copy; 2026 Lentera Donasi.
          </p>
        </footer>
      </div>
    </div>
  );
}
