'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { useState, useEffect } from "react";
import { Mail, MessageSquare, QrCode, Briefcase, AlertTriangle, CheckCircle, XCircle, Clock, Award, ChevronRight, RotateCcw, Eye, Flag, Link as LinkIcon, User, Info, Sparkles, Loader2, Phone, Share2, Plus, X, Globe, Target, History } from "lucide-react";
import { updateUserStats } from "@/lib/updateUserStats";
import { createClient } from "@/lib/supabase";

type Scenario = {
  id: number | string;
  type: 'email' | 'sms' | 'qr' | 'bec' | 'social' | 'vishing';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  isPhishing: boolean;
  sender: string;
  senderEmail?: string;
  subject?: string;
  content: string;
  links?: { display: string; actual: string }[];
  headers?: { from: string; replyTo: string; returnPath: string; receivedFrom: string };
  redFlags: string[];
  safeIndicators: string[];
  explanation: string;
  points: number;
  isAIGenerated?: boolean;
  realWorldContext?: string;
  learningObjective?: string;
};

const scenarios: Scenario[] = [
  {
    id: 1,
    type: 'email',
    difficulty: 'Beginner',
    title: 'Account Verification Request',
    isPhishing: true,
    sender: 'PayPal Security',
    senderEmail: 'security@paypa1-verify.com',
    subject: 'URGENT: Your account will be suspended!',
    content: `Dear Customer,

We have detected unusual activity on your account. Your account will be SUSPENDED within 24 hours unless you verify your information immediately.

Click here to verify: http://paypa1-secure.tk/verify

If you do not verify within 24 hours, your account will be permanently locked.

PayPal Security Team`,
    links: [{ display: 'Click here to verify', actual: 'http://paypa1-secure.tk/verify' }],
    headers: {
      from: 'PayPal Security <security@paypa1-verify.com>',
      replyTo: 'no-reply@paypa1-verify.com',
      returnPath: 'bounce@paypa1-verify.com',
      receivedFrom: 'mail.paypa1-verify.com [185.234.218.45]'
    },
    redFlags: [
      'Sender domain is "paypa1-verify.com" not official "paypal.com"',
      'Urgent language with threats ("SUSPENDED", "permanently locked")',
      'Generic greeting "Dear Customer" instead of your name',
      'Suspicious link domain "paypa1-secure.tk"',
      'Grammar issues and unprofessional tone',
    ],
    safeIndicators: [],
    explanation: 'This is a credential harvesting phishing email. The attacker impersonates PayPal but uses a fake domain with "1" instead of "l". The urgency and threats are designed to make you act without thinking.',
    points: 10,
  },
  {
    id: 2,
    type: 'email',
    difficulty: 'Beginner',
    title: 'IT Password Reset',
    isPhishing: false,
    sender: 'IT Support',
    senderEmail: 'it-support@company.com',
    subject: 'Password expiration reminder',
    content: `Hi John,

Your network password will expire in 14 days. Please update it at your convenience through the standard company portal.

You can access the password reset tool at: https://internal.company.com/password

If you have any questions, contact the IT Help Desk at ext. 4357.

Best regards,
IT Support Team`,
    links: [{ display: 'https://internal.company.com/password', actual: 'https://internal.company.com/password' }],
    headers: {
      from: 'IT Support <it-support@company.com>',
      replyTo: 'it-support@company.com',
      returnPath: 'it-support@company.com',
      receivedFrom: 'mail.company.com [10.0.0.50]'
    },
    redFlags: [],
    safeIndicators: [
      'Sender is from official company domain',
      'Uses your actual name',
      'No urgency or threats',
      'Links to legitimate internal domain',
      'Provides standard contact information',
    ],
    explanation: 'This is a legitimate IT communication. It uses proper company domains, addresses you by name, and provides appropriate timeframes without creating panic.',
    points: 5,
  },
  {
    id: 3,
    type: 'sms',
    difficulty: 'Intermediate',
    title: 'Package Delivery Notification',
    isPhishing: true,
    sender: '+1-555-0123',
    content: `USPS: Your package could not be delivered due to incomplete address. Update delivery info here: bit.ly/3xK9mP2 to avoid return to sender.`,
    links: [{ display: 'bit.ly/3xK9mP2', actual: 'http://fake-usps-delivery.ru/update' }],
    redFlags: [
      'Random phone number, not official USPS short code',
      'URL shortener hides actual destination',
      'Creates urgency ("avoid return to sender")',
      'USPS typically uses 5-digit short codes',
      'No tracking number provided',
    ],
    safeIndicators: [],
    explanation: 'This is smishing (SMS phishing). Real delivery services use official short codes and include tracking numbers. The shortened URL could lead to a credential theft site.',
    points: 15,
  },
  {
    id: 4,
    type: 'bec',
    difficulty: 'Advanced',
    title: 'CEO Wire Transfer Request',
    isPhishing: true,
    sender: 'Michael Johnson',
    senderEmail: 'michael.johnson@company-inc.com',
    subject: 'Urgent - Wire Transfer Needed',
    content: `Hi Sarah,

I need you to process an urgent wire transfer for a confidential acquisition we're finalizing today. Please transfer $47,500 to the following account:

Bank: First National Bank
Account: 892374651
Routing: 091000019

This needs to be done within the next 2 hours. I'm in back-to-back meetings and can't take calls. Please confirm once completed.

Thanks,
Michael Johnson
CEO`,
    headers: {
      from: 'Michael Johnson <michael.johnson@company-inc.com>',
      replyTo: 'michael.johnson@company-inc.com',
      returnPath: 'michael.johnson@company-inc.com',
      receivedFrom: 'mail.company-inc.com [185.234.218.12]'
    },
    redFlags: [
      'Domain is "company-inc.com" not "company.com"',
      'Requests urgent wire transfer',
      'CEO claims to be unavailable to verify',
      '"Confidential" to prevent you from checking',
      'Unusual for CEO to email finance directly for transfers',
    ],
    safeIndicators: [],
    explanation: 'This is Business Email Compromise (BEC). The attacker spoofed the CEO\'s email with a similar domain. Always verify large transfer requests through a known phone number.',
    points: 20,
  },
  {
    id: 5,
    type: 'qr',
    difficulty: 'Intermediate',
    title: 'Parking Payment QR Code',
    isPhishing: true,
    sender: 'Parking Meter Sticker',
    content: `[QR CODE IMAGE]

SCAN TO PAY
City Parking Authority
Pay your parking fee instantly!
Avoid tickets - scan now`,
    redFlags: [
      'QR code on unofficial sticker',
      'No city logo or official branding',
      'Creates urgency ("Avoid tickets")',
      'Destination URL not visible before scanning',
      'Could be placed over legitimate QR code',
    ],
    safeIndicators: [],
    explanation: 'This is quishing (QR code phishing). Attackers place fake QR stickers on parking meters. The QR leads to a fake payment page that steals your card information.',
    points: 15,
  },
  {
    id: 6,
    type: 'email',
    difficulty: 'Advanced',
    title: 'Vendor Invoice Update',
    isPhishing: true,
    sender: 'Jennifer Walsh',
    senderEmail: 'accounts@acme-suppliers.net',
    subject: 'Updated Banking Information for Invoice #INV-2024-0892',
    content: `Dear Accounts Payable,

Please be advised that Acme Suppliers has changed our banking information effective immediately. All future payments for invoice #INV-2024-0892 and subsequent invoices should be sent to:

New Bank: Commerce Bank
New Account: 7834291056
New Routing: 101000695

Please update your records and process the pending payment of $23,450 to the new account.

Regards,
Jennifer Walsh
Accounts Receivable
Acme Suppliers`,
    headers: {
      from: 'Jennifer Walsh <accounts@acme-suppliers.net>',
      replyTo: 'accounts@acme-suppliers.net',
      returnPath: 'accounts@acme-suppliers.net',
      receivedFrom: 'mail.acme-suppliers.net [91.234.56.78]'
    },
    redFlags: [
      'Domain is "acme-suppliers.net" not the expected domain',
      'Banking information changes require verification',
      'No official letterhead or company details',
      'Asks for immediate payment to new account',
      'Contact method only through this email',
    ],
    safeIndicators: [],
    explanation: 'This is a vendor impersonation attack. Attackers research your real vendors and send fake banking update requests. Always verify banking changes through established contacts.',
    points: 20,
  },
  {
    id: 7,
    type: 'email',
    difficulty: 'Intermediate',
    title: 'Microsoft 365 Security Alert',
    isPhishing: true,
    sender: 'Microsoft Account Team',
    senderEmail: 'no-reply@microsoft-security-alert.com',
    subject: 'Action Required: Unusual sign-in activity',
    content: `Microsoft account

Unusual sign-in activity

We detected something unusual about a recent sign-in to the Microsoft account.

Sign-in details
Country/region: Russia
IP address: 185.234.218.12
Date: Dec 27, 2025 10:24 AM (GMT)
Platform: Windows
Browser: Firefox

If this was you, you can safely ignore this email.
If this wasn't you, a malicious user has your password. Please review your recent activity and we'll help you take corrective action.

Review activity: https://login.microsoftonline.com-security.net/activity

Thanks,
The Microsoft account team`,
    links: [{ display: 'Review activity', actual: 'https://login.microsoftonline.com-security.net/activity' }],
    headers: {
      from: 'Microsoft Account Team <no-reply@microsoft-security-alert.com>',
      replyTo: 'no-reply@microsoft-security-alert.com',
      returnPath: 'bounce@microsoft-security-alert.com',
      receivedFrom: 'mail.microsoft-security-alert.com [185.234.218.99]'
    },
    redFlags: [
      'Sender domain "microsoft-security-alert.com" is not the official "microsoft.com"',
      'Link domain "login.microsoftonline.com-security.net" is a spoofed version of the real one',
      'Creates alarm by mentioning a sign-in from a foreign country',
      'Generic signature "The Microsoft account team"',
    ],
    safeIndicators: [],
    explanation: 'This is a very common phishing tactic that exploits security fears. The attacker sends a fake alert about "unusual activity" to trick you into clicking a link that leads to a fake login page.',
    points: 15,
  },
  {
    id: 8,
    type: 'email',
    difficulty: 'Beginner',
    title: 'HR Policy Update',
    isPhishing: false,
    sender: 'Human Resources',
    senderEmail: 'hr-department@company.com',
    subject: 'Important: 2026 Employee Handbook Update',
    content: `Hello Team,

The HR Department has updated the Employee Handbook for the upcoming year 2026. These updates include new remote work guidelines and updated benefits information.

Please review the updated document on the company intranet:
https://intranet.company.com/hr/handbook-2026

You do not need to take any immediate action other than reviewing the changes at your earliest convenience.

Best regards,
Human Resources`,
    links: [{ display: 'https://intranet.company.com/hr/handbook-2026', actual: 'https://intranet.company.com/hr/handbook-2026' }],
    headers: {
      from: 'Human Resources <hr-department@company.com>',
      replyTo: 'hr-department@company.com',
      returnPath: 'hr-department@company.com',
      receivedFrom: 'mail.company.com [10.0.0.51]'
    },
    redFlags: [],
    safeIndicators: [
      'Sender is from the official company domain',
      'Links to the internal company intranet',
      'No urgent or threatening language',
      'Consistent with regular company communications',
    ],
    explanation: 'This is a legitimate internal communication. It uses the correct company domain, points to the internal intranet, and does not pressure the user with false urgency.',
    points: 5,
  },
  {
    id: 9,
    type: 'email',
    difficulty: 'Intermediate',
    title: 'Voicemail Notification',
    isPhishing: true,
    sender: 'Voicemail Service',
    senderEmail: 'voicemail-service@cloud-telephony.net',
    subject: 'New Voicemail from +1 (555) 098-7654 (1:42)',
    content: `You have a new voicemail message.

Message Details:
Caller: +1 (555) 098-7654
Duration: 01:42
Received: Today, 11:15 AM

Click below to listen to your message:
[ PLAY MESSAGE - voicemail-attachment-492.scr ]

Note: This message will be automatically deleted in 24 hours.`,
    headers: {
      from: 'Voicemail Service <voicemail-service@cloud-telephony.net>',
      replyTo: 'no-reply@cloud-telephony.net',
      returnPath: 'bounce@cloud-telephony.net',
      receivedFrom: 'mail.cloud-telephony.net [91.234.56.99]'
    },
    redFlags: [
      'The attachment has a ".scr" extension, which is an executable file (often used for malware)',
      'Sender is an unknown third-party domain',
      'Urgency: "message will be automatically deleted in 24 hours"',
      'Generic "voicemail-service" sender',
    ],
    safeIndicators: [],
    explanation: 'This is a malware delivery attempt. The "voicemail" is actually an executable file (.scr) that, when "played," would install malicious software on your computer.',
    points: 15,
  },
  {
    id: 10,
    type: 'email',
    difficulty: 'Beginner',
    title: 'Social Media "New Login"',
    isPhishing: false,
    sender: 'Facebook Security',
    senderEmail: 'security@facebookmail.com',
    subject: 'Security alert for Facebook',
    content: `Hi Jane,

A new login was detected on your Facebook account from a device you don't usually use.

Device: Chrome on macOS
Location: San Francisco, CA, USA

If this was you, you can safely ignore this email. If this wasn't you, please secure your account by following the steps on our help page:
https://www.facebook.com/hacked

Thanks,
The Facebook Security Team`,
    links: [{ display: 'https://www.facebook.com/hacked', actual: 'https://www.facebook.com/hacked' }],
    headers: {
      from: 'Facebook Security <security@facebookmail.com>',
      replyTo: 'security@facebookmail.com',
      returnPath: 'security@facebookmail.com',
      receivedFrom: 'mail.facebookmail.com [157.240.1.1]'
    },
    redFlags: [],
    safeIndicators: [
      'Sender domain "facebookmail.com" is a legitimate domain used by Facebook for notifications',
      'Addresses the user by name',
      'The link points to the official facebook.com domain',
      'Standard security notification format',
    ],
    explanation: 'This is a legitimate security alert from Facebook. Many major platforms use specific subdomains (like facebookmail.com) for automated emails. The link provided is also official.',
    points: 5,
  },
  {
    id: 11,
    type: 'sms',
    difficulty: 'Advanced',
    title: 'Gift Card Request from "Boss"',
    isPhishing: true,
    sender: '+1 (555) 777-8888',
    content: `Hey, it's David (CEO). I'm tied up in a meeting but I need a quick favor. Can you pick up 5 $100 Apple gift cards for a client? Just text me the codes when you have them. I'll reimburse you by EOD. Thanks!`,
    redFlags: [
      'Requests payment via gift cards (a massive red flag for any business transaction)',
      'Uses a mobile number that might not be David\'s actual number',
      'Urgency and "tied up" excuse to prevent verification',
      'Highly unusual request for a CEO to make to an employee',
    ],
    safeIndicators: [],
    explanation: 'This is a common "Boss Fraud" or gift card scam. Scammers impersonate executives and pressure employees into buying gift cards, which are untraceable once the codes are sent.',
    points: 20,
  },
  {
    id: 12,
    type: 'email',
    difficulty: 'Intermediate',
    title: 'IRS Tax Refund',
    isPhishing: true,
    sender: 'IRS Office',
    senderEmail: 'refunds@irs-online-gov.org',
    subject: 'Notification of Tax Refund - Pending Action',
    content: `Internal Revenue Service

Dear Taxpayer,

After the last annual calculations of your fiscal activity, we have determined that you are eligible to receive a tax refund of $1,429.50.

To process your refund, please submit the tax refund request form through our secure online portal:
http://irs-gov-portal.net/refund-form

The refund will be credited to your bank account within 3-5 business days after form submission.

IRS Office of Public Affairs`,
    links: [{ display: 'http://irs-gov-portal.net/refund-form', actual: 'http://irs-gov-portal.net/refund-form' }],
    headers: {
      from: 'IRS Office <refunds@irs-online-gov.org>',
      replyTo: 'refunds@irs-online-gov.org',
      returnPath: 'bounce@irs-online-gov.org',
      receivedFrom: 'mail.irs-online-gov.org [185.234.56.78]'
    },
    redFlags: [
      'The IRS does not initiate contact with taxpayers by email to request personal or financial information',
      'Sender domain "irs-online-gov.org" is fake (real is irs.gov)',
      'Link "irs-gov-portal.net" is not an official government site',
      'Generic greeting "Dear Taxpayer"',
    ],
    safeIndicators: [],
    explanation: 'This is a classic tax refund scam. The IRS never sends emails about refunds or asks for personal info via email. They almost always communicate through physical mail.',
    points: 15,
  },
  {
    id: 13,
    type: 'email',
    difficulty: 'Intermediate',
    title: 'Bank Fraud Alert',
    isPhishing: false,
    sender: 'Chase Fraud Protection',
    senderEmail: 'alerts@notifications.chase.com',
    subject: 'Fraud Alert: Did you just use your card ending in 4421?',
    content: `Chase Fraud Protection

We noticed a suspicious transaction on your Chase Freedom card ending in 4421.

Merchant: APPLE.COM/BILL
Amount: $99.99
Date: Dec 27, 2025

Did you authorize this transaction?

Reply YES if this was you.
Reply NO if this wasn't you.

If you prefer, you can call us at the number on the back of your card or log in to the Chase Mobile app to review your transactions.`,
    headers: {
      from: 'Chase Fraud Protection <alerts@notifications.chase.com>',
      replyTo: 'no-reply@chase.com',
      returnPath: 'alerts@notifications.chase.com',
      receivedFrom: 'mail.chase.com [159.53.224.1]'
    },
    redFlags: [],
    safeIndicators: [
      'Sender domain "notifications.chase.com" is a legitimate subdomain of chase.com',
      'Specifies the last 4 digits of the card (though scammers can sometimes find this)',
      'Gives the option to call the number on the back of the physical card (the safest way to verify)',
      'Does not include any suspicious links',
    ],
    explanation: 'This is a legitimate fraud alert. Banks often send these to quickly verify transactions. Crucially, it advises calling the official number on your physical card if you are unsure.',
    points: 10,
  },
  {
    id: 14,
    type: 'email',
    difficulty: 'Beginner',
    title: 'Subscription Cancellation',
    isPhishing: true,
    sender: 'Netflix Support',
    senderEmail: 'support@netflix-billing.co',
    subject: 'Your membership is on hold',
    content: `NETFLIX

Your membership is on hold.

We're having some trouble with your current billing information. We'll try again, but in the meantime you may want to update your payment details.

UPDATE ACCOUNT NOW: https://netflix-update-billing.com/login

Need help? We're here if you need it. Visit the Help Center or contact us now.

Your friends at Netflix`,
    links: [{ display: 'UPDATE ACCOUNT NOW', actual: 'https://netflix-update-billing.com/login' }],
    headers: {
      from: 'Netflix Support <support@netflix-billing.co>',
      replyTo: 'support@netflix-billing.co',
      returnPath: 'bounce@netflix-billing.co',
      receivedFrom: 'mail.netflix-billing.co [91.234.56.12]'
    },
    redFlags: [
      'Sender domain "netflix-billing.co" is not "netflix.com"',
      'Link domain "netflix-update-billing.com" is a phishing site',
      'Urgency: "membership is on hold"',
      'Generic signature "Your friends at Netflix"',
    ],
    safeIndicators: [],
    explanation: 'This is a common subscription phishing scam. Attackers target users of popular services like Netflix, hoping they\'ll panic about losing access and enter their credit card details on a fake site.',
    points: 10,
  },
];

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  qr: QrCode,
  bec: Briefcase,
  social: Share2,
  vishing: Phone,
};

