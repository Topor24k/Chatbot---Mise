const normalize = (t) => t.trim().toLowerCase();

function isAmbiguousFoodQuery(text){
  const normalized = normalize(text);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  return wordCount > 0 && wordCount <= 4 && !/[?]/.test(normalized)
    && !/\b(what|how|why|when|where|who|which|ingredients?|steps?|recipe|full|complete|describe|tell|explain|make|cook|using|with|for|of|i have|i only have)\b/i.test(normalized);
}

function isMoodRecommendationQuery(text){
  const normalized = normalize(text);
  return /\b(recommend|recommendation|suggest|suggestion|what food|what should i eat|what can i eat|what can you recommend|food you could recommend|food recommend|meal recommend)\b/i.test(normalized)
    || /\b(sad|down|depressed|lonely|bored|tired|stressed|anxious|happy|excited|angry|upset|hungry|craving|comforting|relaxed|relaxing|sick)\b/i.test(normalized);
}

function classifyIntent(text){
  const normalized = normalize(text);
  if(/(\bingredients?\b|ingredients? for|ingredients? of|what do i need for|what ingredients are in|list the ingredients for|give me the ingredients of)/i.test(normalized)) return 'ingredients';
  if(/(\bsteps?\b|how to cook|how do i make|cooking instructions for|give me the steps for|how to prepare|steps for|instructions for)/i.test(normalized)) return 'steps';
  if(/(what is|tell me about|describe|what kind of food is)/i.test(normalized)) return 'description';
  if(/(?:\b(saved recipes?|recipes? saved|favorites?|favourites?)\b)/i.test(normalized) && /(?:\b(what|which|do|does|have|has|show|list|any|my)\b|\?)/i.test(normalized)) return 'favorites';
  if(/(?:\bi have\b(?!.*\b(saved recipes?|recipes? saved|favorites?|favourites?)\b)|what can i make with|recipes using|i only have)/i.test(normalized)) return 'ingredientSearch';
  if(isAmbiguousFoodQuery(text)) return 'description';
  if(isMoodRecommendationQuery(text)) return 'moodSearch';
  return 'general';
}

const tests = [
  'fries ingredients',
  'ingredients for fries',
  'Burger',
  'burger',
  'Do i have any saved Recipes?',
  'Do i have any recipes saved?',
  "I'm sad what food you could recommend",
  'What should I eat?',
  'chocolate cake',
  'how to cook rice',
  'what is adobo',
];

for(const t of tests){
  console.log('INPUT:', t);
  console.log(' isAmbiguousFoodQuery:', isAmbiguousFoodQuery(t));
  console.log(' isMoodRecommendationQuery:', isMoodRecommendationQuery(t));
  console.log(' classifyIntent:', classifyIntent(t));
  console.log('---');
}
