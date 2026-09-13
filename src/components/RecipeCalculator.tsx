'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calculator,
  Sparkles,
  AlertCircle,
  Info,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  FlaskConical,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateIngredients, calculateSecondFermentationIngredients, TEA_TYPE_PROFILES } from '@/lib/calculator';
import { Recipe, TeaType, ScobyRecord } from '@/types';
import { createBatchFromParams, getStoredScobies } from '@/lib/storage';

interface RecipeCalculatorProps {
  recipes: Recipe[];
}

export default function RecipeCalculator({ recipes }: RecipeCalculatorProps) {
  const router = useRouter();

  const [volume, setVolume] = useState<number>(3.5);
  const [selectedTea, setSelectedTea] = useState<TeaType>('BLACK');
  const [customVolumeInput, setCustomVolumeInput] = useState<string>('3.5');

  // New batch creation from calculator state
  const [batchName, setBatchName] = useState<string>('Domáca Kombucha – Čierny čaj (3.5L)');
  const [selectedScobyId, setSelectedScobyId] = useState<string>('');
  const [estimatedDays, setEstimatedDays] = useState<number>(8);
  const [batchNotes, setBatchNotes] = useState<string>('');
  const [scobies, setScobies] = useState<ScobyRecord[]>([]);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [createdBatchId, setCreatedBatchId] = useState<string>('');

  useEffect(() => {
    const list = getStoredScobies();
    setScobies(list);
    if (list.length > 0) {
      setSelectedScobyId(list[0].id);
    }
  }, []);

  // Update default batch name when tea or volume changes
  useEffect(() => {
    const teaName = TEA_TYPE_PROFILES[selectedTea].name;
    setBatchName(`Moja Kombucha – ${teaName} (${volume}L)`);
    // adjust default ferment days based on tea
    if (selectedTea === 'GREEN') setEstimatedDays(7);
    else if (selectedTea === 'WHITE') setEstimatedDays(6);
    else setEstimatedDays(8);
  }, [selectedTea, volume]);

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

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedScoby = scobies.find((s) => s.id === selectedScobyId) || scobies[0];

    const newBatch = createBatchFromParams({
      name: batchName,
      teaType: selectedTea,
      volumeLiters: volume,
      teaGram: ingredients.teaGram,
      sugarGram: ingredients.sugarGram,
      starterLiquidMl: ingredients.starterMl,
      waterLiters: ingredients.waterLiters,
      scobyId: selectedScoby?.id,
      scobyName: selectedScoby?.name,
      estimatedDays,
      notes: batchNotes || `Založené cez kalkulačku pre ${volume}L nádobu.`,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    setCreatedBatchId(newBatch.id);
    setIsCreated(true);

    // Redirect after brief delay
    setTimeout(() => {
      router.push(`/batches/${newBatch.id}`);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 md:p-8 rounded-2xl shadow-md border border-emerald-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-amber-400" /> Receptár & Interaktívna Kalkulačka Ingrediencií
        </h1>
        <p className="text-emerald-100 text-sm mt-2 max-w-2xl leading-relaxed">
          Presné vyváženie čaju, trstinového cukru, vody a štartovacej tekutiny. Nastavte si objem nádoby a jedným kliknutím založte svoje vlastné kvasenie.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Calculator & Batch Creator (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-extrabold text-emerald-950 font-serif flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calculator className="w-5 h-5 text-amber-600" /> 1. Nastavenie Surovín (1F)
            </h2>

            {/* Step 1: Select Volume */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Objem nádoby (Litre):
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {presetVolumes.map((v) => (
                  <button
                    key={v}
                    type="button"
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
                Druh čajového základu:
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
                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Čajové lístky</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.teaGram} g</span>
                  <span className="text-[10px] text-emerald-200 block">
                    ~{ingredients.kitchenUnits.teaTeaspoonsApprox} čaj. lyžičky
                  </span>
                </div>

                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Cukor trstinový</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.sugarGram} g</span>
                  <span className="text-[10px] text-emerald-200 block">
                    ~{ingredients.kitchenUnits.sugarTablespoonsApprox} pol. lyžíc
                  </span>
                </div>

                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Štartér (Kombucha)</span>
                  <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.starterMl} ml</span>
                  <span className="text-[10px] text-emerald-200 block">
                    ~{ingredients.kitchenUnits.starterCupsApprox} hrnčeka
                  </span>
                </div>

                <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
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

            {/* DIRECT BATCH CREATION SECTION */}
            <div className="border-t-2 border-amber-200/80 pt-6 space-y-4 bg-gradient-to-br from-amber-50/70 to-emerald-50/50 p-5 rounded-2xl border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-emerald-950 font-serif flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-amber-600" /> Pridať ako Moje Kvasenie
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Uložte si túto receptúru priamo medzi vaše aktívne várky a začnite sledovať kvasenie a grafy.
                  </p>
                </div>
              </div>

              {isCreated ? (
                <div className="bg-emerald-600 text-white p-4 rounded-xl flex items-center justify-between animate-fade-in shadow-md">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-300" />
                    <div>
                      <h4 className="font-bold text-sm">Várka bola úspešne vytvorená!</h4>
                      <p className="text-xs text-emerald-100">Presmerovávam na detail kvasenia a grafy...</p>
                    </div>
                  </div>
                  <Link
                    href={`/batches/${createdBatchId}`}
                    className="px-3 py-1.5 bg-white text-emerald-950 font-bold text-xs rounded-lg shadow hover:bg-emerald-50 transition"
                  >
                    Otvoriť ihneď &rarr;
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleCreateBatch} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        Názov novej várky:
                      </label>
                      <input
                        type="text"
                        required
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        Materská kultúra (SCOBY):
                      </label>
                      <select
                        value={selectedScobyId}
                        onChange={(e) => setSelectedScobyId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        {scobies.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (Gen. {s.generation})
                          </option>
                        ))}
                        <option value="new-scoby">Nový čerstvý SCOBY</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        Plánovaná dĺžka 1F (Dni do ochutnania):
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="21"
                        value={estimatedDays}
                        onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 8)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-950 mb-1">
                        Poznámka k uloženiu nádoby (voliteľné):
                      </label>
                      <input
                        type="text"
                        placeholder="Napr. Špajza, stála teplota 23°C"
                        value={batchNotes}
                        onChange={(e) => setBatchNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-sm shadow-md transition transform active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5 text-emerald-950" />
                    <span>Pridať ako Moje Kvasenie & Spustiť Sledovanie</span>
                  </button>
                </form>
              )}
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
              <span className="font-bold block">⚠️ Bezpečnostná poznámka:</span>
              <p>
                Fľaše s ovocím neplňte po okraj (nechajte 2-3 cm voľného priestoru). Kontrolujte tlak raz denne odvetraním, aby nedošlo k prasknutiu skla!
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
