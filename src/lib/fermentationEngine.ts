import { Batch, FermentationState, LogEvent } from '@/types';

export const STATE_LABELS: Record<FermentationState, string> = {
  DRAFT: 'Návrh / Pripravuje sa',
  STARTED: 'Založená',
  FIRST_FERMENTATION: '1. Fermentácia prebieha',
  READY_TO_TASTE: 'Čas ochutnať',
  OVERDUE_FOR_CHECK: 'Zmeškaná kontrola!',
  READY_TO_BOTTLE: 'Pripravená na stočenie',
  SECOND_FERMENTATION: '2. Fermentácia prebieha',
  READY_TO_CHILL: 'Pripravená na chladenie',
  REFRIGERATED: 'V chladničke',
  COMPLETED: 'Dokončená / Vypitá',
  DISCARDED: 'Vyliatá / Znehodnotená',
};

export const STATE_BADGE_COLORS: Record<FermentationState, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  STARTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  FIRST_FERMENTATION: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  READY_TO_TASTE: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  OVERDUE_FOR_CHECK: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-400' },
  READY_TO_BOTTLE: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' },
  SECOND_FERMENTATION: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  READY_TO_CHILL: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
  REFRIGERATED: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  DISCARDED: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
};

/**
 * Calculates updated state based on current timestamp and batch parameters.
 * Does not force completed state, user tasting is always required!
 */
export function evaluateBatchState(batch: Batch, nowISO = new Date().toISOString()): FermentationState {
  if (['COMPLETED', 'DISCARDED', 'REFRIGERATED'].includes(batch.state)) {
    return batch.state;
  }

  const now = new Date(nowISO).getTime();
  const targetTaste = new Date(batch.targetTasteDate).getTime();
  const targetBottle = new Date(batch.targetBottleDate).getTime();

  if (batch.state === 'FIRST_FERMENTATION' || batch.state === 'STARTED') {
    if (now >= targetBottle + 24 * 3600 * 1000) {
      return 'OVERDUE_FOR_CHECK';
    }
    if (now >= targetTaste) {
      return 'READY_TO_TASTE';
    }
    return 'FIRST_FERMENTATION';
  }

  if (batch.state === 'READY_TO_TASTE') {
    if (now >= targetBottle + 24 * 3600 * 1000) {
      return 'OVERDUE_FOR_CHECK';
    }
  }

  if (batch.state === 'SECOND_FERMENTATION' && batch.secondFermentation) {
    const target2FEnd = new Date(batch.secondFermentation.expectedEndDate).getTime();
    if (now >= target2FEnd + 12 * 3600 * 1000) {
      return 'OVERDUE_FOR_CHECK';
    }
    if (now >= target2FEnd) {
      return 'READY_TO_CHILL';
    }
  }

  return batch.state;
}

export function transitionState(
  batch: Batch,
  newState: FermentationState,
  eventTitle: string,
  eventDescription: string,
  photoUrl?: string
): Batch {
  const now = new Date().toISOString();
  const logEvent: LogEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    batchId: batch.id,
    timestamp: now,
    previousState: batch.state,
    newState,
    title: eventTitle,
    description: eventDescription,
    photoUrl,
  };

  const updatedBatch: Batch = {
    ...batch,
    state: newState,
    history: [logEvent, ...batch.history],
    updatedAt: now,
  };

  if (newState === 'COMPLETED' || newState === 'DISCARDED') {
    updatedBatch.completedDate = now;
  }

  return updatedBatch;
}

export function calculateDaysFermenting(startDateISO?: string, nowISO = new Date().toISOString()): number {
  if (!startDateISO) return 0;
  const start = new Date(startDateISO).getTime();
  const now = new Date(nowISO).getTime();
  if (isNaN(start) || isNaN(now)) return 0;
  const diffDays = (now - start) / (1000 * 3600 * 24);
  return Math.max(0, Math.round(diffDays * 10) / 10);
}