const typeLabels: Record<string, string> = {
  email: 'Email Phishing',
  sms: 'SMS Phishing',
  qr: 'QR Code Phishing',
  bec: 'CEO Fraud/BEC',
  social: 'Social Media',
  vishing: 'Voice Phishing',
};

type HistoryItem = {
  id: string;
  title: string;
  activity_type: string;
  result: 'correct' | 'incorrect' | 'completed';
  points: number;
  created_at: string;
};

export default function SimulationsPage() {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<{id: number | string; correct: boolean}[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'headers' | 'links' | 'sender'>('sender');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRedFlag, setSelectedRedFlag] = useState<string | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState<string>('email');
  const [aiDifficulty, setAiDifficulty] = useState<string>('Intermediate');
  const [aiIsPhishing, setAiIsPhishing] = useState<boolean | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedScenarios, setAiGeneratedScenarios] = useState<Scenario[]>([]);
  const [showAITab, setShowAITab] = useState(false);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dbStats, setDbStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        fetchHistory(user.id);
        
        const { data: activityData } = await supabase
          .from('user_activity')
          .select('points, result')
          .eq('user_id', user.id)
          .eq('activity_type', 'simulation');
        
        if (activityData) {
          const sessionPoints = activityData.reduce((sum, a) => sum + (a.points || 0), 0);
          const correctCount = activityData.filter(a => a.result === 'correct').length;
          const totalAttempts = activityData.length;
          setTotalPoints(sessionPoints);
          setDbStats({ correct: correctCount, total: totalAttempts });
        }
      }
    };
    checkAuth();
    fetchAIScenarios();
  }, []);

  const fetchHistory = async (userId: string) => {
    setLoadingHistory(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'simulation')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) {
      setHistory(data);
    }
    setLoadingHistory(false);
  };

  const fetchAIScenarios = async () => {
    try {
      const res = await fetch('/api/simulations/generate');
      const data = await res.json();
      if (data.scenarios) {
        setAiGeneratedScenarios(data.scenarios.map((s: Scenario) => ({ ...s, isAIGenerated: true })));
      }
    } catch (error) {
      console.error('Failed to fetch AI scenarios:', error);
    }
  };

  const generateAISimulation = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch('/api/simulations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          type: aiType,
          difficulty: aiDifficulty,
          isPhishing: aiIsPhishing,
        }),
      });
      
      const data = await res.json();
      if (data.scenario) {
        const newScenario: Scenario = {
          ...data.scenario,
          isAIGenerated: true,
        };
        setAiGeneratedScenarios(prev => [newScenario, ...prev]);
        setCurrentScenario(newScenario);
        setShowAIGenerator(false);
        setAiPrompt('');
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to generate simulation:', error);
      alert('Failed to generate simulation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = async (answer: boolean) => {
    setUserAnswer(answer);
    setShowResult(true);
    const isCorrect = answer === currentScenario?.isPhishing;
    if (currentScenario && !completedScenarios.find(s => s.id === currentScenario.id)) {
      setCompletedScenarios([...completedScenarios, { id: currentScenario.id, correct: isCorrect }]);
      const earnedPoints = isCorrect ? currentScenario.points : 0;
      if (isCorrect) {
        setTotalPoints(totalPoints + currentScenario.points);
      }
      
      if (isAuthenticated) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            console.log('[handleAnswer] Calling updateUserStats for user:', user.id);
            try {
              await supabase.rpc('increment_simulation_stats', {
                user_id_param: user.id,
                type_param: currentScenario.type,
                is_correct: isCorrect
              });
            } catch (rpcError) {
              console.error('[handleAnswer] RPC error:', rpcError);
            }
            
            try {
              const result = await updateUserStats(
                earnedPoints,
                'simulation',
                currentScenario.title,
                isCorrect ? 'correct' : 'incorrect'
              );
              console.log('[handleAnswer] updateUserStats result:', result);
            } catch (updateError) {
              console.error('[handleAnswer] updateUserStats error:', updateError);
            }
            
            fetchHistory(user.id);
        }
      }
    }
  };

  const handleReport = async () => {
    if (!selectedRedFlag || !currentScenario) return;
    
    setReportSubmitted(true);
    
    if (isAuthenticated && currentScenario.isPhishing) {
      const bonusPoints = 5;
      setTotalPoints(prev => prev + bonusPoints);
      await updateUserStats(bonusPoints, 'simulation', `Reported: ${currentScenario.title}`, 'correct');
      const { data: { user } } = await createClient().auth.getUser();
      if (user) fetchHistory(user.id);
    }
  };

  const resetScenario = () => {
    setUserAnswer(null);
    setShowResult(false);
    setCurrentScenario(null);
    setShowInspector(false);
    setShowReportModal(false);
    setSelectedRedFlag(null);
    setReportSubmitted(false);
  };

  const filteredScenarios = scenarios.filter(s => filter === 'all' || s.type === filter);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-[#00D084] bg-[#00D084]/10 border-[#00D084]/30';
      case 'Intermediate': return 'text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30';
      case 'Advanced': return 'text-[#FF4D4D] bg-[#FF4D4D]/10 border-[#FF4D4D]/30';
      default: return '';
    }
  };

  if (currentScenario) {
    const Icon = typeIcons[currentScenario.type];
    const isCorrect = userAnswer === currentScenario.isPhishing;
    
    return (
      <div className="min-h-screen bg-[#0D1B2A]">
        <HeaderNavigation />
        <main className="py-8 lg:py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
            <button onClick={resetScenario} className="flex items-center gap-2 text-[#B8BCCF] hover:text-[#C0FF00] mb-6 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Back to Scenarios
            </button>

            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] overflow-hidden">
              <div className="p-6 border-b border-[#2E3A4F]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#C0FF00]/10 rounded-lg">
                      <Icon className="w-5 h-5 text-[#C0FF00]" />
                    </div>
                    <span className="text-[#B8BCCF] text-sm">{typeLabels[currentScenario.type]}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(currentScenario.difficulty)}`}>
                      {currentScenario.difficulty}
                    </span>
                  </div>
                  {!showResult && (currentScenario.type === 'email' || currentScenario.type === 'bec') && (
                    <button
                      onClick={() => setShowInspector(!showInspector)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        showInspector 
                          ? 'bg-[#C0FF00] text-[#0D1B2A] font-bold' 
                          : 'bg-[#2E3A4F] text-[#B8BCCF] hover:bg-[#3E4A5F]'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Deep Inspect
                    </button>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">{currentScenario.title}</h1>
              </div>

              {showInspector && (currentScenario.type === 'email' || currentScenario.type === 'bec') && (
                <div className="p-4 bg-[#0D1B2A] border-b border-[#2E3A4F]">
                  <div className="flex gap-2 mb-4">
                    {['sender', 'headers', 'links'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setInspectorTab(tab as 'sender' | 'headers' | 'links')}
                        className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                          inspectorTab === tab
                            ? 'bg-[#C0FF00] text-[#0D1B2A] font-bold'
                            : 'bg-[#1A2332] text-[#B8BCCF] hover:bg-[#2E3A4F]'
                        }`}
                      >
                        {tab === 'sender' && <User className="w-4 h-4 inline mr-2" />}
                        {tab === 'headers' && <Info className="w-4 h-4 inline mr-2" />}
                        {tab === 'links' && <LinkIcon className="w-4 h-4 inline mr-2" />}
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-[#1A2332] rounded-lg p-4 font-mono text-sm">
                    {inspectorTab === 'sender' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-[#C0FF00] min-w-[100px]">Display Name:</span>
                          <span className="text-white">{currentScenario.sender}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#C0FF00] min-w-[100px]">Email:</span>
                          <span className={`${currentScenario.isPhishing ? 'text-[#FF4D4D]' : 'text-[#00D084]'}`}>
                            {currentScenario.senderEmail}
                          </span>
                        </div>
                      </div>
                    )}
                    {inspectorTab === 'headers' && currentScenario.headers && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-[#C0FF00] min-w-[100px]">From:</span>
                          <span className="text-white break-all">{currentScenario.headers.from}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#C0FF00] min-w-[100px]">Reply-To:</span>
                          <span className="text-white break-all">{currentScenario.headers.replyTo}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#C0FF00] min-w-[100px]">Return-Path:</span>
                          <span className="text-white break-all">{currentScenario.headers.returnPath}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#C0FF00] min-w-[100px]">Received:</span>
                          <span className="text-white break-all">{currentScenario.headers.receivedFrom}</span>
                        </div>
                      </div>
                    )}
                    {inspectorTab === 'links' && (
                      <div className="space-y-3">
                        {currentScenario.links && currentScenario.links.length > 0 ? (
                          currentScenario.links.map((link, idx) => (
                            <div key={idx} className="p-3 bg-[#0D1B2A] rounded-lg">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-[#B8BCCF] min-w-[80px]">Display:</span>
                                <span className="text-white">{link.display}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-[#B8BCCF] min-w-[80px]">Actual URL:</span>
                                <span className={`break-all ${link.display !== link.actual ? 'text-[#FF4D4D]' : 'text-[#00D084]'}`}>
                                  {link.actual}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[#B8BCCF]">No links in this message</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6 bg-[#0D1B2A]/50">
                {currentScenario.type === 'email' || currentScenario.type === 'bec' ? (
                  <div className="bg-white rounded-lg overflow-hidden text-gray-900">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="text-sm">
                        <p><span className="font-semibold">From:</span> {currentScenario.sender} &lt;{currentScenario.senderEmail}&gt;</p>
                        {currentScenario.subject && (
                          <p><span className="font-semibold">Subject:</span> {currentScenario.subject}</p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 whitespace-pre-wrap text-sm font-mono">
                      {currentScenario.content}
                    </div>
                  </div>
                ) : currentScenario.type === 'sms' ? (
                  <div className="max-w-sm mx-auto">
                    <div className="bg-[#1A2332] rounded-2xl p-4 border border-[#2E3A4F]">
                      <div className="text-xs text-[#B8BCCF] mb-2">{currentScenario.sender}</div>
                      <div className="bg-[#007AFF] text-white p-3 rounded-2xl rounded-tl-sm text-sm">
                        {currentScenario.content}
                      </div>
                      {currentScenario.links && currentScenario.links.length > 0 && (
                        <div className="mt-3 p-2 bg-[#0D1B2A] rounded-lg">
                          <p className="text-xs text-[#B8BCCF] mb-1">Link preview:</p>
                          <p className="text-xs text-[#FF4D4D] break-all">{currentScenario.links[0].actual}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-sm mx-auto bg-white rounded-lg p-6 text-center">
                    <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-gray-600" />
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm">{currentScenario.content}</p>
                  </div>
                )}
              </div>

              {!showResult ? (
                <div className="p-6 border-t border-[#2E3A4F]">
                  <p className="text-white text-lg font-semibold mb-4 text-center">Is this a phishing attempt?</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleAnswer(true)}
                      className="px-8 py-3 bg-[#FF4D4D] text-white font-bold rounded-lg hover:bg-[#FF3333] transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      Phishing
                    </button>
                    <button
                      onClick={() => handleAnswer(false)}
                      className="px-8 py-3 bg-[#00D084] text-white font-bold rounded-lg hover:bg-[#00B873] transition-all hover:scale-105 flex items-center gap-2"
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
                          <span className="text-[#00D084] font-bold text-lg">Correct! +{currentScenario.points} points</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-[#FF4D4D]" />
                          <span className="text-[#FF4D4D] font-bold text-lg">Incorrect</span>
                        </>
                      )}
                    </div>
                    <p className="text-white">
                      This was {currentScenario.isPhishing ? 'a PHISHING attempt' : 'a LEGITIMATE message'}.
                    </p>
                  </div>

                  {currentScenario.isPhishing && !reportSubmitted && (
                    <div className="mb-6 p-4 bg-[#C0FF00]/10 rounded-lg border border-[#C0FF00]/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <Flag className="w-4 h-4 text-[#C0FF00]" />
                            Report This Phishing
                          </h4>
                          <p className="text-[#B8BCCF] text-sm">Identify the red flag and earn +5 bonus points!</p>
                        </div>
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="px-4 py-2 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all text-sm"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  )}

                  {reportSubmitted && (
                    <div className="mb-6 p-4 bg-[#00D084]/10 rounded-lg border border-[#00D084]/30">
                      <div className="flex items-center gap-2 text-[#00D084] font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Report Submitted! +5 bonus points earned!
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">Explanation:</h3>
                    <p className="text-[#B8BCCF]">{currentScenario.explanation}</p>
                  </div>

                  {currentScenario.isPhishing ? (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#FF4D4D]" />
                        Red Flags:
                      </h3>
                      <ul className="space-y-2">
                        {currentScenario.redFlags.map((flag, i) => (
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
                        {currentScenario.safeIndicators.map((indicator, i) => (
                          <li key={i} className="flex items-start gap-2 text-[#B8BCCF] text-sm">
                            <span className="text-[#00D084]">•</span>
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                    )}

                    {currentScenario.isAIGenerated && (currentScenario.realWorldContext || currentScenario.learningObjective) && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-[#C0FF00]/5 to-[#00D084]/5 rounded-lg border border-[#2E3A4F]">
                        {currentScenario.realWorldContext && (
                          <div className="mb-3">
                            <h4 className="text-white font-semibold mb-1 flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4 text-[#C0FF00]" />
                              Real-World Context
                            </h4>
                            <p className="text-[#B8BCCF] text-sm">{currentScenario.realWorldContext}</p>
                          </div>
                        )}
                        {currentScenario.learningObjective && (
                          <div>
                            <h4 className="text-white font-semibold mb-1 flex items-center gap-2 text-sm">
                              <Target className="w-4 h-4 text-[#00D084]" />
                              Learning Objective
                            </h4>
                            <p className="text-[#B8BCCF] text-sm">{currentScenario.learningObjective}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                    onClick={resetScenario}
                    className="w-full px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
                  >
                    Try Another Scenario
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#C0FF00]" />
                Report Phishing - Select Red Flag
              </h3>
              <p className="text-[#B8BCCF] text-sm mb-4">
                Select the main red flag you identified in this phishing attempt:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                {currentScenario?.redFlags.map((flag, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedRedFlag(flag)}
                    className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                      selectedRedFlag === flag
                        ? 'border-[#C0FF00] bg-[#C0FF00]/10 text-white'
                        : 'border-[#2E3A4F] bg-[#0D1B2A] text-[#B8BCCF] hover:border-[#C0FF00]/50'
                    }`}
                  >
                    {flag}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#2E3A4F] text-[#B8BCCF] hover:border-[#C0FF00] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleReport();
                    setShowReportModal(false);
                  }}
                  disabled={!selectedRedFlag}
                  className="flex-1 px-4 py-2 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Phishing Simulations</h1>
              <p className="text-[#B8BCCF]">Test your ability to identify phishing attacks with our Deep Inspect tool</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAIGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C0FF00] to-[#00D084] text-[#0D1B2A] font-bold rounded-lg hover:opacity-90 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Generate with AI
              </button>
              <div className="flex items-center gap-4 bg-[#1A2332] p-2 rounded-lg border border-[#2E3A4F]">
                  <Award className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-white font-bold">{totalPoints} points</span>
                  <span className="text-[#B8BCCF]">|</span>
                  <span className="text-[#B8BCCF]">{dbStats.correct + completedScenarios.filter(s => s.correct).length}/{dbStats.total + completedScenarios.length} correct</span>
                </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-3">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowAITab(false)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    !showAITab
                      ? 'bg-[#C0FF00] text-[#0D1B2A]'
                      : 'bg-[#1A2332] text-[#B8BCCF] border border-[#2E3A4F] hover:border-[#C0FF00]'
                  }`}
                >
                  Built-in Scenarios ({scenarios.length})
                </button>
                <button
                  onClick={() => setShowAITab(true)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    showAITab
                      ? 'bg-[#C0FF00] text-[#0D1B2A]'
                      : 'bg-[#1A2332] text-[#B8BCCF] border border-[#2E3A4F] hover:border-[#C0FF00]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI-Generated ({aiGeneratedScenarios.length})
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {['all', 'email', 'sms', 'qr', 'bec', 'social', 'vishing'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === type
                        ? 'bg-[#C0FF00] text-[#0D1B2A]'
                        : 'bg-[#1A2332] text-[#B8BCCF] border border-[#2E3A4F] hover:border-[#C0FF00]'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : typeLabels[type]}
                  </button>
                ))}
              </div>

              {!showAITab ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredScenarios.map((scenario) => {
                    const Icon = typeIcons[scenario.type] || Mail;
                    const completed = completedScenarios.find(s => s.id === scenario.id);
                    
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => setCurrentScenario(scenario)}
                        className="text-left bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 hover:border-[#C0FF00]/50 transition-all hover:scale-[1.02] group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 bg-[#C0FF00]/10 rounded-lg">
                            <Icon className="w-5 h-5 text-[#C0FF00]" />
                          </div>
                          {completed && (
                            completed.correct ? (
                              <CheckCircle className="w-5 h-5 text-[#00D084]" />
                            ) : (
                              <XCircle className="w-5 h-5 text-[#FF4D4D]" />
                            )
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty}
                          </span>
                          <span className="text-xs text-[#B8BCCF]">{typeLabels[scenario.type]}</span>
                        </div>
                        <h3 className="text-white font-semibold mb-2 group-hover:text-[#C0FF00] transition-colors">{scenario.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-[#C0FF00] text-sm font-medium">+{scenario.points} pts</span>
                          <ChevronRight className="w-5 h-5 text-[#B8BCCF] group-hover:text-[#C0FF00] transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  {aiGeneratedScenarios.length === 0 ? (
                    <div className="text-center py-16">
                      <Sparkles className="w-16 h-16 text-[#C0FF00] mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No AI-Generated Scenarios Yet</h3>
                      <p className="text-[#B8BCCF] mb-6">Create your first custom phishing simulation with AI!</p>
                      <button
                        onClick={() => setShowAIGenerator(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#C0FF00] to-[#00D084] text-[#0D1B2A] font-bold rounded-lg hover:opacity-90 transition-all"
                      >
                        Generate Your First Simulation
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {aiGeneratedScenarios
                        .filter(s => filter === 'all' || s.type === filter)
                        .map((scenario) => {
                          const Icon = typeIcons[scenario.type] || Mail;
                          const completed = completedScenarios.find(s => s.id === scenario.id);
                          
                          return (
                            <button
                              key={scenario.id}
                              onClick={() => setCurrentScenario(scenario)}
                              className="text-left bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 hover:border-[#C0FF00]/50 transition-all hover:scale-[1.02] group relative"
                            >
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-gradient-to-r from-[#C0FF00]/20 to-[#00D084]/20 text-[#C0FF00] text-xs rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  AI
                                </span>
                              </div>
                              <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-[#C0FF00]/10 rounded-lg">
                                  <Icon className="w-5 h-5 text-[#C0FF00]" />
                                </div>
                                {completed && (
                                  completed.correct ? (
                                    <CheckCircle className="w-5 h-5 text-[#00D084]" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-[#FF4D4D]" />
                                  )
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(scenario.difficulty)}`}>
                                  {scenario.difficulty}
                                </span>
                                <span className="text-xs text-[#B8BCCF]">{typeLabels[scenario.type] || scenario.type}</span>
                              </div>
                              <h3 className="text-white font-semibold mb-2 group-hover:text-[#C0FF00] transition-colors">{scenario.title}</h3>
                              <div className="flex items-center justify-between">
                                <span className="text-[#C0FF00] text-sm font-medium">+{scenario.points} pts</span>
                                <ChevronRight className="w-5 h-5 text-[#B8BCCF] group-hover:text-[#C0FF00] transition-colors" />
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-[#C0FF00]" />
                  <h3 className="text-white font-bold">Recent History</h3>
                </div>
                
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#C0FF00] animate-spin" />
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 bg-[#0D1B2A] rounded-lg border border-[#2E3A4F]/50">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-white text-xs font-medium line-clamp-1">{item.title}</h4>
                          {item.result === 'correct' ? (
                            <CheckCircle className="w-3 h-3 text-[#00D084]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-[#FF4D4D]" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#B8BCCF]">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <span className={item.points > 0 ? 'text-[#C0FF00]' : ''}>
                            {item.points > 0 ? `+${item.points} pts` : '0 pts'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#B8BCCF] text-sm">No recent activity</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-[#1A2332] to-[#0D1B2A] rounded-xl border border-[#C0FF00]/20 p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C0FF00]" />
                  Deep Inspect
                </h3>
                <p className="text-[#B8BCCF] text-xs mb-4">
                  Use the Deep Inspect tool inside scenarios to see technical details like email headers and actual URLs.
                </p>
                <div className="p-3 bg-[#C0FF00]/5 rounded-lg border border-[#C0FF00]/10">
                  <p className="text-[#C0FF00] text-[10px] font-bold uppercase mb-1">Pro Tip</p>
                  <p className="text-[#B8BCCF] text-[10px]">
                    Always check if the "Actual URL" matches the "Display text" before clicking!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAIGenerator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#C0FF00]" />
                AI Simulation Generator
              </h3>
              <button onClick={() => setShowAIGenerator(false)} className="text-[#B8BCCF] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Describe the Scenario</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., A phishing email pretending to be from Amazon about a suspicious purchase, targeting online shoppers..."
                  className="w-full h-32 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg p-4 text-white placeholder:text-[#B8BCCF]/50 focus:border-[#C0FF00] focus:outline-none resize-none"
                />
                <p className="text-[#B8BCCF] text-sm mt-2">
                  Be specific! Include the company/brand, scenario context, target audience, or industry.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Type</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value)}
                    className="w-full bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg p-3 text-white focus:border-[#C0FF00] focus:outline-none"
                  >
                    <option value="email">Email Phishing</option>
                    <option value="sms">SMS Phishing</option>
                    <option value="bec">CEO Fraud/BEC</option>
                    <option value="qr">QR Code Phishing</option>
                    <option value="social">Social Media</option>
                    <option value="vishing">Voice Phishing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Difficulty</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg p-3 text-white focus:border-[#C0FF00] focus:outline-none"
                  >
                    <option value="Beginner">Beginner (10 pts)</option>
                    <option value="Intermediate">Intermediate (15 pts)</option>
                    <option value="Advanced">Advanced (20 pts)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Scenario Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAiIsPhishing(undefined)}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      aiIsPhishing === undefined
                        ? 'bg-[#C0FF00] text-[#0D1B2A]'
                        : 'bg-[#0D1B2A] border border-[#2E3A4F] text-[#B8BCCF] hover:border-[#C0FF00]'
                    }`}
                  >
                    Random
                  </button>
                  <button
                    onClick={() => setAiIsPhishing(true)}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      aiIsPhishing === true
                        ? 'bg-[#FF4D4D] text-white'
                        : 'bg-[#0D1B2A] border border-[#2E3A4F] text-[#B8BCCF] hover:border-[#FF4D4D]'
                    }`}
                  >
                    Phishing
                  </button>
                  <button
                    onClick={() => setAiIsPhishing(false)}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      aiIsPhishing === false
                        ? 'bg-[#00D084] text-white'
                        : 'bg-[#0D1B2A] border border-[#2E3A4F] text-[#B8BCCF] hover:border-[#00D084]'
                    }`}
                  >
                    Legitimate
                  </button>
                </div>
              </div>

              <div className="bg-[#0D1B2A] rounded-lg p-4 border border-[#2E3A4F]">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#C0FF00]" />
                  Based on Real 2024-2025 Incidents
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { idea: 'Healthcare billing system breach (like Change Healthcare)', type: 'bec' },
                    { idea: 'CEO wire transfer request (like Pepco €15.5M fraud)', type: 'bec' },
                    { idea: 'Transport service data breach notification', type: 'email' },
                    { idea: 'IT help desk password reset (voice phishing)', type: 'vishing' },
                    { idea: 'Third-party vendor account compromise', type: 'email' },
                    { idea: 'QR code payment at restaurant or parking', type: 'qr' },
                    { idea: 'MFA fatigue attack with repeated push notifications', type: 'email' },
                    { idea: 'AI-generated deepfake voice call from boss', type: 'vishing' },
                  ].map((item) => (
                    <button
                      key={item.idea}
                      onClick={() => {
                        setAiPrompt(item.idea);
                        setAiType(item.type);
                      }}
                      className="text-left text-sm text-[#B8BCCF] hover:text-[#C0FF00] transition-colors py-1"
                    >
                      + {item.idea}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateAISimulation}
                disabled={!aiPrompt.trim() || isGenerating}
                className="w-full py-4 bg-gradient-to-r from-[#C0FF00] to-[#00D084] text-[#0D1B2A] font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Simulation...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
