'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Newspaper, Clock, ExternalLink, AlertTriangle, Shield, Bug, Lock, Globe, Loader2, RefreshCw, Search, Filter, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  image_url: string | null;
  published_at: string;
};

const categories = [
  { id: 'all', label: 'All News', icon: Globe },
  { id: 'phishing', label: 'Phishing', icon: AlertTriangle },
  { id: 'malware', label: 'Malware', icon: Bug },
  { id: 'ransomware', label: 'Ransomware', icon: Lock },
  { id: 'data-breach', label: 'Data Breaches', icon: Shield },
  { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Zap },
];

const latestNews: NewsItem[] = [
  {
    id: '1',
    title: 'New AI-Powered Phishing Attacks Target Corporate Executives',
    summary: 'Security researchers have identified a sophisticated phishing campaign using AI-generated content to impersonate executives and board members. The attacks have increased 400% in Q4 2025.',
    source_url: 'https://example.com/news/1',
    source_name: 'CyberSecurity Today',
    category: 'phishing',
    image_url: null,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Critical Vulnerability Found in Popular Email Clients',
    summary: 'A zero-day vulnerability affecting multiple email clients could allow attackers to execute arbitrary code. Users are advised to update immediately.',
    source_url: 'https://example.com/news/2',
    source_name: 'Security Week',
    category: 'vulnerabilities',
    image_url: null,
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Major Healthcare Provider Hit by Ransomware Attack',
    summary: 'A large healthcare network reports a significant ransomware incident affecting patient data and operations across 50 facilities.',
    source_url: 'https://example.com/news/3',
    source_name: 'Health IT Security',
    category: 'ransomware',
    image_url: null,
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'QR Code Phishing Scams Rise During Holiday Season',
    summary: 'Security experts warn of a 300% increase in QR code phishing attacks targeting shoppers and travelers during the holiday season.',
    source_url: 'https://example.com/news/4',
    source_name: 'Phishing Defense',
    category: 'phishing',
    image_url: null,
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'New Banking Trojan Spreads via SMS Messages',
    summary: 'A newly discovered banking trojan is spreading through SMS messages disguised as package delivery notifications, targeting mobile banking apps.',
    source_url: 'https://example.com/news/5',
    source_name: 'Malware Research',
    category: 'malware',
    image_url: null,
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Fortune 500 Company Discloses Massive Data Breach',
    summary: 'A major corporation has disclosed a data breach affecting 50 million customers. Personal and financial information may have been compromised.',
    source_url: 'https://example.com/news/6',
    source_name: 'Data Breach Today',
    category: 'data-breach',
    image_url: null,
    published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    title: 'Business Email Compromise Costs Reach $50 Billion Globally',
    summary: 'FBI reports that Business Email Compromise (BEC) attacks have caused over $50 billion in losses globally since 2020, with attacks becoming more sophisticated.',
    source_url: 'https://example.com/news/7',
    source_name: 'FBI Cyber Division',
    category: 'phishing',
    image_url: null,
    published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    title: 'New Phishing Kit Bypasses Multi-Factor Authentication',
    summary: 'Researchers have discovered a new phishing-as-a-service kit capable of bypassing most MFA implementations through real-time credential relay.',
    source_url: 'https://example.com/news/8',
    source_name: 'Security Labs',
    category: 'phishing',
    image_url: null,
    published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>(latestNews);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('cybersecurity_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setNews(data);
      }
    };

    fetchNews();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || Globe;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'phishing': return 'text-[#FF4D4D] bg-[#FF4D4D]/10';
      case 'malware': return 'text-[#FFB800] bg-[#FFB800]/10';
      case 'ransomware': return 'text-[#FF6B6B] bg-[#FF6B6B]/10';
      case 'data-breach': return 'text-[#00D9FF] bg-[#00D9FF]/10';
      case 'vulnerabilities': return 'text-[#C0FF00] bg-[#C0FF00]/10';
      default: return 'text-[#B8BCCF] bg-[#B8BCCF]/10';
    }
  };

  const filteredNews = news.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  const featuredNews = filteredNews[0];
  const restNews = filteredNews.slice(1);

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Cybersecurity News</h1>
              <p className="text-[#B8BCCF]">Stay updated with the latest threats, vulnerabilities, and security incidents</p>
            </div>
            <div className="flex items-center gap-2 text-[#B8BCCF] text-sm">
              <Clock className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#C0FF00] text-[#0D1B2A]'
                        : 'bg-[#1A2332] text-[#B8BCCF] border border-[#2E3A4F] hover:border-[#C0FF00]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {featuredNews && (
            <div className="mb-8">
              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] overflow-hidden hover:border-[#C0FF00]/50 transition-all">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(featuredNews.category)}`}>
                      {categories.find(c => c.id === featuredNews.category)?.label || featuredNews.category}
                    </span>
                    <span className="flex items-center gap-1 text-[#B8BCCF] text-sm">
                      <Clock className="w-4 h-4" />
                      {getTimeAgo(featuredNews.published_at)}
                    </span>
                    <span className="text-[#B8BCCF] text-sm">• {featuredNews.source_name}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 hover:text-[#C0FF00] transition-colors">
                    {featuredNews.title}
                  </h2>
                  <p className="text-[#B8BCCF] text-lg mb-6">{featuredNews.summary}</p>
                  <a 
                    href={featuredNews.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
                  >
                    Read Full Story
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restNews.map((item) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <article
                  key={item.id}
                  className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 hover:border-[#C0FF00]/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[#B8BCCF] text-xs">{getTimeAgo(item.published_at)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-[#C0FF00] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[#B8BCCF] text-sm mb-4 line-clamp-3">{item.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#B8BCCF]">{item.source_name}</span>
                    <a 
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C0FF00] text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      Read more
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredNews.length === 0 && (
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-12 text-center">
              <Newspaper className="w-12 h-12 text-[#B8BCCF] mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No news found</h3>
              <p className="text-[#B8BCCF] text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}

          <div className="mt-12 bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Stay Protected</h3>
                <p className="text-[#B8BCCF]">Practice identifying threats with our simulation exercises</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/simulations"
                  className="px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all text-center"
                >
                  Start Training
                </Link>
                <Link 
                  href="/learn"
                  className="px-6 py-3 border border-[#2E3A4F] text-white font-medium rounded-lg hover:border-[#C0FF00] transition-all text-center"
                >
                  Learning Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
