import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';

export async function GET() {
  try {
    const memories = await storage.getMemories();
    return NextResponse.json({ success: true, memories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.content) {
      return NextResponse.json({ success: false, error: 'Memory content is required' }, { status: 400 });
    }

    const key = body.key || `fact_${Date.now()}`;
    const memory = await storage.createMemory(key, body.content, body.category || 'fact');
    return NextResponse.json({ success: true, memory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Memory ID is required' }, { status: 400 });
    }
    const deleted = await storage.deleteMemory(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
