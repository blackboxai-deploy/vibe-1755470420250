'use client';

import { useState } from 'react';
import { ChatSession, ChatSettings } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  settings: ChatSettings;
  onNewChat: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSettings: (settings: Partial<ChatSettings>) => void;
  className?: string;
}

export function Sidebar({
  sessions,
  currentSessionId,
  settings,
  onNewChat,
  onSwitchSession,
  onDeleteSession,
  onUpdateSettings,
  className
}: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState(settings.systemPrompt);

  const handleSaveSettings = () => {
    onUpdateSettings({ systemPrompt: tempSystemPrompt });
    setSettingsOpen(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const dateKey = formatDate(session.updatedAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <Button 
          onClick={onNewChat}
          className="w-full justify-start"
          variant="default"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </Button>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 p-2">
          {Object.entries(groupedSessions).map(([dateGroup, groupSessions]) => (
            <div key={dateGroup}>
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                {dateGroup}
              </h3>
              <div className="space-y-1">
                {groupSessions.map((session) => (
                  <div key={session.id} className="group relative">
                    <Button
                      variant={currentSessionId === session.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left h-auto py-2 px-3",
                        "group-hover:bg-muted transition-colors"
                      )}
                      onClick={() => onSwitchSession(session.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">
                          {session.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.messages.length} messages
                        </div>
                      </div>
                    </Button>
                    
                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No chat sessions yet.
              <br />
              Start a new conversation!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chat Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={tempSystemPrompt}
                  onChange={(e) => setTempSystemPrompt(e.target.value)}
                  placeholder="Enter the system prompt that defines how the AI should behave..."
                  className="min-h-[120px] mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This prompt defines the AI's behavior and personality. Changes apply to new conversations.
                </p>
              </div>
              
              <div>
                <Label>Current Model</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {settings.model}
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="text-xs text-muted-foreground text-center">
          AI Chat Assistant
        </div>
      </div>
    </Card>
  );
}