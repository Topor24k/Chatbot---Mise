import { History, Menu } from 'lucide-react';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function ChatHeader({ isSidebarOpen, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="h-20 px-8 border-b border-[#E8E8E8] flex items-center justify-between bg-white/80 backdrop-blur shrink-0 relative z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-[#F7F7F7] rounded-lg transition-colors text-[#8B8B8B]"
        >
          <Menu size={20} />
        </button>
        <div className="h-4 w-px bg-[#E8E8E8]" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest leading-none mb-1">
            Session Active
          </span>
          <span className="text-xs font-semibold text-[#07132B]">MISE</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="bg-[#F7F7F7] text-[#8B8B8B] px-4 py-2 rounded-lg text-xs font-bold border border-[#E8E8E8] hover:bg-[#E8E8E8] transition-all flex items-center gap-2">
          <History size={14} />
          <span>{isSidebarOpen ? 'Logout' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
