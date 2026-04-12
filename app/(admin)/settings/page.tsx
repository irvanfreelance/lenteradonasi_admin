"use client";

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { 
  Settings as SettingsIcon, Globe, Shield, Bell, 
  Palette, Save, Image as ImageIcon, Check, CreditCard, Plus, Edit, Trash2, X, Loader2, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FileUpload } from '@/components/ui/file-upload';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SortablePM({ pm, onEdit }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pm.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group",
        isDragging && "shadow-2xl ring-2 ring-indigo-500/20 bg-slate-50"
      )}
    >
      <div className="flex items-center gap-4 text-left">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-600 transition-colors">
          <MoreHorizontal size={16} />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 leading-tight">{pm.name}</h4>
          <p className="text-[10px] font-medium text-slate-400">{pm.type} • Fee: {pm.admin_fee_pct}% + {pm.admin_fee_flat}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${pm.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>{pm.is_active ? 'Aktif' : 'Nonaktif'}</span>
        <button onClick={() => onEdit(pm)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit size={16} /></button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general'); // general, payment
  const { data: config, isLoading: configLoading } = useSWR('/api/ngo-config', fetcher);
  const { data: paymentMethods, mutate: mutatePM } = useSWR('/api/payment-methods', fetcher);
  
  const [formData, setFormData] = useState({
    ngo_name: '', short_description: '', address: '', primary_color: '#1086b1', logo_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // PM Modal State
  const [isPMOpen, setIsPMOpen] = useState(false);
  const [selectedPM, setSelectedPM] = useState<any>(null);
  const [pmFormData, setPMFormData] = useState({
    name: '', type: 'E-WALLET', provider: '', admin_fee_flat: 0, admin_fee_pct: 0, is_active: true
  });
  const [pmSubmitting, setPMSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handlePMDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = paymentMethods.findIndex((p: any) => p.id === active.id);
      const newIndex = paymentMethods.findIndex((p: any) => p.id === over.id);
      
      const newItems = arrayMove(paymentMethods, oldIndex, newIndex);
      mutatePM(newItems, false);

      try {
        const items = newItems.map((item: any, index: number) => ({
          id: item.id,
          sort: index
        }));
        
        const res = await fetch('/api/payment-methods/sort', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
        
        if (!res.ok) throw new Error('Failed to save sort order');
        toast.success('Urutan metode diperbarui');
      } catch (err: any) {
        toast.error(err.message);
        mutatePM();
      }
    }
  };

  useEffect(() => {
    if (config && !configLoading) {
      setFormData({
        ngo_name: config.ngo_name || '',
        short_description: config.short_description || '',
        address: config.address || '',
        primary_color: config.primary_color || '#1086b1',
        logo_url: config.logo_url || ''
      });
    }
  }, [config, configLoading]);

  const handleSaveConfig = async () => {
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
        toast.success('Pengaturan disimpan');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPM = (pm: any = null) => {
    setSelectedPM(pm);
    if (pm) {
      setPMFormData({
        name: pm.name, type: pm.type, provider: pm.provider,
        admin_fee_flat: pm.admin_fee_flat, admin_fee_pct: pm.admin_fee_pct,
        is_active: pm.is_active
      });
    } else {
      setPMFormData({ name: '', type: 'E-WALLET', provider: '', admin_fee_flat: 0, admin_fee_pct: 0, is_active: true });
    }
    setIsPMOpen(true);
  };

  const handlePMSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPMSubmitting(true);
    try {
      const method = selectedPM ? 'PATCH' : 'POST';
      const body = selectedPM ? { id: selectedPM.id, ...pmFormData } : pmFormData;
      const res = await fetch('/api/payment-methods', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save PM');
      toast.success(selectedPM ? 'Metode diperbarui' : 'Metode berhasil ditambah');
      mutatePM();
      setIsPMOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPMSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20 text-left">
      <PageHeader
        title="Pengaturan Sistem"
        description="Konfigurasi identitas & infrastruktur pembayaran"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'Umum & NGO', icon: Globe },
            { id: 'payment', label: 'Pembayaran', icon: CreditCard },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all",
              activeTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600 bg-white"
            )}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'general' ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <section className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <SettingsIcon size={20} className="text-teal-500" /> Identitas NGO
                </h3>
                <div className="space-y-5">
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Logo Organisasi</label>
                    <FileUpload
                      value={formData.logo_url}
                      onChange={(url) => setFormData({...formData, logo_url: url})}
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Nama organisasi</label>
                    <Input type="text" value={formData.ngo_name} onChange={(e) => setFormData({...formData, ngo_name: e.target.value})} />
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Deskripsi singkat</label>
                    <textarea rows={3} value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50" />
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Alamat kantor</label>
                    <textarea rows={2} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-normal text-slate-900 focus:outline-none focus:border-teal-500/50" />
                  </div>
                </div>
              </section>
              <div className="pt-6 flex justify-end">
                <Button onClick={handleSaveConfig} disabled={saving} variant={saved ? "primary" : "secondary"}>
                  {saved ? <Check size={16} /> : <Save size={16} />} {saved ? 'Tersimpan' : saving ? 'Menyimpan...' : 'Simpan perubahan'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <CreditCard size={20} className="text-indigo-500" /> Metode Pembayaran
                 </h3>
                 <button onClick={() => handleOpenPM()} className="bg-white border border-slate-100 p-2 rounded-xl text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <Plus size={20} />
                 </button>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePMDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <div className="grid grid-cols-1 gap-4">
                  <SortableContext 
                    items={paymentMethods?.map((pm: any) => pm.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    {paymentMethods?.map((pm: any) => (
                      <SortablePM key={pm.id} pm={pm} onEdit={handleOpenPM} />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            </div>
          )}
        </div>
      </div>

      {isPMOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Metode pembayaran</h2>
              <button onClick={() => setIsPMOpen(false)} className="p-2 hover:bg-white rounded-full transition-all text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handlePMSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Nama</label>
                    <Input required value={pmFormData.name} onChange={(e) => setPMFormData({...pmFormData, name: e.target.value})} />
                 </div>
                 <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Provider</label>
                    <Input required value={pmFormData.provider} onChange={(e) => setPMFormData({...pmFormData, provider: e.target.value})} />
                 </div>
              </div>
              <div className="text-left z-50 relative">
                 <label className="block text-xs font-bold text-slate-500 mb-2">Tipe</label>
                 <SearchableSelect 
                   value={pmFormData.type}
                   onChange={(val) => setPMFormData({...pmFormData, type: String(val)})}
                   options={[
                     { id: 'E-WALLET', name: 'E-WALLET' },
                     { id: 'BANK_TRANSFER', name: 'BANK_TRANSFER' },
                     { id: 'RETAIL', name: 'RETAIL' }
                   ]}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Fee (flat)</label>
                    <Input type="number" value={pmFormData.admin_fee_flat} onChange={(e) => setPMFormData({...pmFormData, admin_fee_flat: parseInt(e.target.value)})} />
                 </div>
                 <div className="text-left">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Fee (%)</label>
                    <Input type="number" step="0.1" value={pmFormData.admin_fee_pct} onChange={(e) => setPMFormData({...pmFormData, admin_fee_pct: parseFloat(e.target.value)})} />
                 </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group mt-4">
                 <input type="checkbox" checked={pmFormData.is_active} onChange={(e) => setPMFormData({...pmFormData, is_active: e.target.checked})} className="sr-only" />
                 <div className={`w-10 h-5 rounded-full transition-colors ${pmFormData.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}><div className={`w-3 h-3 bg-white rounded-full mt-1 ml-1 transition-transform ${pmFormData.is_active ? 'translate-x-5' : 'translate-x-0'}`}></div></div>
                 <span className="text-sm font-bold text-slate-600">Aktif</span>
              </label>
              <div className="pt-4">
                <Button disabled={pmSubmitting} variant="secondary" className="w-full">
                  {pmSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Simpan metode
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

