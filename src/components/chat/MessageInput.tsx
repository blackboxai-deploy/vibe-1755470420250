'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..." 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "min-h-[44px] max-h-[200px] resize-none pr-12",
                "focus-visible:ring-1 focus-visible:ring-ring"
              )}
              rows={1}
            />
            
            {/* Character count indicator */}
            {message.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {message.length}
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="shrink-0 h-11 px-4"
          >
            {disabled ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </Button>
        </div>
        
        {/* Helper text */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {disabled && <span>Sending message...</span>}
        </div>
      </div>
    </div>
  );
}