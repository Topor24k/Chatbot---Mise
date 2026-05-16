export interface Recipe {
  name: string;
  description?: string;
  cuisineType: string;
  nutritionFacts: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients: string[];
  instructions: string[];
  // Optional one-sentence note about sustainable sourcing or ingredient choices
  sustainabilityNote?: string;
  // Optional array of short zero-waste guidance lines (2-3 items preferred)
  wasteZeroGuidance?: string[];
  // Optional short resource conservation tip (e.g., reuse bones for broth)
  resourceConservationTip?: string;
}

export type RecipeIntent =
  | 'ingredients'
  | 'steps'
  | 'description'
  | 'fullRecipe'
  | 'ingredientSearch'
  | 'flavorSearch'
  | 'moodSearch'
  | 'favorites'
  | 'followUpYes'
  | 'general'
  | 'nutrition'
  | 'cookingTime'
  | 'difficulty'
  | 'servings'
  | 'substitution'
  | 'dietaryRestriction'
  | 'mealType'
  | 'cuisineSearch'
  | 'recipeRecommendation'
  | 'similarRecipes'
  | 'favoritesAdd'
  | 'favoritesRemove' 
  | 'favoritesCheck'
  | 'stepByStepMode' 
  | 'repeatStep'
  | 'nextStep'
  | 'previousStep'
  | 'recipeHistory' 
  | 'foodPairing'
  | 'occasionSearch'
  | 'quickRecipes' 
  | 'shoppingList' 
  | 'unknown';

export type Language = 'en';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  recipe?: Recipe;
}

export interface SavedSession {
  id: string;
  title: string;
  timestamp: string;
  messages: Array<{
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: string;
    recipe?: Recipe;
  }>;
}
