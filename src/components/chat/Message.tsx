'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Message as MessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatMessageTime } from '@/lib/chat';
import { cn } from '@/lib/utils';

// Import highlight.js styles
import 'highlight.js/styles/github-dark.css';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
}

export function Message({ message, isLast }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={cn(
      "group flex gap-3 p-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
        isUser 
          ? "bg-blue-500 text-white" 
          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
      )}>
        {isUser ? "U" : "AI"}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "max-w-[80%]" : "max-w-[90%]"
      )}>
        <Card className={cn(
          "p-3",
          isUser 
            ? "bg-blue-500 text-white border-blue-500" 
            : "bg-background border-border"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: ({ children, ...props }) => (
                    <pre {...props} className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  code: ({ children, className, ...props }) => {
                    const isInline = !className;
                    return (
                      <code 
                        {...props} 
                        className={cn(
                          isInline 
                            ? "bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" 
                            : className
                        )}
                      >
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </Card>

        {/* Message Footer */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span>{formatMessageTime(message.timestamp)}</span>
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 text-xs"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>
      </div>

      {message.isLoading && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  );
}