import RecipeCalculator from '@/components/RecipeCalculator';
import { INITIAL_RECIPES } from '@/lib/sampleData';

export default function RecipesPage() {
  return <RecipeCalculator recipes={INITIAL_RECIPES} />;
}
