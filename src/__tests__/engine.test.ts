import { calculateIngredients, calculateSecondFermentationIngredients } from '../lib/calculator';
import { evaluateBatchState, transitionState, calculateDaysFermenting } from '../lib/fermentationEngine';
import { Batch } from '../types';

describe('Fermentation Engine & Calculator Tests', () => {
  const sampleBatch: Batch = {
    id: 'test-1',
    userId: 'u1',
    codeNumber: 'KB-001',
    name: 'Test Klasik',
    teaType: 'BLACK',
    volumeLiters: 3.5,
    teaGram: 24.5,
    sugarGram: 245,
    starterLiquidMl: 350,
    waterLiters: 3.15,
    startDate: '2026-09-01T10:00:00Z',
    targetTasteDate: '2026-09-08T10:00:00Z',
    targetBottleDate: '2026-09-11T10:00:00Z',
    state: 'FIRST_FERMENTATION',
    measurements: [],
    history: [],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  };

  test('Calculator computes ingredients correctly for 3.5L batch', () => {
    const calc = calculateIngredients(3.5);
    expect(calc.volumeLiters).toBe(3.5);
    expect(calc.teaGram).toBe(24.5);
    expect(calc.sugarGram).toBe(245);
    expect(calc.starterMl).toBe(350);
  });

  test('2F Calculator provides bottle proportions', () => {
    const f2 = calculateSecondFermentationIngredients(500);
    expect(f2.fruitGramRange[0]).toBe(25);
    expect(f2.fruitGramRange[1]).toBe(50);
  });

  test('Evaluate Batch State handles normal ferment vs ready to taste vs overdue', () => {
    // Before taste date
    const early = evaluateBatchState(sampleBatch, '2026-09-05T10:00:00Z');
    expect(early).toBe('FIRST_FERMENTATION');

    // On taste date
    const tasteTime = evaluateBatchState(sampleBatch, '2026-09-09T10:00:00Z');
    expect(tasteTime).toBe('READY_TO_TASTE');

    // Past bottle date + 24h
    const overdue = evaluateBatchState(sampleBatch, '2026-09-13T10:00:00Z');
    expect(overdue).toBe('OVERDUE_FOR_CHECK');
  });

  test('Transition state records log history event', () => {
    const updated = transitionState(sampleBatch, 'READY_TO_BOTTLE', 'Ochutnané', 'Chutí vyvážene, pripravená na fľaškovanie');
    expect(updated.state).toBe('READY_TO_BOTTLE');
    expect(updated.history.length).toBe(1);
    expect(updated.history[0].title).toBe('Ochutnané');
  });

  test('Days fermenting calculation', () => {
    const days = calculateDaysFermenting('2026-09-01T00:00:00Z', '2026-09-04T12:00:00Z');
    expect(days).toBe(3.5);
  });
});
