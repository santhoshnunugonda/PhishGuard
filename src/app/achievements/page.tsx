'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { useState, useEffect } from "react";
import { Trophy, Lock, CheckCircle, Star, Target, Shield, Flame, Award, BookOpen, Zap, Crown, Medal, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'simulation' | 'streak' | 'milestone';
  requirement: string;
  progress: number;
  total: number;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
};

const allBadges: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first learning module',
    icon: '🎓',
    category: 'learning',
    requirement: 'Complete 1 module',
    progress: 0,
    total: 1,
    earned: false,
    rarity: 'common',
  },
  {
    id: 'eager-learner',
    name: 'Eager Learner',
    description: 'Complete 3 learning modules',
    icon: '📚',
    category: 'learning',
    requirement: 'Complete 3 modules',
    progress: 0,
    total: 3,
    earned: false,
    rarity: 'common',
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete all learning modules',
    icon: '🧠',
    category: 'learning',
    requirement: 'Complete 8 modules',
    progress: 0,
    total: 8,
    earned: false,
    rarity: 'epic',
  },
  {
    id: 'phish-spotter',
    name: 'Phish Spotter',
    description: 'Correctly identify your first phishing attempt',
    icon: '🎣',
    category: 'simulation',
    requirement: 'Get 1 correct',
    progress: 0,
    total: 1,
    earned: false,
    rarity: 'common',
  },
  {
    id: 'eagle-eye',
    name: 'Eagle Eye',
    description: 'Correctly identify 5 phishing attempts',
    icon: '🦅',
    category: 'simulation',
    requirement: 'Get 5 correct',
    progress: 0,
    total: 5,
    earned: false,
    rarity: 'rare',
  },
  {
    id: 'phish-hunter',
    name: 'Phish Hunter',
    description: 'Correctly identify 10 phishing attempts',
    icon: '🏹',
    category: 'simulation',
    requirement: 'Get 10 correct',
    progress: 0,
    total: 10,
    earned: false,
    rarity: 'epic',
  },
  {
    id: 'master-detective',
    name: 'Master Detective',
    description: 'Achieve 100% accuracy on 5 consecutive simulations',
    icon: '🔍',
    category: 'simulation',
    requirement: '5 correct streak',
    progress: 0,
    total: 5,
    earned: false,
    rarity: 'legendary',
  },
  {
    id: 'daily-warrior',
    name: 'Daily Warrior',
    description: 'Complete the daily challenge',
    icon: '⚔️',
    category: 'streak',
    requirement: 'Complete 1 daily challenge',
    progress: 0,
    total: 1,
    earned: false,
    rarity: 'common',
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day daily challenge streak',
    icon: '🔥',
    category: 'streak',
    requirement: '7 day streak',
    progress: 0,
    total: 7,
    earned: false,
    rarity: 'rare',
  },
  {
    id: 'month-streak',
    name: 'Unstoppable',
    description: 'Maintain a 30-day daily challenge streak',
    icon: '💪',
    category: 'streak',
    requirement: '30 day streak',
    progress: 0,
    total: 30,
    earned: false,
    rarity: 'legendary',
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Earn 100 total points',
    icon: '💯',
    category: 'milestone',
    requirement: 'Earn 100 points',
    progress: 0,
    total: 100,
    earned: false,
    rarity: 'common',
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Earn 500 total points',
    icon: '⭐',
    category: 'milestone',
    requirement: 'Earn 500 points',
    progress: 0,
    total: 500,
    earned: false,
    rarity: 'rare',
  },
  {
    id: 'point-master',
    name: 'Point Master',
    description: 'Earn 1000 total points',
    icon: '🏆',
    category: 'milestone',
    requirement: 'Earn 1000 points',
    progress: 0,
    total: 1000,
    earned: false,
    rarity: 'epic',
  },
  {
    id: 'security-champion',
    name: 'Security Champion',
    description: 'Reach the top 10 on the leaderboard',
    icon: '👑',
    category: 'milestone',
    requirement: 'Top 10 rank',
    progress: 0,
    total: 1,
    earned: false,
    rarity: 'legendary',
  },
  {
    id: 'email-expert',
    name: 'Email Expert',
    description: 'Master all email phishing simulations',
    icon: '📧',
    category: 'simulation',
    requirement: 'Complete all email scenarios',
    progress: 0,
    total: 8,
    earned: false,
    rarity: 'epic',
  },
  {
    id: 'sms-guardian',
    name: 'SMS Guardian',
    description: 'Correctly identify all SMS phishing attempts',
    icon: '📱',
    category: 'simulation',
    requirement: 'Complete all SMS scenarios',
    progress: 0,
    total: 3,
    earned: false,
    rarity: 'rare',
  },
];

const categoryIcons = {
  learning: BookOpen,
  simulation: Target,
  streak: Flame,
  milestone: Trophy,
};

const categoryLabels = {
  learning: 'Learning',
  simulation: 'Simulation',
  streak: 'Streak',
  milestone: 'Milestone',
};

const rarityColors = {
  common: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', label: 'Common' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Rare' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Epic' },
  legendary: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Legendary' },
};

