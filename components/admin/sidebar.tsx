"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Megaphone, Receipt, Users, Settings, 
  ChevronLeft, Menu, LogOut, Heart
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Megaphone, label: 'Kampanye', href: '/campaigns' },
  { icon: Receipt, label: 'Transaksi', href: '/transactions' },
  { icon: Users, label: 'Donatur', href: '/donors' },
  { icon: Settings, label: 'Pengaturan', href: '/settings' },
];

export default function Sidebar({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-slate-900 text-slate-300 transition-all duration-300 z-50 flex flex-col shadow-2xl",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
          <Heart size={20} className="text-white fill-teal-100/20" />
        </div>
        {isOpen && (
          <div className="font-bold text-lg text-white truncate animate-in fade-in duration-500">
            Lentera<span className="text-teal-400">Donasi</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
                  : "hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
              {isOpen && <span className="font-medium text-sm animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={toggle}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all group"
        >
          <Menu size={20} className="text-slate-400 group-hover:text-slate-200" />
          {isOpen && <span className="text-sm font-medium">Collapse Menu</span>}
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all group">
          <LogOut size={20} className="text-slate-400 group-hover:text-rose-400" />
          {isOpen && <span className="text-sm font-medium">Logout Admin</span>}
        </button>
      </div>
    </aside>
  );
}
