'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FlaskConical, Plus, Search, Filter, Calendar, ArrowRight } from 'lucide-react';
import { INITIAL_BATCHES } from '@/lib/sampleData';
import { Batch } from '@/types';
import { STATE_BADGE_COLORS, STATE_LABELS, calculateDaysFermenting, evaluateBatchState } from '@/lib/fermentationEngine';

export default function BatchesListPage() {
  const [batches] = useState<Batch[]>(INITIAL_BATCHES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('ALL');

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.codeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterState === 'ALL') return matchesSearch;
    if (filterState === 'ACTIVE') return matchesSearch && !['COMPLETED', 'DISCARDED'].includes(b.state);
    if (filterState === 'COMPLETED') return matchesSearch && b.state === 'COMPLETED';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 font-serif flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-amber-600" /> Všetky Várky Kombuchy
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Prehľad aktívnych aj ukončených váriek, ochutnávok a fermentačnej histórie.
          </p>
        </div>

        <Link
          href="/batches/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow transition"
        >
          <Plus className="w-4 h-4" /> Založiť Novú Várku
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-300 w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Hľadať podľa kódov/názvu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs bg-transparent outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Filtrovať:</span>
          <button
            onClick={() => setFilterState('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterState === 'ALL' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-gray-700 hover:bg-emerald-100'
            }`}
          >
            Všetky
          </button>
          <button
            onClick={() => setFilterState('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterState === 'ACTIVE' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-gray-700 hover:bg-emerald-100'
            }`}
          >
            Aktívne
          </button>
          <button
            onClick={() => setFilterState('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterState === 'COMPLETED' ? 'bg-emerald-900 text-white font-bold' : 'bg-white text-gray-700 hover:bg-emerald-100'
            }`}
          >
            Ukončené
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBatches.map((batch) => {
          const evaluatedState = evaluateBatchState(batch);
          const days = calculateDaysFermenting(batch.startDate);
          const colors = STATE_BADGE_COLORS[evaluatedState];

          return (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-5 space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {batch.codeNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {STATE_LABELS[evaluatedState]}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 font-serif mt-1">{batch.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Doba fermentácie</span>
                  <span className="text-xs font-bold text-emerald-900 font-mono">{days} dň.</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl text-center">
                <div>
                  <span className="text-gray-400 text-[10px] block">Objem</span>
                  <span className="font-bold text-emerald-950 font-mono">{batch.volumeLiters} L</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Cukor</span>
                  <span className="font-bold text-emerald-950 font-mono">{batch.sugarGram} g</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Čaj</span>
                  <span className="font-bold text-emerald-950 font-mono">{batch.teaGram} g</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Začiatok: {new Date(batch.startDate).toLocaleDateString('sk-SK')}
                </span>
                <Link
                  href={`/batches/${batch.id}`}
                  className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg"
                >
                  Detail & Záznamy <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
