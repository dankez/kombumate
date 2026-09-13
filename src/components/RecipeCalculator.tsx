'use client';

import { useState, useEffect, useRef } from 'react';
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
  Check,
  Star,
  Heart,
  Search,
  Filter,
  Flame,
  ShieldAlert,
  Droplets,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateIngredients, calculateSecondFermentationIngredients, TEA_TYPE_PROFILES } from '@/lib/calculator';
import { Recipe, RecipeCategory, TeaType, ScobyRecord } from '@/types';
import {
  createBatchFromParams,
  getStoredScobies,
  getStoredRecipes,
  toggleFavoriteRecipe,
  setDefaultRecipe,
  addCustomRecipe,
  deleteStoredRecipe
} from '@/lib/storage';

interface RecipeCalculatorProps {
  recipes?: Recipe[];
}

export default function RecipeCalculator({ recipes: initialPropRecipes }: RecipeCalculatorProps) {
  const router = useRouter();
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Calculator inputs
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

  // Recipes list & filter state
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddRecipeModal, setShowAddRecipeModal] = useState<boolean>(false);

  // New custom recipe form
  const [customName, setCustomName] = useState('');
  const [customCat, setCustomCat] = useState<RecipeCategory>('SECOND_FERMENTATION');
  const [customTea, setCustomTea] = useState<TeaType>('BLACK_GREEN_MIX');
  const [customDesc, setCustomDesc] = useState('');
  const [customFlavor, setCustomFlavor] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    const scobyList = getStoredScobies();
    setScobies(scobyList);
    if (scobyList.length > 0) {
      setSelectedScobyId(scobyList[0].id);
    }

    const storedRecipes = getStoredRecipes();
    setRecipesList(storedRecipes);

    // If there is a default recipe, initialize calculator with it
    const defaultRec = storedRecipes.find((r) => r.isDefault);
    if (defaultRec) {
      setSelectedTea(defaultRec.teaType);
      setVolume(defaultRec.defaultVolumeLiters);
      setCustomVolumeInput(defaultRec.defaultVolumeLiters.toString());
      setBatchName(`Moja Várka – ${defaultRec.name}`);
      setEstimatedDays(defaultRec.estimatedDaysFirstFerment);
    }

    const handleRecipesUpdate = () => {
      setRecipesList(getStoredRecipes());
    };
    window.addEventListener('kombumate_recipes_updated', handleRecipesUpdate);
    return () => window.removeEventListener('kombumate_recipes_updated', handleRecipesUpdate);
  }, []);

  // Update default batch name when tea or volume changes (if user hasn't typed custom name)
  const handlePresetClick = (v: number) => {
    setVolume(v);
    setCustomVolumeInput(v.toString());
    const teaName = TEA_TYPE_PROFILES[selectedTea].name;
    setBatchName(`Moja Kombucha – ${teaName} (${v}L)`);
  };

  const handleCustomInputChange = (val: string) => {
    setCustomVolumeInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setVolume(parsed);
      const teaName = TEA_TYPE_PROFILES[selectedTea].name;
      setBatchName(`Moja Kombucha – ${teaName} (${parsed}L)`);
    }
  };

  const handleTeaChange = (tea: TeaType) => {
    setSelectedTea(tea);
    const teaName = TEA_TYPE_PROFILES[tea].name;
    setBatchName(`Moja Kombucha – ${teaName} (${volume}L)`);
    if (tea === 'GREEN') setEstimatedDays(7);
    else if (tea === 'WHITE') setEstimatedDays(6);
    else setEstimatedDays(8);
  };

  // Apply recipe to calculator
  const handleApplyRecipe = (rec: Recipe) => {
    setSelectedTea(rec.teaType);
    setVolume(rec.defaultVolumeLiters);
    setCustomVolumeInput(rec.defaultVolumeLiters.toString());
    setBatchName(`Moja Várka – ${rec.name}`);
    setEstimatedDays(rec.estimatedDaysFirstFerment || 8);
    setBatchNotes(`Inšpirované receptom: ${rec.name}`);

    // Scroll up smoothly to calculator
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavoriteRecipe(id);
    setRecipesList(updated);
  };

  const handleSetDefault = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = setDefaultRecipe(id);
    setRecipesList(updated);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Naozaj chcete vymazať tento vlastný recept?')) {
      deleteStoredRecipe(id);
      setRecipesList(getStoredRecipes());
    }
  };

  const handleCreateCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addCustomRecipe({
      name: customName.trim(),
      category: customCat,
      description: customDesc.trim() || 'Vlastný remeselný recept.',
      teaType: customTea,
      defaultVolumeLiters: 3.5,
      teaGramPerLiter: 7,
      sugarGramPerLiter: 70,
      starterMlPerLiter: 100,
      waterLitersPerLiter: 0.9,
      estimatedDaysFirstFerment: 8,
      flavorProfile: customFlavor.trim() || 'Prírodná, svieža chuť',
      instructions: customInstructions.trim()
        ? customInstructions.split('\n').filter((l) => l.trim())
        : ['Pripravte nálev, pridajte cukor a kultúru, nechajte fermentovať.'],
      isFavorite: true,
    });

    setCustomName('');
    setCustomDesc('');
    setCustomFlavor('');
    setCustomInstructions('');
    setShowAddRecipeModal(false);
  };

  const ingredients = calculateIngredients(volume);
  const teaProfile = TEA_TYPE_PROFILES[selectedTea];
  const f2BottleGuide = calculateSecondFermentationIngredients(500);

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

    setTimeout(() => {
      router.push(`/batches/${newBatch.id}`);
    }, 1200);
  };

  // Filter recipes
  const filteredRecipes = recipesList.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.flavorProfile.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'FAVORITES') return Boolean(r.isFavorite);
    return r.category === selectedCategory;
  });

  const getCategoryBadge = (cat: RecipeCategory) => {
    switch (cat) {
      case 'SCOBY_HOTEL':
        return { label: 'SCOBY Hotel', bg: 'bg-teal-100 text-teal-900 border-teal-200' };
      case 'SODA_LEMONADE':
        return { label: 'Domáca Malinovka', bg: 'bg-rose-100 text-rose-900 border-rose-200' };
      case 'SECOND_FERMENTATION':
        return { label: '2. Fermentácia (2F)', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'EXPERIMENTAL':
        return { label: 'Jun / Špeciál', bg: 'bg-purple-100 text-purple-900 border-purple-200' };
      default:
        return { label: '1F Klasik', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 md:p-8 rounded-2xl shadow-md border border-emerald-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-amber-400" /> Receptár, Malinovky & Kalkulačka
        </h1>
        <p className="text-emerald-100 text-sm mt-2 max-w-2xl leading-relaxed">
          Kompletný sprievodca receptúrami: od výživy SCOBY hotela a vznešeného Junu s medom, cez overené 1F čaje až po najpopulárnejšie perlivé 2F malinovky a zázvorové toniky.
        </p>
      </div>

      {/* 1. INTERACTIVE CALCULATOR SECTION */}
      <div ref={calculatorRef} className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h2 className="text-xl font-extrabold text-emerald-950 font-serif flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-600" /> Interaktívna Kalkulačka Surovín
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Vyvážený pomer: <strong className="text-emerald-950">100ml štartéra + 70g cukru + 7g čaju / 1L</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Select Volume */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Zvoľte objem nádoby (Litre):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[1.0, 2.0, 3.0, 3.5, 4.0].map((v) => (
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
            <div className="pt-1 flex items-center gap-2">
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
              2. Druh čajového základu:
            </label>
            <select
              value={selectedTea}
              onChange={(e) => handleTeaChange(e.target.value as TeaType)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {Object.entries(TEA_TYPE_PROFILES).map(([key, profile]) => (
                <option key={key} value={key}>
                  {profile.name}
                </option>
              ))}
            </select>

            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 text-xs text-amber-950 space-y-0.5">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <Info className="w-3.5 h-3.5 text-amber-600" /> Lúhovanie: {teaProfile.tempC} °C • {teaProfile.steepMinutes} min.
              </span>
              <p className="text-amber-800/90 text-[11px] italic">{teaProfile.notes}</p>
            </div>
          </div>
        </div>

        {/* Ingredients Result Grid */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Čajové lístky</span>
              <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.teaGram} g</span>
              <span className="text-[10px] text-emerald-200 block">
                ~{ingredients.kitchenUnits.teaTeaspoonsApprox} čaj. lyžičky
              </span>
            </div>

            <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Trstinový Cukor</span>
              <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.sugarGram} g</span>
              <span className="text-[10px] text-emerald-200 block">
                ~{ingredients.kitchenUnits.sugarTablespoonsApprox} pol. lyžíc
              </span>
            </div>

            <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Štartér Tekutina</span>
              <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.starterMl} ml</span>
              <span className="text-[10px] text-emerald-200 block">
                ~{ingredients.kitchenUnits.starterCupsApprox} hrnčeka
              </span>
            </div>

            <div className="bg-emerald-900 text-white p-3.5 rounded-xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Pitná voda</span>
              <span className="text-xl font-extrabold font-mono text-amber-300 block">{ingredients.waterLiters} L</span>
              <span className="text-[10px] text-emerald-200 block">vriaca + studená</span>
            </div>
          </div>
        </div>

        {/* DIRECT BATCH CREATION */}
        <div className="bg-gradient-to-br from-amber-50/80 to-emerald-50/60 p-5 rounded-2xl border border-amber-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-emerald-950 font-serif flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-600" /> Založiť Moje Kvasenie z týchto Hodnôt
            </h3>
            <span className="text-xs text-emerald-800 font-mono font-bold">1-Click Setup</span>
          </div>

          {isCreated ? (
            <div className="bg-emerald-700 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-amber-300" />
                <div>
                  <h4 className="font-bold text-sm">Várka bola úspešne vytvorená a uložená!</h4>
                  <p className="text-xs text-emerald-100">Presmerovávam do detailu kvasenia a grafov...</p>
                </div>
              </div>
              <Link
                href={`/batches/${createdBatchId}`}
                className="px-3.5 py-2 bg-amber-400 text-emerald-950 font-bold text-xs rounded-lg shadow hover:bg-amber-300 transition"
              >
                Otvoriť ihneď &rarr;
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCreateBatch} className="space-y-3">
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
                    Kultúra (SCOBY zo zoznamu):
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
                    <option value="scoby-default">Nový čerstvý SCOBY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Dni do prvej ochutnávky (1F):
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="25"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 8)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Poznámka k nádobe (voliteľné):
                  </label>
                  <input
                    type="text"
                    placeholder="Napr. 3.5L nádoba v komore, stála teplota"
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

      {/* 2. RECIPES EXPLORER & MANAGEMENT SECTION */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-900/10 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-emerald-950 font-serif flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-600" /> Receptár & Malinovky ({filteredRecipes.length})
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Vyberte si recept, označte ako obľúbený, nastavte ako predvolený alebo jedným kliknutím preneste do kalkulačky.
            </p>
          </div>

          <button
            onClick={() => setShowAddRecipeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
          >
            <Plus className="w-4 h-4" /> Vytvoriť Vlastný Recept
          </button>
        </div>

        {/* Categories and Search Filter Bar */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-300 w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Hľadať v receptoch a surovinách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs bg-transparent outline-none w-full"
              />
            </div>

            {/* Favorite Counter */}
            <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              Obľúbené recepty: <span className="font-mono font-bold">{recipesList.filter((r) => r.isFavorite).length}</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[
              { id: 'ALL', label: 'Všetky Recepty' },
              { id: 'FAVORITES', label: '⭐ Obľúbené' },
              { id: 'SODA_LEMONADE', label: '🍓 Domáce Malinovky' },
              { id: 'SECOND_FERMENTATION', label: '🍾 2. Fermentácia (2F)' },
              { id: 'CLASSIC', label: '🍃 Základné 1F' },
              { id: 'SCOBY_HOTEL', label: '🏨 SCOBY Hotel' },
              { id: 'EXPERIMENTAL', label: '🍯 Jun & Med' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-900 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-emerald-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((r) => {
            const badge = getCategoryBadge(r.category);

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-5 space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Action icons */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Set as Default Button */}
                      <button
                        onClick={(e) => handleSetDefault(r.id, e)}
                        title={r.isDefault ? 'Tento recept je predvolený' : 'Nastaviť ako predvolený recept'}
                        className={`p-1.5 rounded-lg transition ${
                          r.isDefault
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-gray-300 hover:text-amber-500 hover:bg-gray-100'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${r.isDefault ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(r.id, e)}
                        title={r.isFavorite ? 'Odstrániť z obľúbených' : 'Pridať medzi obľúbené'}
                        className={`p-1.5 rounded-lg transition ${
                          r.isFavorite
                            ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                            : 'text-gray-300 hover:text-rose-500 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${r.isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>

                      {/* Custom Delete Button */}
                      {r.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustom(r.id, e)}
                          title="Zmazať vlastný recept"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-rose-600 hover:bg-gray-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 font-serif leading-snug">{r.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{r.description}</p>
                  </div>

                  {/* Flavor Profile Box */}
                  <div className="text-[11px] text-amber-950 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 font-medium">
                    <span className="font-bold text-amber-900 block">Chuťový profil:</span>
                    {r.flavorProfile}
                  </div>

                  {/* 2F Ratio Table if available */}
                  {r.secondFermentRatio && (
                    <div className="bg-[#fcfbf8] border border-gray-200 p-2.5 rounded-xl text-xs space-y-1.5">
                      <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider block">
                        Dávkovanie pre 0.5L fľašu:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {r.secondFermentRatio.fruitGrams && (
                          <div>
                            <span className="text-gray-400">Ovocie:</span>{' '}
                            <strong className="text-emerald-950 font-mono">{r.secondFermentRatio.fruitGrams} g</strong>
                          </div>
                        )}
                        {r.secondFermentRatio.juiceMl && (
                          <div>
                            <span className="text-gray-400">Šťava:</span>{' '}
                            <strong className="text-emerald-950 font-mono">{r.secondFermentRatio.juiceMl} ml</strong>
                          </div>
                        )}
                        {r.secondFermentRatio.herbsNotes && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Prísada:</span>{' '}
                            <strong className="text-emerald-950">{r.secondFermentRatio.herbsNotes}</strong>
                          </div>
                        )}
                        <div className="col-span-2 text-amber-800 font-semibold text-[10px]">
                          Perlenie: {r.secondFermentRatio.fizzLevel} ({r.secondFermentRatio.fermentDaysMin}–{r.secondFermentRatio.fermentDaysMax} dni)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Instructions Snippet */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Postup:
                    </span>
                    <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
                      {r.instructions.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="leading-tight">{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleApplyRecipe(r)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition flex items-center justify-center gap-1.5 group"
                  >
                    <span>⚡ Použiť recept v kalkulačke</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE CUSTOM RECIPE MODAL */}
      {showAddRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-serif font-bold text-emerald-950">Vytvoriť Vlastný Recept na Kombuchu / Malinovku</h3>

            <form onSubmit={handleCreateCustomRecipe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Názov receptu:</label>
                <input
                  type="text"
                  required
                  placeholder="Napr. Domáca Višňovo-Kardamómová 2F"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategória:</label>
                  <select
                    value={customCat}
                    onChange={(e) => setCustomCat(e.target.value as RecipeCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold outline-none"
                  >
                    <option value="SODA_LEMONADE">Domáca Malinovka</option>
                    <option value="SECOND_FERMENTATION">2. Fermentácia (2F)</option>
                    <option value="CLASSIC">1F Základná Kombucha</option>
                    <option value="SCOBY_HOTEL">SCOBY Hotel</option>
                    <option value="EXPERIMENTAL">Špeciál / Jun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Druh čaju:</label>
                  <select
                    value={customTea}
                    onChange={(e) => setCustomTea(e.target.value as TeaType)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold outline-none"
                  >
                    {Object.entries(TEA_TYPE_PROFILES).map(([k, p]) => (
                      <option key={k} value={k}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Krátky popis:</label>
                <input
                  type="text"
                  placeholder="Napr. Šumivá fialová malinovka s jemným korenistým tónom."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Chuťový profil:</label>
                <input
                  type="text"
                  placeholder="Napr. Kyselkavo-sladká, vôňa višní, perlivá"
                  value={customFlavor}
                  onChange={(e) => setCustomFlavor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Postup / Inštrukcie (každý krok na nový riadok):</label>
                <textarea
                  rows={3}
                  placeholder="Do 500ml fľaše vložte 20g višní.&#10;Dolejte kombuchou a uzavrite.&#10;Fermentujte 2 dni pri izbovej teplote."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecipeModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold shadow"
                >
                  Uložiť do Receptára
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
