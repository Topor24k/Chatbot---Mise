import { History, Menu } from 'lucide-react';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const styles = {
  header: 'h-20 px-8 border-b border-[#E8E8E8] flex items-center justify-between bg-white/80 backdrop-blur shrink-0 relative z-30',
  leftGroup: 'flex items-center gap-4',
  menuButton: 'p-2.5 hover:bg-[#F7F7F7] rounded-lg transition-colors text-[#8B8B8B]',
  separator: 'h-4 w-px bg-[#E8E8E8]',
  sessionMeta: 'flex flex-col',
  sessionLabel: 'text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest leading-none mb-1',
  title: 'text-xs font-semibold text-[#07132B]',
  rightGroup: 'flex items-center gap-2',
  logoutButton: 'bg-[#F7F7F7] text-[#8B8B8B] px-4 py-2 rounded-lg text-xs font-bold border border-[#E8E8E8] hover:bg-[#E8E8E8] transition-all flex items-center gap-2',
};

export default function ChatHeader({ isSidebarOpen, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leftGroup}>
        {/* Toggle sidebar visibility (UI only) */}
        <button onClick={onToggleSidebar} className={styles.menuButton}>
          <Menu size={20} />
        </button>
        <div className={styles.separator} />
        <div className={styles.sessionMeta}>
          <span className={styles.sessionLabel}>Session Active</span>
          <span className={styles.title}>MISE</span>
        </div>
      </div>

      <div className={styles.rightGroup}>
        {/* Logout / session actions live here — not directly tied to LLM calls */}
        <button className={styles.logoutButton}>
          <History size={14} />
          <span>{isSidebarOpen ? 'Logout' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
