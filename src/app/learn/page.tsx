'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { Play, Clock, Award, ChevronRight, Loader2, CheckCircle, XCircle, ArrowRight, PlayCircle, BookOpen, TrendingUp, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { updateUserStats } from "@/lib/updateUserStats";
import Link from "next/link";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type Quiz = {
  question: string;
  options: string[];
  correctIndex: number;
};

type NoteBlock = {
  type: 'key' | 'warning' | 'tip' | 'info' | 'fact';
  emoji: string;
  text: string;
};

type Module = {
  id: number | string;
  title: string;
  description: string;
  duration: string;
  video_id: string;
  level: string;
  points: number;
  quiz: Quiz[];
  notes?: NoteBlock[];
};

const fallbackModules: Module[] = [
  {
    id: 1, title: "Phishing Fundamentals",
    description: "Learn what phishing is, why it matters, and the psychology behind attacks.",
    duration: "8 min", video_id: "XBkzBrXlle0", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Phishing is the #1 cause of data breaches — over 90% of attacks start with a phishing email.' },
      { type: 'warning', emoji: '⚠️', text: 'Attackers exploit URGENCY — phrases like "Act Now" or "Your account is suspended" are red flags.' },
      { type: 'tip',     emoji: '💡', text: 'Always hover over links before clicking to see the real destination URL.' },
      { type: 'fact',    emoji: '📊', text: 'The average phishing attack costs a company $1.6 million in damages.' },
    ],
    quiz: [
      { question: "What is the primary goal of a phishing attack?", options: ["To improve email security", "To steal sensitive information", "To send marketing emails", "To test network speed"], correctIndex: 1 },
      { question: "Which is a common psychological tactic used in phishing?", options: ["Creating urgency", "Providing receipts", "Using letterheads", "Sending attachments"], correctIndex: 0 },
      { question: "What percentage of data breaches involve phishing?", options: ["Less than 10%", "Around 25%", "Over 90%", "Exactly 50%"], correctIndex: 2 }
    ]
  },
  {
    id: 2, title: "Email Header Analysis",
    description: "Master the art of analyzing email headers to detect spoofed senders.",
    duration: "10 min", video_id: "3wwaYc_Yuhc", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'The "From" display name can be anything — only the email domain in angle brackets <> is the real sender.' },
      { type: 'warning', emoji: '⚠️', text: 'Mismatch between "From" and "Return-Path" is a strong indicator of email spoofing.' },
      { type: 'tip',     emoji: '💡', text: 'Use mail-tester.com or Google Admin Toolbox to inspect full email headers for free.' },
      { type: 'info',    emoji: 'ℹ️', text: 'SPF, DKIM, and DMARC are email authentication protocols that help prevent spoofing.' },
    ],
    quiz: [
      { question: "What does the 'From' field actually indicate?", options: ["Verified sender", "Display name (can be spoofed)", "Server IP", "Encryption status"], correctIndex: 1 },
      { question: "Which field shows the email's path?", options: ["Subject", "Received", "Reply-To", "Content-Type"], correctIndex: 1 },
      { question: "From/Return-Path mismatch often indicates:", options: ["Legitimate email", "Phishing attempt", "Encrypted message", "High priority"], correctIndex: 1 }
    ]
  },
  {
    id: 3, title: "Spear Phishing & Targeted Attacks",
    description: "Understand how attackers research victims and craft highly personalized phishing emails.",
    duration: "12 min", video_id: "BhGWnSeNXq0", level: "Intermediate", points: 20,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Spear phishing uses your name, job, and colleagues to appear legitimate — 3x more effective than generic phishing.' },
      { type: 'warning', emoji: '⚠️', text: 'LinkedIn, Facebook, and your company website are goldmines for attackers researching you.' },
      { type: 'tip',     emoji: '💡', text: 'Be cautious of unsolicited emails referencing specific project names — attackers do their research.' },
      { type: 'fact',    emoji: '📊', text: '91% of all cyberattacks begin with a spear phishing email targeting specific individuals.' },
    ],
    quiz: [
      { question: "What makes spear phishing different?", options: ["Uses phone calls", "Targets specific individuals with personal info", "Only targets companies", "Uses malware files"], correctIndex: 1 },
      { question: "Where do spear phishers gather info?", options: ["Dark web only", "Social media and LinkedIn", "Company intranets", "Phone directories"], correctIndex: 1 },
      { question: "Best defense against spear phishing?", options: ["Antivirus software", "Awareness training and verification", "Spam filters", "VPN"], correctIndex: 1 }
    ]
  },
  {
    id: 4, title: "Smishing — SMS Phishing",
    description: "Recognize fraudulent text messages designed to steal credentials or install malware.",
    duration: "7 min", video_id: "sHRS7pbBHcQ", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Smishing texts impersonate banks, delivery services (FedEx, DHL), or government agencies.' },
      { type: 'warning', emoji: '⚠️', text: 'Never click links in unsolicited texts — go directly to the official app or website instead.' },
      { type: 'tip',     emoji: '💡', text: 'Real banks NEVER ask for your PIN, OTP, or password via SMS — these are always scams.' },
      { type: 'info',    emoji: 'ℹ️', text: 'SMS phishing is growing 328% year-over-year as attackers shift from email to mobile.' },
    ],
    quiz: [
      { question: "What is smishing?", options: ["Email phishing", "Phishing via SMS/text messages", "Voice phishing", "QR code attacks"], correctIndex: 1 },
      { question: "A text says your package is held, click to reschedule. What do you do?", options: ["Click the link", "Go to the official courier website directly", "Reply with your address", "Forward to friends"], correctIndex: 1 },
      { question: "Which is a common smishing red flag?", options: ["Message from a contact", "Unknown number with urgent link", "Official app notification", "Verified sender badge"], correctIndex: 1 }
    ]
  },
  {
    id: 5, title: "Vishing — Voice Phishing",
    description: "Learn how phone call scams work and how to handle suspicious callers confidently.",
    duration: "9 min", video_id: "SBBx-m6U_Qs", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Vishing attackers impersonate tech support (Microsoft, Apple), banks, or government officials.' },
      { type: 'warning', emoji: '⚠️', text: 'Caller ID can be SPOOFED — a call from your bank\'s number may not be real.' },
      { type: 'tip',     emoji: '💡', text: 'If suspicious, hang up and call the organization back using the official number from their website.' },
      { type: 'fact',    emoji: '📊', text: 'Americans lose over $10 billion annually to phone scams.' },
    ],
    quiz: [
      { question: "What is vishing?", options: ["Video phishing", "Voice/phone call phishing", "Visual hacking", "VPN attacks"], correctIndex: 1 },
      { question: "A caller claims to be Microsoft and says your PC has a virus. What do you do?", options: ["Give remote access", "Pay their fee", "Hang up and call Microsoft directly", "Install their software"], correctIndex: 2 },
      { question: "Can caller ID be faked?", options: ["No, it's always accurate", "Yes, caller ID spoofing is common", "Only on mobile", "Only internationally"], correctIndex: 1 }
    ]
  },
  {
    id: 6, title: "QR Code Phishing (Quishing)",
    description: "Discover how attackers embed malicious URLs in QR codes to bypass email security.",
    duration: "8 min", video_id: "v4jJdmQpHPg", level: "Intermediate", points: 20,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'QR codes hide URLs — you can\'t see the destination before scanning, making them ideal for bypassing security tools.' },
      { type: 'warning', emoji: '⚠️', text: 'Attackers place fake QR codes over real ones in restaurants, parking meters, and offices.' },
      { type: 'tip',     emoji: '💡', text: 'Use a QR scanner that shows the URL BEFORE opening it, and always check the domain.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Quishing attacks increased 587% in the second half of 2023.' },
    ],
    quiz: [
      { question: "Why are QR codes risky for phishing?", options: ["They expire quickly", "The URL is hidden until scanned", "Only work on iPhone", "Use Bluetooth"], correctIndex: 1 },
      { question: "A QR code at a restaurant asks for your credit card. What do you do?", options: ["Enter payment info", "Close and ask staff for a printed menu", "Take a screenshot", "Share with friends"], correctIndex: 1 },
      { question: "What does 'Quishing' mean?", options: ["Quick phishing", "QR code phishing", "Quantum phishing", "Queue phishing"], correctIndex: 1 }
    ]
  },
  {
    id: 7, title: "Social Engineering Tactics",
    description: "Explore the psychological manipulation techniques attackers use to deceive people.",
    duration: "15 min", video_id: "YmGwdoS706M", level: "Intermediate", points: 20,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Social engineering exploits human psychology — trust, fear, authority — not technical vulnerabilities.' },
      { type: 'warning', emoji: '⚠️', text: 'Pretexting: attackers create fake scenarios ("I\'m from IT, need your password") to gain trust.' },
      { type: 'tip',     emoji: '💡', text: 'Verify the person\'s identity through a separate trusted channel before sharing anything.' },
      { type: 'fact',    emoji: '📊', text: 'Kevin Mitnick said 80% of his hacks relied on social engineering, not code.' },
    ],
    quiz: [
      { question: "Social engineering primarily exploits:", options: ["Software bugs", "Network weaknesses", "Human psychology", "Hardware flaws"], correctIndex: 2 },
      { question: "IT calls asking for your password to fix your account. What do you do?", options: ["Provide the password", "Verify identity through official channels first", "Email the password", "Give a hint"], correctIndex: 1 },
      { question: "Which tactic involves creating a fabricated scenario?", options: ["Tailgating", "Pretexting", "Baiting", "Dumpster diving"], correctIndex: 1 }
    ]
  },
  {
    id: 8, title: "Password Security & Best Practices",
    description: "Build strong password habits and understand why password managers are essential.",
    duration: "10 min", video_id: "CNMKuqb3xFk", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'A 12-character password takes 34,000 years to crack — an 8-character one takes 8 hours.' },
      { type: 'warning', emoji: '⚠️', text: 'Password reuse is dangerous — if one site is breached, attackers try your credentials everywhere (credential stuffing).' },
      { type: 'tip',     emoji: '💡', text: 'Use a password manager (Bitwarden is free) to generate and store unique 20+ character passwords.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Check haveibeenpwned.com to see if your email has been in a known data breach.' },
    ],
    quiz: [
      { question: "Which password is strongest?", options: ["Password123", "MyDog2023!", "Tr#9kL!mN$vQ2p", "qwerty"], correctIndex: 2 },
      { question: "What is credential stuffing?", options: ["Adding characters to passwords", "Using breached passwords on other sites", "Encrypting passwords", "Sharing passwords"], correctIndex: 1 },
      { question: "Best way to manage many strong passwords?", options: ["Write in a notebook", "Use the same password", "Use a password manager", "Use your birthdate"], correctIndex: 2 }
    ]
  },
  {
    id: 9, title: "Two-Factor Authentication (2FA)",
    description: "Understand why 2FA is critical and how to set it up properly for maximum security.",
    duration: "8 min", video_id: "L3alw3iXaio", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: '2FA blocks 99.9% of automated account hacking attempts — even if your password is stolen.' },
      { type: 'warning', emoji: '⚠️', text: 'SMS-based 2FA is the weakest form — SIM swapping attacks can intercept text messages.' },
      { type: 'tip',     emoji: '💡', text: 'Use an authenticator app (Google Authenticator, Authy) or hardware key (YubiKey) for maximum security.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Enable 2FA on email, banking, social media, and any account with personal or financial data first.' },
    ],
    quiz: [
      { question: "What does 2FA add to login?", options: ["A second password", "A second verification factor", "A CAPTCHA", "An email confirmation"], correctIndex: 1 },
      { question: "Which 2FA method is LEAST secure?", options: ["Hardware key", "Authenticator app", "SMS text message", "Biometric"], correctIndex: 2 },
      { question: "2FA blocks what percentage of automated attacks?", options: ["50%", "75%", "99.9%", "60%"], correctIndex: 2 }
    ]
  },
  {
    id: 10, title: "Spotting Fake Websites",
    description: "Learn to identify cloned websites, typosquatting domains, and fake login pages.",
    duration: "11 min", video_id: "MBkqfWkIi5w", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Fake sites use typosquatting: paypa1.com, g00gle.com — always check domain spelling carefully.' },
      { type: 'warning', emoji: '⚠️', text: 'HTTPS and the padlock do NOT mean safe — phishing sites also use HTTPS. It only means encrypted.' },
      { type: 'tip',     emoji: '💡', text: 'Bookmark important banking and email sites — this eliminates typosquatting risk completely.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Use Google Safe Browsing checker to report phishing sites: google.com/safebrowsing/report_phish' },
    ],
    quiz: [
      { question: "What is typosquatting?", options: ["Typing fast", "Registering misspelled domains to trick users", "Squatting in server rooms", "A form of malware"], correctIndex: 1 },
      { question: "Does HTTPS guarantee a website is safe?", options: ["Yes, always", "No, phishing sites also use HTTPS", "Only on .com domains", "Yes, if there's a padlock"], correctIndex: 1 },
      { question: "Best way to avoid fake website attacks:", options: ["Check website color", "Bookmark official sites", "Look for lots of content", "Check loading speed"], correctIndex: 1 }
    ]
  },
  {
    id: 11, title: "Business Email Compromise (BEC)",
    description: "Understand how BEC attacks target organizations and cost billions in wire fraud.",
    duration: "13 min", video_id: "CrcvvJCOSG0", level: "Advanced", points: 25,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'BEC is the most financially damaging cybercrime — costing $2.9 billion in 2023 (FBI).' },
      { type: 'warning', emoji: '⚠️', text: 'Attackers monitor emails for weeks before sending a fake CEO wire transfer request at the perfect moment.' },
      { type: 'tip',     emoji: '💡', text: 'Always verify wire transfers via PHONE CALL to a known number — never by replying to email.' },
      { type: 'fact',    emoji: '📊', text: 'The average BEC loss per incident is $120,000 — most victims never recover the funds.' },
    ],
    quiz: [
      { question: "BEC stands for:", options: ["Basic Email Check", "Business Email Compromise", "Bulk Email Campaign", "Browser Extension Control"], correctIndex: 1 },
      { question: "Your CEO emails requesting a $50,000 urgent wire transfer. What do you do?", options: ["Transfer immediately", "Reply asking for confirmation", "Call the CEO using a known number", "Email the CFO"], correctIndex: 2 },
      { question: "What makes BEC attacks hard to detect?", options: ["They use viruses", "They use legitimate-looking context", "They come from unknown senders", "They contain obvious errors"], correctIndex: 1 }
    ]
  },
  {
    id: 12, title: "Ransomware — How to Stay Protected",
    description: "Learn how ransomware spreads, what to do if infected, and how to prevent attacks.",
    duration: "14 min", video_id: "lIsWpCMBxHQ", level: "Intermediate", points: 20,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Ransomware encrypts ALL your files and demands payment (usually Bitcoin) to unlock them.' },
      { type: 'warning', emoji: '⚠️', text: 'NEVER pay the ransom — payment doesn\'t guarantee file recovery and encourages more attacks.' },
      { type: 'tip',     emoji: '💡', text: 'Follow the 3-2-1 rule: 3 copies of data, on 2 media types, with 1 offsite/cloud backup.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Most ransomware spreads via phishing emails — phishing awareness IS ransomware prevention.' },
    ],
    quiz: [
      { question: "What does ransomware do?", options: ["Deletes files", "Encrypts files and demands payment", "Sends files to attackers", "Corrupts files permanently"], correctIndex: 1 },
      { question: "Should you pay the ransom?", options: ["Yes, always", "Only for important files", "No — it doesn't guarantee recovery", "Yes if you have Bitcoin"], correctIndex: 2 },
      { question: "Best protection against ransomware:", options: ["Antivirus only", "Regular backups + phishing awareness", "Paying quickly", "Disconnecting from internet"], correctIndex: 1 }
    ]
  },
  {
    id: 13, title: "Safe Browsing & Public Wi-Fi",
    description: "Protect yourself online with safe browsing habits and VPN usage on public networks.",
    duration: "9 min", video_id: "_wQTRMBAvzg", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Public Wi-Fi is NEVER secure — attackers can intercept everything (man-in-the-middle attacks).' },
      { type: 'warning', emoji: '⚠️', text: 'Never access banking or work accounts on public Wi-Fi without a VPN.' },
      { type: 'tip',     emoji: '💡', text: 'Use ProtonVPN (free tier) when on public networks in coffee shops, airports, or hotels.' },
      { type: 'info',    emoji: 'ℹ️', text: 'uBlock Origin browser extension blocks ads, trackers, and malicious scripts — install it today.' },
    ],
    quiz: [
      { question: "Why is public Wi-Fi dangerous?", options: ["It's slow", "Attackers can intercept your traffic", "Uses too much battery", "It's unreliable"], correctIndex: 1 },
      { question: "What does a VPN do?", options: ["Speeds up internet", "Encrypts traffic and hides your IP", "Blocks all ads", "Scans for viruses"], correctIndex: 1 },
      { question: "Which activity is SAFE on public Wi-Fi without VPN?", options: ["Online banking", "Reading public news websites", "Logging into work email", "Shopping with credit card"], correctIndex: 1 }
    ]
  },
  {
    id: 14, title: "Data Privacy & Personal Information",
    description: "Understand how your data is collected, sold, and exploited online.",
    duration: "11 min", video_id: "u9x5TeuAFhk", level: "Intermediate", points: 20,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Data brokers legally collect and sell your name, address, phone, income, and relationships.' },
      { type: 'warning', emoji: '⚠️', text: 'Free apps often sell your data — if you\'re not paying, YOU are the product.' },
      { type: 'tip',     emoji: '💡', text: 'Use unique email aliases per site (SimpleLogin is free) to track who sold your data.' },
      { type: 'fact',    emoji: '📊', text: 'Your data is sold to 20+ data brokers on average — you can opt out at DeleteMe.' },
    ],
    quiz: [
      { question: "What is a data broker?", options: ["A bank employee", "Company that collects and sells personal data", "A cybersecurity expert", "An email provider"], correctIndex: 1 },
      { question: "Why are free apps risky for privacy?", options: ["They have bugs", "They monetize by selling user data", "They use too much data", "They crash frequently"], correctIndex: 1 },
      { question: "Best way to limit data exposure:", options: ["Use only paid apps", "Minimize permissions and use email aliases", "Never use smartphones", "Use only offline software"], correctIndex: 1 }
    ]
  },
  {
    id: 15, title: "Mobile Device Security",
    description: "Secure your smartphone against app threats, malicious links, and unauthorized access.",
    duration: "10 min", video_id: "aOCxEBLKhZE", level: "Beginner", points: 15,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Malicious apps are the #1 mobile threat — only install from official stores and check permissions.' },
      { type: 'warning', emoji: '⚠️', text: 'A flashlight app should NOT need access to contacts, microphone, or location — deny suspicious permissions.' },
      { type: 'tip',     emoji: '💡', text: 'Enable device encryption, use a strong PIN, and set screen lock to 30 seconds.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Keep your OS updated — security patches fix vulnerabilities attackers actively exploit.' },
    ],
    quiz: [
      { question: "A calculator app requests contacts access. What should you do?", options: ["Allow it", "Deny — it doesn't need contacts", "Uninstall your calculator", "Grant all permissions"], correctIndex: 1 },
      { question: "Where should you ONLY install apps from?", options: ["Any website", "Official app stores", "Email attachments", "SMS links"], correctIndex: 1 },
      { question: "Why are OS updates important for security?", options: ["Add new features", "Fix security vulnerabilities", "Improve battery", "Required by law"], correctIndex: 1 }
    ]
  },
  {
    id: 16, title: "Deepfakes & AI-Powered Attacks",
    description: "Understand AI-generated audio/video fraud and how to verify authenticity.",
    duration: "12 min", video_id: "gLoI9hAX9dw", level: "Advanced", points: 25,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Deepfakes can clone a person\'s voice with just 3 seconds of audio — enabling convincing phone scams.' },
      { type: 'warning', emoji: '⚠️', text: 'A UK company lost $243,000 after receiving a deepfake audio call from a fake "CEO".' },
      { type: 'tip',     emoji: '💡', text: 'Establish a secret code word with family/colleagues to verify identity for unusual voice requests.' },
      { type: 'fact',    emoji: '📊', text: 'Deepfake videos increased 900% from 2023 to 2024 — AI makes social engineering more convincing.' },
    ],
    quiz: [
      { question: "What is a deepfake?", options: ["A fake social media profile", "AI-generated synthetic media", "A type of malware", "A VPN protocol"], correctIndex: 1 },
      { question: "A voice call sounds exactly like your CEO asking for an urgent transfer. What do you do?", options: ["Transfer immediately", "Verify via a separate known channel", "Record the call", "Ask for email confirmation"], correctIndex: 1 },
      { question: "How little audio is needed to clone a voice today?", options: ["30 minutes", "5 minutes", "As little as 3 seconds", "Only studio quality works"], correctIndex: 2 }
    ]
  },
  {
    id: 17, title: "Cybersecurity for Remote Work",
    description: "Stay secure when working from home — protecting company data on personal networks.",
    duration: "10 min", video_id: "GEKnEp4z-C8", level: "Intermediate", points: 20,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'Home networks are far less secure than corporate networks — remote workers are the weakest link.' },
      { type: 'warning', emoji: '⚠️', text: 'Never mix personal and work accounts on the same device — a personal breach can compromise company systems.' },
      { type: 'tip',     emoji: '💡', text: 'Always use your company VPN when accessing work resources, and lock your screen when walking away.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Change your home router\'s default password — most use "admin/admin" which attackers try first.' },
    ],
    quiz: [
      { question: "Why are remote workers targets?", options: ["Work longer hours", "Home networks are less secure", "Use personal devices", "Access more data"], correctIndex: 1 },
      { question: "What should you do with your router's default password?", options: ["Keep as default", "Write on sticky note", "Change to a strong unique password", "Share with IT"], correctIndex: 2 },
      { question: "When should you use VPN for remote work?", options: ["Only on public Wi-Fi", "Never needed", "Always when accessing company resources", "Only for video calls"], correctIndex: 2 }
    ]
  },
  {
    id: 18, title: "Incident Response — What to Do When Hacked",
    description: "Learn the immediate steps to take if you suspect your accounts or device are compromised.",
    duration: "11 min", video_id: "cMXPFbW0QEk", level: "Advanced", points: 25,
    notes: [
      { type: 'key',     emoji: '🔑', text: 'The first 60 minutes after discovering a breach are critical — fast action limits the damage.' },
      { type: 'warning', emoji: '⚠️', text: 'Do NOT power off the device immediately — this can destroy forensic evidence needed to understand the attack.' },
      { type: 'tip',     emoji: '💡', text: 'Change passwords from a DIFFERENT CLEAN device — not the one you suspect is compromised.' },
      { type: 'info',    emoji: 'ℹ️', text: 'Report phishing emails to reportphishing@apwg.org or your IT security team.' },
    ],
    quiz: [
      { question: "You suspect your email was hacked. First step:", options: ["Ignore and monitor", "Change password from a clean device immediately", "Delete your account", "Call the attacker"], correctIndex: 1 },
      { question: "Should you immediately power off a hacked device?", options: ["Yes, always", "No — preserve forensic evidence", "Yes, to stop the attack", "Only laptops"], correctIndex: 1 },
      { question: "Where to change passwords if your device is compromised?", options: ["On the compromised device", "On a trusted separate clean device", "By calling your provider", "Using safe mode"], correctIndex: 1 }
    ]
  },
];

