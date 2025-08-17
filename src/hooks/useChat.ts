'use client';

import { useState, useCallback } from 'react';
import { ChatSession, Message, ChatSettings } from '@/types/chat';
import { createNewMessage, createNewChatSession, generateChatTitle, DEFAULT_SETTINGS } from '@/lib/chat';
import { sendChatMessage } from '@/lib/api';
import { useLocalStorage } from './useLocalStorage';

export function useChat() {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('chat-sessions', []);
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<string | null>('current-session-id', null);
  const [settings, setSettings] = useLocalStorage<ChatSettings>('chat-settings', DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const createNewChat = useCallback(() => {
    const newSession = createNewChatSession();
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setError(null);
    return newSession;
  }, [setSessions, setCurrentSessionId]);

  const switchToSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setError(null);
  }, [setCurrentSessionId]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
      } else {
        setCurrentSessionId(null);
      }
    }
  }, [setSessions, currentSessionId, sessions, setCurrentSessionId]);

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, title, updatedAt: new Date() }
        : s
    ));
  }, [setSessions]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    let session = currentSession;
    
    // Create new session if none exists
    if (!session) {
      session = createNewChat();
    }

    const userMessage = createNewMessage('user', content.trim());
    
    // Add user message immediately
    setSessions(prev => prev.map(s => 
      s.id === session!.id 
        ? { 
            ...s, 
            messages: [...s.messages, userMessage],
            updatedAt: new Date()
          }
        : s
    ));

    // Generate title from first message
    if (session.messages.length === 0) {
      const title = generateChatTitle(content);
      updateSessionTitle(session.id, title);
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get updated session with user message
      const updatedSession = sessions.find(s => s.id === session!.id);
      const messagesForAPI = updatedSession ? [...updatedSession.messages, userMessage] : [userMessage];

      const response = await sendChatMessage({
        messages: messagesForAPI,
        settings
      });

      const assistantMessage = createNewMessage('assistant', response);

      // Add assistant message
      setSessions(prev => prev.map(s => 
        s.id === session!.id 
          ? { 
              ...s, 
              messages: [...s.messages.filter(m => m.id !== userMessage.id), userMessage, assistantMessage],
              updatedAt: new Date()
            }
          : s
      ));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, createNewChat, setSessions, settings, isLoading, updateSessionTitle, sessions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ChatSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const exportChat = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    const chatText = session.messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    return `${session.title}\n${'='.repeat(session.title.length)}\n\n${chatText}`;
  }, [sessions]);

  return {
    // State
    sessions,
    currentSession,
    settings,
    isLoading,
    error,

    // Actions
    createNewChat,
    switchToSession,
    deleteSession,
    sendMessage,
    clearError,
    updateSettings,
    exportChat,
    updateSessionTitle
  };
}