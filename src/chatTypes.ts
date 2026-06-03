// Types used across the app to represent structured recipe data and intents.
// Notes:
// - `Recipe` mirrors the structured JSON we request from the LLM when asking
//   for a recipe card (see `getRecipeStructured` in `chatUtils.ts`). It
//   intentionally has simple, serializable fields so model output can be
//   parsed into this shape and persisted to `localStorage`.
// - `RecipeIntent` enumerates deterministic intent labels produced by
//   lightweight heuristics in `classifyIntent()` (also in `chatUtils.ts`).
//   These heuristics are used to route user input to either prompting the
//   LLM for structured JSON, asking for steps/ingredients, or offering
//   substitution guidance.
export interface Recipe {
  // `name`: recipe title produced by the LLM (or normalized by parsers)
  // Relates to: Recipe Generation, NLP, Transformer-Based Architecture (LLM output)
  name: string;
  description?: string;
  // `cuisineType`: detected or model-provided cuisine (e.g., Filipino, Italian)
  // Relates to: Global Cuisine Intelligence, Context-Aware Culinary Guidance
  cuisineType: string;
  nutritionFacts: {
    // Nutrition fields may come from model output or heuristic estimates
    // Relates to: Nutrition estimation, NLP, Recipe Generation
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  // `ingredients`: core list used for ingredient substitution heuristics
  // Relates to: Ingredient Substitution, Recipe Generation, NLP
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
  // Optional parsed/structured recipe attached to a model message. When present
  // the UI can render a `RecipeCard` and allow saving to `localStorage`.
  // Relates to: Structured Output Parsing, Session Persistence, React
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
