'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingDown, ArrowLeft, FlaskConical, Plus } from 'lucide-react';
import FermentationCharts from '@/components/FermentationCharts';
import { getStoredBatches } from '@/lib/storage';
import { Batch } from '@/types';

export default function AnalyticsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    setBatches(getStoredBatches());
    const handler = () => {
      setBatches(getStoredBatches());
    };
    window.addEventListener('kombumate_batches_updated', handler);
    return () => window.removeEventListener('kombumate_batches_updated', handler);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-950 font-serif flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-amber-600" /> Štatistiky & Fermentačné Grafy
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Podrobný prehľad spotreby cukru, dynamiky pH, ideálnej teploty a harmonogramu kvasenia.
            </p>
          </div>
        </div>

        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow transition"
        >
          <Plus className="w-4 h-4" /> Nové Kvasenie z Kalkulačky
        </Link>
      </div>

      {/* Main Interactive Charts Component */}
      <FermentationCharts
        allBatches={batches}
        title="Biochemický Priebeh Fermentácie Kombuchy"
        subtitle="Interaktívny graf: prepínajte medzi poklesom cukru (°Brix), krivkou pH a teplotným profilom."
      />
    </div>
  );
}
