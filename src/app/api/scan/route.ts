import { NextRequest, NextResponse } from 'next/server';

// ──────────────────────────────────────────────────────────────
// Trusted domains that are always considered safe
// ──────────────────────────────────────────────────────────────
const TRUSTED_DOMAINS = new Set([
  'google.com', 'youtube.com', 'gmail.com', 'googleapis.com',
  'microsoft.com', 'office.com', 'outlook.com', 'live.com', 'hotmail.com',
  'apple.com', 'icloud.com',
  'amazon.com', 'aws.amazon.com',
  'facebook.com', 'instagram.com', 'whatsapp.com', 'messenger.com',
  'twitter.com', 'x.com', 'linkedin.com', 'reddit.com',
  'github.com', 'stackoverflow.com', 'wikipedia.org',
  'paypal.com', 'stripe.com', 'shopify.com',
  'netflix.com', 'spotify.com', 'twitch.tv',
  'cloudflare.com', 'vercel.app', 'netlify.app',
  'supabase.com', 'supabase.io',
  'gov.in', 'gov.uk', 'gov.us', 'nic.in',
  'edu', 'ac.in', 'ac.uk',
]);

// ──────────────────────────────────────────────────────────────
// Brands commonly impersonated in phishing attacks
// ──────────────────────────────────────────────────────────────
const IMPERSONATED_BRANDS = [
  'paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix',
  'facebook', 'instagram', 'whatsapp', 'linkedin', 'twitter',
  'bank', 'chase', 'wellsfargo', 'citibank', 'barclays', 'hsbc',
  'fedex', 'ups', 'dhl', 'usps', 'irs', 'gov', 'support', 'helpdesk',
  'verify', 'secure', 'login', 'signin', 'account', 'update',
];

// Suspicious TLDs frequently used in phishing
const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq', '.pw', '.cc', '.top',
  '.xyz', '.work', '.click', '.link', '.live', '.online',
  '.site', '.website', '.club', '.info', '.biz', '.ws',
  '.loan', '.win', '.download', '.racing', '.trade', '.icu',
]);

// URL shorteners that hide real destination
const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
  'buff.ly', 'rebrand.ly', 'short.io', 'cutt.ly', 'rb.gy',
  'is.gd', 'v.gd', 'tiny.cc', 'qr.net',
]);

// Malware-related file extensions
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.msi', '.vbs', '.js', '.jar', '.scr',
  '.pif', '.com', '.ps1', '.sh', '.dmg', '.pkg',
]);

function extractDomain(url: string): string {
  try {
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;
    const parsed = new URL(normalized);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return url.toLowerCase();
  }
}

