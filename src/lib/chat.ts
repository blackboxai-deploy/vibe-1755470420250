import { ChatSession, Message, ChatSettings } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_SETTINGS: ChatSettings = {
  systemPrompt: `You are a helpful, harmless, and honest AI assistant. You are knowledgeable, conversational, and aim to be helpful while being concise and clear in your responses. You can assist with a wide variety of tasks including answering questions, helping with analysis, creative writing, coding, math, and general conversation.`,
  model: 'openrouter/anthropic/claude-sonnet-4',
  temperature: 0.7
};

export function createNewMessage(role: 'user' | 'assistant', content: string): Message {
  return {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date()
  };
}

export function createNewChatSession(title?: string): ChatSession {
  const now = new Date();
  return {
    id: uuidv4(),
    title: title || 'New Chat',
    messages: [],
    createdAt: now,
    updatedAt: now
  };
}

export function generateChatTitle(firstMessage: string): string {
  // Generate a title from the first user message
  const words = firstMessage.split(' ').slice(0, 6);
  let title = words.join(' ');
  
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title || 'New Chat';
}

export function formatMessageTime(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export function exportChatAsText(session: ChatSession): string {
  const header = `Chat: ${session.title}\nCreated: ${session.createdAt.toLocaleDateString()}\n\n`;
  
  const messages = session.messages.map(msg => {
    const timestamp = msg.timestamp.toLocaleString();
    const role = msg.role === 'user' ? 'You' : 'Assistant';
    return `[${timestamp}] ${role}:\n${msg.content}\n`;
  }).join('\n');

  return header + messages;
}