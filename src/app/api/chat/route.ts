import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, Message } from '@/types/chat';

const OPENROUTER_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const DEFAULT_MODEL = 'openrouter/anthropic/claude-sonnet-4';
const DEFAULT_SYSTEM_PROMPT = `You are a helpful, harmless, and honest AI assistant. You are knowledgeable, conversational, and aim to be helpful while being concise and clear in your responses. You can assist with a wide variety of tasks including answering questions, helping with analysis, creative writing, coding, math, and general conversation.`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, settings } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Prepare messages for OpenRouter API
    const apiMessages = [
      {
        role: 'system',
        content: settings?.systemPrompt || DEFAULT_SYSTEM_PROMPT
      },
      ...messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Make request to OpenRouter custom endpoint
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: settings?.model || DEFAULT_MODEL,
        messages: apiMessages,
        temperature: settings?.temperature || 0.7,
        stream: false // We'll implement streaming later if needed
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `AI service error: ${response.status} ${response.statusText}` 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response structure:', data);
      return NextResponse.json(
        { success: false, error: 'Unexpected response from AI service' },
        { status: 500 }
      );
    }

    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      message: assistantMessage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat API is running',
    model: DEFAULT_MODEL,
    endpoint: 'POST /api/chat'
  });
}