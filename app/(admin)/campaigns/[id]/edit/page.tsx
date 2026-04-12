"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, Save, Loader2, X, Image as ImageIcon,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EditCampaignPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: categories } = useSWR('/api/categories', fetcher);
  const { data: campaign, isLoading: isFetching } = useSWR(`/api/campaigns/${id}`, fetcher);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        category_id: campaign.category_id,
        slug: campaign.slug,
        image_url: campaign.image_url || '',
        description: campaign.description || '',
        target_amount: campaign.target_amount || 0,
        end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
        is_zakat: campaign.is_zakat || false,
        is_qurban: campaign.is_qurban || false,
        has_no_target: campaign.has_no_target || false,
        is_urgent: campaign.is_urgent || false,
        is_verified: campaign.is_verified ?? true,
        status: campaign.status || 'ACTIVE'
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData }),
      });
      if (!res.ok) throw new Error('Failed to update campaign');
      toast.success('Kampanye berhasil diperbarui');
      router.push(`/campaigns/${id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching || !formData) return <div className="p-8 animate-pulse text-center">Loading campaign data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-800 transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-left">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Edit Kampanye</h1>
          <p className="text-sm text-slate-400 font-bold mt-1 text-left">Sesuaikan detail program penggalangan dana</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-500 mb-2 font-sans">Judul Kampanye</label>
              <input 
                required 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500/50 transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-2">Slug URL</label>
                <input 
                  required 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50 transition-all font-mono" 
                />
              </div>
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-2">Kategori</label>
                <select 
                  value={formData.category_id} 
                  onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-normal text-slate-900 bg-white outline-none focus:border-teal-500/50 transition-all"
                >
                  {categories?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-slate-500 mb-2">Deskripsi Lengkap</label>
              <textarea 
                rows={10}
                value={formData.description || ''} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50 transition-all resize-none" 
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-sm font-black text-slate-800 tracking-tight text-left">Target & Status</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-2">Target Dana (IDR)</label>
                <input 
                  type="number" 
                  disabled={formData.has_no_target}
                  value={formData.target_amount} 
                  onChange={(e) => setFormData({...formData, target_amount: parseFloat(e.target.value)})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50 transition-all disabled:opacity-50" 
                />
              </div>
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-2">Tanggal Berakhir</label>
                <input 
                  type="date" 
                  value={formData.end_date} 
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50 transition-all" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer text-left">
                <input 
                  type="checkbox" 
                  checked={formData.has_no_target} 
                  onChange={(e) => setFormData({...formData, has_no_target: e.target.checked})} 
                  className="w-5 h-5 text-teal-600 rounded-lg border-slate-200" 
                />
                <span className="text-xs font-bold text-slate-700">Terima Tanpa Batas Target</span>
              </label>
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 mx-2">Status Program</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-xs font-black text-slate-800 bg-white"
                >
                  <option value="ACTIVE">AKTIF</option>
                  <option value="INACTIVE">NONAKTIF</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-sm font-black text-slate-800 tracking-tight text-left">Cover Foto</h3>
            <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 overflow-hidden relative group">
              {formData.image_url ? (
                <>
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, image_url: ''})}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-xl text-rose-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <ImageIcon size={32} className="text-slate-300" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Image</span>
                </>
              )}
            </div>
            <input 
              value={formData.image_url || ''} 
              onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
              placeholder="URL Gambar..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500/50 transition-all" 
            />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
             <h3 className="text-sm font-black text-slate-800 tracking-tight text-left">Atribut</h3>
             {[
               { id: 'is_urgent', label: 'Darurat', icon: AlertCircle, color: 'text-rose-500' },
               { id: 'is_zakat', label: 'Zakat', icon: CheckCircle2, color: 'text-emerald-500' },
               { id: 'is_qurban', label: 'Qurban', icon: CheckCircle2, color: 'text-amber-500' },
               { id: 'is_verified', label: 'Verified', icon: CheckCircle2, color: 'text-blue-500' },
             ].map((item) => (
                <label key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className={item.color} />
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={(formData as any)[item.id]} 
                    onChange={(e) => setFormData({...formData, [item.id]: e.target.checked})} 
                    className="w-5 h-5 text-teal-600 rounded-lg border-slate-200" 
                  />
                </label>
             ))}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Perbarui Kampanye
          </button>
        </div>
      </form>
    </div>
  );
}
