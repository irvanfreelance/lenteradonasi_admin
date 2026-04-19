"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Search, Filter, Download,
  CheckCircle, Trash2, Eye, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SearchableSelect } from '@/components/ui/searchable-select';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { toast } from 'sonner';
import { Pagination } from '@/components/shared/pagination';
import { formatIDR } from '@/lib/format';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// ─── Default / initial filter values ───────────────────────────────────────
const DEFAULT_FILTERS = {
  startDate:  '2026-01-01',
  endDate:    '2026-12-31',
  minAmount:  '',
  maxAmount:  '',
  campaignId: '' as string | number,
  status:     'ALL',
  search:     '',
};

type Filters = typeof DEFAULT_FILTERS;

// ─── Page Component ─────────────────────────────────────────────────────────
export default function TransactionsPage() {
  // draft  = values user is currently editing inside the filter panel
  const [draft,   setDraft]   = useState<Filters>({ ...DEFAULT_FILTERS });
  // applied = values that actually drive the SWR query (committed on button click)
  const [applied, setApplied] = useState<Filters>({ ...DEFAULT_FILTERS });

  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(10);
  const offset = (page - 1) * limit;
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Lightweight campaign list for the dropdown
  const { data: campaignOptions } = useSWR<{ id: number; title: string }[]>(
    '/api/campaigns?minimal=true&status=ACTIVE',
    fetcher,
    { revalidateOnFocus: false }
  );

  // How many applied filters deviate from the default
  const activeFilterCount = [
    applied.startDate  !== DEFAULT_FILTERS.startDate,
    applied.endDate    !== DEFAULT_FILTERS.endDate,
    applied.minAmount  !== '',
    applied.maxAmount  !== '',
    applied.campaignId !== '',
    applied.status     !== 'ALL',
    applied.search     !== '',
  ].filter(Boolean).length;

  const queryParams = new URLSearchParams({
    limit:     limit.toString(),
    offset:    offset.toString(),
    status:    applied.status,
    search:    applied.search,
    startDate: new Date(applied.startDate).toISOString(),
    endDate:   new Date(applied.endDate).toISOString(),
    ...(applied.minAmount  && { minAmount:  String(applied.minAmount)  }),
    ...(applied.maxAmount  && { maxAmount:  String(applied.maxAmount)  }),
    ...(applied.campaignId && { campaignId: String(applied.campaignId) }),
  });

  const { data: transactions, error, isLoading, mutate } = useSWR(
    `/api/transactions?${queryParams.toString()}`,
    fetcher
  );

  const totalCount = transactions?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  if (error) return (
    <div className="p-8 text-rose-500 font-semibold bg-rose-50 rounded-2xl border border-rose-100 italic">
      Error: {error.message}
    </div>
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleApplyFilters = () => {
    setApplied({ ...draft });
    setPage(1);
  };

  const handleResetFilters = () => {
    const clean = { ...DEFAULT_FILTERS };
    setDraft(clean);
    setApplied(clean);
    setPage(1);
  };

  const removeChip = (key: keyof Filters, defaultVal: string | number) => {
    setApplied(a => ({ ...a, [key]: defaultVal }));
    setDraft(d => ({ ...d, [key]: defaultVal }));
    setPage(1);
  };

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
            const res = await fetch(
              `/api/transactions?id=${id}&created_at=${created_at}`,
              { method: 'DELETE' }
            );
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-normal text-slate-800 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Laporan ledger &amp; donasi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-normal transition-all shadow-sm border relative",
              isFilterOpen
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
            )}
          >
            <Filter size={18} />
            {isFilterOpen ? 'Tutup Filter' : 'Advanced Filter'}
            {/* Badge: active filter count */}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-normal text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* ── Advanced Filter Panel ── */}
      {isFilterOpen && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible animate-in slide-in-from-top-2 duration-300">

          {/* Panel header */}
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700 tracking-tight">Advanced Filter</p>
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {activeFilterCount} filter aktif
              </span>
            )}
          </div>

          <div className="p-6 space-y-5">

            {/* Row 1 — Date range + amount */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Tanggal Mulai</label>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft(d => ({ ...d, startDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Tanggal Akhir</label>
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft(d => ({ ...d, endDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Min. Nominal</label>
                <input
                  type="number"
                  placeholder="0"
                  value={draft.minAmount}
                  onChange={(e) => setDraft(d => ({ ...d, minAmount: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Max. Nominal</label>
                <input
                  type="number"
                  placeholder="Tak terbatas"
                  value={draft.maxAmount}
                  onChange={(e) => setDraft(d => ({ ...d, maxAmount: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 2 — Status + Campaign + Search text */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Status</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft(d => ({ ...d, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all h-12 appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PAID">Lunas</option>
                  <option value="PENDING">Pending</option>
                  <option value="EXPIRED">Kedaluwarsa</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Kampanye</label>
                <SearchableSelect
                  value={draft.campaignId}
                  onChange={(val) => setDraft(d => ({ ...d, campaignId: val }))}
                  placeholder="Semua Kampanye"
                  options={[
                    { id: '', name: 'Semua Kampanye' },
                    ...(campaignOptions ?? []).map((c) => ({ id: c.id, name: c.title }))
                  ]}
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Pencarian</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nomor invoice atau donatur..."
                    value={draft.search}
                    onChange={(e) => setDraft(d => ({ ...d, search: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all h-12"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={14} /> Reset Semua Filter
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex items-center gap-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-indigo-500/20 shadow-md"
              >
                <Search size={15} /> Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Filter Chips (visible when panel is closed) ── */}
      {!isFilterOpen && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Filter aktif:</span>

          {applied.status !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
              Status: {applied.status}
              <button onClick={() => removeChip('status', 'ALL')}><X size={11} /></button>
            </span>
          )}
          {applied.campaignId && (
            <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100">
              Kampanye: {(campaignOptions ?? []).find(c => String(c.id) === String(applied.campaignId))?.title ?? applied.campaignId}
              <button onClick={() => removeChip('campaignId', '')}><X size={11} /></button>
            </span>
          )}
          {applied.minAmount && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              Min: {formatIDR(Number(applied.minAmount))}
              <button onClick={() => removeChip('minAmount', '')}><X size={11} /></button>
            </span>
          )}
          {applied.maxAmount && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
              Max: {formatIDR(Number(applied.maxAmount))}
              <button onClick={() => removeChip('maxAmount', '')}><X size={11} /></button>
            </span>
          )}
          {applied.search && (
            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
              Cari: &quot;{applied.search}&quot;
              <button onClick={() => removeChip('search', '')}><X size={11} /></button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors ml-1"
          >
            Hapus semua
          </button>
        </div>
      )}

      {/* ── Transactions Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-semibold">
                <th className="px-6 py-4 border-b border-slate-100 font-normal w-12 text-center">#</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Waktu &amp; Kode</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Donatur</th>
                <th className="px-6 py-4 border-b border-slate-100 font-normal">Nominal</th>
                <th className="px-6 py-4 border-b border-slate-100 font-bold">Metode &amp; Kampanye</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center font-bold">Status</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(limit)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="h-16 px-6 py-4" />
                  </tr>
                ))
              ) : transactions?.length > 0 ? (
                transactions.map((trx: any, idx: number) => (
                  <tr
                    key={trx.id}
                    onMouseEnter={() => router.prefetch(`/transactions/${trx.invoice_code}`)}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5 border-b border-slate-50 text-center text-xs font-normal text-slate-400 bg-slate-50/20">
                      {offset + idx + 1}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-normal text-slate-800">{trx.invoice_code}</span>
                        <span className="text-[10px] text-slate-400 font-normal mt-1 tracking-tight">{formatDate(trx.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-800 text-sm text-left">{trx.donor_name_snapshot}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="font-normal text-slate-800 text-sm tracking-tight">{formatIDR(trx.total_amount)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-normal text-teal-600">{trx.payment_method}</span>
                        <span className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                          {trx.campaigns?.map((c: any) => c.title).join(', ') || 'No campaign'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-normal border shadow-sm",
                        trx.status === 'PAID'      ? "bg-teal-50 text-teal-700 border-teal-100"   :
                        trx.status === 'PENDING'   ? "bg-amber-50 text-amber-700 border-amber-100" :
                        trx.status === 'EXPIRED'   ? "bg-slate-50 text-slate-400 border-slate-100" :
                                                     "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        {trx.status === 'PAID' ? 'Lunas' : trx.status === 'PENDING' ? 'Pending' : trx.status === 'EXPIRED' ? 'Kedaluwarsa' : 'Batal'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleUpdateStatus(trx.id, trx.created_at, 'PAID')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Mark as Paid">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleDelete(trx.id, trx.created_at)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                        <button onClick={() => router.push(`/transactions/${trx.invoice_code}`)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all" title="Detail Transaksi">
                          <Eye size={18} />
                        </button>
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          offset={offset}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
