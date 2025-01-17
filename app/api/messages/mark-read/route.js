import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const { chatId, userId } = await request.json();

    if (!chatId || !userId) {
      return NextResponse.json(
        { error: 'Chat ID and User ID are required' },
        { status: 400 }
      );
    }

    // Mark messages as read where:
    // - The message is in this chat
    // - The current user is the receiver (not the sender)
    // - The message is unread
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('receiver_id', userId) // Current user must be the receiver
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark messages as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
