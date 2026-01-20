
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatMessage, HistoryItem } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', title: '智能扫地机器人主控板报价', date: '2024-03-20' },
    { id: '2', title: '工业网关 6层板打样分析', date: '2024-03-19' },
    { id: '3', title: '多路电源管理模块 BOM 比价', date: '2024-03-18' }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSendMessage = (content: string, files: any[]) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      files,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAF9] overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        history={history}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-sm">
        <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">PCB 智能报价助手</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">Enterprise</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>系统运行正常</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 cursor-pointer">
              <span className="text-xs font-medium text-slate-600">L</span>
            </div>
          </div>
        </header>
        
        <ChatArea 
          messages={messages} 
          onSendMessage={handleSendMessage}
          setMessages={setMessages}
        />
      </main>
    </div>
  );
};

export default App;
