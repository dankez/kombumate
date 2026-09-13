import { Batch, Measurement, ScobyRecord } from '@/types';
import { INITIAL_BATCHES, INITIAL_SCOBIES } from './sampleData';

const BATCHES_KEY = 'kombumate_batches_v1';
const SCOBIES_KEY = 'kombumate_scobies_v1';

export function getStoredBatches(): Batch[] {
  if (typeof window === 'undefined') {
    return INITIAL_BATCHES;
  }
  try {
    const raw = localStorage.getItem(BATCHES_KEY);
    if (!raw) {
      localStorage.setItem(BATCHES_KEY, JSON.stringify(INITIAL_BATCHES));
      return INITIAL_BATCHES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BATCHES;
  } catch (e) {
    console.error('Error reading batches from localStorage', e);
    return INITIAL_BATCHES;
  }
}

export function saveStoredBatches(batches: Batch[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
    window.dispatchEvent(new CustomEvent('kombumate_batches_updated', { detail: batches }));
  } catch (e) {
    console.error('Error saving batches to localStorage', e);
  }
}

export function getStoredBatch(id: string): Batch | undefined {
  const batches = getStoredBatches();
  return batches.find((b) => b.id === id);
}

export function createBatchFromParams(params: {
  name: string;
  teaType: Batch['teaType'];
  volumeLiters: number;
  teaGram: number;
  sugarGram: number;
  starterLiquidMl: number;
  waterLiters: number;
  scobyId?: string;
  scobyName?: string;
  estimatedDays?: number;
  notes?: string;
}): Batch {
  const batches = getStoredBatches();
  const nextNum = batches.length + 1;
  const codeNumber = `KB-${String(nextNum).padStart(3, '0')}`;
  const now = new Date();
  const targetDays = params.estimatedDays || 8;
  const targetTaste = new Date(now.getTime() + targetDays * 24 * 3600 * 1000);
  const targetBottle = new Date(now.getTime() + (targetDays + 2) * 24 * 3600 * 1000);

  // Initial measurement calculation
  const initialBrix = Number((params.sugarGram / (params.volumeLiters * 10)).toFixed(1));
  const initialMeasurement: Measurement = {
    id: `m-init-${Date.now()}`,
    batchId: `kb-${Date.now()}`,
    timestamp: now.toISOString(),
    temperature: 23.5,
    ph: 4.2,
    sugarBrix: initialBrix,
    sugarGramPerLiter: Math.round(params.sugarGram / params.volumeLiters),
    sweetnessRating: 5,
    acidityRating: 1,
    fizzRating: 1,
    measuredBy: 'USER',
    notes: `Založená várka. Počiatočný cukor ~${params.sugarGram} g (${initialBrix} °Brix), počiatočné pH upravené štartérom.`,
  };

  const newBatch: Batch = {
    id: `kb-${Date.now()}`,
    userId: 'user-local',
    codeNumber,
    name: params.name || `Kombucha ${params.teaType} (${params.volumeLiters}L)`,
    teaType: params.teaType,
    volumeLiters: params.volumeLiters,
    teaGram: params.teaGram,
    sugarGram: params.sugarGram,
    starterLiquidMl: params.starterLiquidMl,
    waterLiters: params.waterLiters,
    scobyId: params.scobyId || 'scoby-1',
    scobyName: params.scobyName || 'Materský SCOBY (Tradičný čaj)',
    startDate: now.toISOString(),
    targetTasteDate: targetTaste.toISOString(),
    targetBottleDate: targetBottle.toISOString(),
    state: 'FIRST_FERMENTATION',
    notes: params.notes || 'Várka vytvorená cez Kalkulačku ingrediencií Kombucha Hub.',
    measurements: [initialMeasurement],
    history: [
      {
        id: `h-${Date.now()}`,
        batchId: `kb-${Date.now()}`,
        timestamp: now.toISOString(),
        newState: 'FIRST_FERMENTATION',
        title: 'Várka založená (1F)',
        description: `Pridané suroviny: ${params.teaGram}g čaju, ${params.sugarGram}g cukru, ${params.starterLiquidMl}ml štartéra do ${params.volumeLiters}L nádoby.`,
      },
    ],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const updated = [newBatch, ...batches];
  saveStoredBatches(updated);
  return newBatch;
}

export function updateStoredBatch(id: string, updater: (b: Batch) => Batch): Batch | undefined {
  const batches = getStoredBatches();
  let updatedBatch: Batch | undefined;
  const updatedList = batches.map((b) => {
    if (b.id === id) {
      updatedBatch = updater({ ...b, updatedAt: new Date().toISOString() });
      return updatedBatch;
    }
    return b;
  });

  if (updatedBatch) {
    saveStoredBatches(updatedList);
  }
  return updatedBatch;
}

export function deleteStoredBatch(id: string): void {
  const batches = getStoredBatches();
  const filtered = batches.filter((b) => b.id !== id);
  saveStoredBatches(filtered);
}

export function addMeasurementToBatch(
  batchId: string,
  measurementData: Omit<Measurement, 'id' | 'batchId'>
): Measurement | null {
  let created: Measurement | null = null;
  updateStoredBatch(batchId, (batch) => {
    const newM: Measurement = {
      ...measurementData,
      id: `m-${Date.now()}`,
      batchId,
    };
    created = newM;
    return {
      ...batch,
      measurements: [newM, ...batch.measurements],
    };
  });
  return created;
}

export function getStoredScobies(): ScobyRecord[] {
  if (typeof window === 'undefined') {
    return INITIAL_SCOBIES;
  }
  try {
    const raw = localStorage.getItem(SCOBIES_KEY);
    if (!raw) {
      localStorage.setItem(SCOBIES_KEY, JSON.stringify(INITIAL_SCOBIES));
      return INITIAL_SCOBIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SCOBIES;
  } catch (e) {
    console.error('Error reading scobies from localStorage', e);
    return INITIAL_SCOBIES;
  }
}

export function saveStoredScobies(scobies: ScobyRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCOBIES_KEY, JSON.stringify(scobies));
    window.dispatchEvent(new CustomEvent('kombumate_scobies_updated', { detail: scobies }));
  } catch (e) {
    console.error('Error saving scobies to localStorage', e);
  }
}

export function addScoby(name: string, notes?: string): ScobyRecord {
  const scobies = getStoredScobies();
  const newScoby: ScobyRecord = {
    id: `scoby-${Date.now()}`,
    userId: 'user-local',
    name: name || `Mladý SCOBY #${scobies.length + 1}`,
    generation: scobies.length + 1,
    healthStatus: 'HEALTHY',
    notes: notes || 'Nová dcérska kultúra oddelená z varenia.',
    hotelStartDate: new Date().toISOString(),
  };
  saveStoredScobies([newScoby, ...scobies]);
  return newScoby;
}

// RECIPES MANAGEMENT
const RECIPES_KEY = 'kombumate_recipes_v2';
import { INITIAL_RECIPES } from './sampleData';
import { Recipe } from '@/types';

export function getStoredRecipes(): Recipe[] {
  if (typeof window === 'undefined') {
    return INITIAL_RECIPES;
  }
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (!raw) {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(INITIAL_RECIPES));
      return INITIAL_RECIPES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RECIPES;
  } catch (e) {
    console.error('Error reading recipes from localStorage', e);
    return INITIAL_RECIPES;
  }
}

