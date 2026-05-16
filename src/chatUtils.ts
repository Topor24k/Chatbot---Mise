import misePrompt from '../Mise.md?raw';
import { sendMessage } from './api/ollama';
import { Language, Message, Recipe, RecipeIntent } from './chatTypes';

export const SYSTEM_PROMPT = misePrompt.trim();

export function cleanAssistantText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+[.)]\s+/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function stripCodeFence(text?: string): string {
  if (!text) return '';
  return text.replace(/```[\s\S]*?```/g, match => match.replace(/```/g, ''))
    .replace(/^```|```$/g, '')
    .trim();
}

export function sanitizeAssistantText(text?: string, userPrompt?: string): string {
  const cleaned = stripCodeFence(text)
    .replace(/<\|im_start\|>/g, '')
    .replace(/<\|im_end\|>/g, '')
    .replace(/\u0000/g, '')
    .trim();

  if (!cleaned) return '';

  const lines = cleaned
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && line !== 'assistant' && line !== 'user');

  const joined = cleanAssistantText(lines.join('\n').trim());
  if (!userPrompt) return joined;

  const prompt = userPrompt.trim();
  const echoIndex = joined.toLowerCase().lastIndexOf(prompt.toLowerCase());
  if (echoIndex !== -1 && echoIndex > joined.length * 0.35) {
    const beforeEcho = joined.slice(0, echoIndex).trim();
    return beforeEcho || joined;
  }

  return joined;
}

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

export function extractDishName(text: string) {
  const value = text.trim();
  const patterns = [
    /(.+?)\s+(?:ingredients?|steps?|recipe)$/i,
    /(?:ingredients?(?: for| of)?|what do i need for|what ingredients are in|list the ingredients for|give me the ingredients of|steps for|how to cook|how do i make|cooking instructions for|how to prepare|full recipe for|complete recipe for|complete details of|full information on|everything about|give me the complete|i want the full|what is|tell me about|describe|what kind of food is)\s+(.+)$/i,
    /(?:recipes? using|what can i make with|i have|i only have)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/[?.!,]+$/g, '').trim();
    }
  }

  return value.replace(/[?.!,]+$/g, '').trim();
}

export function isAmbiguousFoodQuery(text: string) {
  const normalized = normalizeText(text);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  return wordCount > 0
    && wordCount <= 4
    && !/[?]/.test(normalized)
    && !/\b(what|how|why|when|where|who|which|ingredients?|steps?|recipe|full|complete|describe|tell|explain|make|cook|using|with|for|of|i have|i only have)\b/i.test(normalized);
}

export function isMoodRecommendationQuery(text: string) {
  const normalized = normalizeText(text);
  return /\b(recommend|recommendation|suggest|suggestion|what food|what should i eat|what can i eat|what can you recommend|food you could recommend|food recommend|meal recommend)\b/i.test(normalized)
    || /\b(sad|down|depressed|lonely|bored|tired|stressed|anxious|happy|excited|angry|upset|hungry|craving|comforting|relaxed|relaxing|sick)\b/i.test(normalized);
}

export function classifyIntent(text: string, lastIntent?: RecipeIntent, lastRecipeName?: string): RecipeIntent {
  const normalized = normalizeText(text);

  if (/^(yes|yes please|sure|please|go ahead|give me the steps|ok|okay|yeah|yep|give it to me)$/i.test(normalized)) {
    return lastIntent === 'ingredients' || (lastIntent === 'followUpYes' && lastRecipeName) ? 'followUpYes' : 'general';
  }

  if (/(?:\b(saved recipes?|favorites?|favourites?)\b)/i.test(normalized) && /(?:\b(what|which|do|does|have|has|show|list|any|my)\b|\?)/i.test(normalized)) {
    return 'favorites';
  }

  if (/(?:\bfull\b|\bcomplete\b|everything about|full information on|give me the complete|i want the full|complete details of|full guide|full recipe|complete recipe|recipe for|recipe of|show me the recipe|give me a recipe|how to make|how do i make|how to cook|teach me how to cook|i want to cook|how is .+ made)/i.test(normalized)) {
    return 'fullRecipe';
  }

  if (/(\bingredients?\b|ingredients? for|ingredients? of|what do i need for|what ingredients are in|list the ingredients for|give me the ingredients of)/i.test(normalized)) {
    return 'ingredients';
  }

  if (/(\bsteps?\b|how to cook|how do i make|cooking instructions for|give me the steps for|how to prepare|steps for|instructions for)/i.test(normalized)) {
    return 'steps';
  }

  if (/(what is|tell me about|describe|what kind of food is)/i.test(normalized)) {
    return 'description';
  }

  if (/(?:\bi have\b(?!.*\b(saved recipes?|favorites?|favourites?)\b)|what can i make with|recipes using|i only have)/i.test(normalized)) {
    return 'ingredientSearch';
  }

  if (/(spicy|sweet|sour|savory|rich flavor)/i.test(normalized)) {
    return 'flavorSearch';
  }

  if (/(comfort|happy|romantic|energizing|relaxing|stressed|sad|down|depressed|lonely|bored|tired|anxious|upset|hungry|craving|sick)/i.test(normalized) || /\b(recommend|recommendation|suggest|suggestion|what food|what should i eat|what can i eat|what can you recommend)\b/i.test(normalized)) {
    return 'moodSearch';
  }

  if (isAmbiguousFoodQuery(normalized)) {
    return 'description';
  }

  if (lastIntent === 'ingredients' && lastRecipeName && /^(yes|yes please|sure|please|go ahead|ok|okay|yeah|yep|give it to me)$/i.test(normalized)) {
    return 'followUpYes';
  }

  return 'general';
}

export function buildPrompt(intent: RecipeIntent, dishName: string, language: Language, favorites: string[] = []) {
  const followUpDish = dishName || 'the recipe discussed previously';
  const langHint = 'English';
  const noMarkdown = 'Do not use markdown stars, bold markers, or asterisks. Use plain text only.';

  switch (intent) {
    case 'ingredients':
      return `Return a SUBSTITUTION/INGREDIENTS-focused answer for ${followUpDish}. Use plain text sentences, include quantities where helpful, and end with a concise offer for cooking steps. ${noMarkdown} Do not use bullets, numbering, hashes, or asterisks. Respond in ${langHint}.`;
    case 'steps':
    case 'followUpYes':
      return `Return only the cooking steps for ${followUpDish}. Write them as short plain-text lines or short sentences with no bullets, numbering, hashes, or asterisks. End with a brief offer to provide the full recipe card. ${noMarkdown} Respond in ${langHint}.`;
    case 'description':
      return `Return a short description of ${followUpDish}, covering origin, flavor, and typical use in 2-3 plain-text sentences. End with a brief offer to provide ingredients or the full recipe. ${noMarkdown} Do not use bullets, numbering, hashes, or asterisks. Respond in ${langHint}.`;
    case 'ingredientSearch':
      return `Give 2-3 recipe suggestions using the ingredients the user mentioned. Use plain text sentences separated by line breaks, and close by asking which one they want. ${noMarkdown} Do not use bullets, numbering, hashes, or asterisks. Respond in ${langHint}.`;
    case 'flavorSearch':
      return `Give 3 recipe names with one-line descriptions that match the requested flavor. Use plain text lines, and close by asking if they want ingredients, steps, or the full recipe. ${noMarkdown} Do not use bullets, numbering, hashes, or asterisks. Respond in ${langHint}.`;
    case 'moodSearch':
      return `Give 3 recipe names with one-line descriptions that fit the requested mood. If the user sounds sad, stressed, lonely, tired, or down, recommend comforting, easy, familiar foods first. If the request is vague, briefly explain the mood match and ask a short clarifying question. Use plain text only with line breaks. Do not use bullets, numbering, hashes, or asterisks. Respond in ${langHint}.`;
    case 'favorites':
      return `The user's saved favorites are: ${favorites.length ? favorites.join(', ') : 'none'}. If the list is empty, say they have not saved any recipes yet and invite them to ask for a full recipe. Otherwise list the saved favorites as plain text recipe names and end by telling them they can ask for a full recipe for any item. ${noMarkdown} Do not use bullets, numbering, hashes, or asterisks. Respond in ${langHint}.`;
    case 'fullRecipe':
      return `Return ONLY a recipe card for ${followUpDish} with these sections in plain text:

Recipe Name:
Description:
Ingredients:
(list each ingredient with quantity)
Cooking Instructions:
(numbered steps 1, 2, 3, etc)
Nutrition Facts (per serving):
Calories: value
Protein: value
Carbohydrates: value
Fat: value

Sustainability Note:
(one sentence about sustainable sourcing or eco-friendly practices)

Resource Conservation Tip:
(one sentence about reusing ingredients or reducing waste)

Zero-Waste Guidance:
(list 2-3 ways to use leftovers or reduce waste)

Do NOT include: emoji, asterisks, markdown, bullet points, variations, or extra commentary. ${noMarkdown} Respond in ${langHint}.`;
    default:
      return SYSTEM_PROMPT;
  }
}

export function parseRecipeResponse(raw: string): Recipe | null {
  const cleaned = stripCodeFence(raw);
  if (!cleaned) return null;

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const jsonText = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
    ? cleaned.slice(firstBrace, lastBrace + 1)
    : cleaned;

  try {
    const parsed = JSON.parse(jsonText);

    // Normalize nutrition keys: accept `carbs` or `carbohydrates` from model output
    const parsedCalories = parsed.nutritionFacts?.calories ?? parsed.nutrition?.calories;
    const parsedProtein = parsed.nutritionFacts?.protein ?? parsed.nutrition?.protein;
    const parsedCarbs = parsed.nutritionFacts?.carbs ?? parsed.nutritionFacts?.carbohydrates ?? parsed.nutritionFacts?.carbohydrate ?? parsed.nutrition?.carbs ?? parsed.nutrition?.carbohydrates ?? parsed.nutrition?.carbohydrate;
    const parsedFat = parsed.nutritionFacts?.fat ?? parsed.nutrition?.fat;

    return {
      name: cleanAssistantText(parsed.name || 'Recipe'),
      description: parsed.description ? cleanAssistantText(parsed.description) : undefined,
      cuisineType: cleanAssistantText(parsed.cuisineType || 'Filipino'),
      nutritionFacts: {
        calories: cleanAssistantText(parsedCalories || 'N/A'),
        protein: cleanAssistantText(parsedProtein || 'N/A'),
        carbs: cleanAssistantText(parsedCarbs || 'N/A'),
        fat: cleanAssistantText(parsedFat || 'N/A'),
      },
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map((item: string) => cleanAssistantText(String(item))) : [],
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions.map((item: string) => cleanAssistantText(String(item))) : [],
      sustainabilityNote: parsed.sustainabilityNote ? cleanAssistantText(parsed.sustainabilityNote) : undefined,
      wasteZeroGuidance: Array.isArray(parsed.wasteZeroGuidance) ? parsed.wasteZeroGuidance.map((item: string) => cleanAssistantText(String(item))) : undefined,
      resourceConservationTip: parsed.resourceConservationTip ? cleanAssistantText(parsed.resourceConservationTip) : undefined,
    };
  } catch {
    return null;
  }
}

export async function getChatResponse(history: Array<{ role: string; content: string }> | Message[], userPrompt?: string): Promise<string> {
  const mapped = (history as Array<{ role: string; content: string }>).map(message => ({
    role: message.role === 'model' ? 'assistant' : message.role === 'user' ? 'user' : message.role,
    content: message.content,
  }));

  const payload = [{ role: 'system', content: SYSTEM_PROMPT }, ...mapped];
  const reply = await sendMessage(payload);
  return typeof reply === 'string' ? sanitizeAssistantText(reply, userPrompt) : '(No response)';
}

export async function getRecipeStructured(prompt: string): Promise<Recipe | null> {
  const recipeSystem = SYSTEM_PROMPT + '\n\nWhen asked for a recipe, respond ONLY with a JSON object containing keys: name, cuisineType, nutritionFacts:{calories,protein,carbs,fat}, ingredients[], instructions[].';
  const payload = [
    { role: 'system', content: recipeSystem },
    { role: 'user', content: prompt }
  ];

  try {
    const raw = await sendMessage(payload, 'qwen2.5:7b', { format: 'json' });
    if (!raw) return null;

    const recipe = parseRecipeResponse(raw);
    if (recipe) return recipe;

    console.warn('Recipe parse failed; model returned non-JSON content:', raw);
    return null;
  } catch (error) {
    console.warn('Recipe parse failed', error);
    return null;
  }
}

export function getInitialMessage(_: Language) {
  return "Hello! I'm Mise — your global kitchen companion.  Whether you need a recipe, help with grocery budgeting, meal planning, ingredient swaps, or creative ways to use up leftovers — I'm here for all of it. Every cuisine, every budget, every kitchen setup. So, what are we cooking today?";
}

export function parseRecipeFromText(raw: string): Recipe | null {
  if (!raw || !raw.trim()) return null;
  const lines = raw.replace(/\r/g, '\n').split(/\n+/);
  let section: 'none' | 'ingredients' | 'instructions' | 'nutrition' | 'description' | 'sustainability' | 'resourceTip' | 'zeroWaste' = 'none';
  const ingredients: string[] = [];
  const instructions: string[] = [];
  const zeroWasteLines: string[] = [];
  const nutrition = {
    calories: 'N/A',
    protein: 'N/A',
    carbs: 'N/A',
    fat: 'N/A',
  };
  let name = 'Recipe';
  let description = '';
  let sustainabilityNote = '';
  let resourceConservationTip = '';
  const descriptionLines: string[] = [];

  const asValue = (value?: string) => cleanAssistantText((value ?? '').replace(/^[:\-\s]+/, '').trim()) || 'N/A';

  for (const rawLine of lines) {
    const line = cleanAssistantText(rawLine).trim();
    if (!line) continue;

    const heading = line
      .replace(/^\d+[.)]\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .trim();
    const normalized = heading.toLowerCase();

    if (/^(recipe|recipe name)\b[:\-]?/.test(normalized)) {
      const possibleName = heading.replace(/^(recipe|recipe name)\b[:\-]?\s*/i, '').trim();
      if (possibleName) name = possibleName;
      continue;
    }

    if (/^(description|about|overview)\b/.test(normalized)) {
      section = 'description';
      const inlineDescription = heading.replace(/^(description|about|overview)\b[:\-]?\s*/i, '').trim();
      if (inlineDescription) descriptionLines.push(inlineDescription);
      continue;
    }

    if (/^(ingredients|ingredient list)\b/.test(normalized)) {
      section = 'ingredients';
      continue;
    }

    if (/^(instructions|steps|process|method|directions|procedure|cooking instructions)\b/.test(normalized)) {
      section = 'instructions';
      continue;
    }

    if (/^(nutrition|nutritional information|nutrition facts|nutrition facts \(per serving\)|nutritional facts)\b/.test(normalized)) {
      section = 'nutrition';
      continue;
    }

    if (/^(sustainability note|sustainability)\b/.test(normalized)) {
      section = 'sustainability';
      const inlineSustainability = heading.replace(/^(sustainability note|sustainability)\b[:\-]?\s*/i, '').trim();
      if (inlineSustainability) sustainabilityNote = inlineSustainability;
      continue;
    }

    if (/^(resource conservation tip|resource tip|conservation tip)\b/.test(normalized)) {
      section = 'resourceTip';
      const inlineResourceTip = heading.replace(/^(resource conservation tip|resource tip|conservation tip)\b[:\-]?\s*/i, '').trim();
      if (inlineResourceTip) resourceConservationTip = inlineResourceTip;
      continue;
    }

    if (/^(zero-waste guidance|zero-waste bonus|waste-zero guidance|waste zero|zero waste)\b/.test(normalized)) {
      section = 'zeroWaste';
      continue;
    }

    if (/^(step|instruction|process)\s*\d+\b/.test(normalized) || /^\d+[.)]\s+/.test(heading)) {
      if (section === 'ingredients') {
        section = 'instructions';
      }
    }

    if (section === 'nutrition') {
      const calories = heading.match(/calories?\s*[:\-]\s*(.+)/i);
      const protein = heading.match(/protein\s*[:\-]\s*(.+)/i);
      const carbs = heading.match(/carbohydrates?|carbs?\s*[:\-]\s*(.+)/i);
      const fat = heading.match(/fat\s*[:\-]\s*(.+)/i);
      if (calories) nutrition.calories = asValue(calories[1]);
      if (protein) nutrition.protein = asValue(protein[1]);
      if (carbs) nutrition.carbs = asValue(carbs[1]);
      if (fat) nutrition.fat = asValue(fat[1]);
      continue;
    }

    const nutritionInline = heading.match(/^(calories?|protein|carbohydrates?|carbs?|fat)\s*[:\-]\s*(.+)$/i);
    if (nutritionInline) {
      const key = nutritionInline[1].toLowerCase();
      const value = asValue(nutritionInline[2]);
      if (key.startsWith('cal')) nutrition.calories = value;
      else if (key.startsWith('pro')) nutrition.protein = value;
      else if (key.startsWith('car')) nutrition.carbs = value;
      else if (key.startsWith('fat')) nutrition.fat = value;
      continue;
    }

    if (section === 'description') {
      if (descriptionLines.length < 2) {
        descriptionLines.push(heading);
      }
      continue;
    }

    if (section === 'sustainability') {
      if (!sustainabilityNote) {
        sustainabilityNote = heading;
      }
      continue;
    }

    if (section === 'resourceTip') {
      if (!resourceConservationTip) {
        resourceConservationTip = heading;
      }
      continue;
    }

    if (section === 'zeroWaste') {
      zeroWasteLines.push(heading);
      continue;
    }

    if (section === 'ingredients') {
      if (!/^(step|instruction|process|cook|prepare|mix|heat|serve|bake|fry|simmer|boil|stir|add|combine|whisk|chop)\b/i.test(normalized)) {
        ingredients.push(heading);
      } else {
        section = 'instructions';
        instructions.push(heading);
      }
      continue;
    }

    if (section === 'instructions') {
      instructions.push(heading);
      continue;
    }
  }

  if (ingredients.length === 0 && instructions.length === 0) return null;

  description = cleanAssistantText(descriptionLines.slice(0, 2).join(' ').trim());

  return {
    name: cleanAssistantText(name),
    description: description || undefined,
    cuisineType: 'Various',
    nutritionFacts: nutrition,
    ingredients: ingredients.map(item => cleanAssistantText(item)),
    instructions: instructions.map(item => cleanAssistantText(item)),
    sustainabilityNote: sustainabilityNote ? cleanAssistantText(sustainabilityNote) : undefined,
    wasteZeroGuidance: zeroWasteLines.length > 0 ? zeroWasteLines.map(item => cleanAssistantText(item)) : undefined,
    resourceConservationTip: resourceConservationTip ? cleanAssistantText(resourceConservationTip) : undefined,
  };
}

export function isRecipeValid(recipe: Recipe | null) {
  if (!recipe) return false;
  return Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && Array.isArray(recipe.instructions) && recipe.instructions.length > 0;
}
