'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Plus,
  Flame,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Thermometer,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { Batch, Recipe, ScobyRecord } from '@/types';
import { STATE_BADGE_COLORS, STATE_LABELS, calculateDaysFermenting, evaluateBatchState } from '@/lib/fermentationEngine';

interface DashboardProps {
  initialBatches: Batch[];
  initialRecipes: Recipe[];
  initialScobies: ScobyRecord[];
}

export default function Dashboard({ initialBatches, initialRecipes, initialScobies }: DashboardProps) {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);

  const activeBatches = batches.filter(
    (b) => !['COMPLETED', 'DISCARDED'].includes(b.state)
  );

  // Alerts logic
  const urgentAlerts = activeBatches.filter((b) => {
    const evaluated = evaluateBatchState(b);
    return ['READY_TO_TASTE', 'OVERDUE_FOR_CHECK', 'READY_TO_CHILL', 'READY_TO_BOTTLE'].includes(evaluated);
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl">
          🍃
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
            <Sparkles className="w-4 h-4" /> Domáca Remeselná Varňa
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif mb-2">
            Kombucha Hub – Vaša Fermentácia pod Kontrolou
          </h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            Sledujte priebeh prvej a druhej fermentácie, nezabudnite na degustácie, prepočítajte ingrediencie pre 3-4L nádoby a udržiavajte zdravý SCOBY hotel.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/batches/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm shadow-md transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" /> Založiť Novú Várku
            </Link>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-semibold text-sm border border-emerald-600 transition"
            >
              <BookOpen className="w-4 h-4" /> Kalkulačka & Recepty
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Status Bar Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-emerald-900/10 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Aktívne Várky</div>
            <div className="text-xl font-extrabold text-emerald-950 font-mono">{activeBatches.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-900/10 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Upozornenia & Kontroly</div>
            <div className="text-xl font-extrabold text-amber-900 font-mono">{urgentAlerts.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-900/10 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">SCOBY Hotel</div>
            <div className="text-xl font-extrabold text-teal-950 font-mono">{initialScobies.length} kultúry</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-900/10 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-sky-100 text-sky-800 rounded-xl">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Priemerná Teplota</div>
            <div className="text-xl font-extrabold text-sky-950 font-mono">23.8 °C</div>
          </div>
        </div>
      </div>

      {/* Urgent Action Banner */}
      {urgentAlerts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
            Vyžaduje sa Vaša pozornosť ({urgentAlerts.length})
          </div>
          <div className="grid gap-3">
            {urgentAlerts.map((batch) => {
              const days = calculateDaysFermenting(batch.startDate);
              return (
                <div
                  key={batch.id}
                  className="bg-white p-3.5 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {batch.codeNumber}
                    </span>
                    <h4 className="font-bold text-emerald-950 text-sm inline-block ml-2">{batch.name}</h4>
                    <p className="text-xs text-amber-800">
                      Várka je vo fermentácii <span className="font-bold">{days} dní</span>. Odporúča sa spraviť ochutnávku alebo skontrolovať tlak vo fľašiach.
                    </p>
                  </div>
                  <Link
                    href={`/batches/${batch.id}`}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs transition"
                  >
                    Ochutnať / Spravovať &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Batches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-emerald-950 font-serif flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-600" /> Prebiehajúce Várky ({activeBatches.length})
            </h2>
            <Link href="/batches" className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline">
              Zobraziť všetky
            </Link>
          </div>

          {activeBatches.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center space-y-3">
              <FlaskConical className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-700">Nemáte žiadne aktívne várky</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Pripravte si čerstvý čaj, pridajte cukor a začnite svoju novú kombucha várku s naším asistentom.
              </p>
              <Link
                href="/batches/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" /> Založiť novú várku
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeBatches.map((batch) => {
                const evaluatedState = evaluateBatchState(batch);
                const days = calculateDaysFermenting(batch.startDate);
                const colors = STATE_BADGE_COLORS[evaluatedState];

                return (
                  <div
                    key={batch.id}
                    className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-5 space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {batch.codeNumber}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {STATE_LABELS[evaluatedState]}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-emerald-950 font-serif mt-1">{batch.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Trvanie</div>
                        <div className="text-sm font-bold text-emerald-900 font-mono">{days} dň.</div>
                      </div>
                    </div>

                    {/* Batch Metrics Quick Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#fcfbf8] p-3 rounded-xl border border-amber-900/5">
                      <div>
                        <span className="text-gray-400 block">Objem</span>
                        <span className="font-bold text-emerald-950 font-mono">{batch.volumeLiters} L</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Čaj</span>
                        <span className="font-bold text-emerald-950">{batch.teaType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Posledné pH</span>
                        <span className="font-bold text-emerald-950 font-mono">
                          {batch.measurements[0]?.ph ? batch.measurements[0].ph.toFixed(1) : '–'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Teplota</span>
                        <span className="font-bold text-emerald-950 font-mono">
                          {batch.measurements[0]?.temperature ? `${batch.measurements[0].temperature} °C` : '23 °C'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Plánovaná degustácia: <span className="font-semibold text-gray-700">{new Date(batch.targetTasteDate).toLocaleDateString('sk-SK')}</span>
                      </div>

                      <Link
                        href={`/batches/${batch.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Otvoriť detail a záznamy <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): SCOBY & Quick Tools */}
        <div className="space-y-6">
          {/* SCOBY Hotel Card */}
          <div className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif font-extrabold text-emerald-950 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-700" /> SCOBY Hotel & Zásoby
              </h3>
              <Link href="/scoby" className="text-xs text-emerald-700 font-bold hover:underline">
                Spravovať
              </Link>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Váš domáci hotel pre záložné materské kultúry. Pravidelné prikŕmenie chráni kultúry pred vyschnutím a udržiava vysokú aciditu.
            </p>

            <div className="space-y-2">
              {initialScobies.map((scoby) => (
                <div key={scoby.id} className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">{scoby.name}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">Generácia {scoby.generation} • {scoby.healthStatus}</span>
                  </div>
                  <span className="text-xs bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    Zdravá
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/scoby"
              className="block text-center text-xs font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 py-2 rounded-xl transition"
            >
              + Pridať novú kultúru do hotela
            </Link>
          </div>

          {/* Quick Recipe Recommendation */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base">
              <Sparkles className="w-5 h-5 text-amber-600" /> Odporúčaná 2F Príchuť
            </div>
            <p className="text-xs text-amber-950/80 leading-relaxed">
              <strong>Zázvor & Čerstvé Maliny:</strong> Pre 3.5L várku stočenú do 0.5L fliaš pridajte do každej fľaše 25g malín a 10g nastrúhaného zázvoru. Už za 3 dni získate bohatú penu a perlenie.
            </p>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-950 underline pt-1"
            >
              Prejsť do Receptára a Kalkulačky &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
