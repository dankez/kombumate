'use client';

import { useState } from 'react';
import { ShieldAlert, Plus, Sparkles, HeartHandshake, RefreshCw, Calendar } from 'lucide-react';
import { INITIAL_SCOBIES } from '@/lib/sampleData';
import { ScobyRecord } from '@/types';

export default function ScobyPage() {
  const [scobies, setScobies] = useState<ScobyRecord[]>(INITIAL_SCOBIES);

  const handleFeedHotel = () => {
    alert('Hotel bol nakŕmený čerstvým sladeným čajom! Dátum kŕmenia bol aktualizovaný.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 font-serif flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-teal-700" /> SCOBY Hotel & Správa Kultúr
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Udržiavajte záložné materské kultúry v bezpečí, evidujte generácie a plánujte kŕmenie.
          </p>
        </div>

        <button
          onClick={handleFeedHotel}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow transition"
        >
          <RefreshCw className="w-4 h-4" /> Nakŕmiť Hotel Čajom
        </button>
      </div>

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
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {s.healthStatus}
              </span>
            </div>

            <p className="text-xs text-gray-600">{s.notes}</p>

            <div className="text-[11px] text-gray-500 space-y-1 bg-emerald-50/50 p-2.5 rounded-xl">
              <div className="flex justify-between">
                <span>Založený v hoteli:</span>
                <span className="font-mono font-bold">{new Date(s.hotelStartDate).toLocaleDateString('sk-SK')}</span>
              </div>
              {s.lastUsedDate && (
                <div className="flex justify-between">
                  <span>Naposledy použitá:</span>
                  <span className="font-mono font-bold">{new Date(s.lastUsedDate).toLocaleDateString('sk-SK')}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
