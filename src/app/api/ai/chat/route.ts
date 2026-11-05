import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';
import { processUserMessage } from '@/lib/ai-engine';
import { ChatMessage } from '@/types';

export async function GET() {
  try {
    const history = await storage.getChatHistory();
    return NextResponse.json({ success: true, messages: history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty' }, { status: 400 });
    }

    // 1. Save user's message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };
    await storage.saveChatMessage(userMsg);

    // 2. Process through AI Engine
    const aiResult = await processUserMessage(message);

    // 3. Save assistant message with receipt
    const assistantMsg: ChatMessage = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      text: aiResult.text,
      timestamp: new Date().toISOString(),
      receipt: aiResult.receipt,
    };
    await storage.saveChatMessage(assistantMsg);

    return NextResponse.json({
      success: true,
      message: assistantMsg,
    });
  } catch (error: any) {
    console.error('Error processing AI chat:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
