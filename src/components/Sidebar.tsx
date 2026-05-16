import { ChefHat, History, Plus, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, SavedSession, Recipe } from '../chatTypes';

interface SidebarProps {
  isOpen: boolean;
  lang: Language;
  historyList: SavedSession[];
  savedRecipes?: Recipe[];
  onNewSession: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenSavedRecipe?: (name: string) => void;
  onDeleteSavedRecipe?: (name: string) => void;
  onLanguageChange: (language: Language) => void;
}

export default function Sidebar({
  isOpen,
  lang,
  historyList,
  savedRecipes,
  onNewSession,
  onLoadSession,
  onDeleteSession,
  onOpenSavedRecipe,
  onDeleteSavedRecipe,
  onLanguageChange,
}: SidebarProps) {
  const styles = {
    aside: 'h-full bg-white border-r border-[#E8E8E8] flex flex-col overflow-hidden shrink-0 relative z-40 transition-[width] duration-300 ease-in-out shadow-sm',
    inner: 'flex flex-col h-full w-full overflow-hidden',
    header: (open: boolean) => `h-20 flex items-center px-6 border-b border-[#E8E8E8] ${open ? 'justify-between' : 'justify-center'} shrink-0`,
    brandRow: 'flex items-center gap-3',
    brandIconSmall: 'w-9 h-9 bg-[#07132B] rounded-lg flex items-center justify-center shadow-md',
    brandIconTiny: 'w-10 h-10 bg-[#07132B] rounded-lg flex items-center justify-center shadow-md',
    brandTitle: 'font-display font-extrabold text-lg tracking-tight text-[#07132B]',
    brandSubtitle: 'text-[10px] uppercase tracking-widest font-bold text-[#8B8B8B]',
    newSessionWrap: 'px-4 py-6 shrink-0',
    newSessionButton: (open: boolean) => `flex items-center transition-all bg-[#FF1E1E] text-white rounded-xl font-semibold hover:bg-[#07132B] active:scale-95 ${open ? 'w-full py-3 px-4 gap-3' : 'w-12 h-12 justify-center mx-auto'}`,
    historyWrap: 'flex-1 px-4 overflow-y-auto custom-scrollbar space-y-1',
    historyTitle: 'px-2 mb-3 text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest',
    emptyText: 'px-2 text-[12px] text-[#8B8B8B]',
    sessionItem: 'flex items-center justify-between gap-2 py-2.5 rounded-lg px-2 hover:bg-[#F7F7F7]',
    sessionButton: 'flex-1 text-left truncate text-sm font-semibold text-[#8B8B8B]',
    sessionActions: 'flex items-center gap-2',
    savedWrap: 'px-4 py-3 border-t border-[#E8E8E8]',
    savedTitle: 'px-2 mb-3 text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest',
    savedItem: 'flex items-center justify-between gap-2 py-2.5 rounded-lg px-2 hover:bg-[#F7F7F7]',
    savedActions: 'flex items-center gap-2',
    accountBox: (open: boolean) => `p-2 rounded-xl border border-[#E8E8E8] bg-[#F7F7F7] flex items-center transition-all ${open ? 'gap-3 px-3' : 'justify-center'}`,
    accountIcon: 'w-8 h-8 rounded-full bg-[#E8E8E8] flex items-center justify-center text-[#8B8B8B] shrink-0',
    accountTextTitle: 'text-xs font-bold truncate',
    accountTextSubtitle: 'text-[10px] text-[#8B8B8B] font-medium',
  };

  return (
    <motion.aside initial={false} animate={{ width: isOpen ? 280 : 80 }} className={styles.aside}>
      <div className={styles.inner}>
        <div className={styles.header(isOpen)}>
          {isOpen ? (
            <div className={styles.brandRow}>
              <div className={styles.brandIconSmall}>
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <h1 className={styles.brandTitle}>Mise</h1>
                <span className={styles.brandSubtitle}>ProCook Edition</span>
              </div>
            </div>
          ) : (
            <div className={styles.brandIconTiny}>
              <ChefHat size={22} className="text-white" />
            </div>
          )}
        </div>

        <div className={styles.newSessionWrap}>
          <button onClick={onNewSession} className={styles.newSessionButton(isOpen)} title="New Chat">
            <Plus size={18} />
            {isOpen && <span className="text-sm">New Session</span>}
          </button>
        </div>

        <div className={styles.historyWrap}>
          {isOpen && <h3 className={styles.historyTitle}>History</h3>}
          {historyList.length === 0 && <div className={styles.emptyText}>No previous sessions</div>}
          {historyList.map(session => (
            <div key={session.id} className={styles.sessionItem}>
              <button onClick={() => onLoadSession(session.id)} className={styles.sessionButton}>
                {session.title}
              </button>
              <div className={styles.sessionActions}>
                <button onClick={() => onLoadSession(session.id)} title="Open" className="text-[#8B8B8B] hover:text-[#000]">
                  <History size={16} />
                </button>
                <button onClick={() => onDeleteSession(session.id)} title="Delete" className="text-[#8B8B8B] hover:text-[#000]">✕</button>
              </div>
            </div>
          ))}
        </div>

        {isOpen && (
          <div className={styles.savedWrap}>
            <h3 className={styles.savedTitle}>Saved Recipes</h3>
            {(!savedRecipes || savedRecipes.length === 0) && <div className={styles.emptyText}>No saved recipes</div>}
            {savedRecipes && savedRecipes.map((recipe: Recipe) => (
              <div key={recipe.name} className={styles.savedItem}>
                <button onClick={() => onOpenSavedRecipe && onOpenSavedRecipe(recipe.name)} className={styles.sessionButton}>
                  {recipe.name}
                </button>
                <div className={styles.savedActions}>
                  <button onClick={() => onOpenSavedRecipe && onOpenSavedRecipe(recipe.name)} title="Open" className="text-[#8B8B8B] hover:text-[#000]">
                    <History size={16} />
                  </button>
                  <button onClick={() => onDeleteSavedRecipe && onDeleteSavedRecipe(recipe.name)} title="Delete" className="text-[#8B8B8B] hover:text-[#000]">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.accountBox(isOpen)}>
          <div className={styles.accountIcon}><User size={16} /></div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className={styles.accountTextTitle}>Host Account</p>
              <p className={styles.accountTextSubtitle}>Standard</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
