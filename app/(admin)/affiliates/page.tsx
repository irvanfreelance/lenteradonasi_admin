"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Plus, Search, Edit, Trash2, X, Save, Loader2, Heart, Mail, Phone, ExternalLink,
  LayoutGrid, List, Eye, TrendingUp, Users, DollarSign, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatIDR = (amount: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

export default function AffiliatesPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'CARD' | 'TABLE'>('CARD');
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { data: affiliates, error, isLoading, mutate } = useSWR(`/api/affiliates?limit=${limit}&offset=${offset}&search=${search}`, fetcher);

  const totalCount = affiliates?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    affiliate_code: '', name: '', email: '', phone: '', status: 'ACTIVE' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (affiliate: any = null) => {
    setSelectedAffiliate(affiliate);
    if (affiliate) {
      setFormData({ 
        affiliate_code: affiliate.affiliate_code, 
        name: affiliate.name, 
        email: affiliate.email, 
        phone: affiliate.phone || '', 
        status: affiliate.status 
      });
    } else {
      setFormData({ affiliate_code: '', name: '', email: '', phone: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const handleOpenDetail = (aff: any) => {
    setSelectedAffiliate(aff);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = selectedAffiliate ? 'PATCH' : 'POST';
      const body = selectedAffiliate ? { id: selectedAffiliate.id, ...formData } : formData;
      const res = await fetch('/api/affiliates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save affiliate');
      toast.success(selectedAffiliate ? 'Afiliasi diperbarui' : 'Afiliasi berhasil dibuat');
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    toast('Hapus afiliasi ini?', {
      action: {
        label: 'Hapus',
        onClick: async () => {
          try {
            const res = await fetch(`/api/affiliates?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Afiliasi berhasil dihapus');
            mutate();
          } catch (err: any) {
            toast.error(err.message);
          }
        }
      }
    });
  };

  if (error) return <div className="p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100 italic">Error: {error.message}</div>;

  const columns = [
    {
      header: '#',
      headerClassName: "w-12 text-center",
      className: "text-center text-xs font-bold text-slate-400 bg-slate-50/20",
      cell: (_: any, idx: number) => offset + idx + 1
    },
    {
      header: 'Afiliasi',
      cell: (aff: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 tracking-tight text-sm">{aff.name}</span>
          <span className="text-[10px] text-slate-400 font-medium">{aff.affiliate_code}</span>
        </div>
      )
    },
    {
      header: 'Kode',
      cell: (aff: any) => (
        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{aff.affiliate_code}</span>
      )
    },
    {
      header: 'Total Dana',
      cell: (aff: any) => (
        <span className="font-semibold text-slate-800 text-sm tracking-tight">{formatIDR(aff.balance)}</span>
      )
    },
    {
      header: 'Impact',
      className: "text-sm font-bold text-slate-700",
      cell: (aff: any) => `${aff.converted_donors || 0} Donatur`
    },
    {
      header: 'Status',
      className: "text-center",
      cell: (aff: any) => (
        <Badge variant={aff.status === 'ACTIVE' ? 'success' : 'secondary'}>
          {aff.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      className: "text-center",
      cell: (aff: any) => (
        <div className="flex justify-center gap-1 transition-opacity">
          <button onClick={() => handleOpenDetail(aff)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"><Eye size={18} /></button>
          <button onClick={() => handleOpenModal(aff)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all shadow-sm"><Edit size={18} /></button>
          <button onClick={() => handleDelete(aff.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manajemen Afiliasi"
        description="Kelola network fundraiser"
      >
        <div className="flex gap-3 mt-4 sm:mt-0 items-center">
          <div className="flex bg-white border border-slate-100 p-1 rounded-2xl shadow-sm">
             <button onClick={() => setView('CARD')} className={cn("p-2 rounded-xl transition-all", view === 'CARD' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}><LayoutGrid size={18} /></button>
             <button onClick={() => setView('TABLE')} className={cn("p-2 rounded-xl transition-all", view === 'TABLE' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}><List size={18} /></button>
          </div>
          <Button onClick={() => handleOpenModal()} className="shrink-0">
            <Plus size={18} strokeWidth={3} /> Tambah Afiliasi
          </Button>
        </div>
      </PageHeader>

      <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px] group text-left">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input 
            type="text" 
            placeholder="Cari nama atau kode affiliate..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10" 
          />
        </div>
      </div>

      {view === 'CARD' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-48 bg-white rounded-[2rem] animate-pulse border border-slate-100"></div>)
          ) : affiliates?.length > 0 ? (
            affiliates.map((aff: any) => (
              <div key={aff.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden text-left">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shadow-indigo-100">
                    <Heart size={24} className={cn("transition-all", "fill-indigo-50 group-hover:fill-indigo-400")} />
                  </div>
                  <Badge variant={aff.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {aff.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{aff.name}</h3>
                <p className="text-xs font-bold text-indigo-600 mb-4">Kode: {aff.affiliate_code}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Mail size={14} className="text-slate-300" /> {aff.email}
                  </div>
                  {aff.phone && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <Phone size={14} className="text-slate-300" /> {aff.phone}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 mb-1">Impact</p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{aff.converted_donors || 0} Donatur</p>
                  </div>
                  <div className="text-left border-l border-slate-50 pl-4">
                    <p className="text-[10px] font-black text-slate-400 mb-1">Raised</p>
                    <p className="text-sm font-black text-emerald-600 tracking-tight">{formatIDR(aff.raised_amount)}</p>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenDetail(aff)} className="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Eye size={16} /></button>
                  <button onClick={() => handleOpenModal(aff)} className="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Edit size={16} /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 italic">No affiliates found.</div>
          )}
        </div>
      ) : (
        <DataTable 
          columns={columns}
          data={affiliates || []}
          isLoading={isLoading}
          emptyMessage="No data found."
        />
      )}

      {/* Pagination Footer */}
      <Pagination 
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        offset={offset}
        limit={limit}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-left">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight text-left">
                {selectedAffiliate ? 'Edit afiliasi' : 'Daftar afiliasi baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1 text-left">
                  <label className="block text-xs font-bold text-slate-500 mb-2">Kode unik</label>
                  <Input required value={formData.affiliate_code} onChange={(e) => setFormData({...formData, affiliate_code: e.target.value.toUpperCase()})} placeholder="KODE_UNIK" className="font-mono" />
                </div>
                <div className="col-span-1 text-left z-50">
                  <label className="block text-xs font-bold text-slate-500 mb-2">Status</label>
                  <SearchableSelect 
                    value={formData.status}
                    onChange={(val) => setFormData({...formData, status: String(val)})}
                    options={[
                      { id: 'ACTIVE', name: 'Aktif' },
                      { id: 'INACTIVE', name: 'Nonaktif' }
                    ]}
                  />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-2">Nama lengkap</label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nama lengkap..." />
              </div>
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-2">Email</label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email agent..." />
              </div>
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-2">WhatsApp / telepon</label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="08xxxxxxxx" />
              </div>
              <div className="pt-4 flex gap-3 text-left">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Batal</Button>
                <Button disabled={isSubmitting} className="flex-[2] bg-indigo-600 hover:bg-indigo-700">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan agent
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedAffiliate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 text-left">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Detail performa afiliasi</h2>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-8">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                   <Users size={40} strokeWidth={1.5} />
                 </div>
                 <div className="text-left">
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{selectedAffiliate.name}</h3>
                   <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">Kode: {selectedAffiliate.affiliate_code}</span>
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[9px] font-black border",
                        selectedAffiliate.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                      )}>{selectedAffiliate.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}</span>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm mb-4">
                      <TrendingUp size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 mb-1">Total impact</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter">{selectedAffiliate.converted_donors || 0} <span className="text-xs text-slate-400 font-bold ml-1">Donatur</span></p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm mb-4">
                      <DollarSign size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 mb-1">Dana terkumpul</p>
                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">{formatIDR(selectedAffiliate.raised_amount)}</p>
                  </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 text-left">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 text-[10px] flex items-center gap-2"><Mail size={12} /> Email</span>
                    <span className="font-bold text-slate-700">{selectedAffiliate.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 text-[10px] flex items-center gap-2"><Phone size={12} /> WhatsApp</span>
                    <span className="font-bold text-slate-700">{selectedAffiliate.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 text-[10px] flex items-center gap-2"><Calendar size={12} /> Bergabung</span>
                    <span className="font-bold text-slate-700">{new Date(selectedAffiliate.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
               </div>

               <div className="flex gap-3 pt-2 text-left">
                  <Button onClick={() => { setIsDetailOpen(false); handleOpenModal(selectedAffiliate); }} variant="outline" className="flex-1">Edit agent</Button>
                  <Button onClick={() => setIsDetailOpen(false)} variant="secondary" className="flex-1">Tutup</Button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
