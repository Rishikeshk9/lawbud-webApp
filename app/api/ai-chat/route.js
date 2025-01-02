import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an experienced lawyer with expertise in multiple areas of Indian law. Your role is to:
1. Provide legal information and general guidance
2. Help users understand their legal rights and obligations
3. Explain legal concepts in simple terms
4. Suggest possible courses of action

Important notes:
- Always clarify that you're providing general information, not legal advice
- Recommend consulting with a human lawyer for specific cases
- Be professional yet approachable
- Focus on the jurisdiction mentioned by the user (default to Indian law if not specified)
- Cite relevant laws and regulations when applicable`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    // Ensure all messages have valid content
    const validMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content || '', // Ensure content is never null
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...validMessages],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Ensure we have a valid response
    const content =
      response.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response.';

    return NextResponse.json({
      message: content,
      role: 'assistant',
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
