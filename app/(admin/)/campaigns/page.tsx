"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Newspaper,
  ChevronRight, Calendar, Target, MoreHorizontal
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatIDR = (amount: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

export default function CampaignsPage() {
  const { data: campaigns, error, isLoading } = useSWR('/api/campaigns', fetcher);
  const [search, setSearch] = useState('');

  if (error) return <div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100 italic">Gagal memuat kampanye: {error.message}</div>;

  const filteredCampaigns = campaigns?.filter((c: any) => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Kampanye</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Kelola program donasi & qurban</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95 shrink-0">
          <Plus size={18} strokeWidth={3} /> Buat Kampanye
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari judul kampanye..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all text-slate-700" 
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-4 border-b border-slate-100">Judul Kampanye</th>
                <th className="px-6 py-4 border-b border-slate-100">Kategori</th>
                <th className="px-6 py-4 border-b border-slate-100">Progres Donasi</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">Status</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-16 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-24 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredCampaigns?.length > 0 ? (
                filteredCampaigns.map((camp: any) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 line-clamp-1 group-hover:text-teal-600 transition-colors">
                          {camp.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-100/80 px-1.5 py-0.5 rounded-md text-slate-500 font-bold uppercase tracking-wider">{camp.campaign_type}</span>
                          <span className="text-[10px] text-slate-400 font-medium">@{camp.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        camp.category_color === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        camp.category_color === 'rose' ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-teal-50 text-teal-600 border-teal-100"
                      )}>
                        {camp.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 min-w-[150px]">
                        <div className="flex justify-between items-end">
                          <span className="font-black text-slate-800 text-sm leading-none">{formatIDR(camp.collected_amount)}</span>
                          {camp.target_amount && (
                            <span className="text-[10px] text-slate-400 font-bold leading-none">
                              {((camp.collected_amount / camp.target_amount) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full" 
                            style={{ width: `${camp.target_amount ? (camp.collected_amount / camp.target_amount) * 100 : 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                          {camp.target_amount ? `Target: ${formatIDR(camp.target_amount)}` : 'Tanpa Batas Dana'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        camp.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Detail Performa"><Eye size={18} /></button>
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Kabar Terbaru"><Newspaper size={18} /></button>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all"><Edit size={18} /></button>
                        <button className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                    Belum ada kampanye ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-6 border-t border-slate-50 flex justify-between items-center text-sm font-bold text-slate-400">
          <span>Menampilkan {filteredCampaigns?.length || 0} dari {campaigns?.length || 0} kampanye</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-50" disabled>Sebelumnya</button>
            <button className="px-4 py-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-50" disabled>Berikutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
