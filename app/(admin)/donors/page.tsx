"use client";

import React from 'react';
import useSWR from 'swr';
import { 
  Search, Mail, Phone, Calendar, 
  ArrowUpRight, User, Heart, Star
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatIDR = (amount: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export default function DonorsPage() {
  const { data: donors, error, isLoading } = useSWR('/api/donors', fetcher);

  if (error) return <div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100 italic">Gagal memuat data donatur: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Database Donatur</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Profil & Loyalitas Dermawan</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100 flex items-center gap-2">
            <Heart size={16} className="text-teal-600 fill-teal-600/20" />
            <span className="text-xs font-black text-teal-700 uppercase tracking-widest">{donors?.length || 0} Total Donatur</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100">
        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau nomor telepon donatur..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all" 
          />
        </div>
      </div>

      {/* Grid of Donors */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 animate-pulse h-48"></div>
          ))
        ) : donors?.length > 0 ? (
          donors.map((donor: any) => (
            <div key={donor.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:border-teal-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 tracking-tight text-lg group-hover:text-teal-600 transition-colors">{donor.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bergabung {formatDate(donor.created_at)}</p>
                  </div>
                </div>
                {donor.total_donated > 1000000 && (
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100" title="Top Donor">
                    <Star size={16} fill="currentColor" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Donasi</p>
                    <p className="font-black text-slate-800 text-sm tracking-tight">{formatIDR(donor.total_donated)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Frekuensi</p>
                    <p className="font-black text-slate-800 text-sm tracking-tight">{donor.donation_count}x Transaksi</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Mail size={14} className="text-slate-300" />
                    <span>{donor.email || 'Email Tidak Tersedia'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Phone size={14} className="text-slate-300" />
                    <span>{donor.phone || 'Nomor Tidak Tersedia'}</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 text-xs font-black text-slate-600 hover:bg-slate-800 hover:text-white transition-all">
                  Lihat Detail Profil <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 italic">No donors found.</div>
        )}
      </div>
    </div>
  );
}
