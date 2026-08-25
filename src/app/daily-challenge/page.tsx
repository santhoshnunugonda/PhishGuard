'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { useState, useEffect } from "react";
import { Mail, MessageSquare, AlertTriangle, CheckCircle, XCircle, Award, Flame, Calendar, Clock, Trophy, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { updateUserStats } from "@/lib/updateUserStats";

type DailyChallenge = {
  id: string;
  type: 'email' | 'sms';
  difficulty: string;
  title: string;
  isPhishing: boolean;
  sender: string;
  senderEmail?: string;
  subject?: string;
  content: string;
  redFlags: string[];
  safeIndicators: string[];
  explanation: string;
  points: number;
};

const dailyChallenges: DailyChallenge[] = [
  {
    id: 'day-1',
    type: 'email',
    difficulty: 'Intermediate',
    title: 'LinkedIn Connection Request',
    isPhishing: true,
    sender: 'LinkedIn Notifications',
    senderEmail: 'notifications@linkedin-mail.net',
    subject: 'John Smith wants to connect with you',
    content: `LinkedIn

John Smith, Senior Recruiter at Google, wants to connect with you.

"Hi! I came across your profile and was impressed by your experience. We have an exciting opportunity that I think would be perfect for you. Let's connect!"

View Profile: https://linkedin.com.profile-viewer.net/john-smith

Accept | Ignore

© 2025 LinkedIn Corporation`,
    redFlags: [
      'Sender domain "linkedin-mail.net" is not official "linkedin.com"',
      'Link goes to "linkedin.com.profile-viewer.net" - a fake domain',
      'Vague job opportunity without details',
      'Pressure to click without verification',
    ],
    safeIndicators: [],
    explanation: 'This is a LinkedIn impersonation phishing email. The domain tricks users by putting "linkedin.com" at the beginning of a fake domain. Always check the actual URL before clicking.',
    points: 25,
  },
  {
    id: 'day-2',
    type: 'sms',
    difficulty: 'Advanced',
    title: 'Bank Account Alert',
    isPhishing: true,
    sender: '+1 (800) 555-0199',
    content: `[BankAlert] Unusual login detected on your account from Moscow, Russia. If this wasn't you, secure your account immediately: secure-bankverify.com/login`,
    redFlags: [
      'Generic "BankAlert" without specifying which bank',
      'Foreign location designed to create panic',
      'URL "secure-bankverify.com" is not a real bank domain',
      'Pressure to act immediately',
    ],
    safeIndicators: [],
    explanation: 'This is smishing designed to exploit fear of account compromise. Real banks identify themselves and never send security links via SMS. Always log in through the official app or website.',
    points: 25,
  },
  {
    id: 'day-3',
    type: 'email',
    difficulty: 'Beginner',
    title: 'Package Tracking Update',
    isPhishing: false,
    sender: 'Amazon Shipping',
    senderEmail: 'ship-confirm@amazon.com',
    subject: 'Your package has shipped!',
    content: `Your Amazon order has shipped!

Order #112-4567890-1234567
Arriving: Wednesday, December 31

Track your package:
https://www.amazon.com/gp/your-account/order-details?orderID=112-4567890-1234567

Delivery address:
John D.
123 Main St
San Francisco, CA 94102

Thanks for shopping with us!
Amazon.com`,
    redFlags: [],
    safeIndicators: [
      'Sender is from official "amazon.com" domain',
      'Includes specific order number',
      'Link goes to official amazon.com',
      'Shows partial delivery address for verification',
      'Professional formatting consistent with Amazon',
    ],
    explanation: 'This is a legitimate Amazon shipping notification. It uses the official domain, includes verifiable order details, and links to the real Amazon website.',
    points: 25,
  },
  {
    id: 'day-4',
    type: 'email',
    difficulty: 'Advanced',
    title: 'DocuSign Document',
    isPhishing: true,
    sender: 'DocuSign via HR',
    senderEmail: 'dse@docusign.net.secure-docs.co',
    subject: 'Please Review and Sign: Employment Agreement',
    content: `DocuSign

Sarah from Human Resources sent you a document to review and sign.

REVIEW DOCUMENT

Document: Employment_Agreement_2026.pdf
Sent: December 27, 2025

Please review and sign this document within 24 hours.

Questions? Contact HR at hr@company.com

Do Not Share This Email — This email contains a secure link to DocuSign.`,
    redFlags: [
      'Email domain "docusign.net.secure-docs.co" is spoofed',
      '24-hour deadline creates artificial urgency',
      'Generic "Sarah from Human Resources" without full details',
      '"Do Not Share" warning to prevent verification',
    ],
    safeIndicators: [],
    explanation: 'This is a DocuSign impersonation attack. Attackers use document signing urgency to trick victims. Always verify unexpected documents directly with the sender through known contact methods.',
    points: 25,
  },
  {
    id: 'day-5',
    type: 'email',
    difficulty: 'Intermediate',
    title: 'IT Security Training',
    isPhishing: false,
    sender: 'IT Security Team',
    senderEmail: 'security-training@company.com',
    subject: 'Reminder: Complete Your Annual Security Training',
    content: `Hi Team,

This is a friendly reminder that annual cybersecurity training is due by January 15, 2026.

Please complete the training modules on our learning portal:
https://learning.company.com/security-training

Training includes:
- Phishing awareness (30 min)
- Password security (15 min)
- Data handling (20 min)

Questions? Contact security@company.com or ext. 5500.

Best regards,
IT Security Team`,
    redFlags: [],
    safeIndicators: [
      'Sender is from official company domain',
      'Reasonable deadline with no extreme urgency',
      'Links to internal company learning portal',
      'Provides alternative contact methods',
      'Professional, consistent formatting',
    ],
    explanation: 'This is a legitimate internal IT communication about security training. It uses proper company domains, reasonable timelines, and provides verification contact information.',
    points: 25,
  },
  {
    id: 'day-6',
    type: 'sms',
    difficulty: 'Intermediate',
    title: 'Delivery Fee Required',
    isPhishing: true,
    sender: '+1 (555) 234-5678',
    content: `FedEx: Your package is on hold due to unpaid shipping fee of $2.99. Pay now to avoid return: fedex-delivery-fee.com/pay`,
    redFlags: [
      'Random phone number, not official FedEx',
      'Small fee designed to seem harmless',
      'Domain "fedex-delivery-fee.com" is not official fedex.com',
      'No tracking number or package details',
    ],
    safeIndicators: [],
    explanation: 'This is a common delivery fee scam. The small amount makes victims less cautious. Real delivery services don\'t request payment via random SMS links.',
    points: 25,
  },
  {
    id: 'day-7',
    type: 'email',
    difficulty: 'Advanced',
    title: 'Shared Google Doc',
    isPhishing: true,
    sender: 'Google Drive',
    senderEmail: 'drive-shares@google.com.notifications.co',
    subject: 'Document shared with you: Q4 Budget Report.xlsx',
    content: `Google Drive

Mike Chen has shared a file with you.

Q4 Budget Report.xlsx

Open in Drive

"Please review the Q4 numbers before tomorrow's meeting. Let me know if you have questions. - Mike"

Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043`,
    redFlags: [
      'Domain "google.com.notifications.co" is spoofed',
      'Urgency with "before tomorrow\'s meeting"',
      'Could be from anyone named Mike Chen',
      'Footer copied to appear legitimate',
    ],
    safeIndicators: [],
    explanation: 'This is a Google Drive impersonation attack. The domain appears legitimate at first glance but is actually a subdomain of a malicious site. Always verify shared documents with the sender.',
    points: 25,
  },
];

function getTodaysChallenge(): DailyChallenge {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % dailyChallenges.length;
  return dailyChallenges[index];
}

export default function DailyChallengePage() {
  const [challenge, setChallenge] = useState<DailyChallenge>(getTodaysChallenge());
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchChallengeAndStatus = async () => {
      const supabase = createClient();
      
      // 1. Fetch today's challenge from DB
      const today = new Date().toISOString().split('T')[0];
      const { data: challengeData } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .single();
      
      if (challengeData) {
        setChallenge({
          id: challengeData.id,
          type: challengeData.scenario_type as 'email' | 'sms',
          difficulty: challengeData.difficulty,
          title: challengeData.title,
          isPhishing: challengeData.is_phishing,
          sender: challengeData.sender,
          senderEmail: challengeData.sender_email,
          subject: challengeData.subject,
          content: challengeData.content,
          redFlags: challengeData.red_flags || [],
          safeIndicators: challengeData.safe_indicators || [],
          explanation: challengeData.explanation,
          points: challengeData.points
        });
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsAuthenticated(true);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('daily_streak, last_daily_challenge')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setDailyStreak(profile.daily_streak || 0);
          if (profile.last_daily_challenge === today) {
            setAlreadyCompleted(true);
          }
        }

        const { data: completed } = await supabase
          .from('user_daily_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_date', today)
          .single();
        
        if (completed) {
          setAlreadyCompleted(true);
          setHasAnswered(true);
          setUserAnswer(completed.answered_correctly);
        }
      }
      
      setLoading(false);
    };
    
    fetchChallengeAndStatus();
  }, []);

  const handleAnswer = async (answer: boolean) => {
    if (hasAnswered || submitting || !challenge) return;
    
    setSubmitting(true);
    setUserAnswer(answer);
    setHasAnswered(true);
    
    const isCorrect = answer === challenge.isPhishing;
    
    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        
        // Record the attempt in user_daily_challenges
        await supabase.from('user_daily_challenges').insert({
          user_id: user.id,
          challenge_date: today,
          answered_correctly: isCorrect,
          points_earned: isCorrect ? challenge.points : 0
        });

        // Use the unified updateUserStats function
        const result = await updateUserStats(
          isCorrect ? challenge.points : 0,
          'daily_challenge',
          challenge.title,
          isCorrect ? 'correct' : 'incorrect'
        );

        if (result) {
          setDailyStreak(result.newDailyStreak);
        }
      }
    }
    
    setSubmitting(false);
  };

  const isCorrect = userAnswer === challenge.isPhishing;

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C0FF00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C0FF00]/10 rounded-full border border-[#C0FF00]/30 mb-4">
              <Calendar className="w-4 h-4 text-[#C0FF00]" />
              <span className="text-[#C0FF00] font-medium">Daily Phish Challenge</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Today&apos;s Challenge</h1>
            <p className="text-[#B8BCCF]">Test your skills with a new scenario every day</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 text-center">
              <Flame className="w-6 h-6 text-[#FF8C00] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{dailyStreak}</p>
              <p className="text-xs text-[#B8BCCF]">Day Streak</p>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 text-center">
              <Award className="w-6 h-6 text-[#C0FF00] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">+{challenge.points}</p>
              <p className="text-xs text-[#B8BCCF]">Points</p>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 text-center">
              <Clock className="w-6 h-6 text-[#00D9FF] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{getTimeUntilReset()}</p>
              <p className="text-xs text-[#B8BCCF]">Until Reset</p>
            </div>
          </div>

          <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] overflow-hidden">
            <div className="p-6 border-b border-[#2E3A4F]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#C0FF00]/10 rounded-lg">
                  {challenge.type === 'email' ? (
                    <Mail className="w-5 h-5 text-[#C0FF00]" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-[#C0FF00]" />
                  )}
                </div>
                <span className="text-[#B8BCCF] text-sm capitalize">{challenge.type} Challenge</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  challenge.difficulty === 'Beginner' ? 'text-[#00D084] bg-[#00D084]/10 border-[#00D084]/30' :
                  challenge.difficulty === 'Intermediate' ? 'text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30' :
                  'text-[#FF4D4D] bg-[#FF4D4D]/10 border-[#FF4D4D]/30'
                }`}>
                  {challenge.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{challenge.title}</h2>
            </div>

            <div className="p-6 bg-[#0D1B2A]/50">
              {challenge.type === 'email' ? (
                <div className="bg-white rounded-lg overflow-hidden text-gray-900">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="text-sm">
                      <p><span className="font-semibold">From:</span> {challenge.sender} &lt;{challenge.senderEmail}&gt;</p>
                      {challenge.subject && (
                        <p><span className="font-semibold">Subject:</span> {challenge.subject}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 whitespace-pre-wrap text-sm font-mono">
                    {challenge.content}
                  </div>
                </div>
              ) : (
                <div className="max-w-sm mx-auto">
                  <div className="bg-[#1A2332] rounded-2xl p-4 border border-[#2E3A4F]">
                    <div className="text-xs text-[#B8BCCF] mb-2">{challenge.sender}</div>
                    <div className="bg-[#007AFF] text-white p-3 rounded-2xl rounded-tl-sm text-sm">
                      {challenge.content}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!hasAnswered ? (
              <div className="p-6 border-t border-[#2E3A4F]">
                <p className="text-white text-lg font-semibold mb-4 text-center">Is this a phishing attempt?</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleAnswer(true)}
                    disabled={submitting}
                    className="px-8 py-3 bg-[#FF4D4D] text-white font-bold rounded-lg hover:bg-[#FF3333] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Phishing
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    disabled={submitting}
                    className="px-8 py-3 bg-[#00D084] text-white font-bold rounded-lg hover:bg-[#00B873] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Legitimate
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-t border-[#2E3A4F]">
                <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-[#00D084]/10 border border-[#00D084]/30' : 'bg-[#FF4D4D]/10 border border-[#FF4D4D]/30'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-[#00D084]" />
                        <span className="text-[#00D084] font-bold text-lg">Correct! +{challenge.points} points</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-[#FF4D4D]" />
                        <span className="text-[#FF4D4D] font-bold text-lg">Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-white">
                    This was {challenge.isPhishing ? 'a PHISHING attempt' : 'a LEGITIMATE message'}.
                  </p>
                </div>

                {dailyStreak > 0 && isCorrect && (
                  <div className="mb-6 p-4 bg-[#FF8C00]/10 rounded-lg border border-[#FF8C00]/30">
                    <div className="flex items-center gap-3">
                      <Flame className="w-6 h-6 text-[#FF8C00]" />
                      <div>
                        <p className="text-white font-semibold">{dailyStreak} Day Streak!</p>
                        <p className="text-[#B8BCCF] text-sm">Come back tomorrow to keep it going!</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Explanation:</h3>
                  <p className="text-[#B8BCCF]">{challenge.explanation}</p>
                </div>

                {challenge.isPhishing ? (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#FF4D4D]" />
                      Red Flags:
                    </h3>
                    <ul className="space-y-2">
                      {challenge.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-[#B8BCCF] text-sm">
                          <span className="text-[#FF4D4D]">•</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00D084]" />
                      Safe Indicators:
                    </h3>
                    <ul className="space-y-2">
                      {challenge.safeIndicators.map((indicator, i) => (
                        <li key={i} className="flex items-start gap-2 text-[#B8BCCF] text-sm">
                          <span className="text-[#00D084]">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center p-4 bg-[#0D1B2A] rounded-lg">
                  <p className="text-[#B8BCCF] mb-2">Come back tomorrow for a new challenge!</p>
                  <p className="text-[#C0FF00] font-bold">Next challenge in {getTimeUntilReset()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