export function saveStoredRecipes(recipes: Recipe[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    window.dispatchEvent(new CustomEvent('kombumate_recipes_updated', { detail: recipes }));
  } catch (e) {
    console.error('Error saving recipes to localStorage', e);
  }
}

export function toggleFavoriteRecipe(recipeId: string): Recipe[] {
  const recipes = getStoredRecipes();
  const updated = recipes.map((r) => {
    if (r.id === recipeId) {
      return { ...r, isFavorite: !r.isFavorite };
    }
    return r;
  });
  saveStoredRecipes(updated);
  return updated;
}

export function setDefaultRecipe(recipeId: string): Recipe[] {
  const recipes = getStoredRecipes();
  const updated = recipes.map((r) => ({
    ...r,
    isDefault: r.id === recipeId,
  }));
  saveStoredRecipes(updated);
  return updated;
}

export function getDefaultRecipe(): Recipe | undefined {
  const recipes = getStoredRecipes();
  return recipes.find((r) => r.isDefault) || recipes[0];
}

export function addCustomRecipe(recipeData: Omit<Recipe, 'id'>): Recipe {
  const recipes = getStoredRecipes();
  const newRecipe: Recipe = {
    ...recipeData,
    id: `rec-custom-${Date.now()}`,
    isCustom: true,
  };
  const updated = [newRecipe, ...recipes];
  saveStoredRecipes(updated);
  return newRecipe;
}

export function deleteStoredRecipe(recipeId: string): void {
  const recipes = getStoredRecipes();
  const filtered = recipes.filter((r) => r.id !== recipeId);
  saveStoredRecipes(filtered);
}