export default function AchievementsPage() {
  const [badges, setBadges] = useState<Badge[]>(allBadges);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showEarned, setShowEarned] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    const loadProgress = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_points, modules_completed, scenarios_completed, accuracy, daily_streak, rank')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const updatedBadges = allBadges.map(badge => {
            let progress = 0;
            let earned = false;
            
            switch (badge.id) {
              case 'first-steps':
                progress = Math.min(profile.modules_completed || 0, 1);
                earned = progress >= 1;
                break;
              case 'eager-learner':
                progress = Math.min(profile.modules_completed || 0, 3);
                earned = progress >= 3;
                break;
              case 'knowledge-seeker':
                progress = Math.min(profile.modules_completed || 0, 8);
                earned = progress >= 8;
                break;
              case 'phish-spotter':
                progress = Math.min(profile.scenarios_completed || 0, 1);
                earned = progress >= 1;
                break;
              case 'eagle-eye':
                progress = Math.min(profile.scenarios_completed || 0, 5);
                earned = progress >= 5;
                break;
              case 'phish-hunter':
                progress = Math.min(profile.scenarios_completed || 0, 10);
                earned = progress >= 10;
                break;
              case 'daily-warrior':
                progress = (profile.daily_streak || 0) > 0 ? 1 : 0;
                earned = progress >= 1;
                break;
              case 'week-streak':
                progress = Math.min(profile.daily_streak || 0, 7);
                earned = progress >= 7;
                break;
              case 'month-streak':
                progress = Math.min(profile.daily_streak || 0, 30);
                earned = progress >= 30;
                break;
              case 'century-club':
                progress = Math.min(profile.total_points || 0, 100);
                earned = progress >= 100;
                break;
              case 'rising-star':
                progress = Math.min(profile.total_points || 0, 500);
                earned = progress >= 500;
                break;
              case 'point-master':
                progress = Math.min(profile.total_points || 0, 1000);
                earned = progress >= 1000;
                break;
              case 'security-champion':
                progress = profile.rank && profile.rank <= 10 ? 1 : 0;
                earned = progress >= 1;
                break;
              default:
                break;
            }
            
            return { ...badge, progress, earned };
          });
          
          setBadges(updatedBadges);
        }
      }
      
      setLoading(false);
    };
    
    loadProgress();
  }, []);

  const filteredBadges = badges.filter(badge => {
    if (filter !== 'all' && badge.category !== filter) return false;
    if (showEarned === 'earned' && !badge.earned) return false;
    if (showEarned === 'locked' && badge.earned) return false;
    return true;
  });

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;

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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C0FF00]/10 rounded-full border border-[#C0FF00]/30 mb-4">
              <Trophy className="w-4 h-4 text-[#C0FF00]" />
              <span className="text-[#C0FF00] font-medium">Achievement Gallery</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Your Achievements</h1>
            <p className="text-[#B8BCCF]">Collect badges and track your security training progress</p>
          </div>

          <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Collection Progress</h2>
                <p className="text-[#B8BCCF]">{earnedCount} of {totalCount} badges earned</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 md:w-64 h-3 bg-[#0D1B2A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C0FF00] to-[#00D9FF] rounded-full transition-all"
                    style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-[#C0FF00] font-bold">{Math.round((earnedCount / totalCount) * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {['all', 'learning', 'simulation', 'streak', 'milestone'].map((cat) => {
                const Icon = cat === 'all' ? Star : categoryIcons[cat as keyof typeof categoryIcons];
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      filter === cat
                        ? 'bg-[#C0FF00] text-[#0D1B2A]'
                        : 'bg-[#1A2332] text-[#B8BCCF] border border-[#2E3A4F] hover:border-[#C0FF00]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat === 'all' ? 'All' : categoryLabels[cat as keyof typeof categoryLabels]}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 md:ml-auto">
              {(['all', 'earned', 'locked'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setShowEarned(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showEarned === status
                      ? 'bg-[#2E3A4F] text-white'
                      : 'bg-[#1A2332] text-[#B8BCCF] border border-[#2E3A4F] hover:border-[#C0FF00]'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'earned' ? 'Earned' : 'Locked'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => {
              const rarity = rarityColors[badge.rarity];
              const CategoryIcon = categoryIcons[badge.category];
              
              return (
                <div
                  key={badge.id}
                  className={`relative bg-[#1A2332] rounded-xl border p-6 transition-all ${
                    badge.earned 
                      ? `${rarity.border} hover:scale-[1.02]` 
                      : 'border-[#2E3A4F] opacity-70'
                  }`}
                >
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${rarity.bg} ${rarity.text}`}>
                      {rarity.label}
                    </span>
                  </div>
                  
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${
                    badge.earned ? rarity.bg : 'bg-[#0D1B2A]'
                  }`}>
                    {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-[#2E3A4F]" />}
                  </div>
                  
                  <h3 className={`text-center font-semibold mb-1 ${badge.earned ? 'text-white' : 'text-[#B8BCCF]'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-center text-sm text-[#B8BCCF] mb-3">{badge.description}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-[#B8BCCF] mb-3">
                    <CategoryIcon className="w-3 h-3" />
                    {categoryLabels[badge.category]}
                  </div>
                  
                  {badge.earned ? (
                    <div className="flex items-center justify-center gap-2 text-[#00D084] text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Earned!
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs text-[#B8BCCF] mb-1">
                        <span>{badge.requirement}</span>
                        <span>{badge.progress}/{badge.total}</span>
                      </div>
                      <div className="h-2 bg-[#0D1B2A] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#C0FF00] rounded-full transition-all"
                          style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-[#2E3A4F] mx-auto mb-4" />
              <p className="text-[#B8BCCF]">No badges match your filters</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
