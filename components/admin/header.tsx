"use client";

import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-8 sticky top-0 z-40">
      <h1 className="text-xl font-normal text-slate-800">{title}</h1>
      
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all w-64"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-100 mx-2"></div>
          
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-normal text-slate-800 leading-none mb-1">Ahmad Fulan</p>
              <p className="text-[10px] font-normal text-slate-400">Super admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all border border-slate-200">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
