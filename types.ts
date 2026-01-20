
export interface AnalysisStep {
  title: string;
  content: string;
  details?: Record<string, any>;
  type: 'design' | 'dfm' | 'cost' | 'risk';
}

export interface QuotationResult {
  reasoning: string;
  steps: AnalysisStep[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: FileInfo[];
  result?: QuotationResult;
  timestamp: number;
}

export interface FileInfo {
  name: string;
  type: 'gerber' | 'bom' | 'other';
  size: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
}
