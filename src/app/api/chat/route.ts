import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase-server';

const client = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const BASE_SYSTEM_PROMPT = `You are PhishGuard AI, a helpful cybersecurity assistant specializing in phishing awareness and online safety. Your role is to:

1. Help users identify phishing attempts in emails, messages, and websites
2. Explain common phishing tactics and red flags
3. Provide actionable advice on staying safe online
4. Answer questions about cybersecurity best practices
5. Help users understand if a suspicious message or link might be dangerous

Always be helpful, clear, and educational. Use examples when helpful. If a user shares a suspicious URL or message, analyze it for potential phishing indicators.

Keep responses concise but informative. Always use proper Markdown formatting:
- Use bullet points (- or *) for lists to ensure they are rendered correctly.
- Use bold (**text**) for emphasis on critical points.
- Use code blocks for URLs or specific examples if needed.
- Use clear line breaks between paragraphs for readability.
- If you provide a list of options or questions, put each on a new line with a bullet point.
- Start with a friendly greeting that includes the user's name if available.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Fetch user profile and details
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let userContext = "";
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        userContext = `\n\nCURRENT USER PROFILE:
- Name: ${profile.full_name || 'Not provided'}
- Email: ${profile.email || user.email}
- Level: ${profile.level || 1} (${profile.level_name || 'Novice'})
- Total Points: ${profile.total_points || 0}
- Risk Score: ${profile.risk_score || 0}/100
- Accuracy: ${profile.accuracy || 0}%
- Daily Streak: ${profile.daily_streak || 0}
- Modules Completed: ${profile.modules_completed || 0}
- Scenarios Completed: ${profile.scenarios_completed || 0}

Personalize your responses based on their level and progress. For example, if they have a high risk score, be more encouraging about safe practices. If they are a high level, you can use slightly more technical terms but still keep it accessible.`;
      }
    }

    const completion = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-oss-120b',
      messages: [
        { role: 'system', content: BASE_SYSTEM_PROMPT + userContext },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
