"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, Edit, Share2, Users, Eye, Calendar, 
  ArrowUpRight, MessageSquare, Wallet, Clock, CheckCircle2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
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

export default function CampaignDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: campaign, error, isLoading } = useSWR(`/api/campaigns/${id}`, fetcher);
  const [activeTab, setActiveTab] = useState('transactions');

  if (isLoading) return <div className="p-8 animate-pulse space-y-8">
    <div className="h-12 w-1/3 bg-slate-100 rounded-2xl"></div>
    <div className="grid grid-cols-3 gap-6">
      <div className="h-64 bg-slate-100 rounded-[2.5rem]"></div>
      <div className="col-span-2 h-64 bg-slate-100 rounded-[2.5rem]"></div>
    </div>
  </div>;

  if (error || !campaign) return <div className="p-8 text-rose-500 font-bold">Error loading campaign</div>;

  const progress = campaign.target_amount ? Math.min((campaign.collected_amount / campaign.target_amount) * 100, 100) : 100;
  const remaining = campaign.target_amount ? Math.max(campaign.target_amount - campaign.collected_amount, 0) : 0;
  
  const daysLeft = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : '∞';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{campaign.title}</h1>
            <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-wider">
              {campaign.category_name} • {campaign.has_no_target ? 'Open Amount' : 'Target Goal'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => router.push(`/campaigns/${id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Edit size={18} /> Edit
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl text-sm font-black hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20">
            <Share2 size={18} /> Bagikan Link
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative z-10 text-center space-y-6 w-full">
            <p className="text-sm font-black text-slate-800 tracking-tight uppercase">Status Pendanaan</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pencapaian dari Target</p>
            
            <div className="relative flex justify-center py-4">
               {/* Progress Circle (Simplified SVG) */}
               <svg className="w-48 h-24 transform rotate-0" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F1F5F9" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#0D9488" strokeWidth="8" strokeLinecap="round" 
                    strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - progress/100)} 
                  />
               </svg>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-4">
                  <p className="text-4xl font-black text-slate-800 leading-none">{progress.toFixed(1)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Terkumpul</p>
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50 w-full">
              <div className="flex justify-between items-center text-left">
                <span className="text-xs font-bold text-slate-400">Terkumpul</span>
                <span className="text-sm font-black text-emerald-600">{formatIDR(campaign.collected_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-left">
                <span className="text-xs font-bold text-slate-400">Kekurangan</span>
                <span className="text-sm font-black text-rose-500">{formatIDR(remaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart & Mini Cards */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-left">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={18} /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Donatur</span>
               </div>
               <p className="text-3xl font-black text-slate-800">{campaign.donor_count?.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-left">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Eye size={18} /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Views</span>
               </div>
               <p className="text-3xl font-black text-slate-800">{campaign.views_count?.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-left">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock size={18} /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sisa Hari</span>
               </div>
               <p className="text-3xl font-black text-slate-800">{daysLeft}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 relative min-h-[300px]">
            <div className="flex justify-between items-center mb-8">
               <div className="text-left">
                 <h3 className="text-sm font-black text-slate-800 tracking-tight">Pertumbuhan Donasi</h3>
                 <p className="text-[10px] font-bold text-slate-400">7 Hari terakhir</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
                 <ArrowUpRight size={14} />
                 <span className="text-[10px] font-black">+12.5%</span>
               </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={campaign.chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94A3B8'}} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'black', color: '#1E293B' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorAmt)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 p-2">
          {[
            { id: 'transactions', label: 'Riwayat Transaksi', icon: Wallet },
            { id: 'updates', label: 'Kabar Penyaluran', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-8 py-5 text-sm font-black transition-all relative",
                activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full mx-6"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-2">
          {activeTab === 'transactions' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Tanggal</th>
                    <th className="px-8 py-4">Donatur</th>
                    <th className="px-8 py-4">Nominal</th>
                    <th className="px-8 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {campaign.transactions?.map((trx: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5 text-xs font-bold text-slate-400">{formatDate(trx.time)}</td>
                      <td className="px-8 py-5 font-black text-slate-800 text-sm">{trx.donor_name_snapshot}</td>
                      <td className="px-8 py-5 font-black text-emerald-600 text-sm">{formatIDR(trx.amount)}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                          trx.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {trx.status === 'PAID' ? 'Success' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {campaign.transactions?.length === 0 && (
                    <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 italic font-medium">Belum ada transaksi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 space-y-6">
               {campaign.updates?.map((update: any) => (
                 <div key={update.id} className="flex gap-6 text-left">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                      {update.image_url ? <img src={update.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><MessageSquare size={32} /></div>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(update.created_at)}</p>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight">{update.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2">{update.content}</p>
                    </div>
                 </div>
               ))}
               {campaign.updates?.length === 0 && (
                 <div className="text-center py-12 text-slate-400 italic">Belum ada kabar penyaluran.</div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
