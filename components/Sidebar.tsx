
import React from 'react';
import { HistoryItem } from '../types';
import { 
  MessageSquare, 
  History, 
  Settings, 
  Plus, 
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  history: HistoryItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, history }) => {
  return (
    <aside className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r border-slate-200 flex flex-col bg-white shrink-0 relative`}>
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm z-10"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <img src="http://1.15.1.90:3000/icon/logo.svg" alt="logo" className="w-full h-full object-contain" />
        </div>
        {isOpen && <span className="font-bold text-slate-800 tracking-tight text-lg">造物潭</span>}
      </div>

      <div className="px-3 py-2">
        <button className={`w-full flex items-center gap-2 ${isOpen ? 'px-4 justify-start' : 'justify-center px-0'} py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm transition-colors shadow-sm`}>
          <Plus size={18} />
          {isOpen && <span>新建会话</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {isOpen && (
          <>
            <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">历史会话</div>
            <div className="space-y-1 px-2">
              {history.map(item => (
                <button key={item.id} className="w-full text-left px-3 py-2 rounded text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 truncate transition-colors group">
                  <MessageSquare size={16} className="text-slate-400 group-hover:text-teal-500" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {!isOpen && (
          <div className="flex flex-col items-center gap-4">
            <History size={20} className="text-slate-400 cursor-pointer hover:text-teal-500" />
            <Search size={20} className="text-slate-400 cursor-pointer hover:text-teal-500" />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="space-y-1">
          <button className={`w-full flex items-center gap-3 ${isOpen ? 'px-3 justify-start' : 'justify-center'} py-2 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors`}>
            <ShieldCheck size={18} className="text-slate-400" />
            {isOpen && <span>供应链安全</span>}
          </button>
          <button className={`w-full flex items-center gap-3 ${isOpen ? 'px-3 justify-start' : 'justify-center'} py-2 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors`}>
            <Settings size={18} className="text-slate-400" />
            {isOpen && <span>系统设置</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
