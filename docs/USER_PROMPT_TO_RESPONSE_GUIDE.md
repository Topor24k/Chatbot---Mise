# User Prompt to Chatbot Response Guide

This guide shows how a user message moves through the app, how the code decides what the user wants, how the model is called, and how the final chatbot response is shown.

## 1) User types a prompt in the input bar

File: [src/components/InputBar.tsx](src/components/InputBar.tsx#L25)

Relevant code:

```tsx
<input
  id="mise-message-input"
  name="message"
  type="text"
  value={input}
  onChange={(event: { target: HTMLInputElement }) => onInputChange(event.target.value)}
  onKeyDown={(event: { key: string }) => event.key === 'Enter' && onSend()}
/>

<button onClick={onSend} disabled={!input.trim() || isLoading}>
  <span>Send</span>
</button>
```

What it does:
- The text box is controlled by React state from the parent component.
- `onInputChange` updates the prompt as the user types.
- Pressing Enter or clicking Send calls `onSend`, which starts the chatbot flow.

## 2) The prompt enters the main chat handler

File: [src/MiseChat.tsx](src/MiseChat.tsx#L184)

Relevant code:

```tsx
const handleSend = async (customInput?: string) => {
  const textToSend = customInput || input;
  if (!textToSend.trim() || isLoading) return;

  const userMsg: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: textToSend,
    timestamp: new Date(),
  };

  setMessages(previous => [...previous, userMsg]);
  setInput('');
  setIsLoading(true);
```

What it does:
- Builds a user message object.
- Adds the message to the chat history immediately so the UI updates right away.
- Clears the input and turns on the loading state while the app prepares the response.

## 3) The app classifies the request before calling the model

File: [src/MiseChat.tsx](src/MiseChat.tsx#L203) and [src/chatUtils.ts](src/chatUtils.ts#L132)

Relevant code:

```tsx
const dishName = extractDishName(textToSend);
const favorites = savedRecipes.map(r => r.name);
const intent = classifyIntent(textToSend, lastIntent, lastRecipeName);
const moodRecommendationQuery = isMoodRecommendationQuery(textToSend);
const ambiguousQuery = isAmbiguousFoodQuery(textToSend);
```

```ts
export function classifyIntent(text: string, lastIntent?: RecipeIntent, lastRecipeName?: string): RecipeIntent {
  // ...
}

export function extractDishName(text: string) {
  // ...
}

export function isMoodRecommendationQuery(text: string) {
  // ...
}

export function isAmbiguousFoodQuery(text: string) {
  // ...
}
```

What it does:
- `extractDishName` tries to pull out the dish or ingredient name from the user’s text.
- `classifyIntent` decides what kind of help is needed, such as `fullRecipe`, `ingredients`, `steps`, `description`, `moodSearch`, or `favorites`.
- `isMoodRecommendationQuery` and `isAmbiguousFoodQuery` catch special cases so the chatbot can give the right style of answer.

## 4) The app builds the prompt for the model

File: [src/chatUtils.ts](src/chatUtils.ts#L226)

Relevant code:

```ts
export function buildPrompt(intent: RecipeIntent, dishName: string, language: Language, favorites: string[] = []) {
  const followUpDish = dishName || 'the recipe discussed previously';
  const langHint = 'English';
  const noMarkdown = 'Do not use markdown stars, bold markers, or asterisks. Use plain text only.';

  switch (intent) {
    case 'fullRecipe':
      return `Return ONLY a recipe card for ${followUpDish} ...`;
    // ...
  }
}
```

What it does:
- Converts the detected intent into a detailed instruction for the model.
- Changes the prompt depending on whether the user wants ingredients, steps, a description, a mood-based suggestion, or a full recipe.
- Keeps the response plain text so the UI can display it cleanly.

## 5) The app sends the prompt to the model

File: [src/chatUtils.ts](src/chatUtils.ts#L333) and [src/api/ollama.js](src/api/ollama.js#L1)

Relevant code:

```ts
export async function getChatResponse(history: Array<{ role: string; content: string }> | Message[], userPrompt?: string): Promise<string> {
  const mapped = (history as Array<{ role: string; content: string }>).map(message => ({
    role: message.role === 'model' ? 'assistant' : message.role === 'user' ? 'user' : message.role,
    content: message.content,
  }));

  const payload = [{ role: 'system', content: SYSTEM_PROMPT }, ...mapped];
  const reply = await sendMessage(payload);
  return typeof reply === 'string' ? sanitizeAssistantText(reply, userPrompt) : '(No response)';
}
```

```ts
export async function sendMessage(messages, model = "qwen2.5:7b", extraBody = {}) {
  const endpoint = base ? `${base.replace(/\/$/, '')}/api/chat` : '/api/chat';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, ...extraBody }),
  });
}
```

What it does:
- `getChatResponse` packages the chat history and system prompt into one request.
- `sendMessage` sends the request to the Ollama-compatible API.
- `sanitizeAssistantText` removes markdown clutter and stray prompt echoes before the answer reaches the UI.

## 6) Full recipe requests use structured JSON first

File: [src/MiseChat.tsx](src/MiseChat.tsx#L236) and [src/chatUtils.ts](src/chatUtils.ts#L346)

Relevant code:

```tsx
recipeData = await getRecipeStructured(`${textToSend} (Reply in English)`);
```

```ts
export async function getRecipeStructured(prompt: string): Promise<Recipe | null> {
  const recipeSystem = SYSTEM_PROMPT + '\n\nWhen asked for a recipe, respond ONLY with a JSON object containing keys: name, cuisineType, nutritionFacts:{calories,protein,carbs,fat}, ingredients[], instructions[].';
  const payload = [
    { role: 'system', content: recipeSystem },
    { role: 'user', content: prompt }
  ];

  const raw = await sendMessage(payload, 'qwen2.5:7b', { format: 'json' });
  const recipe = parseRecipeResponse(raw);
  return recipe;
}
```

What it does:
- Requests a structured JSON recipe instead of plain text.
- Parses the JSON into a `Recipe` object that the UI can render as a card.
- Falls back to free-form recipe parsing if the JSON path fails.

## 7) The final assistant response is added to chat state

File: [src/MiseChat.tsx](src/MiseChat.tsx#L277)

Relevant code:

```tsx
setMessages(previous => [...previous, {
  id: (Date.now() + 1).toString(),
  role: 'model',
  content: responseText,
  recipe: recipeData || undefined,
  timestamp: new Date(),
}]);
```

What it does:
- Stores the assistant response in the message list.
- Attaches `recipeData` when the reply contains structured recipe data.
- This is the point where the chatbot response becomes visible in the UI.

## 8) The UI renders the assistant response and recipe card

File: [src/components/MessageList.tsx](src/components/MessageList.tsx#L14) and [src/components/RecipeCard.tsx](src/components/RecipeCard.tsx#L12)

Relevant code:

```tsx
{message.role === 'model' && !message.recipe ? filterAssistantContent(message.content) : message.content}

{message.recipe && (
  <RecipeCard
    recipe={message.recipe}
    isSaved={savedRecipes.some(r => r.name.toLowerCase() === message.recipe!.name.toLowerCase())}
    onSave={() => onSaveRecipe(message.recipe!)}
  />
)}
```

```tsx
export default function RecipeCard({ recipe, onSave, isSaved }: RecipeCardProps) {
  // ...renders title, nutrition, ingredients, steps, and sustainability notes
}
```

What it does:
- Plain assistant text is shown directly in the conversation.
- Structured recipe data is rendered as a richer recipe card.
- The save button sends the recipe back to the parent so it can be stored in favorites.

## End-to-end summary

1. The user types in [InputBar.tsx](src/components/InputBar.tsx#L25).
2. `handleSend` in [MiseChat.tsx](src/MiseChat.tsx#L184) captures the text and adds the user message.
3. `extractDishName`, `classifyIntent`, and the heuristic helpers in [chatUtils.ts](src/chatUtils.ts#L132) decide what the prompt should do.
4. `buildPrompt` in [chatUtils.ts](src/chatUtils.ts#L226) creates the model instruction.
5. `getChatResponse` or `getRecipeStructured` in [chatUtils.ts](src/chatUtils.ts#L333) and [chatUtils.ts](src/chatUtils.ts#L346) sends the request through [src/api/ollama.js](src/api/ollama.js#L1).
6. The response is sanitized, stored in chat state, and rendered by [MessageList.tsx](src/components/MessageList.tsx#L14).
