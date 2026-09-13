import Dashboard from '@/components/Dashboard';
import { INITIAL_BATCHES, INITIAL_RECIPES, INITIAL_SCOBIES } from '@/lib/sampleData';

export default function HomePage() {
  return (
    <Dashboard
      initialBatches={INITIAL_BATCHES}
      initialRecipes={INITIAL_RECIPES}
      initialScobies={INITIAL_SCOBIES}
    />
  );
}
