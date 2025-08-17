'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    sessions,
    currentSession,
    settings,
    isLoading,
    error,
    createNewChat,
    switchToSession,
    deleteSession,
    sendMessage,
    clearError,
    updateSettings
  } = useChat();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 border-r",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          settings={settings}
          onNewChat={createNewChat}
          onSwitchSession={switchToSession}
          onDeleteSession={deleteSession}
          onUpdateSettings={updateSettings}
          className="h-full border-0"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold">
                  {currentSession?.title || 'AI Chat Assistant'}
                </h1>
                {currentSession && (
                  <p className="text-sm text-muted-foreground">
                    {currentSession.messages.length} messages
                  </p>
                )}
              </div>
            </div>

            {/* New Chat Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={createNewChat}
              className="hidden sm:flex"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-auto p-1 text-destructive-foreground hover:bg-destructive/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Messages */}
        <MessageList
          messages={currentSession?.messages || []}
          isLoading={isLoading}
        />

        {/* Input */}
        <MessageInput
          onSendMessage={sendMessage}
          disabled={isLoading}
          placeholder={
            currentSession?.messages.length === 0
              ? "Start a conversation with the AI assistant..."
              : "Type your message..."
          }
        />
      </div>
    </div>
  );
}