function analyzeURL(input: string): object {
  const url = input.trim();
  const lowerURL = url.toLowerCase();
  const redFlags: string[] = [];
  const tips: string[] = [];
  let score = 0; // higher = more dangerous

  let domain = '';
  let hostname = '';
  let pathname = '';
  let protocol = '';

  try {
    let normalized = url;
    if (!/^https?:\/\//i.test(url)) normalized = 'https://' + url;
    const parsed = new URL(normalized);
    domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
    hostname = parsed.hostname.toLowerCase();
    pathname = parsed.pathname.toLowerCase();
    protocol = parsed.protocol;
  } catch {
    redFlags.push('Invalid URL format — cannot be parsed');
    score += 30;
  }

  // ── 1. Trusted domain check ──────────────────────────────
  const rootDomain = domain.split('.').slice(-2).join('.');
  if (TRUSTED_DOMAINS.has(domain) || TRUSTED_DOMAINS.has(rootDomain)) {
    return {
      status: 'safe',
      threatLevel: 'Low',
      malwareType: null,
      confidence: 95,
      details: `${domain} is a well-known, trusted domain with a strong reputation for security.`,
      identification: [],
      tips: [
        'Always verify you are on the official website before logging in',
        'Check for HTTPS padlock in your browser',
        'Bookmark important sites to avoid typosquatting',
      ],
      technicalAnalysis: {
        domainAnalysis: `Verified trusted domain: ${domain}`,
        urlStructure: 'Clean URL structure with no suspicious elements',
        socialEngineering: 'No social engineering indicators detected',
      },
    };
  }

  // ── 2. URL Shortener ─────────────────────────────────────
  if (URL_SHORTENERS.has(domain)) {
    score += 35;
    redFlags.push('URL shortener hides the real destination — high risk');
    tips.push('Use a URL expander (e.g. checkshorturl.com) before visiting');
  }

  // ── 3. Protocol check ────────────────────────────────────
  if (protocol === 'http:') {
    score += 15;
    redFlags.push('Uses HTTP (not HTTPS) — connection is unencrypted');
    tips.push('Never enter credentials on HTTP sites');
  }

  // ── 4. IP address instead of domain ──────────────────────
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    score += 40;
    redFlags.push('Uses raw IP address instead of domain name — highly suspicious');
    tips.push('Legitimate sites always use domain names, not raw IP addresses');
  }

  // ── 5. Suspicious TLD ────────────────────────────────────
  const tldMatch = domain.match(/\.[a-z]{2,}$/);
  if (tldMatch && SUSPICIOUS_TLDS.has(tldMatch[0])) {
    score += 25;
    redFlags.push(`Suspicious top-level domain "${tldMatch[0]}" — frequently used in phishing`);
  }

  // ── 6. Excessive subdomains ──────────────────────────────
  const subdomainParts = hostname.split('.');
  if (subdomainParts.length > 4) {
    score += 20;
    redFlags.push(`Excessive subdomains (${subdomainParts.length} levels) — common phishing trick`);
    tips.push('Verify the actual root domain (last 2 parts) carefully');
  }

  // ── 7. Brand impersonation in domain ─────────────────────
  const impersonated = IMPERSONATED_BRANDS.filter(brand =>
    domain.includes(brand) && !TRUSTED_DOMAINS.has(domain)
  );
  if (impersonated.length > 0) {
    score += 35;
    redFlags.push(`Domain impersonates "${impersonated[0]}" — classic phishing technique`);
    tips.push(`Verify the official ${impersonated[0]} domain before proceeding`);
  }

  // ── 8. Homograph / digit substitution ────────────────────
  const homographPatterns = [
    { pattern: /paypa[l1]|pay-pal/i, brand: 'PayPal' },
    { pattern: /g[o0]{2}gle|g00gle/i, brand: 'Google' },
    { pattern: /m[i1]crosoft|micros0ft/i, brand: 'Microsoft' },
    { pattern: /app[l1]e|appl3/i, brand: 'Apple' },
    { pattern: /amaz[o0]n|amaz0n/i, brand: 'Amazon' },
    { pattern: /faceb[o0]{2}k|facebo0k/i, brand: 'Facebook' },
    { pattern: /netfl[i1]x|netf1ix/i, brand: 'Netflix' },
  ];
  for (const { pattern, brand } of homographPatterns) {
    if (pattern.test(domain)) {
      score += 50;
      redFlags.push(`Typosquatting detected: mimics ${brand} using character substitution`);
      tips.push(`The real ${brand} URL is different — do not enter credentials`);
      break;
    }
  }

  // ── 9. Suspicious keywords in path ───────────────────────
  const suspiciousKeywords = [
    'verify', 'validation', 'confirm', 'update', 'secure', 'login',
    'signin', 'account', 'password', 'credential', 'banking',
    'suspended', 'locked', 'urgent', 'click-here', 'free',
    'winner', 'prize', 'reward', 'limited-offer',
  ];
  const foundKeywords = suspiciousKeywords.filter(kw => lowerURL.includes(kw));
  if (foundKeywords.length >= 2) {
    score += 20;
    redFlags.push(`Multiple phishing keywords in URL: ${foundKeywords.slice(0, 3).join(', ')}`);
    tips.push('Phishing URLs often contain urgency and action words to manipulate you');
  }

  // ── 10. URL encoding tricks ───────────────────────────────
  if (/%[0-9a-fA-F]{2}/.test(url) && (url.match(/%/g) || []).length > 3) {
    score += 20;
    redFlags.push('Heavy URL encoding detected — often used to hide malicious content');
  }

  // ── 11. Long URL ──────────────────────────────────────────
  if (url.length > 100) {
    score += 10;
    redFlags.push('Unusually long URL — can be used to hide the real destination');
  }

  // ── 12. Dangerous file extension ─────────────────────────
  const extMatch = pathname.match(/\.[a-z0-9]+$/i);
  if (extMatch && DANGEROUS_EXTENSIONS.has(extMatch[0].toLowerCase())) {
    score += 45;
    redFlags.push(`URL points to a potentially dangerous file type: ${extMatch[0]}`);
    tips.push('Never download executable files from untrusted sources');
  }

  // ── 13. Multiple redirects in URL ────────────────────────
  if ((lowerURL.match(/https?:\/\//g) || []).length > 1) {
    score += 30;
    redFlags.push('URL contains embedded redirect — used to bypass security filters');
  }

  // ── Determine status ──────────────────────────────────────
  let status: string, threatLevel: string, malwareType: string | null, confidence: number;

  if (score === 0 && redFlags.length === 0) {
    status = 'safe'; threatLevel = 'Low'; malwareType = null; confidence = 82;
  } else if (score < 20) {
    status = 'safe'; threatLevel = 'Low'; malwareType = null; confidence = 70;
  } else if (score < 40) {
    status = 'warning'; threatLevel = 'Medium'; malwareType = 'Suspicious Link'; confidence = Math.min(60 + score, 88);
  } else if (score < 65) {
    status = 'threat'; threatLevel = 'High'; malwareType = 'Phishing Attempt'; confidence = Math.min(70 + score, 93);
  } else {
    status = 'threat'; threatLevel = 'Critical'; malwareType = 'Active Phishing / Credential Harvesting'; confidence = Math.min(80 + score, 98);
  }

  // Default tips if none added
  if (tips.length === 0) {
    tips.push('Always verify website addresses before entering personal data');
    tips.push('Look for HTTPS and padlock icon in browser');
    tips.push('When in doubt, navigate directly to the official site');
  }

  const details = status === 'safe'
    ? redFlags.length === 0
      ? `No phishing indicators found. The URL appears legitimate.`
      : `Minor concerns noted but no strong phishing indicators detected.`
    : status === 'warning'
    ? `This URL has suspicious characteristics. Proceed with caution and do not enter credentials.`
    : `This URL shows strong signs of a phishing attack. Do NOT visit this page or enter any personal information.`;

  return {
    status,
    threatLevel,
    malwareType,
    confidence,
    details,
    identification: redFlags.length > 0 ? redFlags : ['No specific red flags detected'],
    tips,
    technicalAnalysis: {
      domainAnalysis: domain ? `Domain: ${domain} — ${impersonated.length > 0 ? `Impersonates ${impersonated[0]}` : 'No brand impersonation detected'}` : 'Could not extract domain',
      urlStructure: `Length: ${url.length} chars | Protocol: ${protocol || 'unknown'} | Subdomains: ${hostname.split('.').length - 2}`,
      socialEngineering: foundKeywords.length > 0 ? `Social engineering keywords found: ${foundKeywords.join(', ')}` : 'No social engineering language detected',
    },
  };
}

function analyzeFile(input: string): object {
  const lowerInput = input.toLowerCase();
  const redFlags: string[] = [];
  const tips: string[] = [];
  let score = 0;

  // Check for dangerous extensions
  const extMatch = input.match(/\.[a-z0-9]+$/i);
  if (extMatch && DANGEROUS_EXTENSIONS.has(extMatch[0].toLowerCase())) {
    score += 50;
    redFlags.push(`Dangerous file type: ${extMatch[0]} — can execute malicious code`);
    tips.push('Never open executable files from email attachments or unknown sources');
  }

  // Check for double extensions (e.g., invoice.pdf.exe)
  if (/\.[a-z]{2,4}\.[a-z]{2,4}$/i.test(input)) {
    score += 40;
    redFlags.push('Double file extension detected (e.g., .pdf.exe) — classic malware disguise');
  }

  // Suspicious filename keywords
  const suspiciousFilenames = ['invoice', 'receipt', 'payment', 'order', 'urgent', 'verify', 'password', 'credential', 'bank', 'tax', 'refund', 'prize', 'winner'];
  const foundTerms = suspiciousFilenames.filter(term => lowerInput.includes(term));
  if (foundTerms.length > 0) {
    score += 20;
    redFlags.push(`Suspicious filename terms: ${foundTerms.join(', ')} — often used in phishing attachments`);
  }

  const status = score >= 50 ? 'threat' : score >= 20 ? 'warning' : 'safe';
  const threatLevel = score >= 50 ? 'High' : score >= 20 ? 'Medium' : 'Low';

  if (tips.length === 0) {
    tips.push('Scan files with antivirus before opening');
    tips.push('Be suspicious of unexpected email attachments');
  }

  return {
    status,
    threatLevel,
    malwareType: status === 'threat' ? 'Potential Malware' : null,
    confidence: score >= 50 ? 88 : score >= 20 ? 65 : 75,
    details: status === 'safe' ? 'No obvious malware indicators in filename.' : 'This file shows characteristics of a malicious attachment.',
    identification: redFlags.length > 0 ? redFlags : ['No specific red flags detected'],
    tips,
    technicalAnalysis: {
      domainAnalysis: 'File scan — no domain analysis applicable',
      urlStructure: `File: ${input} | Extension: ${extMatch?.[0] || 'none'}`,
      socialEngineering: foundTerms.length > 0 ? `Social engineering terms in filename: ${foundTerms.join(', ')}` : 'None detected',
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const { input, type } = await request.json();

    if (!input || input.trim() === '') {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const analysis = type === 'file' ? analyzeFile(input) : analyzeURL(input);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Scan API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze input. Please try again.' },
      { status: 500 }
    );
  }
}

