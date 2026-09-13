'use client';

import { useState } from 'react';
import { Calculator, Sparkles, AlertCircle, Info, BookOpen } from 'lucide-react';
import { calculateIngredients, calculateSecondFermentationIngredients, TEA_TYPE_PROFILES } from '@/lib/calculator';
import { Recipe, TeaType } from '@/types';

interface RecipeCalculatorProps {
  recipes: Recipe[];
}

export default function RecipeCalculator({ recipes }: RecipeCalculatorProps) {
  const [volume, setVolume] = useState<number>(3.5);
  const [selectedTea, setSelectedTea] = useState<TeaType>('BLACK');
  const [customVolumeInput, setCustomVolumeInput] = useState<string>('3.5');

  const presetVolumes = [1.0, 2.0, 3.0, 3.5, 4.0];

  const handlePresetClick = (v: number) => {
    setVolume(v);
    setCustomVolumeInput(v.toString());
  };

  const handleCustomInputChange = (val: string) => {
    setCustomVolumeInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setVolume(parsed);
    }
  };

  const ingredients = calculateIngredients(volume);
  const teaProfile = TEA_TYPE_PROFILES[selectedTea];
  const f2BottleGuide = calculateSecondFermentationIngredients(500); // 500ml standard bottle

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 md:p-8 rounded-2xl shadow-md border border-emerald-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-amber-400" /> Receptár & Interaktívna Kalkulačka Ingrediencií
        </h1>
        <p className="text-emerald-100 text-sm mt-2 max-w-2xl leading-relaxed">
          Presné vyváženie čaju, trstinového cukru, vody a štartovacej tekutiny. Optimalizované pre domáce domáce nádoby s objemom 3 – 4 litre.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Calculator (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-extrabold text-emerald-950 font-serif flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calculator className="w-5 h-5 text-amber-600" /> Kalkulačka Prvej Fermentácie (1F)
            </h2>

            {/* Step 1: Select Volume */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                1. Zvoľte požadovaný objem nádoby (Litre):
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {presetVolumes.map((v) => (
                  <button
                    key={v}
                    onClick={() => handlePresetClick(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition font-mono ${
                      volume === v
                        ? 'bg-amber-500 text-emerald-950 shadow-sm scale-105'
                        : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    {v} L
                  </button>
                ))}
              </div>
              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Vlastný objem:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="50"
                  value={customVolumeInput}
                  onChange={(e) => handleCustomInputChange(e.target.value)}
                  className="w-24 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <span className="text-xs text-gray-500">L</span>
              </div>
            </div>

            {/* Step 2: Select Tea Type */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Vyberte druh čajového základu:
              </label>
              <select
                value={selectedTea}
                onChange={(e) => setSelectedTea(e.target.value as TeaType)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {Object.entries(TEA_TYPE_PROFILES).map(([key, profile]) => (
                  <option key={key} value={key}>
                    {profile.name}
                  </option>
                ))}
              </select>

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" /> Odporúčanie lúhovania:
                </div>
                <p>
                  Teplota vody: <span className="font-bold font-mono">{teaProfile.tempC} °C</span> • Čas lúhovania:{' '}
                  <span className="font-bold font-mono">{teaProfile.steepMinutes} minút</span>
                </p>
                <p className="text-amber-800/90 italic">{teaProfile.notes}</p>
              </div>
            </div>

            {/* Step 3: Ingredients Result Grid */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <h3 className="font-bold text-emerald-950 text-sm">
                Vypočítané presné množstvá ingrediencií pre {ingredients.volumeLiters} L:
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Čajové lístky</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.teaGram} g</span>
                  <span className="text-[10px] text-emerald-200 block">
                    ~{ingredients.kitchenUnits.teaTeaspoonsApprox} čaj. lyžičky
                  </span>
                </div>

                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Cukor trstinový</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.sugarGram} g</span>
                  <span className="text-[10px] text-emerald-200 block">
                    ~{ingredients.kitchenUnits.sugarTablespoonsApprox} pol. lyžíc
                  </span>
                </div>

                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Štartér (Kombucha)</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.starterMl} ml</span>
                  <span className="text-[10px] text-emerald-200 block">
                    ~{ingredients.kitchenUnits.starterCupsApprox} hrnčeka
                  </span>
                </div>

                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Pitná voda</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.waterLiters} L</span>
                  <span className="text-[10px] text-emerald-200 block">vriaca & studená</span>
                </div>
              </div>

              {/* Warnings if any */}
              {ingredients.warnings.map((warn, i) => (
                <div key={i} className="flex items-center gap-2 bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 2F Flavoring Guide & Recipes */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-emerald-950 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold font-serif text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-950" /> 2. Fermentácia (2F) – Pre 0.5L Fľašu
            </h3>
            <p className="text-xs text-emerald-950/90 leading-relaxed">
              Pripravujete ovocné ochutenie vo fľašiach s patentovým uzáverom? Pre 500ml fľašu použite:
            </p>

            <div className="bg-white/90 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-bold text-emerald-950 border-b border-gray-200 pb-1">
                <span>Čerstvé / Mrazené Ovocie:</span>
                <span className="font-mono text-amber-900">{f2BottleGuide.fruitGramRange[0]} - {f2BottleGuide.fruitGramRange[1]} g</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-950 border-b border-gray-200 pb-1">
                <span>Ovocná Šťava (100%):</span>
                <span className="font-mono text-amber-900">{f2BottleGuide.juiceMlRange[0]} - {f2BottleGuide.juiceMlRange[1]} ml</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-950">
                <span>Dodatočný cukor (ak treba):</span>
                <span className="font-mono text-amber-900">{f2BottleGuide.sugarGramRange[0]} - {f2BottleGuide.sugarGramRange[1]} g</span>
              </div>
            </div>

            <div className="text-[11px] bg-amber-700/20 p-3 rounded-xl text-emerald-950 font-medium space-y-1 border border-amber-700/30">
              <span className="font-bold block">⚠️ Bezpečnostná poznámka ku krytu:</span>
              <p>
                Fľaše s ovocím neplňte po okraj (nechajte 2-3 cm voľného priestoru). Kontrolujte tlak raz denne naklonením alebo jemným odvetraním, aby nedošlo k prasknutiu skla!
              </p>
            </div>
          </div>

          {/* Preset Recipe Cards */}
          <div className="space-y-3">
            <h3 className="font-serif font-extrabold text-emerald-950 text-base">Overené Receptúry v Databáze</h3>
            {recipes.map((r) => (
              <div key={r.id} className="bg-white p-4 rounded-xl border border-emerald-900/10 space-y-2 shadow-sm">
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {r.category}
                </span>
                <h4 className="font-bold text-emerald-950 text-sm font-serif">{r.name}</h4>
                <p className="text-xs text-gray-600">{r.description}</p>
                <div className="text-[11px] text-amber-900 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Chuťový profil: {r.flavorProfile}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
