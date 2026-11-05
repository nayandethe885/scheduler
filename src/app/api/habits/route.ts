import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';

export async function GET() {
  try {
    const habits = await storage.getHabits();
    return NextResponse.json({ success: true, habits });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'toggle' && body.habitId && body.date) {
      const updated = await storage.toggleHabitDay(body.habitId, body.date);
      return NextResponse.json({ success: true, habit: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid habit request' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
