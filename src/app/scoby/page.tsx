'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Sparkles, HeartHandshake, RefreshCw, Calendar, Trash2 } from 'lucide-react';
import { ScobyRecord } from '@/types';
import { getStoredScobies, saveStoredScobies, addScoby } from '@/lib/storage';

export default function ScobyPage() {
  const [scobies, setScobies] = useState<ScobyRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [fedSuccess, setFedSuccess] = useState(false);

  useEffect(() => {
    setScobies(getStoredScobies());
    const handler = () => {
      setScobies(getStoredScobies());
    };
    window.addEventListener('kombumate_scobies_updated', handler);
    return () => window.removeEventListener('kombumate_scobies_updated', handler);
  }, []);

  const handleFeedHotel = () => {
    const now = new Date().toISOString();
    const updated = scobies.map((s) => ({
      ...s,
      lastUsedDate: now,
      notes: `${s.notes} (Nakŕmené sladeným čajom ${new Date().toLocaleDateString('sk-SK')})`,
    }));
    saveStoredScobies(updated);
    setScobies(updated);
    setFedSuccess(true);
    setTimeout(() => setFedSuccess(false), 3000);
  };

  const handleCreateScoby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addScoby(newName.trim(), newNotes.trim());
    setNewName('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleDeleteScoby = (id: string) => {
    if (confirm('Naozaj chcete odstrániť túto kultúru zo záznamov?')) {
      const updated = scobies.filter((s) => s.id !== id);
      saveStoredScobies(updated);
      setScobies(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 font-serif flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-teal-700" /> SCOBY Hotel & Správa Kultúr
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Udržiavajte záložné materské kultúry v bezpečí, evidujte generácie a plánujte pravidelné prikŕmenie.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition"
          >
            <Plus className="w-4 h-4" /> Nová Kultúra
          </button>
          <button
            onClick={handleFeedHotel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow transition"
          >
            <RefreshCw className="w-4 h-4" /> Nakŕmiť Hotel Čajom
          </button>
        </div>
      </div>

      {fedSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          Všetky kultúry v hoteli boli úspešne nakŕmené sladeným čajom! Dátum bol zaznamenaný.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scobies.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-emerald-900/10 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Gen. {s.generation}
                </span>
                <h3 className="text-base font-bold text-emerald-950 font-serif mt-1">{s.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {s.healthStatus}
                </span>
                <button
                  onClick={() => handleDeleteScoby(s.id)}
                  title="Odstrániť"
                  className="text-gray-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600">{s.notes}</p>

            <div className="text-[11px] text-gray-500 space-y-1 bg-[#fcfbf8] p-2.5 rounded-xl border border-gray-100">
              <div className="flex justify-between">
                <span>Založený v hoteli:</span>
                <span className="font-mono font-bold">{new Date(s.hotelStartDate).toLocaleDateString('sk-SK')}</span>
              </div>
              {s.lastUsedDate && (
                <div className="flex justify-between">
                  <span>Naposledy kŕmená / použitá:</span>
                  <span className="font-mono font-bold text-emerald-900">{new Date(s.lastUsedDate).toLocaleDateString('sk-SK')}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-serif font-bold text-emerald-950">Pridať Novú Kultúru do Hotela</h3>
            <form onSubmit={handleCreateScoby} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Názov kultúry:</label>
                <input
                  type="text"
                  required
                  placeholder="Napr. Dcérsky SCOBY #2"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Poznámky k stavu:</label>
                <textarea
                  rows={2}
                  placeholder="Hrúbka, farba, materský pôvod..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold shadow"
                >
                  Uložiť do Hotela
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
