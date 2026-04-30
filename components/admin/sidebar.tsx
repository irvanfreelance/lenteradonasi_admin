"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Megaphone, Receipt, Users, Settings, 
  ChevronLeft, Menu, LogOut, Heart, Tags, CreditCard, BellRing,
  ShieldCheck, History, Wallet, MessageSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import useSWR from 'swr';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Megaphone, label: 'Kampanye', href: '/campaigns' },
  { icon: MessageSquare, label: 'Kabar Penyaluran', href: '/campaign-updates' },
  { icon: Tags, label: 'Kategori', href: '/categories' },
  { icon: Receipt, label: 'Transaksi', href: '/transactions' },
  { icon: Users, label: 'Donatur', href: '/donors' },
  { icon: Heart, label: 'Afiliasi', href: '/affiliates' },
  { icon: Wallet, label: 'Penarikan', href: '/withdrawals' },
  { icon: BellRing, label: 'Notifikasi', href: '/notifications' },
  { icon: ShieldCheck, label: 'Admin', href: '/admins' },
  { icon: CreditCard, label: 'Payment Channels', href: '/payment-channels' },
  { icon: History, label: 'Log Sistem', href: '/logs' },
  { icon: Settings, label: 'Pengaturan', href: '/settings' },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Sidebar({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) {
  const pathname = usePathname();
  const { data: config } = useSWR('/api/ngo-config', fetcher);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-slate-800 text-slate-300 transition-all duration-300 z-50 flex flex-col shadow-2xl",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center gap-3 border-b border-slate-700/50 transition-all duration-300",
        isOpen ? "p-6" : "p-4 justify-center"
      )}>
        <div className={cn(
          "shrink-0 overflow-hidden flex items-center justify-center transition-all",
          config?.logo_url ? "w-20 h-20" : "w-12 h-12 rounded-xl bg-primary border border-white/10 shadow-lg"
        )}>
          {config?.logo_url ? (
            <img src={config.logo_url} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Heart size={24} className="text-white fill-white/20" />
          )}
        </div>
        {isOpen && (
          <div className="font-bold text-sm text-white truncate animate-in fade-in duration-500 leading-tight">
            {config?.ngo_name || 'Lentera Donasi'}
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
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
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
