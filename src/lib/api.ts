import { ChatRequest, ApiResponse } from '@/types/chat';

export async function sendChatMessage(request: ChatRequest): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to send message');
  }

  return data.message || '';
}

export async function testChatAPI(): Promise<boolean> {
  try {
    const response = await fetch('/api/chat');
    return response.ok;
  } catch {
    return false;
  }
}