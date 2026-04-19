"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  History, Terminal, Search, Activity, Share2, MessageCircle, CreditCard, ExternalLink, 
  ChevronRight, ChevronLeft, Eye, X, Calendar, Hash, Globe, ShieldCheck, AlertCircle,
  Smartphone, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Pagination } from '@/components/shared/pagination';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState('payment'); // payment, notification, ads
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const offset = (page - 1) * limit;

  const { data: logs, error, isLoading } = useSWR(
    `/api/logs?type=${activeTab}&limit=${limit}&offset=${offset}&search=${search}`, 
    fetcher
  );

  const totalCount = logs?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const handleOpenDetail = (log: any) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const tabs = [
    { id: 'payment', label: 'Payment Logs', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'notification', label: 'Notification Logs', icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'ads', label: 'Ads Conversion', icon: Share2, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (error) return <div className="p-8 text-rose-500 font-normal bg-rose-50 rounded-2xl border border-rose-100 italic">Error: {error.message}</div>;

  return (activeTab &&
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Log sistem</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Audit trail & monitoring api</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari aktivitas..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500/50" 
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-1 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-800/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 text-left">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Terminal size={14} className="text-emerald-500" />
            </div>
            <span className="text-[10px] font-normal text-slate-400">
              {activeTab} output stream
            </span>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[9px] font-normal text-emerald-500/80">Live stream</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[9px] font-semibold">
                <th className="px-6 py-4 border-b border-slate-800 w-12 text-center text-slate-600">#</th>
                <th className="px-6 py-4 border-b border-slate-800">Timestamp</th>
                {activeTab === 'payment' && <th className="px-6 py-4 border-b border-slate-800">Invoice Code</th>}
                {activeTab === 'notification' && <th className="px-6 py-4 border-b border-slate-800">Recipient</th>}
                {activeTab === 'ads' && <th className="px-6 py-4 border-b border-slate-800">Campaign</th>}
                <th className="px-6 py-4 border-b border-slate-800">Status</th>
                <th className="px-6 py-4 border-b border-slate-800">Activity</th>
                <th className="px-6 py-4 border-b border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px] leading-relaxed">
              {isLoading ? (
                [...Array(limit)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={7} className="px-6 py-4 border-b border-slate-800 h-12 bg-slate-800/10"></td></tr>)
              ) : logs?.length > 0 ? (
                logs.map((log: any, idx: number) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 border-b border-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-center text-slate-700 font-medium">{offset + idx + 1}</td>
                    <td className="px-6 py-4 text-emerald-500/70 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    {activeTab === 'payment' && <td className="px-6 py-4 text-slate-300 font-medium">{log.invoice_code}</td>}
                    {activeTab === 'notification' && <td className="px-6 py-4 text-slate-300 font-medium">{log.recipient || 'N/A'}</td>}
                    {activeTab === 'ads' && <td className="px-6 py-4 text-slate-300 font-medium tracking-tight">{log.campaign_id || 'DEFAULT'}</td>}
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[9px] font-medium tracking-widest border border-current",
                         (log.http_status === 200 || log.status === 'SUCCESS' || log.status === 'DONE') ? "bg-emerald-500/5 text-emerald-500/80" : "bg-rose-500/5 text-rose-500/80"
                       )}>
                         {activeTab === 'payment' ? `HTTP ${log.http_status}` : (log.status || 'LOGGING')}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-slate-500 truncate max-w-[200px] block">
                         {activeTab === 'payment' ? log.endpoint : (activeTab === 'notification' ? `${log.channel} / ${log.event_name}` : log.platform)}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenDetail(log)} className="text-[10px] font-medium text-slate-600 hover:text-white transition-colors flex items-center gap-1 ml-auto group-hover:bg-slate-800 p-2 rounded-lg">
                        Lihat data <ExternalLink size={12} className="opacity-50" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-700 italic">No logs found for this stream.</td></tr>
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

      {/* Detail Modal */}
      {isDetailOpen && selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-800/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-800 w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg">
                    <Activity size={20} className="text-emerald-500" />
                 </div>
                 <div className="text-left font-sans">
                   <h2 className="text-xl font-normal text-white tracking-tight leading-none">Log metadata</h2>
                   <p className="text-[10px] font-normal text-slate-500 mt-1.5 opacity-60">System audit trail stream</p>
                 </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-8 text-left font-sans">
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-800/50 group hover:border-emerald-500/20 transition-colors">
                    <p className="text-[10px] font-normal text-slate-600 mb-2 flex items-center gap-1.5"><Calendar size={12}/> Event timestamp</p>
                    <p className="text-sm font-normal text-emerald-500 group-hover:text-emerald-400 transition-colors">{new Date(selectedLog.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-800/50 group hover:border-blue-500/20 transition-colors">
                    <p className="text-[10px] font-normal text-slate-600 mb-2 flex items-center gap-1.5"><Hash size={12}/> Log reference id</p>
                    <p className="text-sm font-normal text-blue-400 transition-colors group-hover:text-blue-300">#LOG-{selectedLog.id}</p>
                  </div>
               </div>

               <div className="space-y-4 font-sans font-bold">
                  <div className="flex justify-between items-center p-5 bg-slate-800/10 rounded-2xl border border-slate-800/30">
                     <span className="text-[10px] font-normal text-slate-500 flex items-center gap-2"><Globe size={14}/> Service / target</span>
                     <span className="text-xs font-normal text-slate-300 underline decoration-emerald-500/50 underline-offset-4">{activeTab === 'payment' ? selectedLog.endpoint : (activeTab === 'notification' ? selectedLog.channel : selectedLog.platform)}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-slate-800/10 rounded-2xl border border-slate-800/30 font-sans">
                     <span className="text-[10px] font-normal text-slate-500 flex items-center gap-2"><AlertCircle size={14}/> Operational status</span>
                     <span className={cn(
                       "px-3 py-1 rounded-full text-[10px] font-normal shadow-lg font-sans",
                       (selectedLog.http_status === 200 || selectedLog.status === 'SUCCESS' || selectedLog.status === 'DONE') ? "bg-emerald-500 text-slate-900 border-emerald-400" : "bg-rose-500 text-white border-rose-400"
                     )}>
                       {activeTab === 'payment' ? `HTTP ${selectedLog.http_status}` : (selectedLog.status || 'PROCESSED')}
                     </span>
                  </div>
               </div>

               <div className="bg-slate-800/20 p-8 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden group font-sans">
                  <div className="absolute top-0 right-0 p-6 text-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                    <History size={120} strokeWidth={1} />
                  </div>
                  <div className="relative z-10 text-left font-sans">
                    <p className="text-[10px] font-normal text-slate-500 mb-4">Response payload data</p>
                    <div className="font-mono text-[10px] text-emerald-500/90 leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar italic font-sans font-normal font-sans">
                      <div className="p-4 bg-black/40 rounded-xl border border-slate-800/50 whitespace-pre-wrap break-all shadow-inner font-sans">
                        {selectedLog.raw_response || selectedLog.metadata || selectedLog.message || JSON.stringify(selectedLog, null, 2)}
                      </div>
                    </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-2 font-sans">
                  <button onClick={() => setIsDetailOpen(false)} className="w-full py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-normal shadow-2xl active:scale-95 transition-all hover:bg-slate-100 font-sans">Tutup</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
