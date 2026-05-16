import { useEffect, useRef, useState } from 'react';
import ChatHeader from './components/ChatHeader';
import InputBar from './components/InputBar';
import MessageList from './components/MessageList';
import Sidebar from './components/Sidebar';
import { buildPrompt, classifyIntent, extractDishName, getChatResponse, getInitialMessage, getRecipeStructured, parseRecipeFromText, isAmbiguousFoodQuery, isMoodRecommendationQuery } from './chatUtils';
import { Language, Message, Recipe, RecipeIntent, SavedSession } from './chatTypes';

const HISTORY_KEY = 'mise_chat_history_v1';

export default function MiseChat() {
  const [lang, setLang] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [lastIntent, setLastIntent] = useState<RecipeIntent>('general');
  const [lastRecipeName, setLastRecipeName] = useState('');
  const [historyList, setHistoryList] = useState<SavedSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: getInitialMessage('en'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedSession[];
      setHistoryList(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.warn('Failed to load local chat history', error);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mise_saved_recipes_v1');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Recipe[];
      setSavedRecipes(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.warn('Failed to load saved recipes', error);
    }
  }, []);

  useEffect(() => {
    setMessages(previous => (
      previous.length === 1 && previous[0].id === 'welcome'
        ? [{ ...previous[0], content: getInitialMessage(lang) }]
        : previous
    ));
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  function persistHistory(nextHistory: SavedSession[]) {
    setHistoryList(nextHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (error) {
      console.warn('Failed to persist local chat history', error);
    }
  }

  function sessionTitleFromMessages(currentMessages: Message[]) {
    const firstUser = currentMessages.find(message => message.role === 'user');
    const title = firstUser ? firstUser.content.slice(0, 40) : `Session ${new Date().toLocaleString()}`;
    return title.replace(/\n/g, ' ').trim();
  }

  function saveCurrentSessionToHistory() {
    if (messages.length === 0) return;
    if (messages.length === 1 && messages[0].id === 'welcome') return;

    const entry: SavedSession = {
      id: Date.now().toString(),
      title: sessionTitleFromMessages(messages),
      timestamp: new Date().toISOString(),
      messages: messages.map(message => ({
        ...message,
        timestamp: message.timestamp.toISOString(),
      })),
    };

    persistHistory([entry, ...historyList].slice(0, 50));
  }

  function loadSession(id: string) {
    const session = historyList.find(item => item.id === id);
    if (!session) return;

    const loadedMessages: Message[] = session.messages.map(message => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));

    setMessages(loadedMessages.length ? loadedMessages : [{
      id: 'welcome',
      role: 'model',
      content: getInitialMessage(lang),
      timestamp: new Date(),
    }]);
  }

  function deleteSession(id: string) {
    persistHistory(historyList.filter(item => item.id !== id));
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this session? This cannot be undone.')) return;
    deleteSession(id);
  }

  function handleNewSession() {
    saveCurrentSessionToHistory();
    setMessages([{ id: 'welcome', role: 'model', content: getInitialMessage(lang), timestamp: new Date() }]);
  }

  function handleSaveRecipe(recipe: Recipe) {
    setSavedRecipes(prev => {
      const exists = prev.some(r => r.name.toLowerCase() === recipe.name.toLowerCase());
      if (exists) return prev;
      const next = [...prev, recipe];
      try { localStorage.setItem('mise_saved_recipes_v1', JSON.stringify(next)); } catch (e) { console.warn('Failed to persist saved recipes', e); }
      return next;
    });
  }

  function deleteSavedRecipe(name: string) {
    setSavedRecipes(prev => {
      const next = prev.filter(r => r.name.toLowerCase() !== name.toLowerCase());
      try { localStorage.setItem('mise_saved_recipes_v1', JSON.stringify(next)); } catch (e) { console.warn('Failed to persist saved recipes', e); }
      return next;
    });
  }

  function openSavedRecipe(name: string) {
    const recipe = savedRecipes.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (!recipe) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      content: `Saved recipe: ${recipe.name}`,
      recipe,
      timestamp: new Date(),
    }]);
    setLastIntent('fullRecipe');
    setLastRecipeName(recipe.name);
  }

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

    try {
      const dishName = extractDishName(textToSend);
      const favorites = savedRecipes.map(r => r.name);
      const intent = classifyIntent(textToSend, lastIntent, lastRecipeName);
      const moodRecommendationQuery = isMoodRecommendationQuery(textToSend);
      const ambiguousQuery = isAmbiguousFoodQuery(textToSend);

      if (intent === 'favorites') {
        const responseText = favorites.length
          ? `Your saved favorites are: ${favorites.join(', ')}. Say full recipe for a name to view it again.`
          : `You haven't saved any recipes yet. Ask for a full recipe and tap to save it!`;

        setLastIntent(intent);
        setMessages(previous => [...previous, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: new Date(),
        }]);
        return;
      }

      if (intent === 'fullRecipe') {
        let responseText = '';
        let recipeData: Recipe | null = null;

        recipeData = await getRecipeStructured(`${textToSend} (Reply in English)`);

        if (recipeData) {
          const recipe = recipeData;
          const duplicate = savedRecipes.some(r => r.name.toLowerCase() === recipe.name.toLowerCase());
          if (duplicate) {
            responseText = `${recipe.name} is already in your favorites. Would you like an alternative version? I can offer a healthier variation, a budget-friendly version, a premium version, a different serving size, or a different preparation style. Which would you prefer?`;
            recipeData = null;
          } else {
            responseText = 'Tap the button to save this to your favorites.';
            setLastRecipeName(recipe.name.trim());
          }
        } else {
          responseText = await getChatResponse([
            { role: 'system', content: buildPrompt('fullRecipe', dishName || lastRecipeName, lang, favorites) },
            { role: 'user', content: textToSend },
          ], textToSend);

          if (responseText && responseText !== '(No response)') {
            const parsed = parseRecipeFromText(responseText);
            if (parsed) {
              recipeData = {
                ...parsed,
                name: parsed.name && parsed.name.toLowerCase() !== 'recipe' ? parsed.name : (dishName || lastRecipeName || parsed.name),
                description: parsed.description || `A classic ${dishName || lastRecipeName || 'recipe'} that can be adapted to taste, budget, and local ingredients.`,
              };
              responseText = 'Tap the button to save this to your favorites.';
              setLastRecipeName((recipeData.name || '').trim());
            }
          }

          if (!recipeData && (!responseText || responseText === '(No response)')) {
            const targetName = dishName || lastRecipeName || textToSend.trim();
            responseText = `I can help with ${targetName}. Try asking for ingredients, cooking steps, or a full recipe. If you want, I can also give you a common, simple version first.`;
          }
        }

        setLastIntent(intent);
        setMessages(previous => [...previous, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          recipe: recipeData || undefined,
          timestamp: new Date(),
        }]);
        return;
      }

      if (moodRecommendationQuery) {
        const intent = classifyIntent(textToSend, lastIntent, lastRecipeName);
        const responseText = await getChatResponse([
          { role: 'system', content: buildPrompt('moodSearch', dishName || lastRecipeName || '', lang, favorites) },
          { role: 'user', content: textToSend },
        ], textToSend);

        setLastIntent(intent === 'general' ? 'moodSearch' : intent);
        setMessages(previous => [...previous, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: new Date(),
        }]);
        return;
      }

      if (ambiguousQuery) {
          const displayName = dishName || textToSend.trim();
          setLastIntent('description');

          try {
            const modelResp = await getChatResponse([
            { role: 'system', content: buildPrompt('description', displayName, lang, favorites) },
              { role: 'user', content: displayName }
            ], textToSend);

            const trimmed = modelResp ? modelResp.trim() : '';
            const finalText = trimmed.length
              ? trimmed
              : `${displayName} is a common food name that can mean different things depending on context.`;

            setMessages(previous => [...previous, {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: finalText,
              timestamp: new Date(),
            }]);
          } catch (err) {
            const fallback = `${displayName} is a common food name that can mean different things depending on context.`;
            setMessages(previous => [...previous, {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: fallback,
              timestamp: new Date(),
            }]);
          }

          return;
      }

      let responseText = '';
      let recipeData: Recipe | null = null;
      if (intent === 'ingredients' || intent === 'steps' || intent === 'description' || intent === 'ingredientSearch' || intent === 'flavorSearch' || intent === 'moodSearch' || intent === 'followUpYes') {
        responseText = await getChatResponse([
          { role: 'system', content: buildPrompt(intent, dishName || lastRecipeName, lang, favorites) },
          { role: 'user', content: textToSend },
        ], textToSend);

        if (intent === 'ingredients' || intent === 'steps' || intent === 'description' || intent === 'followUpYes') {
          setLastRecipeName(dishName || lastRecipeName);
        }
      } else {
        responseText = 'I can help with ingredients, cooking steps, full recipes, ingredient ideas, flavor ideas, or mood based food suggestions. What would you like to cook today?';
      }

      setLastIntent(intent);

      setMessages(previous => [...previous, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        recipe: recipeData || undefined,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error(error);
      setMessages(previous => [...previous, {
        id: 'error',
        role: 'model',
        content: 'I encountered a problem. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F7F7F7] font-sans text-[#000000] flex overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        lang={lang}
        historyList={historyList}
        savedRecipes={savedRecipes}
        onNewSession={handleNewSession}
        onLoadSession={loadSession}
        onDeleteSession={handleDelete}
        onOpenSavedRecipe={openSavedRecipe}
        onDeleteSavedRecipe={deleteSavedRecipe}
        onLanguageChange={setLang}
      />

      <main className="flex-1 flex flex-col relative bg-white overflow-hidden shadow-2xl z-20">
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(previous => !previous)}
        />

        <MessageList
          messages={messages}
          savedRecipes={savedRecipes}
          isLoading={isLoading}
          scrollRef={scrollRef}
          onSaveRecipe={handleSaveRecipe}
        />

        <InputBar
          lang={lang}
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSend={() => handleSend()}
        />
      </main>
    </div>
  );
}
