import { TeaType } from '@/types';

export interface IngredientsCalculation {
  volumeLiters: number;
  teaGram: number;
  sugarGram: number;
  starterMl: number;
  waterLiters: number;
  kitchenUnits: {
    teaTeaspoonsApprox: number;
    sugarTablespoonsApprox: number;
    sugarCupsApprox: number;
    starterCupsApprox: number;
  };
  warnings: string[];
}

export const BASELINE_PER_LITER = {
  teaGram: 7,
  sugarGram: 70,
  starterMl: 100, // 10% starter liquid minimum
  waterLiters: 0.9,
};

export const TEA_TYPE_PROFILES: Record<
  TeaType,
  { name: string; tempC: number; steepMinutes: number; notes: string }
> = {
  BLACK: {
    name: 'Čierny čaj (Ceylon, Assam, English Breakfast)',
    tempC: 95,
    steepMinutes: 10,
    notes: 'Tradičný výborný základ. Dobre vyživuje SCOBY a dodáva plnú chuť.',
  },
  GREEN: {
    name: 'Zelený čaj (Sencha, Gunpowder)',
    tempC: 80,
    steepMinutes: 7,
    notes: 'Jemnejšia, svieža, travnatá chuť. Rýchlejšia fermentácia.',
  },
  BLACK_GREEN_MIX: {
    name: 'Mesačný mix (50% Čierny + 50% Zelený)',
    tempC: 90,
    steepMinutes: 8,
    notes: 'Najobľúbenejšia vyvážená kombinácia pre plnú chuť a sviežosť.',
  },
  WHITE: {
    name: 'Biely čaj (Pai Mu Tan)',
    tempC: 75,
    steepMinutes: 12,
    notes: 'Veľmi jemný, kvetinový nápoj. Vyžaduje opatrné lúhovanie.',
  },
  OOLONG: {
    name: 'Oolong (Tie Guan Yin)',
    tempC: 85,
    steepMinutes: 8,
    notes: 'Ovocno-drevité tóny, skvelý pre labužníkov.',
  },
  HERBAL_CUSTOM: {
    name: 'Bylinkový akcent (Max 20% byliniek + 80% čaj)',
    tempC: 90,
    steepMinutes: 10,
    notes: 'Pozor na esenciálne oleje v bylinkách (hermanček, mäta), ktoré môžu oslabiť SCOBY.',
  },
};

export function calculateIngredients(
  volumeLiters: number,
  customRatios?: {
    teaGramPerLiter?: number;
    sugarGramPerLiter?: number;
    starterMlPerLiter?: number;
  }
): IngredientsCalculation {
  const safeVolume = Math.max(0.1, Math.min(50, volumeLiters));

  const teaPerL = customRatios?.teaGramPerLiter ?? BASELINE_PER_LITER.teaGram;
  const sugarPerL = customRatios?.sugarGramPerLiter ?? BASELINE_PER_LITER.sugarGram;
  const starterPerL = customRatios?.starterMlPerLiter ?? BASELINE_PER_LITER.starterMl;

  const teaGram = Math.round(safeVolume * teaPerL * 10) / 10;
  const sugarGram = Math.round(safeVolume * sugarPerL);
  const starterMl = Math.round(safeVolume * starterPerL);
  const waterLiters = Math.round((safeVolume - starterMl / 1000) * 100) / 100;

  // Approx conversions
  const teaTeaspoonsApprox = Math.round((teaGram / 2.5) * 10) / 10; // ~2.5g loose tea per tsp
  const sugarTablespoonsApprox = Math.round((sugarGram / 12.5) * 10) / 10; // ~12.5g per tbsp
  const sugarCupsApprox = Math.round((sugarGram / 200) * 100) / 100; // ~200g per cup
  const starterCupsApprox = Math.round((starterMl / 240) * 10) / 10; // ~240ml per cup

  const warnings: string[] = [];
  if (starterMl / 1000 / safeVolume < 0.1) {
    warnings.push('Množstvo štartovacej tekutiny je pod 10% objemu. Hrozí vyššie riziko plesne!');
  }
  if (safeVolume < 1) {
    warnings.push('Pri malých objemoch (pod 1L) prebieha fermentácia a odparovanie vody oveľa rýchlejšie.');
  }

  return {
    volumeLiters: safeVolume,
    teaGram,
    sugarGram,
    starterMl,
    waterLiters: Math.max(0.1, waterLiters),
    kitchenUnits: {
      teaTeaspoonsApprox,
      sugarTablespoonsApprox,
      sugarCupsApprox,
      starterCupsApprox,
    },
    warnings,
  };
}

export interface FlavoringRecommendation {
  bottleVolumeMl: number;
  fruitGramRange: [number, number];
  juiceMlRange: [number, number];
  sugarGramRange: [number, number];
  notes: string[];
}

export function calculateSecondFermentationIngredients(bottleVolumeMl: number): FlavoringRecommendation {
  // Fruit: ~5-10% of bottle volume in grams
  const minFruit = Math.round((bottleVolumeMl * 0.05));
  const maxFruit = Math.round((bottleVolumeMl * 0.10));

  // Juice: ~3-5% of volume in ml
  const minJuice = Math.round((bottleVolumeMl * 0.03));
  const maxJuice = Math.round((bottleVolumeMl * 0.05));

  // Pure Sugar (if low sugar fruit): ~0.5 - 1%
  const minSugar = Math.round((bottleVolumeMl * 0.005) * 10) / 10;
  const maxSugar = Math.round((bottleVolumeMl * 0.01) * 10) / 10;

  return {
    bottleVolumeMl,
    fruitGramRange: [minFruit, maxFruit],
    juiceMlRange: [minJuice, maxJuice],
    sugarGramRange: [minSugar, maxSugar],
    notes: [
      'Pre vysoké perlenie (karbonizáciu) použite ovocie s vysokým obsahom cukru (jahody, maliny, mango).',
      'Fľaše nenechávajte naplnené až po okrajoch, nechajte 2-3 cm voľného priestoru na tlak.',
      'BEZPEČNOSTNÉ UPOZORNENIE: Používajte iba hrubostenné fľaše určené na tlak (napr. patentové pivné fľaše).',
    ],
  };
}
