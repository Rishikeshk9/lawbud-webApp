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

    let conversationHistory = [
      {
        role: 'system',
        content: `You are an experienced lawyer with expertise in multiple areas of Indian law based on the Bharatiya Nyaya Sanhita BNS, 2023. Your role is to:
          1. Make sure you have a clear thought & Provide legal information on any legal matter only with the help of BNS, 2023.
          2. Help users understand their legal rights and obligations
          3. Explain legal concepts in simple terms
          4. Give detailed answers to the user's question
                    5. If the user's question is not related to Indian law, say "I'm sorry, I can only provide information on Indian law."`,
      },
    ];

    // Only fetch chat history if chatId exists
    if (chatId) {
      console.log('chatId', chatId);
      // Get the chat history for context
      const { data: messages, error: historyError } = await supabase
        .from('ai_messages')
        .select('content, role')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (historyError) throw historyError;

      // Add message history if it exists
      if (messages && messages.length > 0) {
        conversationHistory = [
          ...conversationHistory,
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ];
      }
    }

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    const completion = await openai.chat.completions.create({
      model:
        process.env.AI_MODEL ||
        'ft:gpt-4o-mini-2024-07-18:personal:bns:AnD2Z4Pz',
      messages: conversationHistory,
      temperature: 0.7,
      max_tokens: 1000,
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
