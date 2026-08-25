'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { Trophy, Award, TrendingUp, Crown, Medal, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type LeaderboardUser = {
  id: string;
  full_name: string;
  total_points: number;
  level: number;
  accuracy: number;
  badges_count: number;
};

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyPoints, setWeeklyPoints] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 8000);
    
    const fetchLeaderboard = async () => {
      try {
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, total_points, level, accuracy')
          .order('total_points', { ascending: false })
          .limit(100);

        if (profilesError) throw profilesError;

        if (profiles) {
          const { data: badgeCounts } = await supabase
            .from('user_badges')
            .select('user_id')
            .eq('earned', true);

          const badgeCountMap: Record<string, number> = {};
          if (badgeCounts) {
            badgeCounts.forEach((b: { user_id: string }) => {
              badgeCountMap[b.user_id] = (badgeCountMap[b.user_id] || 0) + 1;
            });
          }

          const enrichedProfiles = profiles.map(profile => ({
            ...profile,
            badges_count: badgeCountMap[profile.id] || 0
          }));
          
          setLeaderboardData(enrichedProfiles);
          
          if (user) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const { data: weeklyActivity } = await supabase
              .from('user_activity')
              .select('points')
              .eq('user_id', user.id)
              .gte('created_at', oneWeekAgo.toISOString());
            
            if (weeklyActivity) {
              const total = weeklyActivity.reduce((sum, a) => sum + (a.points || 0), 0);
              setWeeklyPoints(total);
            }
          }
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchLeaderboard();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[#FFD700]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[#CD7F32]" />;
    return <span className="text-[#B8BCCF] font-bold">#{rank}</span>;
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-[#B8BCCF]';
      case 2: return 'text-[#00D9FF]';
      case 3: return 'text-[#C0FF00]';
      case 4: return 'text-[#FFD700]';
      default: return 'text-[#B8BCCF]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C0FF00] animate-spin" />
      </div>
    );
  }

  const currentUser = leaderboardData.find(u => u.id === currentUserId);
  const userRank = currentUserId ? leaderboardData.findIndex(u => u.id === currentUserId) + 1 : 0;
  const totalUsers = leaderboardData.length;
  const percentile = totalUsers > 0 && userRank > 0 ? Math.round((1 - (userRank - 1) / totalUsers) * 100) : 0;
  const pointsToNextLevel = currentUser ? (currentUser.level === 1 ? 500 : currentUser.level === 2 ? 1500 : currentUser.level === 3 ? 3000 : 0) - currentUser.total_points : 500;

  const top3 = leaderboardData.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-[#B8BCCF]">See how you rank against other security champions</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <button className="px-6 py-2 rounded-lg font-medium bg-[#C0FF00] text-[#0D1B2A]">
              <Trophy className="w-4 h-4 inline mr-2" />
              Global Rankings
            </button>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-[#2E3A4F] mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">No Rankings Yet</h3>
              <p className="text-[#B8BCCF]">Complete simulations to appear on the leaderboard!</p>
            </div>
          ) : (
            <>
              {top3.length >= 3 && (
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {[top3[1], top3[0], top3[2]].map((user, i) => {
                    const displayRank = i === 1 ? 1 : i === 0 ? 2 : 3;
                    return (
                      <div
                        key={user.id}
                        className={`bg-[#1A2332] rounded-xl border p-6 text-center transition-all hover:scale-105 ${
                          displayRank === 1 ? 'border-[#FFD700]/50 md:order-2' : displayRank === 2 ? 'border-[#C0C0C0]/50 md:order-1' : 'border-[#CD7F32]/50 md:order-3'
                        } ${currentUserId === user.id ? 'ring-2 ring-[#C0FF00]' : ''}`}
                      >
                        <div className="mb-4">{getRankIcon(displayRank)}</div>
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#C0FF00] to-[#00D9FF] flex items-center justify-center text-2xl font-bold text-[#0D1B2A]">
                          {user.full_name?.charAt(0) || '?'}
                        </div>
                        <h3 className="text-white font-bold mb-1">
                          {user.full_name || 'Anonymous'}
                          {currentUserId === user.id && <span className="text-[#C0FF00]"> (You)</span>}
                        </h3>
                        <p className={`text-sm font-medium mb-2 ${getLevelColor(user.level)}`}>Level {user.level}</p>
                        <p className="text-2xl font-bold text-[#C0FF00] mb-1">{user.total_points.toLocaleString()}</p>
                        <p className="text-[#B8BCCF] text-sm">points</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] overflow-hidden">
                <div className="p-4 border-b border-[#2E3A4F]">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-[#B8BCCF]">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">User</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Accuracy</div>
                    <div className="col-span-2 text-center">Badges</div>
                  </div>
                </div>
                
                <div className="divide-y divide-[#2E3A4F]">
                  {leaderboardData.map((user, index) => (
                    <div
                      key={user.id}
                      className={`p-4 transition-colors ${
                        currentUserId === user.id
                          ? 'bg-[#C0FF00]/10 border-l-4 border-l-[#C0FF00]'
                          : 'hover:bg-[#0D1B2A]/50'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1">
                          {getRankIcon(index + 1)}
                        </div>
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E3A4F] to-[#1A2332] flex items-center justify-center text-white font-bold">
                            {user.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <h4 className={`font-medium ${currentUserId === user.id ? 'text-[#C0FF00]' : 'text-white'}`}>
                              {user.full_name || 'Anonymous'}
                              {currentUserId === user.id && ' (You)'}
                            </h4>
                            <p className={`text-xs ${getLevelColor(user.level)}`}>Level {user.level}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-bold">{user.total_points.toLocaleString()}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-[#00D084]">{user.accuracy}%</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="flex items-center justify-center gap-1 text-[#FFB800]">
                            <Award className="w-4 h-4" />
                            {user.badges_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentUser && (
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 text-center">
                <Trophy className="w-8 h-8 text-[#FFD700] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-1">Your Rank</h3>
                <p className="text-3xl font-bold text-[#C0FF00]">#{userRank}</p>
                <p className="text-[#B8BCCF] text-sm">Top {percentile}%</p>
              </div>
              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 text-center">
                <Award className="w-8 h-8 text-[#C0FF00] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-1">Your Points</h3>
                <p className="text-3xl font-bold text-[#C0FF00]">{currentUser.total_points.toLocaleString()}</p>
                <p className="text-[#B8BCCF] text-sm">{pointsToNextLevel > 0 ? `${pointsToNextLevel} to Level ${currentUser.level + 1}` : 'Max Level!'}</p>
              </div>
              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 text-center">
                <TrendingUp className="w-8 h-8 text-[#00D084] mx-auto mb-3" />
                <h3 className="text-white font-bold mb-1">Weekly Progress</h3>
                <p className="text-3xl font-bold text-[#00D084]">+{weeklyPoints}</p>
                <p className="text-[#B8BCCF] text-sm">points this week</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}