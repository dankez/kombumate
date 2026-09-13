'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FlaskConical,
  Calendar,
  Thermometer,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  History,
  MessageSquare
} from 'lucide-react';
import { INITIAL_BATCHES } from '@/lib/sampleData';
import { Batch, FermentationState, Measurement } from '@/types';
import { STATE_BADGE_COLORS, STATE_LABELS, calculateDaysFermenting, transitionState } from '@/lib/fermentationEngine';

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const initialBatch = INITIAL_BATCHES.find((b) => b.id === resolvedParams.id) || INITIAL_BATCHES[0];

  const [batch, setBatch] = useState<Batch>(initialBatch);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [phInput, setPhInput] = useState<string>('3.2');
  const [tempInput, setTempInput] = useState<string>('24.0');
  const [measurementNotes, setMeasurementNotes] = useState<string>('Chuť je jemne sladkokyslá, priehľadný film na povrchu.');

  const days = calculateDaysFermenting(batch.startDate);
  const colors = STATE_BADGE_COLORS[batch.state];

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const newM: Measurement = {
      id: `m-${Date.now()}`,
      batchId: batch.id,
      timestamp: new Date().toISOString(),
      ph: parseFloat(phInput) || undefined,
      temperature: parseFloat(tempInput) || undefined,
      notes: measurementNotes,
      measuredBy: 'USER',
    };

    setBatch((prev) => ({
      ...prev,
      measurements: [newM, ...prev.measurements],
      updatedAt: new Date().toISOString(),
    }));

    setShowMeasurementModal(false);
    alert('Meranie bolo pridané!');
  };

  const handleStateChange = (newState: FermentationState) => {
    let title = `Zmena stavu: ${STATE_LABELS[newState]}`;
    let desc = `Stav bol manuálne zmenený na ${STATE_LABELS[newState]}.`;

    if (newState === 'SECOND_FERMENTATION') {
      title = 'Začatá 2. fermentácia vo fľašiach';
      desc = 'Kombucha bola stočená do fliaš s ovocím. Skontrolujte fľaše raz denne.';
    } else if (newState === 'COMPLETED') {
      title = 'Várka úspešne dokončená';
      desc = 'Kombucha bola skonzumovaná alebo presunutá do trvalého chladu.';
    }

    const updated = transitionState(batch, newState, title, desc);
    setBatch(updated);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/batches"
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {batch.codeNumber}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                {STATE_LABELS[batch.state]}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-emerald-950 font-serif mt-1">{batch.name}</h1>
          </div>
        </div>

        <button
          onClick={() => setShowMeasurementModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Pridať Meranie / Ochutnávku
        </button>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl border border-emerald-900/10 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Doba Fermentácie</span>
            <span className="text-xl font-extrabold text-emerald-950 font-mono">{days} Dní</span>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Objem Nádoby</span>
            <span className="text-xl font-extrabold text-emerald-950 font-mono">{batch.volumeLiters} L</span>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Druh Čaju</span>
            <span className="text-sm font-extrabold text-emerald-950 block mt-1">{batch.teaType}</span>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">SCOBY Kultúra</span>
            <span className="text-xs font-bold text-emerald-950 block mt-1">{batch.scobyName || 'Štandard'}</span>
          </div>
        </div>

        {/* State Manual Controls */}
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 space-y-3">
          <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" /> Posunúť Fázu Fermentácie:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStateChange('READY_TO_TASTE')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-emerald-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              Oznam Ochutnávku
            </button>
            <button
              onClick={() => handleStateChange('SECOND_FERMENTATION')}
              className="px-3 py-1.5 rounded-lg bg-purple-700 text-white font-bold text-xs hover:bg-purple-600 transition"
            >
              Začať 2. Fermentáciu (Fľaše)
            </button>
            <button
              onClick={() => handleStateChange('COMPLETED')}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 transition"
            >
              Označiť ako Dokončenú
            </button>
          </div>
        </div>

        {/* Second Fermentation Details if active */}
        {batch.secondFermentation && (
          <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 space-y-3">
            <h3 className="font-serif font-bold text-purple-950 text-base flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-700" /> Detail Druhej Fermentácie (2F)
            </h3>
            <p className="text-xs text-purple-900">
              Stočené do <span className="font-bold">{batch.secondFermentation.bottlesCount} fliaš</span> ({batch.secondFermentation.totalVolumeMl} ml celkovo).
            </p>
            <div className="bg-white/80 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-purple-950 block">Bezpečnostná kontrola tlaku:</span>
              <p className="text-purple-900 text-[11px]">
                Fľaše uchovávajte pri izbovej teplote max 2–4 dni. Pred otvorením ich presuňte do chladničky pre rozpustenie CO₂ v nápoji!
              </p>
            </div>
          </div>
        )}

        {/* Timeline Log History */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-serif font-bold text-emerald-950 text-base flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" /> Časová Os & História Udalostí
          </h3>

          <div className="relative border-l-2 border-emerald-200 ml-3 space-y-6 pl-5">
            {batch.history.map((evt) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white"></div>
                <div className="text-[11px] text-gray-400 font-mono">{new Date(evt.timestamp).toLocaleString('sk-SK')}</div>
                <h4 className="font-bold text-emerald-950 text-sm">{evt.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{evt.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Measurement Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-serif font-bold text-emerald-950">Pridať Záznam Ochutnávky & Merania</h3>

            <form onSubmit={handleAddMeasurement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Namerané pH:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="6.0"
                    value={phInput}
                    onChange={(e) => setPhInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teplota (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="40"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Poznámky k chuti / vzľadu:</label>
                <textarea
                  rows={3}
                  value={measurementNotes}
                  onChange={(e) => setMeasurementNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeasurementModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold shadow"
                >
                  Uložiť Meranie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
