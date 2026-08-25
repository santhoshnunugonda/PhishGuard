'use client';

import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { 
  Search, 
  Upload, 
  Globe, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  FileSearch,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type ScanResult = {
  status: 'safe' | 'threat' | 'warning';
  malwareType?: string | null;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence?: number;
  identification: string[];
  tips: string[];
  details: string;
  technicalAnalysis?: {
    domainAnalysis: string;
    urlStructure: string;
    socialEngineering: string;
  };
};

const MALWARE_DATABASE: Record<string, ScanResult> = {
  'ransomware': {
    status: 'threat',
    malwareType: 'Ransomware',
    threatLevel: 'Critical',
    identification: [
      'Encrypted files with unusual extensions (e.g., .locked, .crypto)',
      'A demand for payment (usually in cryptocurrency) displayed on screen',
      'Sudden loss of access to important documents or systems',
      'CPU usage spike as files are being encrypted'
    ],
    tips: [
      'Maintain regular offline backups of your data',
      'Keep all software and operating systems updated',
      'Never click on suspicious links or download unsolicited attachments',
      'Disable RDP (Remote Desktop Protocol) if not strictly necessary'
    ],
    details: 'Ransomware is designed to lock you out of your system and files until a ransom is paid. Modern variants can also steal data before encrypting it (double extortion).'
  },
  'spyware': {
    status: 'threat',
    malwareType: 'Spyware / Info-Stealer',
    threatLevel: 'High',
    identification: [
      'Unexplained slowdowns or system instability',
      'Browser homepages or search engines changing without permission',
      'Unexpected pop-up ads appearing even when offline',
      'Webcam light turning on unexpectedly'
    ],
    tips: [
      'Use a reputable anti-malware solution with real-time protection',
      'Avoid "free" software downloads from unofficial sources',
      'Be wary of browser extensions requesting excessive permissions',
      'Enable Multi-Factor Authentication (MFA) on all accounts'
    ],
    details: 'Spyware secretly monitors your activity, captures keystrokes (keyloggers), and steals login credentials or financial information.'
  },
  'trojan': {
    status: 'threat',
    malwareType: 'Trojan Horse',
    threatLevel: 'High',
    identification: [
      'Settings being changed automatically',
      'Strange activity on your social media or email accounts',
      'Programs opening or closing on their own',
      'Antivirus software being disabled mysteriously'
    ],
    tips: [
      'Only download software from official, verified sources',
      'Do not open attachments from unknown senders',
      'Use a firewall to monitor outgoing network traffic',
      'Verify the file extension (e.g., avoid .exe files masquerading as .pdf)'
    ],
    details: 'Trojans disguise themselves as legitimate software to trick users into installing them, then provide backdoors for attackers.'
  },
  'phishing_url': {
    status: 'threat',
    malwareType: 'Phishing / Credential Harvesting',
    threatLevel: 'High',
    identification: [
      'Misspelled domain names (e.g., faceb00k.com instead of facebook.com)',
      'Sense of extreme urgency or threats in the page content',
      'HTTP instead of HTTPS (though many phishing sites now use SSL)',
      'Input fields asking for sensitive info on unexpected pages'
    ],
    tips: [
      'Always check the actual URL in the address bar',
      'Hover over links before clicking to see the destination',
      'Use a browser that provides built-in phishing protection',
      'Navigate directly to websites via bookmarks instead of links'
    ],
    details: 'Phishing URLs lead to deceptive websites designed to trick you into entering passwords, credit card numbers, or other sensitive data.'
  }
};

const SAFE_RESULT: ScanResult = {
  status: 'safe',
  threatLevel: 'Low',
  identification: [],
  tips: [
    'Continue practicing good digital hygiene',
    'Verify any unexpected communication through a separate channel',
    'Keep your software up to date'
  ],
  details: 'No known threats were detected. However, always remain vigilant as new threats emerge daily.'
};

export default function ScanPage() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanType, setScanType] = useState<'url' | 'file'>('url');
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const performAIScan = async (input: string, type: 'url' | 'file') => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, type }),
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      const data = await response.json();
      setScanResult(data.analysis);
    } catch {
      setScanError('Failed to analyze. Please try again.');
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUrlScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    performAIScan(url, 'url');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      performAIScan(file.name, 'file');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <HeaderNavigation />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="bg-[#C0FF00]/10 text-[#C0FF00] border-[#C0FF00]/20 mb-4 px-3 py-1">
            Threat Intelligence
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Threat Scanner</h1>
          <p className="text-[#B8BCCF] text-lg max-w-2xl mx-auto">
            Instantly analyze URLs and files for potential malware, phishing, and other cyber threats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Card className="bg-[#1A2332] border-[#2E3A4F] text-white overflow-hidden">
              <CardHeader className="border-b border-[#2E3A4F] bg-[#1A2332]">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="size-5 text-[#C0FF00]" />
                  Scan Analyzer
                </CardTitle>
                <CardDescription className="text-[#B8BCCF]">
                    AI-powered phishing detection for URLs and files.
                  </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="url" className="w-full" onValueChange={(v) => setScanType(v as 'url' | 'file')}>
                  <TabsList className="grid w-full grid-cols-2 bg-[#0D1B2A] border border-[#2E3A4F] p-1">
                    <TabsTrigger 
                      value="url" 
                      className="data-[state=active]:bg-[#2E3A4F] data-[state=active]:text-[#C0FF00]"
                    >
                      <Globe className="size-4 mr-2" />
                      URL Scanner
                    </TabsTrigger>
                    <TabsTrigger 
                      value="file"
                      className="data-[state=active]:bg-[#2E3A4F] data-[state=active]:text-[#C0FF00]"
                    >
                      <Upload className="size-4 mr-2" />
                      File Scanner
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="mt-6">
                    <form onSubmit={handleUrlScan} className="space-y-4">
                      <div className="relative">
                        <Input 
                          placeholder="https://example.com/login" 
                          className="bg-[#0D1B2A] border-[#2E3A4F] text-white focus-visible:ring-[#C0FF00]"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isScanning || !url}
                        className="w-full bg-[#C0FF00] text-[#0D1B2A] font-bold hover:brightness-110"
                      >
                        {isScanning ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Analyzing URL...
                          </>
                        ) : (
                          'Scan URL for Threats'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                    <TabsContent value="file" className="mt-6">
                      <div 
                        className="border-2 border-dashed border-[#2E3A4F] rounded-xl p-10 text-center hover:border-[#C0FF00]/50 transition-colors bg-[#0D1B2A]/50 group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            setFileName(file.name);
                            performAIScan(file.name, 'file');
                          }
                        }}
                      >
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <div className="w-16 h-16 bg-[#C0FF00]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="size-8 text-[#C0FF00]" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {fileName || 'Drop your file here'}
                        </h3>
                        <p className="text-[#B8BCCF] text-sm">
                          or click to browse from your computer
                        </p>
                      </label>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-[#0D1B2A]/50 py-4 border-t border-[#2E3A4F]">
                <div className="flex items-center gap-2 text-xs text-[#B8BCCF]">
                  <Info className="size-4" />
                  AI analyzes URLs and file names for phishing indicators. No files are uploaded to servers.
                </div>
              </CardFooter>
            </Card>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1A2332] p-4 rounded-xl border border-[#2E3A4F] flex flex-col items-center text-center">
                  <ShieldCheck className="size-8 text-[#C0FF00] mb-2" />
                  <h4 className="font-semibold text-sm">AI-Powered Analysis</h4>
                  <p className="text-[10px] text-[#B8BCCF]">Advanced threat detection using AI</p>
                </div>
                <div className="bg-[#1A2332] p-4 rounded-xl border border-[#2E3A4F] flex flex-col items-center text-center">
                  <FileSearch className="size-8 text-[#C0FF00] mb-2" />
                  <h4 className="font-semibold text-sm">Phishing Detection</h4>
                  <p className="text-[10px] text-[#B8BCCF]">Identifies deceptive URLs & content</p>
                </div>
                <div className="bg-[#1A2332] p-4 rounded-xl border border-[#2E3A4F] flex flex-col items-center text-center">
                  <Globe className="size-8 text-[#C0FF00] mb-2" />
                  <h4 className="font-semibold text-sm">Real-time Scanning</h4>
                  <p className="text-[10px] text-[#B8BCCF]">Instant threat assessment</p>
                </div>
              </div>
          </div>

          <div className="lg:col-span-5">
            {isScanning ? (
              <Card className="bg-[#1A2332] border-[#2E3A4F] h-full flex flex-col items-center justify-center p-12 text-center animate-pulse">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#C0FF00] blur-2xl opacity-20 animate-pulse"></div>
                  <Loader2 className="size-20 text-[#C0FF00] animate-spin relative" />
                </div>
                <h3 className="text-xl font-bold mt-8 mb-2">AI Analyzing {scanType === 'url' ? 'URL' : 'File'}...</h3>
                <p className="text-[#B8BCCF]">Checking for phishing indicators and malicious patterns</p>
                <div className="w-full bg-[#0D1B2A] h-2 rounded-full mt-8 overflow-hidden">
                  <div className="bg-[#C0FF00] h-full animate-progress-fast"></div>
                </div>
              </Card>
            ) : scanResult ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <Card className={cn(
                  "border-2 overflow-hidden",
                  scanResult.status === 'safe' ? "border-[#00FF88] bg-[#00FF88]/5" : "border-[#FF4D4D] bg-[#FF4D4D]/5"
                )}>
                  <CardHeader className={cn(
                    "pb-2",
                    scanResult.status === 'safe' ? "text-[#00FF88]" : "text-[#FF4D4D]"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {scanResult.status === 'safe' ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
                        <CardTitle className="text-2xl">
                          {scanResult.status === 'safe' ? 'System Clear' : 'Threat Detected!'}
                        </CardTitle>
                      </div>
                      <Badge variant={scanResult.status === 'safe' ? "outline" : "destructive"} className="uppercase tracking-widest">
                        {scanResult.threatLevel} Risk
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scanResult.malwareType && (
                      <div>
                        <span className="text-xs text-[#B8BCCF] uppercase tracking-wider font-bold">Category</span>
                        <div className="text-xl font-bold text-white">{scanResult.malwareType}</div>
                      </div>
                    )}
                    <p className="text-sm text-[#B8BCCF] leading-relaxed">
                      {scanResult.details}
                    </p>
                  </CardContent>
                </Card>

                {scanResult.identification.length > 0 && (
                  <Card className="bg-[#1A2332] border-[#2E3A4F] text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldAlert className="size-5 text-[#FF4D4D]" />
                        How to Identify
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {scanResult.identification.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-[#B8BCCF]">
                            <div className="size-1.5 rounded-full bg-[#FF4D4D] mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-[#1A2332] border-[#2E3A4F] text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="size-5 text-[#C0FF00]" />
                      Tips to Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {scanResult.tips.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-[#B8BCCF]">
                          <CheckCircle2 className="size-4 text-[#C0FF00] mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Button 
                  variant="outline" 
                  className="w-full border-[#2E3A4F] text-[#B8BCCF] hover:text-white"
                  onClick={() => {
                    setScanResult(null);
                    setUrl('');
                    setFileName(null);
                  }}
                >
                  Clear Results and Scan Again
                </Button>
              </div>
              ) : scanError ? (
                <Card className="bg-[#1A2332] border-[#FF4D4D] h-full flex flex-col items-center justify-center p-12 text-center">
                  <XCircle className="size-16 text-[#FF4D4D] mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
                  <p className="text-[#B8BCCF] mb-4">{scanError}</p>
                  <Button 
                    variant="outline" 
                    className="border-[#2E3A4F] text-[#B8BCCF] hover:text-white"
                    onClick={() => {
                      setScanError(null);
                      setUrl('');
                      setFileName(null);
                    }}
                  >
                    Try Again
                  </Button>
                </Card>
              ) : (
                <Card className="bg-[#1A2332] border-[#2E3A4F] h-full flex flex-col items-center justify-center p-12 text-center text-[#B8BCCF] border-dashed">
                  <ShieldAlert className="size-16 opacity-20 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">AI-Powered Analysis</h3>
                  <p>Input a URL or upload a file to begin threat detection powered by AI.</p>
                  <div className="mt-8 flex flex-col gap-2 w-full text-left">
                    <span className="text-[10px] uppercase tracking-wider font-bold">Example URLs to test:</span>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:border-[#C0FF00]" onClick={() => { setUrl('https://secure-paypal-login.suspicious-site.com'); performAIScan('https://secure-paypal-login.suspicious-site.com', 'url'); }}>paypal-phishing.com</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:border-[#C0FF00]" onClick={() => { setUrl('https://google.com'); performAIScan('https://google.com', 'url'); }}>google.com (safe)</Badge>
                    </div>
                  </div>
                </Card>
              )}
          </div>
        </div>

        <div className="mt-20">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2E3A4F]" />
            <h2 className="text-2xl font-bold">Educational Resources</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2E3A4F]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Phishing 101', icon: <Mail />, desc: 'Master the art of spotting deceptive emails.' },
              { title: 'Network Security', icon: <Globe />, desc: 'Learn how to secure your home and office WiFi.' },
              { title: 'Zero Trust', icon: <ShieldCheck />, desc: 'Understanding the principle of "Never Trust, Always Verify".' },
              { title: 'Data Privacy', icon: <Info />, desc: 'Protect your personal information from data brokers.' }
            ].map((resource, i) => (
              <div key={i} className="bg-[#1A2332] p-6 rounded-2xl border border-[#2E3A4F] hover:border-[#C0FF00]/50 transition-all group cursor-pointer">
                <div className="size-12 bg-[#0D1B2A] rounded-xl flex items-center justify-center mb-4 text-[#C0FF00] group-hover:scale-110 transition-transform">
                  {resource.icon}
                </div>
                <h3 className="font-bold mb-2 group-hover:text-[#C0FF00] transition-colors">{resource.title}</h3>
                <p className="text-sm text-[#B8BCCF] mb-4">{resource.desc}</p>
                <div className="flex items-center text-xs font-bold text-[#C0FF00]">
                  LEARN MORE <ArrowRight className="size-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
