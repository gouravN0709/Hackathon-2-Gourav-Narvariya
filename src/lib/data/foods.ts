import type { Food, FoodCategory, FoodEntry, Serving } from '@/types/domain';

type ServingSet = 'cup' | 'g150' | 'g200' | 'g20' | 'pc2' | 'med' | 'tbsp' | 'scoop' | 'roti' | 'bowl';

const SV: Record<ServingSet, [string, number][]> = {
  cup: [['½ cup', 0.5], ['1 cup', 1], ['1½ cups', 1.5], ['2 cups', 2]],
  g150: [['100 g', 0.67], ['150 g', 1], ['200 g', 1.33], ['250 g', 1.67]],
  g200: [['100 g', 0.5], ['200 g', 1], ['300 g', 1.5]],
  g20: [['10 g', 0.5], ['20 g', 1], ['30 g', 1.5], ['40 g', 2]],
  pc2: [['1 piece', 0.5], ['2 pieces', 1], ['3 pieces', 1.5], ['4 pieces', 2]],
  med: [['½ medium', 0.5], ['1 medium', 1], ['2 medium', 2]],
  tbsp: [['1 tbsp', 1], ['2 tbsp', 2], ['3 tbsp', 3]],
  scoop: [['½ scoop', 0.5], ['1 scoop', 1], ['2 scoops', 2]],
  roti: [['1 roti', 0.5], ['2 rotis', 1], ['3 rotis', 1.5], ['4 rotis', 2]],
  bowl: [['½ bowl', 0.5], ['1 bowl', 1], ['1½ bowls', 1.5]],
};

function food(
  id: string,
  name: string,
  cat: FoodCategory,
  base: string,
  k: number,
  p: number,
  c: number,
  f: number,
  sv: ServingSet,
): Food {
  const servings: Serving[] = SV[sv].map(([label, m]) => ({ label, m }));
  const defIdx = Math.max(0, servings.findIndex((s) => s.m === 1));
  return { id, name, cat, base, k, p, c, f, servings, defIdx };
}

export const FOODS: Food[] = [
  food('pt', 'Paneer tikka', 'Protein', '150 g', 330, 24, 8, 22, 'g150'),
  food('rj', 'Rajma curry', 'Lentils & beans', '1 cup', 240, 13, 38, 4, 'cup'),
  food('qn', 'Quinoa, cooked', 'Grains', '1 cup', 220, 8, 39, 4, 'cup'),
  food('sc', 'Soya chunks curry', 'Protein', '1 cup', 260, 26, 18, 9, 'cup'),
  food('mc', 'Moong dal chilla', 'Breakfast', '2 pieces', 220, 14, 28, 5, 'pc2'),
  food('br', 'Brown rice, cooked', 'Grains', '1 cup', 215, 5, 45, 2, 'cup'),
  food('sb', 'Mixed veg sabzi', 'Vegetables', '1 cup', 120, 3, 14, 6, 'cup'),
  food('bn', 'Banana', 'Fruit', '1 medium', 105, 1, 27, 0, 'med'),
  food('pb', 'Peanut butter', 'Snacks', '1 tbsp', 95, 4, 3, 8, 'tbsp'),
  food('gy', 'Greek yogurt', 'Dairy', '200 g', 130, 20, 8, 1, 'g200'),
  food('ws', 'Whey protein shake', 'Protein', '1 scoop', 120, 24, 3, 1, 'scoop'),
  food('dt', 'Dal tadka', 'Lentils & beans', '1 cup', 180, 10, 24, 4, 'cup'),
  food('rt', 'Whole wheat roti', 'Grains', '2 rotis', 200, 7, 36, 3, 'roti'),
  food('al', 'Almonds', 'Snacks', '20 g', 120, 4, 4, 10, 'g20'),
  food('ap', 'Apple', 'Fruit', '1 medium', 95, 0, 25, 0, 'med'),
  food('pk', 'Paneer bhurji', 'Protein', '150 g', 330, 24, 6, 18, 'g150'),
];

export const FOOD_CATEGORIES: ('All' | FoodCategory)[] = [
  'All',
  'Protein',
  'Grains',
  'Lentils & beans',
  'Vegetables',
  'Fruit',
  'Dairy',
  'Snacks',
  'Breakfast',
];

export const DEFAULT_FOOD_ID = 'rj';

/** Nova's dinner suggestion on Nutrition. */
export const SUGGESTED_MEAL: FoodEntry = { name: 'Paneer tikka bowl', serving: '1 bowl', k: 610, p: 41, c: 48, f: 24 };
