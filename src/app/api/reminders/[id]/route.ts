import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await storage.updateReminder(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reminder: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await storage.deleteReminder(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
