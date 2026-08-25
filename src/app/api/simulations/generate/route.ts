import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase-server';

const client = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const REAL_WORLD_INCIDENTS = `
REAL-WORLD PHISHING INCIDENTS (2024-2025) - Use these as inspiration for realistic scenarios:

1. CHANGE HEALTHCARE (Feb 2024): ALPHV/BlackCat ransomware via compromised credentials from phishing. Impacted 100M+ users, disrupted billing, insurance claims, pharmacy services. Attackers used credential harvesting phishing emails targeting healthcare employees.

2. PEPCO GROUP (Feb 2024): Lost €15.5M via AI-crafted phishing emails designed for fraudulent money transfers. CEO impersonation with deepfake-quality text.

3. TRANSPORT FOR LONDON (Sep 2024): Sophisticated phishing compromised 5,000 customer records including banking details and addresses.

4. UK MINISTRY OF DEFENCE (May 2024): Contractor payroll breach exposing 270,000 military personnel data via phishing attack on third-party vendor.

5. GRUBHUB (Feb 2025): Third-party service provider account compromised, exposing partial payment cards of customers, drivers, merchants.

6. NHS/SYNNOVIS (Jun 2024): Qilin Ransomware stole 400GB via phishing, caused "critical incident" shutdown.

7. CISCO VISHING (2025): Employee fell for voice phishing attack, hackers accessed email addresses and phone numbers.

CURRENT ATTACK TRENDS (2025):
- AI-generated phishing increased 4,000%+ since 2022
- QR code phishing (quishing) targeting mobile users
- MFA fatigue attacks with repeated push notifications
- CEO voice deepfakes for wire transfer fraud
- Help desk social engineering for password resets
- Supply chain attacks via vendor compromise
- Phishing-as-a-Service kits available on dark web
`;

