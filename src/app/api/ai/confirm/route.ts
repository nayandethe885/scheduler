import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';
import { executeConfirmedAction } from '@/lib/ai-engine';
import { ChatMessage } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetId } = body;

    if (!action || !targetId) {
      return NextResponse.json({ success: false, error: 'Action and targetId required' }, { status: 400 });
    }

    const result = await executeConfirmedAction({ action, targetId });

    // Save confirmation result in chat
    const confirmMsg: ChatMessage = {
      id: `confirm-${Date.now()}`,
      sender: 'assistant',
      text: result.text,
      timestamp: new Date().toISOString(),
      receipt: result.receipt,
    };
    await storage.saveChatMessage(confirmMsg);

    return NextResponse.json({ success: true, message: confirmMsg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
