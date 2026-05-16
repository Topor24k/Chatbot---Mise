import type { ReactNode } from 'react';
import { Clock, Heart, Paperclip, Send, TrendingUp, Utensils } from 'lucide-react';
import { Language } from '../chatTypes';

interface InputBarProps {
  lang: Language;
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

const styles = {
  wrapper: 'px-8 pb-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-[#E8E8E8] shrink-0',
  container: 'max-w-3xl mx-auto space-y-6',
  toolsRow: 'flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide py-1',
  inputCard: 'relative glass-card rounded-2xl p-2 pl-6 flex items-center gap-3 shadow-lg focus-within:ring-2 focus-within:ring-[#E8E8E8] transition-all border-[#E8E8E8] bg-white',
  paperclip: 'text-[#8B8B8B] hover:text-[#000000] cursor-pointer',
  input: 'flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-[#000000] placeholder:text-[#8B8B8B] py-3',
  sendButton: 'bg-[#000000] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#FF1E1E] disabled:opacity-30 transition-all flex items-center gap-2',
  toolButton: 'flex items-center gap-2 text-[10px] font-bold text-[#8B8B8B] hover:text-[#000000] transition-all uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-[#F7F7F7] shrink-0 border border-transparent hover:border-[#E8E8E8]',
  toolIcon: 'text-[#E8E8E8] group-hover:text-[#FF1E1E]'
};

export default function InputBar({ lang, input, isLoading, onInputChange, onSend }: InputBarProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.toolsRow}>
          <ToolButton icon={<TrendingUp size={14} />} label="Nutrition" />
          <ToolButton icon={<Utensils size={14} />} label="Waste-Zero" />
          <ToolButton icon={<Heart size={14} />} label="Healthy" />
          <ToolButton icon={<Clock size={14} />} label="Quick" />
        </div>

        <div className={styles.inputCard}>
          <Paperclip className={styles.paperclip} size={18} />
          <input
            id="mise-message-input"
            name="message"
            type="text"
            value={input}
            onChange={(event: { target: HTMLInputElement }) => onInputChange(event.target.value)}
            onKeyDown={(event: { key: string }) => event.key === 'Enter' && onSend()}
            placeholder={'Describe ingredients or ask for a recipe...'}
            className={styles.input}
          />
          <button onClick={onSend} disabled={!input.trim() || isLoading} className={styles.sendButton}>
            <span>Send</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className={styles.toolButton}>
      <span className={styles.toolIcon}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
