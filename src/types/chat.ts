export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSettings {
  systemPrompt: string;
  model: string;
  temperature?: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface StreamedResponse {
  content: string;
  finished: boolean;
  error?: string;
}

export interface ChatRequest {
  messages: Message[];
  settings?: ChatSettings;
}