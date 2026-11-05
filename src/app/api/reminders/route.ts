import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';

export async function GET() {
  try {
    const reminders = await storage.getReminders();
    return NextResponse.json({ success: true, reminders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.dateTime) {
      return NextResponse.json({ success: false, error: 'Title and dateTime are required' }, { status: 400 });
    }

    const reminder = await storage.createReminder({
      title: body.title,
      dateTime: body.dateTime,
      priority: body.priority || 'medium',
      isCompleted: false,
      taskId: body.taskId || undefined,
    });

    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
