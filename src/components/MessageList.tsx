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

  const styles = {
    outer: 'flex-1 overflow-y-auto px-6 md:px-16 py-12 space-y-10 scroll-smooth custom-scrollbar bg-[radial-gradient(#E8E8E8_1px,transparent_1px)] [background-size:24px_24px]',
    inner: 'max-w-4xl mx-auto space-y-10 pb-20',
    messageRow: (role: string) => `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`,
    messageContainer: (role: string) => `flex gap-4 max-w-[90%] md:max-w-[80%] ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`,
    avatar: (role: string) => `w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border ${role === 'user' ? 'bg-[#000000] border-[#000000] text-white' : 'bg-white border-[#E8E8E8] text-[#000000]'}`,
    messageBox: (role: string) => `p-5 rounded-2xl ${role === 'user' ? 'bg-[#000000] text-white shadow-lg' : 'bg-white border border-[#E8E8E8] shadow-sm text-[#000000]'}`,
    messageText: 'whitespace-pre-wrap leading-relaxed text-sm md:text-[15px] font-medium',
    timestamp: (role: string) => `mt-4 text-[9px] font-bold uppercase tracking-widest ${role === 'user' ? 'text-white/40' : 'text-[#8B8B8B]'}`,
    loadingRow: 'flex justify-start',
    loadingInner: 'flex gap-4',
    loadingAvatar: 'w-9 h-9 rounded-lg bg-white border border-[#E8E8E8] flex items-center justify-center text-[#8B8B8B] shadow-sm',
    loadingBubble: 'bg-[#F7F7F7] border border-[#E8E8E8] p-4 rounded-xl flex items-center gap-1.5',
    loadingDot: 'w-1.5 h-1.5 bg-[#8B8B8B] rounded-full animate-bounce',
  };

  return (
    <div ref={scrollRef} className={styles.outer}>
      <div className={styles.inner}>
        <AnimatePresence initial={false}>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={styles.messageRow(message.role)}
            >
              <div className={styles.messageContainer(message.role)}>
                <div className={styles.avatar(message.role)}>
                  {message.role === 'user' ? <User size={18} /> : <ChefHat size={18} />}
                </div>

                <div className="space-y-4 flex-1">
                  <div className={styles.messageBox(message.role)}>
                    <div className={styles.messageText}>
                      {/* If the assistant message includes a structured `recipe` object,
                          the UI renders that `RecipeCard` separately below. Otherwise,
                          display filtered assistant text (remove verbose sustainability
                          blocks when appropriate). */}
                      {message.role === 'model' && !message.recipe ? filterAssistantContent(message.content) : message.content}
                    </div>
                    <div className={styles.timestamp(message.role)}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* When a `Recipe` is attached to a message (parsed from LLM output),
                      render a `RecipeCard`. The `onSave` callback persists the recipe
                      to `localStorage` via the parent `MiseChat` component. */}
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
          <div className={styles.loadingRow}>
            <div className={styles.loadingInner}>
              <div className={styles.loadingAvatar}>
                <ChefHat size={18} className="animate-pulse" />
              </div>
              <div className={styles.loadingBubble}>
                <span className={styles.loadingDot} />
                <span className={`${styles.loadingDot} [animation-delay:0.2s]`} />
                <span className={`${styles.loadingDot} [animation-delay:0.4s]`} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
