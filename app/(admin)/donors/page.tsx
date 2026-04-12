"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Plus, Edit, Trash2, X, Save, Loader2,
  Search, Mail, Phone, ArrowUpRight, User,
  LayoutGrid, List, Eye, Calendar, DollarSign, Activity
} from 'lucide-react';
import { toast } from 'sonner';
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
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'CARD' | 'TABLE'>('CARD');
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { data: donors, error, isLoading, mutate } = useSWR(`/api/donors?limit=${limit}&offset=${offset}&search=${search}`, fetcher);

  const totalCount = donors?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  if (error) return <div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100 italic">Error: {error.message}</div>;

  const handleOpenModal = (donor: any = null) => {
    setSelectedDonor(donor);
    if (donor) {
      setFormData({ name: donor.name, email: donor.email || '', phone: donor.phone || '' });
    } else {
      setFormData({ name: '', email: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenDetail = (donor: any) => {
    setSelectedDonor(donor);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = selectedDonor ? 'PATCH' : 'POST';
      const body = selectedDonor ? { id: selectedDonor.id, ...formData } : formData;
      const res = await fetch('/api/donors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save donor');
      toast.success(selectedDonor ? 'Profil donatur diperbarui' : 'Donatur baru didaftarkan');
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    toast('Hapus data donatur ini?', {
      action: {
        label: 'Hapus',
        onClick: async () => {
          try {
            const res = await fetch(`/api/donors?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete donor');
            toast.success('Donatur dihapus');
            mutate();
          } catch (err: any) {
            toast.error(err.message);
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Database Donatur</h1>
          <p className="text-sm text-slate-400 font-bold mt-1">Profil & loyalitas dermawan</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white border border-slate-100 p-1 rounded-2xl shadow-sm">
             <button onClick={() => setView('CARD')} className={cn("p-2 rounded-xl transition-all", view === 'CARD' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}><LayoutGrid size={18} /></button>
             <button onClick={() => setView('TABLE')} className={cn("p-2 rounded-xl transition-all", view === 'TABLE' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}><List size={18} /></button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95 shrink-0"
          >
            <Plus size={18} strokeWidth={3} /> Tambah Donatur
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px] group text-left">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama atau email donatur..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50" 
          />
        </div>
      </div>

      {view === 'CARD' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 animate-pulse h-48"></div>)
          ) : donors?.length > 0 ? (
            donors.map((donor: any) => (
              <div key={donor.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:border-teal-100 text-left relative overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 tracking-tight text-lg group-hover:text-teal-600 transition-colors line-clamp-1">{donor.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold">ID #{donor.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 transition-opacity">
                    <button onClick={() => handleOpenDetail(donor)} className="p-2 text-slate-400 hover:text-teal-600"><Eye size={16} /></button>
                    <button onClick={() => handleOpenModal(donor)} className="p-2 text-slate-400 hover:text-slate-800"><Edit size={16} /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Total donasi</p>
                      <p className="font-black text-slate-800 text-sm tracking-tight">{formatIDR(donor.total_donated)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Frekuensi</p>
                      <p className="font-black text-slate-800 text-sm tracking-tight">{donor.donation_count}x Transaksi</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Mail size={14} className="text-slate-300" />
                      <span className="truncate">{donor.email || 'Email Tidak Tersedia'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Phone size={14} className="text-slate-300" />
                      <span>{donor.phone || 'Nomor Tidak Tersedia'}</span>
                    </div>
                  </div>

                  <button onClick={() => handleOpenDetail(donor)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 text-xs font-black text-slate-600 hover:bg-slate-800 hover:text-white transition-all active:scale-95 mt-4 group/btn">
                    Lihat profil lengkap <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 italic">No donors found.</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold">
                  <th className="px-6 py-4 border-b border-slate-100 font-black w-12 text-center">#</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-black">Donatur</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-black">Kontak</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-black">Total Donasi</th>
                  <th className="px-6 py-4 border-b border-slate-100 font-black">Frekuensi</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-center font-black">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [...Array(10)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 px-6 py-4"></td></tr>)
                ) : donors?.length > 0 ? (
                  donors.map((donor: any, idx: number) => (
                    <tr key={donor.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 border-b border-slate-50 text-center text-xs font-bold text-slate-400 bg-slate-50/20">
                        {offset + idx + 1}
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                               {donor.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 text-sm">{donor.name}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-800 tracking-tight text-sm">{donor.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{donor.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className="font-semibold text-slate-800 text-sm tracking-tight">{formatIDR(donor.total_donation)}</span>
                      </td>
                      <td className="px-6 py-5 text-left text-xs font-black text-slate-500">
                        {donor.donation_count} Transaksi
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-1 transition-opacity">
                          <button onClick={() => handleOpenDetail(donor)} className="p-2 text-slate-400 hover:text-teal-600"><Eye size={18} /></button>
                          <button onClick={() => handleOpenModal(donor)} className="p-2 text-slate-400 hover:text-slate-800"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(donor.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No donors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
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
              const pageNum = i + 1;
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Profil Donatur</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="text-left text-slate-800">
                  <label className="block text-[10px] font-bold text-slate-500 mb-2">Nama lengkap</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500 transition-all font-sans" placeholder="Nama lengkap..." />
              </div>
              <div className="text-left text-slate-800">
                  <label className="block text-[10px] font-bold text-slate-500 mb-2">Email</label>
                <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-normal text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-teal-500 transition-all font-sans" placeholder="Email donatur..." />
              </div>
              <div className="text-left text-slate-800">
                <label className="block text-[10px] font-bold text-slate-500 mb-2">Nomor WhatsApp/HP</label>
                <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-normal text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-teal-500 transition-all font-sans" placeholder="Cth: 0812..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-6 rounded-2xl text-sm font-black text-slate-400 hover:bg-slate-50 transition-all font-sans">Batal</button>
                <button disabled={isSubmitting} className="flex-[2] bg-teal-600 text-white py-4 px-6 rounded-2xl text-sm font-black shadow-xl shadow-teal-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 font-sans">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedDonor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 text-left">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Detail Donatur</h2>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-8">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                   <User size={40} strokeWidth={1.5} />
                 </div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedDonor.name}</h3>
                   <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Mail size={12} /> {selectedDonor.email || 'No email'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Phone size={12} /> {selectedDonor.phone || 'No phone'}
                      </div>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm mb-3">
                      <DollarSign size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mb-1">Total terkumpul</p>
                    <p className="text-lg font-black text-slate-800 leading-none">{formatIDR(selectedDonor.total_donated)}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm mb-3">
                      <Activity size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mb-1">Frekuensi</p>
                    <p className="text-lg font-black text-slate-800 leading-none">{selectedDonor.donation_count}x</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm mb-3">
                      <Calendar size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mb-1">Terdaftar</p>
                    <p className="text-base font-black text-slate-800 leading-none">{formatDate(selectedDonor.created_at)}</p>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button onClick={() => { setIsDetailOpen(false); handleOpenModal(selectedDonor); }} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all font-sans">Edit profil</button>
                  <button onClick={() => setIsDetailOpen(false)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-xl active:scale-95 transition-all font-sans">Tutup</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
