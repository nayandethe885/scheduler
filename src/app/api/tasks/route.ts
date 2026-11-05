import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';

export async function GET() {
  try {
    const tasks = await storage.getTasks();
    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Task title is required' }, { status: 400 });
    }

    const newTask = await storage.createTask({
      title: body.title.trim(),
      description: body.description || '',
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      category: body.category || 'Work',
      dueDate: body.dueDate || undefined,
      dueTime: body.dueTime || undefined,
      recurrence: body.recurrence || 'none',
      subtasks: body.subtasks || [],
      tags: body.tags || [],
      estimatedMinutes: body.estimatedMinutes || 30,
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
