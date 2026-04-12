"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Search, Filter, Download, Receipt, 
  ExternalLink, CheckCircle, Clock, XCircle, Trash2, Eye, X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { toast } from 'sonner';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    status: statusFilter,
    search: search,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    ...(minAmount && { minAmount }),
    ...(maxAmount && { maxAmount }),
  });

  const { data: transactions, error, isLoading, mutate } = useSWR(`/api/transactions?${queryParams.toString()}`, fetcher);

  const totalCount = transactions?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  if (error) return <div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100 italic">Error: {error.message}</div>;

  const handleUpdateStatus = async (id: number, created_at: string, newStatus: string) => {
    toast(`Ubah status ke ${newStatus}?`, {
      action: {
        label: 'Update',
        onClick: async () => {
          try {
            const res = await fetch('/api/transactions', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, created_at, status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            toast.success('Status transaksi diperbarui');
            mutate();
          } catch (err: any) {
            toast.error(err.message);
          }
        }
      }
    });
  };

  const handleDelete = async (id: number, created_at: string) => {
    toast('Hapus transaksi ini? Data tidak dapat dikembalikan.', {
      action: {
        label: 'Hapus',
        onClick: async () => {
          try {
            const res = await fetch(`/api/transactions?id=${id}&created_at=${created_at}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Transaksi dihapus');
            mutate();
          } catch (err: any) {
            toast.error(err.message);
          }
        }
      }
    });
  };

  const openDetail = (trx: any) => {
    setSelectedTrx(trx);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-400 font-bold mt-1">Laporan ledger & donasi</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-sm border",
              isFilterOpen ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
            )}
          >
            <Filter size={18} /> {isFilterOpen ? 'Tutup Filter' : 'Advanced Filter'}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300">
          <div className="text-left">
            <label className="block text-[10px] font-bold text-slate-500 mb-2">Tanggal mulai</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-normal text-slate-900 focus:border-teal-500/50 outline-none" />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-bold text-slate-500 mb-2">Tanggal akhir</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-normal text-slate-900 focus:border-teal-500/50 outline-none" />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-bold text-slate-500 mb-2">Min. nominal</label>
            <input type="number" placeholder="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-normal text-slate-900 focus:border-teal-500/50 outline-none" />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-bold text-slate-500 mb-2">Max. nominal</label>
            <input type="number" placeholder="Tak terbatas" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-normal text-slate-900 focus:border-teal-500/50 outline-none" />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px] group text-left">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nomor invoice atau donatur..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50" 
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-normal text-slate-600 outline-none focus:border-teal-500"
          >
            <option value="ALL">Semua status</option>
            <option value="PAID">Lunas</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Kedaluwarsa</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold">
                <th className="px-6 py-4 border-b border-slate-100 font-black w-12 text-center">#</th>
                <th className="px-6 py-4 border-b border-slate-100 font-black">Waktu & Kode</th>
                <th className="px-6 py-4 border-b border-slate-100 font-black">Donatur</th>
                <th className="px-6 py-4 border-b border-slate-100 font-black">Nominal</th>
                <th className="px-6 py-4 border-b border-slate-100 font-black">Metode & Kampanye</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center font-black">Status</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center font-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(limit)].map((_, i) => <tr key={i} className="animate-pulse flex-1"><td colSpan={7} className="h-16 px-6 py-4"></td></tr>)
              ) : transactions?.length > 0 ? (
                transactions.map((trx: any, idx: number) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 border-b border-slate-50 text-center text-xs font-bold text-slate-400 bg-slate-50/20">
                      {offset + idx + 1}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-slate-800">{trx.invoice_code}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">{formatDate(trx.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800 text-sm text-left">{trx.donor_name_snapshot}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800 text-sm tracking-tight text-left">{formatIDR(trx.total_amount)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black text-teal-600">{trx.payment_method}</span>
                        <span className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                          {trx.campaigns?.map((c: any) => c.title).join(', ') || 'No campaign'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-semibold border shadow-sm",
                        trx.status === 'PAID' ? "bg-teal-50 text-teal-700 border-teal-100" :
                        trx.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-100" :
                        trx.status === 'EXPIRED' ? "bg-slate-50 text-slate-400 border-slate-100" :
                        "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        {trx.status === 'PAID' ? 'Lunas' : trx.status === 'PENDING' ? 'Pending' : trx.status === 'EXPIRED' ? 'Kedaluwarsa' : 'Batal'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-1 transition-opacity">
                        <button onClick={() => handleUpdateStatus(trx.id, trx.created_at, 'PAID')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Mark as Paid"><CheckCircle size={18} /></button>
                        <button onClick={() => handleDelete(trx.id, trx.created_at)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                        {trx.campaigns?.[0] && (
                          <a href={`/campaigns/${trx.campaigns[0].id}`} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Detail Kampanye">
                            <Eye size={18} />
                          </a>
                        )}
                        <button onClick={() => openDetail(trx)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Detail Transaksi"><Receipt size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400">
            Menampilkan <span className="text-slate-800">{Math.min(offset + 1, totalCount)}</span> - <span className="text-slate-800">{Math.min(offset + limit, totalCount)}</span> dari <span className="text-slate-800">{totalCount}</span> data
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1 || isLoading}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Sebelumnya
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1; // Simplified for now
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-black transition-all",
                      page === pageNum ? "bg-slate-900 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              disabled={page === totalPages || isLoading}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedTrx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Detail Transaksi</h2>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-left">
                  <span className="block text-[10px] font-black text-slate-400 mb-1">Kode invoice</span>
                  <p className="font-black text-slate-800">{selectedTrx.invoice_code}</p>
                </div>
                <div className="text-left text-right">
                    {selectedTrx.status === 'PAID' ? 'Lunas' : 'Pending'}
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Donatur</span>
                  <p className="font-bold text-slate-800">{selectedTrx.donor_name_snapshot}</p>
                </div>
                <div className="text-left text-right">
                  <span className="block text-[10px] font-black text-slate-400 mb-1">Nominal</span>
                  <p className="text-lg font-black text-slate-800">{formatIDR(selectedTrx.total_amount)}</p>
                </div>
                <div className="col-span-2 border-t border-slate-50 pt-6 text-left">
                  <span className="block text-[10px] font-black text-slate-400 mb-2">Kampanye</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrx.campaigns?.map((c: any, i: number) => (
                      <span key={i} className="bg-teal-50 text-teal-600 text-[10px] font-black px-3 py-1.5 rounded-xl border border-teal-100 uppercase tracking-tight">
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-left pt-2">
                   <span className="block text-[10px] font-black text-slate-400 mb-1">Metode pembayaran</span>
                   <p className="text-sm font-bold text-slate-600">{selectedTrx.payment_method}</p>
                </div>
                <div className="text-left pt-2 text-right">
                   <span className="block text-[10px] font-black text-slate-400 mb-1">Waktu transaksi</span>
                   <p className="text-sm font-bold text-slate-600">{formatDate(selectedTrx.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 font-sans"
              >
                Tutup detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

