import { Suspense } from 'react';
import { FoodSearch } from '@/components/features/nutrition/FoodSearch';

export default function FoodSearchPage() {
  return (
    <Suspense fallback={null}>
      <FoodSearch />
    </Suspense>
  );
}
