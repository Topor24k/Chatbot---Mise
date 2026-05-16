import { ChefHat, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Message, Recipe } from '../chatTypes';
import RecipeCard from './RecipeCard';

interface MessageListProps {
  messages: Message[];
  savedRecipes: Recipe[];
  isLoading: boolean;
  scrollRef: { current: HTMLDivElement | null };
  onSaveRecipe: (recipe: Recipe) => void;
}

export default function MessageList({ messages, savedRecipes, isLoading, scrollRef, onSaveRecipe }: MessageListProps) {
  function filterAssistantContent(content: string) {
    if (!content) return content;
    const lines = content.split(/\r?\n/);
    const forbidden = /^(sustainability|resource|waste|zero-waste|zero waste|chef's secret|waste-zero|energy tip|resource conservation|variation)/i;
    const filtered = lines.filter(line => !forbidden.test(line.trim()));
    return filtered.join('\n').trim();
  }
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 md:px-16 py-12 space-y-10 scroll-smooth custom-scrollbar bg-[radial-gradient(#E8E8E8_1px,transparent_1px)] [background-size:24px_24px]"
    >
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        <AnimatePresence initial={false}>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  message.role === 'user'
                    ? 'bg-[#000000] border-[#000000] text-white'
                    : 'bg-white border-[#E8E8E8] text-[#000000]'
                }`}>
                  {message.role === 'user' ? <User size={18} /> : <ChefHat size={18} />}
                </div>

                <div className="space-y-4 flex-1">
                  <div className={`p-5 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[#000000] text-white shadow-lg'
                      : 'bg-white border border-[#E8E8E8] shadow-sm text-[#000000]'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-[15px] font-medium">
                      {message.role === 'model' && !message.recipe ? filterAssistantContent(message.content) : message.content}
                    </div>
                    <div className={`mt-4 text-[9px] font-bold uppercase tracking-widest ${
                      message.role === 'user' ? 'text-white/40' : 'text-[#8B8B8B]'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {message.recipe && (
                    <RecipeCard
                      recipe={message.recipe}
                      isSaved={savedRecipes.some(r => r.name.toLowerCase() === message.recipe!.name.toLowerCase())}
                      onSave={() => onSaveRecipe(message.recipe!)}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center text-[#8B8B8B] shadow-sm">
                <ChefHat size={18} className="animate-pulse" />
              </div>
              <div className="bg-[#F7F7F7] border border-[#E8E8E8] p-4 rounded-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#8B8B8B] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#8B8B8B] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#8B8B8B] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
