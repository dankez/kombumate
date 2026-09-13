'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, Calculator, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateIngredients, TEA_TYPE_PROFILES } from '@/lib/calculator';
import { TeaType } from '@/types';
import { createBatchFromParams } from '@/lib/storage';

export default function NewBatchPage() {
  const router = useRouter();

  const [name, setName] = useState('Nová Domáca Kombucha (3.5L)');
  const [volume, setVolume] = useState<number>(3.5);
  const [teaType, setTeaType] = useState<TeaType>('BLACK');
  const [targetDays, setTargetDays] = useState<number>(8);
  const [notes, setNotes] = useState('Nádoba v špajzi, izbová teplota 23–24°C.');

  const ingredients = calculateIngredients(volume);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = createBatchFromParams({
      name,
      teaType,
      volumeLiters: volume,
      teaGram: ingredients.teaGram,
      sugarGram: ingredients.sugarGram,
      starterLiquidMl: ingredients.starterMl,
      waterLiters: ingredients.waterLiters,
      estimatedDays: targetDays,
      notes,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    router.push(`/batches/${created.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-950 font-serif">Založiť Novú Várku Kombuchy</h1>
          <p className="text-xs text-gray-500">
            Zadajte parametre nádoby. Kalkulačka automaticky prepočíta pomer vody, čaju, cukru a štartéra.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-emerald-900/10 p-6 shadow-sm space-y-6">
        {/* Name and Volume */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Názov Várky:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Objem Nádoby (Litre):</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="20"
              required
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value) || 1)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Tea Type Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Druh Čaju:</label>
          <select
            value={teaType}
            onChange={(e) => setTeaType(e.target.value as TeaType)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500"
          >
            {Object.entries(TEA_TYPE_PROFILES).map(([key, prof]) => (
              <option key={key} value={key}>
                {prof.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Ingredient Calculation Preview */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4" /> Vypočítané Ingrediencie pre {volume} L:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="block text-[10px] text-emerald-200">Čajové lístky</span>
              <span className="text-base font-extrabold font-mono text-amber-300">{ingredients.teaGram} g</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="block text-[10px] text-emerald-200">Trstinový Cukor</span>
              <span className="text-base font-extrabold font-mono text-amber-300">{ingredients.sugarGram} g</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="block text-[10px] text-emerald-200">Štartér Tekutina</span>
              <span className="text-base font-extrabold font-mono text-amber-300">{ingredients.starterMl} ml</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="block text-[10px] text-emerald-200">Voda</span>
              <span className="text-base font-extrabold font-mono text-amber-300">{ingredients.waterLiters} L</span>
            </div>
          </div>
        </div>

        {/* Target Fermentation Days */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Odhadovaný Čas 1. Fermentácie (Dni):
          </label>
          <input
            type="number"
            min="3"
            max="30"
            value={targetDays}
            onChange={(e) => setTargetDays(parseInt(e.target.value) || 7)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Poznámky k Založeniu:</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" /> Uložiť Várku & Spustiť Kvasenie
        </button>
      </form>
    </div>
  );
}