const SIMULATION_SYSTEM_PROMPT = `You are an expert cybersecurity trainer creating realistic phishing simulation scenarios based on REAL-WORLD incidents and current threat intelligence.

${REAL_WORLD_INCIDENTS}

IMPORTANT: You must respond with ONLY valid JSON, no other text. The JSON must match this exact structure:

{
  "type": "email" | "sms" | "qr" | "bec" | "social" | "vishing",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "title": "short descriptive title",
  "isPhishing": true | false,
  "sender": "display name of sender",
  "senderEmail": "email@domain.com (for email/bec types)",
  "subject": "email subject line (for email/bec types)",
  "content": "the full message content",
  "links": [{"display": "visible link text", "actual": "real URL destination"}],
  "headers": {
    "from": "full from header",
    "replyTo": "reply-to address",
    "returnPath": "return path",
    "receivedFrom": "server info"
  },
  "redFlags": ["list of red flags if phishing"],
  "safeIndicators": ["list of safe indicators if legitimate"],
  "explanation": "detailed explanation of why this is phishing or legitimate",
  "realWorldContext": "brief note on which real incident inspired this or what current trend it represents",
  "learningObjective": "what skill the user will practice identifying"
}

Guidelines:
- BASE scenarios on REAL incidents listed above or current 2024-2025 threat trends
- For phishing: include realistic but detectable red flags (typos in domains, urgency, mismatched URLs, suspicious sender patterns)
- For legitimate: show proper business communications with verifiable security indicators
- Make scenarios contextually relevant to requested topic/industry
- Vary difficulty: Beginner=obvious red flags, Intermediate=subtle indicators, Advanced=sophisticated attacks requiring careful analysis
- Include 3-6 red flags or safe indicators
- Email headers should be realistic with actual red flags in them
- Points: Beginner=10, Intermediate=15, Advanced=20
- Always provide educational value explaining WHY this is suspicious or safe`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, difficulty, isPhishing, adaptToUser } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userLearningContext = '';
    let weakestArea = '';
    let recommendedDifficulty = difficulty || 'Intermediate';

    if (user && adaptToUser !== false) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_correct, email_total, sms_correct, sms_total, qr_correct, qr_total, bec_correct, bec_total, accuracy, level, scenarios_completed')
        .eq('id', user.id)
        .single();

      const { data: recentAttempts } = await supabase
        .from('user_simulation_details')
        .select('scenario_type, answered_correctly, red_flag_identified')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (profile) {
        const accuracyByType: Record<string, { correct: number; total: number; accuracy: number }> = {
          email: { correct: profile.email_correct || 0, total: profile.email_total || 0, accuracy: 0 },
          sms: { correct: profile.sms_correct || 0, total: profile.sms_total || 0, accuracy: 0 },
          qr: { correct: profile.qr_correct || 0, total: profile.qr_total || 0, accuracy: 0 },
          bec: { correct: profile.bec_correct || 0, total: profile.bec_total || 0, accuracy: 0 },
        };

        Object.keys(accuracyByType).forEach(key => {
          const t = accuracyByType[key];
          t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
        });

        const sortedByWeakness = Object.entries(accuracyByType)
          .filter(([, v]) => v.total >= 2)
          .sort(([, a], [, b]) => a.accuracy - b.accuracy);

        if (sortedByWeakness.length > 0) {
          weakestArea = sortedByWeakness[0][0];
        }

        const overallAccuracy = profile.accuracy || 0;
        const completedCount = profile.scenarios_completed || 0;
        
        if (completedCount < 5) {
          recommendedDifficulty = 'Beginner';
        } else if (overallAccuracy >= 80) {
          recommendedDifficulty = 'Advanced';
        } else if (overallAccuracy >= 50) {
          recommendedDifficulty = 'Intermediate';
        } else {
          recommendedDifficulty = 'Beginner';
        }

        const missedRedFlags: string[] = [];
        if (recentAttempts) {
          recentAttempts
            .filter(a => !a.answered_correctly && a.red_flag_identified)
            .forEach(a => {
              if (a.red_flag_identified && !missedRedFlags.includes(a.red_flag_identified)) {
                missedRedFlags.push(a.red_flag_identified);
              }
            });
        }

        userLearningContext = `
USER LEARNING PROFILE (Adapt scenario to their needs):
- Overall Accuracy: ${overallAccuracy}%
- Scenarios Completed: ${completedCount}
- Performance by Type: Email=${accuracyByType.email.accuracy}%, SMS=${accuracyByType.sms.accuracy}%, QR=${accuracyByType.qr.accuracy}%, BEC=${accuracyByType.bec.accuracy}%
- Weakest Area: ${weakestArea || 'Not enough data yet'}
- Recommended Difficulty: ${recommendedDifficulty}
${missedRedFlags.length > 0 ? `- Red Flags User Often Misses: ${missedRedFlags.slice(0, 5).join(', ')}` : ''}

ADAPTATION INSTRUCTIONS:
- If user struggles with a type, include more obvious red flags of that type
- If user is advanced (>80% accuracy), create more sophisticated scenarios
- Include red flags the user has missed before to reinforce learning
- Gradually increase difficulty as user improves
`;
      }
    }

    const userPrompt = `Create a ${isPhishing !== undefined ? (isPhishing ? 'PHISHING' : 'LEGITIMATE') : 'phishing or legitimate (you decide)'} simulation scenario.
Type: ${type || weakestArea || 'email'}
Difficulty: ${difficulty || recommendedDifficulty}
Context/Topic: ${prompt}

${userLearningContext}

Generate a REALISTIC scenario based on REAL-WORLD 2024-2025 phishing incidents and current threat trends. Make it educational, challenging, and relevant to actual cyber threats people face today.`;

    const completion = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-oss-120b',
      messages: [
        { role: 'system', content: SIMULATION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    let scenario;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenario = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to generate valid scenario. Please try again.' },
        { status: 500 }
      );
    }

    const points = scenario.difficulty === 'Beginner' ? 10 : scenario.difficulty === 'Intermediate' ? 15 : 20;

    const dbScenario = {
      user_id: user?.id || null,
      type: scenario.type || type || 'email',
      difficulty: scenario.difficulty || difficulty || 'Intermediate',
      title: scenario.title,
      is_phishing: scenario.isPhishing,
      sender: scenario.sender,
      sender_email: scenario.senderEmail || null,
      subject: scenario.subject || null,
      content: scenario.content,
      links: scenario.links || [],
      headers: scenario.headers || null,
      red_flags: scenario.redFlags || [],
      safe_indicators: scenario.safeIndicators || [],
      explanation: scenario.explanation,
      points: points,
      scenario_context: prompt,
      is_public: true,
      real_world_context: scenario.realWorldContext || null,
      learning_objective: scenario.learningObjective || null,
    };

    const { data: savedScenario, error: dbError } = await supabase
      .from('ai_generated_simulations')
      .insert(dbScenario)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({
      scenario: {
        id: savedScenario?.id || `temp-${Date.now()}`,
        ...scenario,
        points,
        realWorldContext: scenario.realWorldContext,
        learningObjective: scenario.learningObjective,
      }
    });
  } catch (error) {
    console.error('Simulation Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate simulation. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('ai_generated_simulations')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const scenarios = data?.map(s => ({
      id: s.id,
      type: s.type,
      difficulty: s.difficulty,
      title: s.title,
      isPhishing: s.is_phishing,
      sender: s.sender,
      senderEmail: s.sender_email,
      subject: s.subject,
      content: s.content,
      links: s.links,
      headers: s.headers,
      redFlags: s.red_flags,
      safeIndicators: s.safe_indicators,
      explanation: s.explanation,
      points: s.points,
      timesAttempted: s.times_attempted,
      timesCorrect: s.times_correct,
      createdAt: s.created_at,
      realWorldContext: s.real_world_context,
      learningObjective: s.learning_objective,
    })) || [];

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error('Fetch Simulations Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}