export default function LearnPage() {
  const [modules, setModules] = useState<Module[]>(fallbackModules);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<(number | string)[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [completing, setCompleting] = useState(false);
  const playerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 8000);
    
    const fetchModules = async () => {
      try {
        const supabase = createClient();
        
        const { data: modulesData, error: modulesError } = await supabase
          .from('learn_modules')
          .select('*')
          .order('order_index', { ascending: true });

        if (modulesError) throw modulesError;

          if (modulesData && modulesData.length > 0) {
            const mapped = modulesData.map((m: any) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              duration: m.duration || '8 min',
              video_id: m.video_url || '',
              level: m.level || 'Beginner',
              points: m.points || 15,
              quiz: m.quiz || [],
            }));
            setModules(mapped);
            setSelectedModule(mapped[0]);
          } else {
          setSelectedModule(fallbackModules[0]);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progress } = await supabase
            .from('user_module_progress')
            .select('module_id')
            .eq('user_id', user.id);
          
          if (progress) {
            setCompletedModules(progress.map(p => p.module_id));
          }
        }
      } catch (err) {
        console.error('Error fetching modules:', err);
        setSelectedModule(fallbackModules[0]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchModules();
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!selectedModule) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [selectedModule]);

  const initPlayer = () => {
    if (!selectedModule) return;
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    setVideoError(false);

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: selectedModule.video_id,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            setVideoFinished(true);
          }
        },
        onError: () => {
          setVideoError(true);
        },
      },
    });
  };

  useEffect(() => {
    setVideoFinished(false);
  }, [selectedModule]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizAnswers([]);
    setShowQuizResult(false);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (showQuizResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !selectedModule) return;
    const isCorrect = selectedAnswer === selectedModule.quiz[currentQuestion].correctIndex;
    setQuizAnswers([...quizAnswers, isCorrect]);
    setShowQuizResult(true);
  };

  const handleNextQuestion = async () => {
    if (!selectedModule) return;
    
    if (currentQuestion < selectedModule.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowQuizResult(false);
    } else {
      setQuizCompleted(true);
      const correctCount = [...quizAnswers, selectedAnswer === selectedModule.quiz[currentQuestion].correctIndex].filter(Boolean).length;
      const passed = correctCount >= 2;
      
        if (passed && !completedModules.includes(selectedModule.id)) {
          setCompleting(true);
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: inserted, error: progressError } = await supabase.rpc('complete_module', {
              user_id_param: user.id,
              module_id_param: selectedModule.id,
              quiz_score_param: correctCount
            });

            if (!progressError && inserted) {
              await updateUserStats(selectedModule.points, 'module', selectedModule.title, 'completed');
              setCompletedModules(prev => [...prev, selectedModule.id]);
            }
          }
          setCompleting(false);
        }
    }
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizAnswers([]);
    setShowQuizResult(false);
    setQuizCompleted(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "text-[#00D084] bg-[#00D084]/10 border-[#00D084]/30";
      case "Intermediate": return "text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30";
      case "Advanced": return "text-[#FF4D4D] bg-[#FF4D4D]/10 border-[#FF4D4D]/30";
      default: return "text-[#B8BCCF]";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C0FF00] animate-spin" />
      </div>
    );
  }

  const correctAnswersCount = quizAnswers.filter(Boolean).length + (showQuizResult && selectedModule && selectedAnswer === selectedModule.quiz[currentQuestion]?.correctIndex ? 1 : 0);
  const quizPassed = quizCompleted && correctAnswersCount >= 2;

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Learning Center</h1>
            <p className="text-[#B8BCCF]">Watch video tutorials and pass the quiz to earn points</p>
          </div>

          <div ref={statsRef} className="grid lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#C0FF00]/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-[#C0FF00]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{modules.length}</p>
                <p className="text-sm text-[#B8BCCF]">Total Modules</p>
              </div>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#00D084]/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#00D084]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedModules.length}</p>
                <p className="text-sm text-[#B8BCCF]">Completed</p>
              </div>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#FFB800]/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#FFB800]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Math.round((completedModules.length / modules.length) * 100)}%</p>
                <p className="text-sm text-[#B8BCCF]">Progress</p>
              </div>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#C0FF00]/10 rounded-lg">
                <Award className="w-6 h-6 text-[#C0FF00]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {completedModules.reduce<number>((acc, id) => acc + (modules.find(m => m.id === id)?.points || 0), 0)}
                </p>
                <p className="text-sm text-[#B8BCCF]">Points Earned</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {selectedModule && (
                <div ref={videoContainerRef} className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] overflow-hidden">
                  {!showQuiz ? (
                    <>
                      <div className="aspect-video bg-black relative">
                        <div id="youtube-player" className={`w-full h-full ${videoError ? 'hidden' : ''}`} />

                        {/* Video unavailable fallback */}
                        {videoError && (
                          <div className="absolute inset-0 bg-[#0D1B2A] flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 bg-[#FF4D4D]/20 rounded-full flex items-center justify-center mb-4">
                              <span className="text-3xl">📺</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Video Unavailable</h3>
                            <p className="text-[#B8BCCF] text-sm mb-5 max-w-xs">
                              This video isn't available in the embed player. Watch it directly on YouTube instead.
                            </p>
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedModule.title + ' cybersecurity tutorial')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2.5 bg-[#FF0000] text-white font-bold rounded-lg hover:bg-[#cc0000] transition-all flex items-center gap-2 mb-3"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                              Search on YouTube
                            </a>
                            <button
                              onClick={handleStartQuiz}
                              className="text-[#C0FF00] text-sm underline hover:text-white transition-colors"
                            >
                              Skip to Quiz →
                            </button>
                          </div>
                        )}

                        {videoFinished && !completedModules.includes(selectedModule.id) && !videoError && (
                          <div className="absolute inset-0 bg-[#0D1B2A]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                            <div className="w-16 h-16 bg-[#C0FF00] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(192,255,0,0.4)]">
                              <PlayCircle className="w-10 h-10 text-[#0D1B2A]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Video Completed!</h3>
                            <p className="text-[#B8BCCF] mb-6 max-w-sm">
                              Ready to test your knowledge and earn points?
                            </p>
                            <button
                              onClick={handleStartQuiz}
                              className="px-8 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                              Start Module Quiz
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(selectedModule.level)}`}>
                            {selectedModule.level}
                          </span>
                          <span className="flex items-center gap-1 text-[#B8BCCF] text-sm">
                            <Clock className="w-4 h-4" />
                            {selectedModule.duration}
                          </span>
                          <span className="flex items-center gap-1 text-[#C0FF00] text-sm">
                            <Award className="w-4 h-4" />
                            +{selectedModule.points} pts
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedModule.title}</h2>
                        <p className="text-[#B8BCCF] mb-6">{selectedModule.description}</p>

                        {/* ── Notion-style notes ── */}
                        {selectedModule.notes && selectedModule.notes.length > 0 && (
                          <div className="mb-6 space-y-2">
                            <p className="text-xs font-semibold text-[#B8BCCF] uppercase tracking-widest mb-3">📝 Module Notes</p>
                            {selectedModule.notes.map((note, i) => {
                              const styles: Record<string, string> = {
                                key:     'bg-[#C0FF00]/10 border-l-4 border-[#C0FF00] text-[#d4ff66]',
                                warning: 'bg-[#FF4D4D]/10 border-l-4 border-[#FF4D4D] text-[#ff8080]',
                                tip:     'bg-[#00D084]/10 border-l-4 border-[#00D084] text-[#4dffb4]',
                                info:    'bg-[#4DA6FF]/10 border-l-4 border-[#4DA6FF] text-[#80c4ff]',
                                fact:    'bg-[#FFB800]/10 border-l-4 border-[#FFB800] text-[#ffd166]',
                              };
                              return (
                                <div key={i} className={`flex gap-3 px-4 py-3 rounded-r-lg ${styles[note.type]}`}>
                                  <span className="text-lg flex-shrink-0">{note.emoji}</span>
                                  <p className="text-sm leading-relaxed">{note.text}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {completedModules.includes(selectedModule.id) ? (
                          <div className="flex items-center gap-2 text-[#00D084] font-semibold bg-[#00D084]/10 p-4 rounded-lg border border-[#00D084]/30">
                            <Award className="w-5 h-5" />
                            Module Completed! +{selectedModule.points} points earned
                          </div>
                        ) : (
                          <button
                            onClick={handleStartQuiz}
                            className="px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all hover:scale-105 flex items-center gap-2"
                          >
                            Take Quiz to Complete
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Quiz: {selectedModule.title}</h2>
                        <button 
                          onClick={handleCloseQuiz}
                          className="text-[#B8BCCF] hover:text-white text-sm"
                        >
                          Close Quiz
                        </button>
                      </div>

                      {!quizCompleted ? (
                        <>
                          <div className="flex items-center gap-2 mb-6">
                            {selectedModule.quiz.map((_, idx) => (
                              <div 
                                key={idx}
                                className={`h-2 flex-1 rounded-full ${
                                  idx < currentQuestion ? (quizAnswers[idx] ? 'bg-[#00D084]' : 'bg-[#FF4D4D]') :
                                  idx === currentQuestion ? 'bg-[#C0FF00]' : 'bg-[#2E3A4F]'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="mb-6">
                            <p className="text-[#B8BCCF] text-sm mb-2">Question {currentQuestion + 1} of {selectedModule.quiz.length}</p>
                            <h3 className="text-lg font-semibold text-white">{selectedModule.quiz[currentQuestion].question}</h3>
                          </div>

                          <div className="space-y-3 mb-6">
                            {selectedModule.quiz[currentQuestion].options.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={showQuizResult}
                                className={`w-full p-4 rounded-lg border text-left transition-all ${
                                  showQuizResult
                                    ? idx === selectedModule.quiz[currentQuestion].correctIndex
                                      ? 'border-[#00D084] bg-[#00D084]/10'
                                      : idx === selectedAnswer
                                      ? 'border-[#FF4D4D] bg-[#FF4D4D]/10'
                                      : 'border-[#2E3A4F] bg-[#0D1B2A]/50'
                                    : selectedAnswer === idx
                                    ? 'border-[#C0FF00] bg-[#C0FF00]/10'
                                    : 'border-[#2E3A4F] bg-[#0D1B2A] hover:border-[#C0FF00]/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    showQuizResult
                                      ? idx === selectedModule.quiz[currentQuestion].correctIndex
                                        ? 'border-[#00D084] bg-[#00D084]'
                                        : idx === selectedAnswer
                                        ? 'border-[#FF4D4D] bg-[#FF4D4D]'
                                        : 'border-[#2E3A4F]'
                                      : selectedAnswer === idx
                                      ? 'border-[#C0FF00] bg-[#C0FF00]'
                                      : 'border-[#2E3A4F]'
                                  }`}>
                                    {showQuizResult && idx === selectedModule.quiz[currentQuestion].correctIndex && (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                    {showQuizResult && idx === selectedAnswer && idx !== selectedModule.quiz[currentQuestion].correctIndex && (
                                      <XCircle className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <span className={`text-sm ${
                                    showQuizResult
                                      ? idx === selectedModule.quiz[currentQuestion].correctIndex
                                        ? 'text-[#00D084]'
                                        : idx === selectedAnswer
                                        ? 'text-[#FF4D4D]'
                                        : 'text-[#B8BCCF]'
                                      : selectedAnswer === idx
                                      ? 'text-white'
                                      : 'text-[#B8BCCF]'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {!showQuizResult ? (
                            <button
                              onClick={handleSubmitAnswer}
                              disabled={selectedAnswer === null}
                              className="w-full px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit Answer
                            </button>
                          ) : (
                            <button
                              onClick={handleNextQuestion}
                              className="w-full px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all flex items-center justify-center gap-2"
                            >
                              {currentQuestion < selectedModule.quiz.length - 1 ? 'Next Question' : 'See Results'}
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                            quizPassed ? 'bg-[#00D084]/20' : 'bg-[#FF4D4D]/20'
                          }`}>
                            {quizPassed ? (
                              <CheckCircle className="w-10 h-10 text-[#00D084]" />
                            ) : (
                              <XCircle className="w-10 h-10 text-[#FF4D4D]" />
                            )}
                          </div>
                          <h3 className={`text-2xl font-bold mb-2 ${quizPassed ? 'text-[#00D084]' : 'text-[#FF4D4D]'}`}>
                            {quizPassed ? 'Quiz Passed!' : 'Quiz Not Passed'}
                          </h3>
                          <p className="text-[#B8BCCF] mb-4">
                            You got {correctAnswersCount} out of {selectedModule.quiz.length} questions correct
                          </p>
                          {quizPassed ? (
                            <div className="flex items-center justify-center gap-2 text-[#C0FF00] font-bold mb-6">
                              <Award className="w-5 h-5" />
                              +{selectedModule.points} points earned!
                            </div>
                          ) : (
                            <p className="text-[#B8BCCF] text-sm mb-6">
                              You need at least 2 correct answers to pass. Watch the video again and retry!
                            </p>
                          )}
                          <button
                            onClick={handleCloseQuiz}
                            className="px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
                          >
                            {quizPassed ? 'Continue Learning' : 'Try Again'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">All Modules</h3>
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => {
                      setSelectedModule(module);
                      handleCloseQuiz();
                      setTimeout(() => {
                        statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 50);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedModule?.id === module.id
                        ? "bg-[#1A2332] border-[#C0FF00]"
                        : completedModules.includes(module.id)
                        ? "bg-[#1A2332]/50 border-[#00D084]/50"
                        : "bg-[#1A2332]/50 border-[#2E3A4F] hover:border-[#C0FF00]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {completedModules.includes(module.id) ? (
                            <CheckCircle className="w-4 h-4 text-[#00D084]" />
                          ) : (
                            <Play className="w-4 h-4 text-[#C0FF00]" />
                          )}
                          <span className={`text-xs font-medium ${getLevelColor(module.level).split(' ')[0]}`}>
                            {module.level}
                          </span>
                          {completedModules.includes(module.id) && (
                            <span className="text-xs font-medium text-[#00D084] bg-[#00D084]/10 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-medium text-sm mb-1">{module.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-[#B8BCCF]">
                          <span>{module.duration}</span>
                          <span>+{module.points} pts</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#B8BCCF]" />
                    </div>
                  </button>
                ))}
              
              <div className="mt-6 p-4 bg-[#1A2332] rounded-xl border border-[#2E3A4F]">
                <h4 className="text-white font-semibold mb-2">Your Progress</h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#B8BCCF]">Modules completed</span>
                  <span className="text-[#C0FF00] font-bold">{completedModules.length}/{modules.length}</span>
                </div>
                <div className="h-2 bg-[#0D1B2A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#C0FF00] rounded-full transition-all"
                    style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1A2332] rounded-xl border border-[#2E3A4F]">
                <h4 className="text-white font-semibold mb-3">Continue Learning</h4>
                <div className="space-y-2">
                  <Link href="/simulations" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                    <span className="text-[#B8BCCF] text-sm">Practice Simulations</span>
                    <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                  </Link>
                  <Link href="/daily-challenge" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                    <span className="text-[#B8BCCF] text-sm">Daily Challenge</span>
                    <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                  </Link>
                  <Link href="/discussions" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                    <span className="text-[#B8BCCF] text-sm">Join Discussions</span>
                    <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
