export type FermentationState =
  | 'DRAFT'
  | 'STARTED'
  | 'FIRST_FERMENTATION'
  | 'READY_TO_TASTE'
  | 'OVERDUE_FOR_CHECK'
  | 'READY_TO_BOTTLE'
  | 'SECOND_FERMENTATION'
  | 'READY_TO_CHILL'
  | 'REFRIGERATED'
  | 'COMPLETED'
  | 'DISCARDED';

export type TeaType =
  | 'BLACK'
  | 'GREEN'
  | 'BLACK_GREEN_MIX'
  | 'WHITE'
  | 'OOLONG'
  | 'HERBAL_CUSTOM';

export interface Measurement {
  id: string;
  batchId: string;
  timestamp: string;
  temperature?: number; // °C
  ph?: number;
  sugarBrix?: number; // °Brix (napr. 7.0 štart -> 3.2 hotová)
  sugarGramPerLiter?: number; // g/L cukru
  sweetnessRating?: number; // 1 (kyslá) - 5 (veľmi sladká)
  acidityRating?: number; // 1 (jemná) - 5 (veľmi kyslá)
  fizzRating?: number; // 1-5
  notes?: string;
  measuredBy?: 'USER' | 'RASPBERRY_PI';
}

export interface LogEvent {
  id: string;
  batchId: string;
  timestamp: string;
  previousState?: FermentationState;
  newState: FermentationState;
  title: string;
  description: string;
  photoUrl?: string;
}

export interface SecondFermentationBottle {
  id: string;
  volumeMl: number;
  flavoring: string;
  fruitGram?: number;
  juiceMl?: number;
  herbalNotes?: string;
  notes?: string;
}

export interface SecondFermentationInfo {
  id: string;
  batchId: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  bottlesCount: number;
  totalVolumeMl: number;
  bottles: SecondFermentationBottle[];
  pressureCheckedDates: string[];
  safetyWarningDismissed: boolean;
}

export interface Batch {
  id: string;
  userId: string;
  codeNumber: string; // e.g. "KB-001"
  name: string;
  recipeId?: string;
  recipeName?: string;
  teaType: TeaType;
  volumeLiters: number;
  teaGram: number;
  sugarGram: number;
  starterLiquidMl: number;
  waterLiters: number;
  scobyId?: string;
  scobyName?: string;
  
  startDate: string; // ISO String
  targetTasteDate: string; // ISO String
  targetBottleDate: string; // ISO String
  completedDate?: string;

  state: FermentationState;
  notes?: string;
  ambientTemperatureAverage?: number;

  measurements: Measurement[];
  history: LogEvent[];
  secondFermentation?: SecondFermentationInfo;
  
  rating?: number; // 1-5 overall final score
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'CLASSIC' | 'FLAVORED' | 'EXPERIMENTAL' | 'SECOND_FERMENTATION';
  description: string;
  teaType: TeaType;
  defaultVolumeLiters: number;
  teaGramPerLiter: number;
  sugarGramPerLiter: number;
  starterMlPerLiter: number;
  waterLitersPerLiter: number;
  estimatedDaysFirstFerment: number;
  flavorProfile: string;
  instructions: string[];
  notes?: string;
  recommendedSecondFermentAdditions?: string[];
}

export interface ScobyRecord {
  id: string;
  userId: string;
  name: string;
  generation: number;
  healthStatus: 'HEALTHY' | 'RESTING' | 'DISCARDED' | 'DONATED';
  notes?: string;
  hotelStartDate: string;
  lastUsedDate?: string;
}

export interface RaspberryPiSensorData {
  id: string;
  deviceId: string;
  batchId?: string;
  temperature: number;
  ph?: number;
  ambientHumidity?: number;
  timestamp: string;
}

export interface NotificationConfig {
  id: string;
  userId: string;
  enableBrowserNotifications: boolean;
  enableEmailAlerts: boolean;
  reminderHour: number; // e.g. 9 for 09:00 AM
  snoozeDaysDefault: number; // e.g. 1
  autoCheckOverdueIntervalHours: number;
}
