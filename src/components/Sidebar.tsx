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
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      className="h-full bg-white border-r border-[#E8E8E8] flex flex-col overflow-hidden shrink-0 relative z-40 transition-[width] duration-300 ease-in-out shadow-sm"
    >
      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className={`h-20 flex items-center px-6 border-b border-[#E8E8E8] ${isOpen ? 'justify-between' : 'justify-center'} shrink-0`}>
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#07132B] rounded-lg flex items-center justify-center shadow-md">
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-lg tracking-tight text-[#07132B]">Mise</h1>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8B8B8B]">ProCook Edition</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-[#07132B] rounded-lg flex items-center justify-center shadow-md">
              <ChefHat size={22} className="text-white" />
            </div>
          )}
        </div>

        <div className="px-4 py-6 shrink-0">
          <button
            onClick={onNewSession}
            className={`flex items-center transition-all bg-[#FF1E1E] text-white rounded-xl font-semibold hover:bg-[#07132B] active:scale-95 ${
              isOpen
                ? 'w-full py-3 px-4 gap-3'
                : 'w-12 h-12 justify-center mx-auto'
            }`}
            title="New Chat"
          >
            <Plus size={18} />
            {isOpen && <span className="text-sm">New Session</span>}
          </button>
        </div>

        <div className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-1">
          {isOpen && (
            <h3 className="px-2 mb-3 text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest">History</h3>
          )}
          {historyList.length === 0 && (
            <div className="px-2 text-[12px] text-[#8B8B8B]">No previous sessions</div>
          )}
          {historyList.map(session => (
            <div key={session.id} className="flex items-center justify-between gap-2 py-2.5 rounded-lg px-2 hover:bg-[#F7F7F7]">
              <button
                onClick={() => onLoadSession(session.id)}
                className="flex-1 text-left truncate text-sm font-semibold text-[#8B8B8B]"
              >
                {session.title}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => onLoadSession(session.id)} title="Open" className="text-[#8B8B8B] hover:text-[#000]">
                  <History size={16} />
                </button>
                <button onClick={() => onDeleteSession(session.id)} title="Delete" className="text-[#8B8B8B] hover:text-[#000]">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {isOpen && (
          <div className="px-4 py-3 border-t border-[#E8E8E8]">
            <h3 className="px-2 mb-3 text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest">Saved Recipes</h3>
            {(!savedRecipes || savedRecipes.length === 0) && (
              <div className="px-2 text-[12px] text-[#8B8B8B]">No saved recipes</div>
            )}
            {savedRecipes && savedRecipes.map((recipe: Recipe) => (
              <div key={recipe.name} className="flex items-center justify-between gap-2 py-2.5 rounded-lg px-2 hover:bg-[#F7F7F7]">
                <button
                  onClick={() => onOpenSavedRecipe && onOpenSavedRecipe(recipe.name)}
                  className="flex-1 text-left truncate text-sm font-semibold text-[#8B8B8B]"
                >
                  {recipe.name}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => onOpenSavedRecipe && onOpenSavedRecipe(recipe.name)} title="Open" className="text-[#8B8B8B] hover:text-[#000]">
                    <History size={16} />
                  </button>
                    <button onClick={() => onDeleteSavedRecipe && onDeleteSavedRecipe(recipe.name)} title="Delete" className="text-[#8B8B8B] hover:text-[#000]">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

          <div className={`p-2 rounded-xl border border-[#E8E8E8] bg-[#F7F7F7] flex items-center transition-all ${isOpen ? 'gap-3 px-3' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-[#E8E8E8] flex items-center justify-center text-[#8B8B8B] shrink-0">
              <User size={16} />
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">Host Account</p>
                <p className="text-[10px] text-[#8B8B8B] font-medium">Standard</p>
              </div>
            )}
          </div>
        </div>
    </motion.aside>
  );    
}
