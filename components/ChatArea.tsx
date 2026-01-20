
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, FileInfo } from '../types';
import { 
  Paperclip, 
  Send, 
  FileIcon, 
  X,
  Loader2,
  Cpu,
  Layers,
  AlertTriangle,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { generateQuotationAnalysis } from '../services/geminiService';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, files: FileInfo[]) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, setMessages }) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isAnalyzing]);

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    
    const userPrompt = input;
    const currentFiles = [...attachedFiles];
    
    onSendMessage(userPrompt, currentFiles);
    setInput('');
    setAttachedFiles([]);
    setIsAnalyzing(true);

    try {
      const result = await generateQuotationAnalysis(userPrompt, currentFiles);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.reasoning,
        result: result,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，系统在处理您的文件时遇到了错误，请稍后再试或检查文件格式。',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: FileInfo[] = Array.from(files).map((f: File) => ({
        name: f.name,
        type: f.name.toLowerCase().endsWith('.zip') || f.name.toLowerCase().endsWith('.rar') ? 'gerber' : 'bom',
        size: (f.size / 1024).toFixed(1) + 'KB'
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAF9]">
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #14b8a6 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      ></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="relative group">
               <div className="absolute -inset-4 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all duration-500"></div>
               <img 
                 src="https://chat-web-1253214834.cos.ap-beijing.myqcloud.com/image/a98360672e312beb0fcc5fdaaf57a568.png" 
                 className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl" 
                 alt="avatar" 
               />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-800 tracking-tight">造物潭已就绪</h1>
              <p className="text-slate-500 text-lg">随时准备启动研发任务</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-4">
              {[
                { title: "Gerber 解析", desc: "自动提取层数、线宽、孔径参数", icon: <Layers size={18} /> },
                { title: "DFM 风险", desc: "识别制造瓶颈与良率隐患", icon: <Cpu size={18} /> },
                { title: "实时报价", desc: "基于大宗商品指数的精准预测", icon: <TrendingUp size={18} /> },
                { title: "替代推荐", desc: "关键器件停产预警与替换选型", icon: <AlertTriangle size={18} /> }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white/80 backdrop-blur-sm text-left hover:border-teal-200 hover:bg-teal-50 transition-all cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 group-hover:text-teal-500">{item.icon}</span>
                    <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isAnalyzing && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center shrink-0">
                <BrainCircuit className="text-white" size={18} />
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm max-w-[85%]">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <Loader2 className="animate-spin text-teal-500" size={16} />
                  <span>AI 引擎正在分析文件内容并模拟市场波动...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-slate-200 bg-white/80 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto relative">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-xs text-teal-700">
                  <FileIcon size={14} className="text-teal-500" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-teal-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-lg focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-50 transition-all">
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="请描述需求，输入@可调用BOM档案"
              className="flex-1 bg-transparent border-none focus:ring-0 text-base py-1 resize-none min-h-[44px] max-h-32"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  title="上传文件"
                >
                  <Paperclip size={20} />
                </button>
                <div className="h-6 w-[1px] bg-slate-100 mx-1"></div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium hover:bg-teal-100 transition-all">
                   <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                   均衡模式
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={isAnalyzing || (!input.trim() && attachedFiles.length === 0)}
                className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-200 flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-between px-2">
            <div className="flex gap-4">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">支持 Gerber / BOM / PDF</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">专业级 PCB 分析引擎</span>
            </div>
            <span className="text-[11px] text-slate-400">Enter 发送</span>
          </div>
        </div>
      </div>
    </div>
  );
};
