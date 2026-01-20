
import React from 'react';
import { ChatMessage, AnalysisStep } from '../types';
import { 
  User, 
  BrainCircuit, 
  FileIcon, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingDown,
  Cpu,
  Layers,
  Info
} from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex items-start gap-4 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${
        isAI ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        {isAI ? <BrainCircuit size={18} /> : <User size={18} />}
      </div>

      <div className={`max-w-[85%] space-y-3 ${isAI ? '' : 'flex flex-col items-end'}`}>
        {!isAI && message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs shadow-sm">
                <FileIcon size={14} className="text-blue-500" />
                <span className="text-slate-700 font-medium">{file.name}</span>
                <span className="text-slate-400">({file.size})</span>
              </div>
            ))}
          </div>
        )}

        <div className={`p-4 rounded-lg text-sm leading-relaxed shadow-sm border ${
          isAI ? 'bg-white border-slate-200 text-slate-700' : 'bg-blue-600 border-blue-600 text-white'
        }`}>
          {isAI && message.result && (
             <div className="mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <Info size={12} />
                  <span>Reasoning Process (AI 推理思维链路)</span>
                </div>
                <p className="text-slate-500 italic text-xs leading-relaxed bg-slate-50 p-3 rounded-md border-l-2 border-slate-200">
                  {message.result.reasoning}
                </p>
             </div>
          )}
          {message.content}
        </div>

        {isAI && message.result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {message.result.steps.map((step, idx) => (
              <AnalysisCard key={idx} step={step} index={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AnalysisCard: React.FC<{ step: AnalysisStep; index: number }> = ({ step, index }) => {
  const getIcon = () => {
    switch (step.type) {
      case 'design': return <Layers size={18} className="text-blue-500" />;
      case 'dfm': return <Cpu size={18} className="text-orange-500" />;
      case 'cost': return <TrendingDown size={18} className="text-green-500" />;
      case 'risk': return <AlertCircle size={18} className="text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (step.type) {
      case 'design': return 'bg-blue-50 border-blue-100';
      case 'dfm': return 'bg-orange-50 border-orange-100';
      case 'cost': return 'bg-green-50 border-green-100';
      case 'risk': return 'bg-red-50 border-red-100';
    }
  };

  return (
    <div className={`flex flex-col border rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs font-bold text-slate-800 tracking-tight">Step {index}: {step.title}</span>
        </div>
        <CheckCircle2 size={16} className="text-slate-300 group-hover:text-blue-500" />
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{step.content}</p>
        
        {step.details && (
          <div className="pt-3 border-t border-slate-50 space-y-2">
            {Object.entries(step.details).map(([key, val], i) => (
              <div key={i} className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">{key}</span>
                <span className={`font-semibold ${typeof val === 'string' && val.includes('风险') ? 'text-red-500' : 'text-slate-700'}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <button className="w-full mt-2 py-1.5 flex items-center justify-center gap-1 text-[10px] font-medium text-slate-400 hover:text-blue-600 border border-slate-100 rounded group-hover:border-blue-100 transition-all">
          查看完整技术报告 <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};
