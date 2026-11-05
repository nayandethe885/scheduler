import { NextResponse } from 'next/server';
import * as storage from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    const profile = await storage.getUserProfile();
    const hasOpenAI = Boolean(profile.openaiApiKey || process.env.OPENAI_API_KEY);
    const hasGemini = Boolean(profile.geminiApiKey || process.env.GEMINI_API_KEY);
    const hasSupabase = isSupabaseConfigured();

    return NextResponse.json({
      success: true,
      provider: hasOpenAI ? 'OpenAI GPT-4o' : hasGemini ? 'Google Gemini' : 'LifeOS Native Intelligent Engine',
      hasOpenAI,
      hasGemini,
      hasSupabase,
      engineMode: hasOpenAI ? 'cloud-llm' : 'native-nlp',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
