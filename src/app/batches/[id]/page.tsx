'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  TrendingDown,
  Trash2,
  Droplets,
  Activity
} from 'lucide-react';
import { Batch, FermentationState, Measurement } from '@/types';
import { STATE_BADGE_COLORS, STATE_LABELS, calculateDaysFermenting, transitionState } from '@/lib/fermentationEngine';
import { getStoredBatch, updateStoredBatch, deleteStoredBatch, addMeasurementToBatch } from '@/lib/storage';
import FermentationCharts from '@/components/FermentationCharts';

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  // Measurement form state
  const [phInput, setPhInput] = useState<string>('3.2');
  const [brixInput, setBrixInput] = useState<string>('3.6');
  const [tempInput, setTempInput] = useState<string>('23.8');
  const [sweetnessInput, setSweetnessInput] = useState<number>(3);
  const [acidityInput, setAcidityInput] = useState<number>(3);
  const [measurementNotes, setMeasurementNotes] = useState<string>('Vyvážená chuť, jemné perlenie na jazyku.');

  useEffect(() => {
    const loaded = getStoredBatch(resolvedParams.id);
    if (loaded) {
      setBatch(loaded);
    }
  }, [resolvedParams.id]);

  if (!batch) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4 max-w-lg mx-auto">
        <FlaskConical className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-lg font-bold text-gray-800">Várka nebola nájdená</h2>
        <p className="text-xs text-gray-500">Táto várka mohla byť zmazaná alebo neexistuje.</p>
        <Link
          href="/batches"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs"
        >
          Späť na zoznam váriok
        </Link>
      </div>
    );
  }

  const days = calculateDaysFermenting(batch.startDate);
  const colors = STATE_BADGE_COLORS[batch.state];

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();

    const ph = parseFloat(phInput) || undefined;
    const sugarBrix = parseFloat(brixInput) || undefined;
    const temperature = parseFloat(tempInput) || undefined;
    const sugarGramPerLiter = sugarBrix ? Math.round(sugarBrix * 10) : undefined;

    const added = addMeasurementToBatch(batch.id, {
      timestamp: new Date().toISOString(),
      ph,
      sugarBrix,
      sugarGramPerLiter,
      temperature,
      sweetnessRating: sweetnessInput,
      acidityRating: acidityInput,
      notes: measurementNotes,
      measuredBy: 'USER',
    });

    if (added) {
      // Refresh local batch
      const updated = getStoredBatch(batch.id);
      if (updated) setBatch(updated);
    }

    setShowMeasurementModal(false);
  };

  const handleStateChange = (newState: FermentationState) => {
    let title = `Zmena stavu: ${STATE_LABELS[newState]}`;
    let desc = `Stav bol manuálne zmenený na ${STATE_LABELS[newState]}.`;

    if (newState === 'SECOND_FERMENTATION') {
      title = 'Začatá 2. fermentácia vo fľašiach';
      desc = 'Kombucha bola stočená do fliaš s ovocím. Kontrolujte tlak odvetraním raz denne.';
    } else if (newState === 'COMPLETED') {
      title = 'Várka úspešne dokončená';
      desc = 'Kombucha bola vypitá alebo premiestnená do chladničky na zastavenie kvasenia.';
    }

    const updated = transitionState(batch, newState, title, desc);
    updateStoredBatch(batch.id, () => updated);
    setBatch(updated);
  };

  const handleDeleteBatch = () => {
    if (confirm(`Naozaj chcete zmazať várku ${batch.name} (${batch.codeNumber})?`)) {
      deleteStoredBatch(batch.id);
      router.push('/batches');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMeasurementModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Pridať Meranie / Ochutnávku
          </button>
          <button
            onClick={handleDeleteBatch}
            title="Zmazať várku"
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition border border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Info Summary Card */}
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

        {/* INLINE DEDICATED FERMENTATION CHART FOR THIS BATCH */}
        <FermentationCharts
          batch={batch}
          title={`Krivka Kvasenia pre ${batch.name}`}
          subtitle="Sledujte spotrebu cukru, vývoj pH a ideálny čas na ochutnanie tejto várky."
        />

        {/* Measurements History List */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-emerald-950 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-800" /> Zaznamenané Merania ({batch.measurements.length})
            </h3>
            <button
              onClick={() => setShowMeasurementModal(true)}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 underline"
            >
              + Pridať meranie
            </button>
          </div>

          <div className="grid gap-2.5">
            {batch.measurements.map((m) => (
              <div
                key={m.id}
                className="bg-[#fcfbf9] border border-gray-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-gray-400">
                      {new Date(m.timestamp).toLocaleString('sk-SK')}
                    </span>
                    <span className="font-mono font-bold text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                      {m.measuredBy === 'RASPBERRY_PI' ? 'IoT Senzor' : 'Manuálne'}
                    </span>
                  </div>
                  {m.notes && <p className="text-gray-700 italic text-[11px]">{m.notes}</p>}
                </div>

                <div className="flex items-center gap-4 font-mono font-bold">
                  {m.sugarBrix !== undefined && (
                    <div className="text-amber-900">
                      <span className="text-[10px] text-gray-400 block font-sans">Cukor</span>
                      {m.sugarBrix} °Brix
                    </div>
                  )}
                  {m.ph !== undefined && (
                    <div className="text-emerald-900">
                      <span className="text-[10px] text-gray-400 block font-sans">pH</span>
                      {m.ph.toFixed(1)}
                    </div>
                  )}
                  {m.temperature !== undefined && (
                    <div className="text-sky-900">
                      <span className="text-[10px] text-gray-400 block font-sans">Teplota</span>
                      {m.temperature} °C
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Log History */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-serif font-bold text-emerald-950 text-base flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" /> Časová Os & Udalosti
          </h3>

          <div className="relative border-l-2 border-emerald-200 ml-3 space-y-5 pl-5">
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
            <h3 className="text-lg font-serif font-bold text-emerald-950">Pridať Meranie & Degustáciu</h3>

            <form onSubmit={handleAddMeasurement} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cukor (°Brix):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="15.0"
                    value={brixInput}
                    onChange={(e) => setBrixInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sladkosť (1 - 5):</label>
                  <select
                    value={sweetnessInput}
                    onChange={(e) => setSweetnessInput(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold outline-none"
                  >
                    <option value={5}>5 – Veľmi sladká</option>
                    <option value={4}>4 – Svieža polosladká</option>
                    <option value={3}>3 – Vyvážená (ideálna)</option>
                    <option value={2}>2 – Jemne kyselkavá</option>
                    <option value={1}>1 – Suchá / Kyslá</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kyslosť (1 - 5):</label>
                  <select
                    value={acidityInput}
                    onChange={(e) => setAcidityInput(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold outline-none"
                  >
                    <option value={1}>1 – Žiadna (sladký čaj)</option>
                    <option value={2}>2 – Jemné okyslenie</option>
                    <option value={3}>3 – Príjemná acidita</option>
                    <option value={4}>4 – Výrazne kyslá</option>
                    <option value={5}>5 – Ocot (silná)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Poznámky k chuti / vzhľadu:</label>
                <textarea
                  rows={2}
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
