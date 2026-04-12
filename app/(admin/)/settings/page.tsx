"use client";

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { 
  Settings as SettingsIcon, Globe, Shield, Bell, 
  Palette, Save, Image as ImageIcon, Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { data: config, isLoading } = useSWR('/api/ngo-config', fetcher);
  const [formData, setFormData] = useState({
    ngo_name: '',
    short_description: '',
    address: '',
    primary_color: '#1086b1',
    logo_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config && !isLoading) {
      setFormData({
        ngo_name: config.ngo_name || '',
        short_description: config.short_description || '',
        address: config.address || '',
        primary_color: config.primary_color || '#1086b1',
        logo_url: config.logo_url || ''
      });
    }
  }, [config, isLoading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/ngo-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        mutate('/api/ngo-config');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight text-premium">Pengaturan Organisasi</h1>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Konfigurasi Identitas & Visual Sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs Placeholder */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'Umum', icon: Globe, active: true },
            { id: 'appearance', label: 'Tampilan', icon: Palette },
            { id: 'notifications', label: 'Notifikasi', icon: Bell },
            { id: 'security', label: 'Keamanan', icon: Shield },
          ].map(tab => (
            <button key={tab.id} className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
              tab.active ? "bg-white shadow-sm text-teal-600 border border-slate-100" : "text-slate-400 hover:text-slate-600"
            )}>
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            {/* Identity */}
            <section className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <SettingsIcon size={20} className="text-teal-500" />
                Identitas NGO
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nama Organisasi</label>
                  <input 
                    type="text" 
                    value={formData.ngo_name}
                    onChange={(e) => setFormData({...formData, ngo_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi Singkat</label>
                  <textarea 
                    rows={3}
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Kantor</label>
                  <textarea 
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all" 
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-50" />

            {/* Visuals */}
            <section className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Palette size={20} className="text-teal-500" />
                Tema Visual
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Warna Utama (Brand)</label>
                  <div className="flex justify-center">
                    <input 
                      type="color" 
                      value={formData.primary_color}
                      onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                      className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl cursor-pointer" 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest text-center">Logo Organisasi</label>
                   <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                      <ImageIcon size={32} />
                   </div>
                   <button className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors">Ganti Logo</button>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <div className="pt-6 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-95",
                  saved ? "bg-emerald-500 text-white" : "bg-slate-800 text-white hover:bg-slate-900"
                )}
              >
                {saved ? <Check size={18} strokeWidth={3} /> : <Save size={18} strokeWidth={3} />}
                {saved ? 'Berhasil Disimpan' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
