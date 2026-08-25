'use client';

import { useState, useRef, useEffect } from 'react';
import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { Send, Bot, User, Loader2, Sparkles, Shield, AlertTriangle, Link2, Copy, Check, Target, Zap, ShieldCheck } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Example } from "@/components/ui/ai-actions";
import { createClient } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Profile {
  full_name: string;
  level: number;
  level_name: string;
  total_points: number;
  risk_score: number;
}

const SUGGESTED_PROMPTS = [
  { icon: AlertTriangle, text: "How do I identify a phishing email?" },
  { icon: Link2, text: "Is this URL safe? https://amaz0n-secure.com/login" },
  { icon: Shield, text: "What are the signs of a scam text message?" },
  { icon: Sparkles, text: "Best practices for password security" },
];

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return <p className="text-sm">{content}</p>;
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute -left-10 top-0 p-1.5 rounded-lg bg-[#2E3A4F] opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy message"
      >
        {copied ? <Check className="w-4 h-4 text-[#00D084]" /> : <Copy className="w-4 h-4 text-[#B8BCCF]" />}
      </button>
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-white prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
          prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
          prose-p:text-[#E5E7EB] prose-p:my-2 prose-p:leading-relaxed
          prose-strong:text-[#C0FF00] prose-strong:font-semibold
          prose-ul:my-2 prose-ul:space-y-1
          prose-ol:my-2 prose-ol:space-y-1
          prose-li:text-[#E5E7EB] prose-li:my-0.5
          prose-code:bg-[#2E3A4F] prose-code:text-[#C0FF00] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
          prose-pre:bg-[#0D1B2A] prose-pre:border prose-pre:border-[#2E3A4F] prose-pre:rounded-lg
          prose-a:text-[#C0FF00] prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-[#C0FF00] prose-blockquote:text-[#B8BCCF]
          prose-table:border prose-table:border-[#2E3A4F] prose-table:rounded-lg prose-table:overflow-hidden
          prose-th:bg-[#1A2332] prose-th:text-white prose-th:px-4 prose-th:py-2 prose-th:text-left
          prose-td:border-t prose-td:border-[#2E3A4F] prose-td:px-4 prose-td:py-2 prose-td:text-[#E5E7EB]
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, level, level_name, total_points, risk_score')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col">
      <HeaderNavigation />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#C0FF00]/20 to-[#00D084]/20 rounded-2xl mb-4">
              <Bot className="w-8 h-8 text-[#C0FF00]" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              {profile ? `Hello, ${profile.full_name.split(' ')[0]}!` : 'AI Assistant'}
            </h1>
            <p className="text-[#B8BCCF]">Your intelligent cybersecurity companion. I'm ready to help you stay safe online.</p>
            
            {profile && (
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2332] border border-[#2E3A4F] rounded-full">
                  <Target className="w-4 h-4 text-[#C0FF00]" />
                  <span className="text-xs font-medium text-white">Level {profile.level}: {profile.level_name}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2332] border border-[#2E3A4F] rounded-full">
                  <Zap className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-xs font-medium text-white">{profile.total_points} Points</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A2332] border border-[#2E3A4F] rounded-full">
                  <ShieldCheck className="w-4 h-4 text-[#00D084]" />
                  <span className="text-xs font-medium text-white">Risk Score: {profile.risk_score}/100</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] overflow-hidden shadow-xl">
              <div className="h-[600px] overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8">
                    <Example />
                    
                    <div className="w-full max-w-2xl">
                      <div className="text-center mb-6">
                        <p className="text-[#B8BCCF] text-sm font-medium uppercase tracking-wider">Suggested Topics</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SUGGESTED_PROMPTS.map((prompt, idx) => {
                          const Icon = prompt.icon;
                          return (
                            <button
                              key={idx}
                              onClick={() => sendMessage(prompt.text)}
                              className="flex items-center gap-3 p-4 bg-[#0D1B2A] border border-[#2E3A4F] rounded-xl text-left hover:border-[#C0FF00]/50 transition-all group"
                            >
                              <Icon className="w-5 h-5 text-[#C0FF00] flex-shrink-0" />
                              <span className="text-sm text-[#B8BCCF] group-hover:text-white transition-colors">{prompt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

              ) : (
                <>
                  {messages.map((message, idx) => (
                    <div key={idx} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C0FF00]/20 to-[#00D084]/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-[#C0FF00]" />
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user' 
                          ? 'bg-[#C0FF00] text-[#0D1B2A] max-w-[80%]' 
                          : 'bg-[#0D1B2A] border border-[#2E3A4F] text-white max-w-[85%]'
                      }`}>
                        <MessageContent content={message.content} isUser={message.role === 'user'} />
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-[#2E3A4F] flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-[#B8BCCF]" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C0FF00]/20 to-[#00D084]/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-[#C0FF00]" />
                      </div>
                      <div className="bg-[#0D1B2A] border border-[#2E3A4F] rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-[#C0FF00] animate-spin" />
                          <span className="text-sm text-[#B8BCCF]">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-[#2E3A4F]">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about phishing, security threats, or paste a suspicious link..."
                  className="flex-1 px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-xl text-white placeholder-[#6B7280] focus:outline-none focus:border-[#C0FF00] transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-5 py-3 bg-[#C0FF00] text-[#0D1B2A] rounded-xl font-semibold hover:bg-[#b0e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-[#6B7280] text-sm mt-4">
            PhishGuard AI provides educational information. For critical security concerns, consult a cybersecurity professional.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
