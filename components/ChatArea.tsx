
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

  // Fixed type error: explicitly casting map parameter to File to resolve 'unknown' property access
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
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 mb-2">
              <BrainCircuit size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">欢迎使用 PCB 智能报价助手</h1>
              <p className="text-slate-500 leading-relaxed">
                上传您的 Gerber 设计文件或 BOM 清单，输入需求，我将为您提供深度的设计解析、DFM 预检、成本预测及供应链风险分析。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {[
                { title: "Gerber 解析", desc: "自动提取层数、线宽、孔径参数", icon: <Layers size={18} /> },
                { title: "DFM 风险", desc: "识别制造瓶颈与良率隐患", icon: <Cpu size={18} /> },
                { title: "实时报价", desc: "基于大宗商品指数的精准预测", icon: <TrendingUp size={18} /> },
                { title: "替代推荐", desc: "关键器件停产预警与替换选型", icon: <AlertTriangle size={18} /> }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-100 bg-slate-50 text-left hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 group-hover:text-blue-500">{item.icon}</span>
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
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0">
                <BrainCircuit className="text-white" size={18} />
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm max-w-[85%]">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <Loader2 className="animate-spin text-blue-500" size={16} />
                  <span>AI 引擎正在分析文件内容并模拟市场波动...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto relative">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                  <FileIcon size={14} className="text-blue-500" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 bg-[#F8FAF9] rounded-lg border border-slate-200 p-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Paperclip size={20} />
            </button>
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
              placeholder="请描述您的产品需求，例如：'分析此4层主控板的打样成本，沉金1U工艺'..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32"
            />
            <button 
              onClick={handleSend}
              disabled={isAnalyzing || (!input.trim() && attachedFiles.length === 0)}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 flex justify-between px-1">
            <div className="flex gap-4">
              <span className="text-[10px] text-slate-400 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-slate-400"></span> 输入@调用BOM档案</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-slate-400"></span> 支持Gerber/Excel/PDF</span>
            </div>
            <span className="text-[10px] text-slate-400">Ctrl + Enter 快速发送</span>
          </div>
        </div>
      </div>
    </div>
  );
};
