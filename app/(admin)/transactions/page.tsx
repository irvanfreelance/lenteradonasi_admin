"use client";

import React from 'react';
import useSWR from 'swr';
import { 
  Search, Filter, Download, Receipt, 
  ExternalLink, CheckCircle, Clock, XCircle
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
  return new Date(dateStr).toLocaleString('id-ID', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

export default function TransactionsPage() {
  const { data: transactions, error, isLoading } = useSWR('/api/transactions', fetcher);

  if (error) return <div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100 italic">Gagal memuat transaksi: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Laporan Ledger & Donasi</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Download size={18} /> Export Excel
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px] group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari ID Invoice atau Nama Donatur..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all" 
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none focus:border-teal-500">
            <option>Semua Status</option>
            <option>PAID</option>
            <option>PENDING</option>
            <option>EXPIRED</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-2.5 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={18} /> Lainnya
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-4 border-b border-slate-100">Waktu & Kode</th>
                <th className="px-6 py-4 border-b border-slate-100">Donatur</th>
                <th className="px-6 py-4 border-b border-slate-100">Nominal</th>
                <th className="px-6 py-4 border-b border-slate-100">Metode & Kampanye</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">Status</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 bg-slate-100 rounded w-full"></div></td>
                    <td className="px-6 py-4"><div className="h-10 bg-slate-100 rounded w-full"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-10 bg-slate-100 rounded w-full"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-6 bg-slate-100 rounded-full w-16 mx-auto"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-8 bg-slate-100 rounded-xl w-10 mx-auto"></div></td>
                  </tr>
                ))
              ) : transactions?.length > 0 ? (
                transactions.map((trx: any) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800">{trx.invoice_code}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase">{formatDate(trx.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800 text-sm">{trx.donor_name_snapshot}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800 text-sm tracking-tight">{formatIDR(trx.total_amount)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{trx.payment_method}</span>
                        <span className="text-xs text-slate-400 mt-1 line-clamp-1 italic">{trx.campaigns?.[0] || 'Multiple Campaigns'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        trx.status === 'PAID' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        trx.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-slate-50 text-slate-400 border-slate-100"
                      )}>
                        {trx.status === 'PAID' && <CheckCircle size={10} />}
                        {trx.status === 'PENDING' && <Clock size={10} />}
                        {trx.status === 'EXPIRED' && <XCircle size={10} />}
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center group-hover:opacity-100 opacity-30 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Lihat Invoice">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Status Legend */}
        <div className="p-6 bg-slate-50/50 flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sukses/Terbayar</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Menunggu Pembayaran</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Kedaluwarsa</div>
        </div>
      </div>
    </div>
  );
}
