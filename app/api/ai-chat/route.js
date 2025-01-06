import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { message, chatId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the chat history for context
    const { data: messages, error: historyError } = await supabase
      .from('ai_messages')
      .select('content, role')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    // Prepare conversation history for the AI
    const conversationHistory = [
      {
        role: 'system',
        content: `You are an experienced lawyer with expertise in multiple areas of Indian law. Your role is to:
          1. Provide legal information and general guidance
          2. Help users understand their legal rights and obligations
          3. Explain legal concepts in simple terms
          4. Suggest possible courses of action
          
          Important: Always include a disclaimer that your responses are for informational purposes only and should not be considered as legal advice. Recommend consulting with a qualified lawyer for specific legal matters.`,
      },
      ...(messages?.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || []),
      {
        role: 'user',
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      'I apologize, but I am unable to provide a response at this time.';

    return NextResponse.json({ message: aiResponse }, { status: 200 });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
