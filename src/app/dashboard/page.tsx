'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { 
  Award, Target, BookOpen, TrendingUp, Clock, CheckCircle, 
  AlertTriangle, Trophy, ChevronRight, Flame, Rocket, 
  Loader2, Calendar, Mail, MessageSquare, QrCode, 
  Briefcase, PieChart, Activity, Shield, Zap, Info, ArrowUpRight,
  ZapOff, Lock, Brain, Globe, Settings, BarChart3, Fingerprint,
  ShieldAlert, ShieldCheck, Zap as BoltIcon
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  level: number;
  level_name: string;
  risk_score: number;
  accuracy: number;
  streak: number;
  scenarios_completed: number;
  modules_completed: number;
  rank: number;
  email_correct: number;
  email_total: number;
  sms_correct: number;
  sms_total: number;
  qr_correct: number;
  qr_total: number;
  bec_correct: number;
  bec_total: number;
  daily_streak: number;
  created_at: string;
  last_activity_date: string | null;
};

type Badge = {
  id: string;
  badge_name: string;
  badge_icon: string;
  earned: boolean;
  progress: number;
  total: number;
  earned_at: string | null;
};

type UserActivity = {
  id: string;
  activity_type: string;
  title: string;
  result: string;
  points: number;
  created_at: string;
};

type HeatmapData = {
  [date: string]: number;
};

const DefenseStrengthChart = ({ profile }: { profile: Profile | null }) => {
  if (!profile) return null;

  const data = [
    { subject: 'Email', A: (profile.email_correct / (profile.email_total || 1)) * 100, fullMark: 100 },
    { subject: 'SMS', A: (profile.sms_correct / (profile.sms_total || 1)) * 100, fullMark: 100 },
    { subject: 'BEC', A: (profile.bec_correct / (profile.bec_total || 1)) * 100, fullMark: 100 },
    { subject: 'QR', A: (profile.qr_correct / (profile.qr_total || 1)) * 100, fullMark: 100 },
    { subject: 'Intel', A: (profile.modules_completed / 10) * 100, fullMark: 100 },
  ];

  return (
    <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#C0FF00]" />
          Defense Strength
        </h3>
        <UiBadge variant="outline" className="border-[#C0FF00] text-[#C0FF00]">
          {profile.level_name}
        </UiBadge>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#2E3A4F" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#B8BCCF', fontSize: 12 }} />
            <Radar
              name="Skill"
              dataKey="A"
              stroke="#C0FF00"
              fill="#C0FF00"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ProfileCard = ({ profile, rank, totalUsers }: { profile: Profile | null, rank: number, totalUsers: number }) => {
  if (!profile) return null;
  
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  return (
    <div className="bg-gradient-to-b from-[#1A2332] to-[#0D1B2A] rounded-xl border border-[#2E3A4F] p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0FF00]/5 blur-3xl rounded-full -mr-16 -mt-16" />
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-[#C0FF00] p-1">
             <Avatar className="w-full h-full border-2 border-[#1A2332]">
              <AvatarImage src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} />
              <AvatarFallback>{profile.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#C0FF00] text-[#0D1B2A] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
            Level {profile.level}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{profile.full_name || 'Defender'}</h2>
        <p className="text-[#B8BCCF] text-sm mb-6">{profile.email}</p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-[#2E3A4F]/30 rounded-lg p-3 border border-[#2E3A4F]/50">
            <p className="text-[10px] text-[#B8BCCF] uppercase font-bold mb-1">Rank</p>
            <p className="text-xl font-bold text-white">#{rank}</p>
          </div>
          <div className="bg-[#2E3A4F]/30 rounded-lg p-3 border border-[#2E3A4F]/50">
            <p className="text-[10px] text-[#B8BCCF] uppercase font-bold mb-1">Points</p>
            <p className="text-xl font-bold text-[#C0FF00]">{profile.total_points.toLocaleString()}</p>
          </div>
        </div>

        <div className="w-full space-y-4 mb-8">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#B8BCCF]">Progress to Level {profile.level + 1}</span>
              <span className="text-white">65%</span>
            </div>
            <Progress value={65} className="h-1.5 bg-[#2E3A4F]" />
          </div>
        </div>

        <Link 
          href="/profile" 
          className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group"
        >
          <Settings className="w-4 h-4 text-[#B8BCCF] group-hover:rotate-45 transition-transform" />
          Manage Account
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-[#2E3A4F]/50 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#B8BCCF] flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Joined
          </span>
          <span className="text-white font-medium">{memberSince}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#B8BCCF] flex items-center gap-2">
            <Zap className="w-4 h-4" /> Daily Streak
          </span>
          <span className="text-[#C0FF00] font-bold">{profile.daily_streak} Days</span>
        </div>
      </div>
    </div>
  );
};

const MissionControl = ({ profile }: { profile: Profile | null }) => {
  if (!profile) return null;

  const recommendations = [
    { title: 'Master BEC Fraud', type: 'Hard', icon: <Briefcase className="w-4 h-4" />, href: '/simulations?type=bec' },
    { title: 'AI Phishing Defense', type: 'New', icon: <Brain className="w-4 h-4" />, href: '/simulations' },
    { title: 'Weekly Challenge', type: 'Bonus', icon: <Zap className="w-4 h-4" />, href: '/daily-challenge' },
  ];

  return (
    <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
        <Rocket className="w-4 h-4 text-[#C0FF00]" />
        Next Missions
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <Link 
            key={i} 
            href={rec.href}
            className="flex items-center justify-between p-4 bg-[#0D1B2A] rounded-xl border border-[#2E3A4F] hover:border-[#C0FF00] hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#2E3A4F] flex items-center justify-center text-[#C0FF00] group-hover:bg-[#C0FF00] group-hover:text-[#0D1B2A] transition-colors">
                {rec.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{rec.title}</p>
                <p className="text-[10px] text-[#B8BCCF] uppercase">{rec.type}</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#B8BCCF] group-hover:text-[#C0FF00]" />
          </Link>
        ))}
      </div>
    </div>
  );
};

const ThreatLevel = () => (
  <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-6 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="relative">
        <Globe className="w-10 h-10 text-red-500 animate-pulse" />
        <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse" />
      </div>
      <div>
        <h3 className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Global Threat Level</h3>
        <p className="text-white font-bold text-lg">ELEVATED</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[10px] text-[#B8BCCF] uppercase">Active Phish Campaigns</p>
      <p className="text-white font-mono text-xl">42,891</p>
    </div>
  </div>
);

  const SubmissionsHeatmap = ({ activities }: { activities: UserActivity[] }) => {
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const { heatmapData } = useMemo(() => {
      const data: HeatmapData = {};
      activities.forEach(activity => {
        const dateStr = formatDate(new Date(activity.created_at));
        data[dateStr] = (data[dateStr] || 0) + 1;
      });
      return { heatmapData: data };
    }, [activities]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const grid = useMemo(() => {
      const weeks: { date: string; count: number; monthLabel?: string }[][] = [];
      const now = new Date();
      const year = now.getFullYear();
      const startDate = new Date(year, 0, 1);
      const startDay = startDate.getDay();
      startDate.setDate(startDate.getDate() - startDay);
      
      for (let w = 0; w < 53; w++) {
        const week: { date: string; count: number; monthLabel?: string }[] = [];
        for (let d = 0; d < 7; d++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + w * 7 + d);
          const dateStr = formatDate(currentDate);
          const item: any = { date: dateStr, count: heatmapData[dateStr] || 0 };
          
          if (d === 0 && currentDate.getFullYear() === year) {
            if (currentDate.getDate() <= 7) {
              item.monthLabel = months[currentDate.getMonth()];
            }
          }
          week.push(item);
        }
        weeks.push(week);
      }
      return weeks;
    }, [heatmapData]);

    const getColor = (count: number) => {
      if (count === 0) return '#222D3E';
      if (count === 1) return '#0E4429';
      if (count === 2) return '#006D32';
      if (count === 3) return '#26A641';
      return '#C0FF00';
    };

    return (
      <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Training Consistency</h3>
            <p className="text-[10px] text-[#B8BCCF] mt-0.5">{activities.length} simulations completed in {new Date().getFullYear()}</p>
          </div>
          <UiBadge variant="secondary" className="bg-[#2E3A4F] text-white text-[10px] py-0 h-5">2025</UiBadge>
        </div>

        <div className="relative pt-4">
          <div className="flex gap-[2px] md:gap-[3px] justify-between">
            {grid.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[2px] md:gap-[3px] relative">
                {week[0].monthLabel && (
                  <span className="absolute -top-4 left-0 text-[8px] md:text-[9px] text-[#B8BCCF] font-bold uppercase">
                    {week[0].monthLabel}
                  </span>
                )}
                {week.map((day, dayIdx) => (
                  <div 
                    key={`${weekIdx}-${dayIdx}`} 
                    className="w-[8px] h-[8px] md:w-[10px] md:h-[10px] rounded-[1.5px] cursor-help transition-all hover:scale-125 hover:z-10"
                    style={{ backgroundColor: getColor(day.count) }}
                    title={`${day.date}: ${day.count} simulations`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-4 text-[9px] text-[#B8BCCF] uppercase font-bold tracking-widest">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: getColor(level) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    );
  };

const RecentThreats = () => {
  const threats = [
    { title: "M365 Credential Phishing Surge", date: "2h ago", severity: "High", icon: <Mail className="w-3 h-3" /> },
    { title: "New AI Voice Clone Campaign", date: "5h ago", severity: "Critical", icon: <Brain className="w-3 h-3" /> },
    { title: "QR Code Payment Hijacking", date: "1d ago", severity: "Medium", icon: <QrCode className="w-3 h-3" /> },
  ];

  return (
    <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#FF4D4D]" />
          Tactical Alerts
        </h3>
        <Link href="/threats" className="text-[10px] text-[#B8BCCF] hover:text-[#C0FF00]">Intelligence Library</Link>
      </div>
      <div className="space-y-4">
        {threats.map((threat, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${threat.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : threat.severity === 'High' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                  {threat.icon}
                </div>
                <span className="text-sm font-bold text-white group-hover:text-[#C0FF00] transition-colors">{threat.title}</span>
              </div>
              <span className="text-[10px] text-[#B8BCCF]">{threat.date}</span>
            </div>
            <div className="flex items-center gap-2 ml-7">
              <span className={`text-[9px] uppercase font-black tracking-tighter ${threat.severity === 'Critical' ? 'text-red-500' : threat.severity === 'High' ? 'text-orange-500' : 'text-blue-500'}`}>
                {threat.severity} Priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const fetchData = async () => {
          try {
            const supabase = createClient();
            
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError || !user) {
              setLoading(false);
              return;
            }

            const [profileRes, badgesRes, activityRes, usersCountRes] = await Promise.all([
              supabase.from('profiles').select('*').eq('id', user.id).single(),
              supabase.from('user_badges').select('*').eq('user_id', user.id),
              supabase.from('user_activity').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
              supabase.from('profiles').select('*', { count: 'exact', head: true })
            ]);

            if (profileRes.data) {
              setProfile(profileRes.data as Profile);
            }
            
            if (badgesRes.data) {
              setBadges(badgesRes.data);
            }
            
            if (activityRes.data) {
              setActivities(activityRes.data);
            }
            
            if (usersCountRes.count !== null) {
              setTotalUsers(usersCountRes.count);
            }
          } catch (err) {
            console.error('Dashboard fetch error:', err);
          } finally {
            clearTimeout(timeoutId);
            setLoading(false);
          }
        };

        fetchData();
        
        return () => {
          clearTimeout(timeoutId);
          controller.abort();
        };
      }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C0FF00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white selection:bg-[#C0FF00] selection:text-[#0D1B2A]">
      <HeaderNavigation />
      
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Top Hero Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6 relative overflow-hidden group hover:border-[#C0FF00]/50 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-12 h-12 text-[#C0FF00]" />
              </div>
              <p className="text-[#B8BCCF] text-xs font-bold uppercase tracking-widest mb-1">Current Points</p>
              <h3 className="text-3xl font-black text-[#C0FF00]">{profile?.total_points.toLocaleString() || '0'}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-[#B8BCCF]">
                <span className="text-[#C0FF00] flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +12%</span>
                <span>vs last week</span>
              </div>
            </div>

            <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6 relative overflow-hidden group hover:border-[#C0FF00]/50 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck className="w-12 h-12 text-[#C0FF00]" />
              </div>
              <p className="text-[#B8BCCF] text-xs font-bold uppercase tracking-widest mb-1">Defense Rank</p>
              <h3 className="text-3xl font-black text-white">#{profile?.rank || '--'}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-[#B8BCCF]">
                <span>Top <span className="text-[#C0FF00]">5%</span> of all defenders</span>
              </div>
            </div>

            <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6 relative overflow-hidden group hover:border-[#C0FF00]/50 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-12 h-12 text-[#C0FF00]" />
              </div>
              <p className="text-[#B8BCCF] text-xs font-bold uppercase tracking-widest mb-1">Accuracy</p>
              <h3 className="text-3xl font-black text-white">{profile?.accuracy || '0'}%</h3>
              <div className="mt-4 w-full h-1 bg-[#2E3A4F] rounded-full overflow-hidden">
                <div className="h-full bg-[#C0FF00]" style={{ width: `${profile?.accuracy || 0}%` }} />
              </div>
            </div>

            <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6 relative overflow-hidden group hover:border-[#C0FF00]/50 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Flame className="w-12 h-12 text-orange-500" />
              </div>
              <p className="text-[#B8BCCF] text-xs font-bold uppercase tracking-widest mb-1">Active Streak</p>
              <h3 className="text-3xl font-black text-white">{profile?.daily_streak || '0'} Days</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-orange-500">
                <Zap className="w-3 h-3 fill-current" />
                <span>Keep it going!</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column: Intelligence & Profile */}
            <div className="lg:col-span-4 space-y-8">
              <ProfileCard profile={profile} rank={profile?.rank || 0} totalUsers={totalUsers} />
              
              <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-[#C0FF00]" />
                    Skill Fingerprint
                  </h3>
                  <Info className="w-4 h-4 text-[#B8BCCF]" />
                </div>
                <DefenseStrengthChart profile={profile} />
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#B8BCCF]">Social Engineering</span>
                    <span className="text-white font-bold">88%</span>
                  </div>
                  <Progress value={88} className="h-1 bg-[#2E3A4F]" />
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-[#B8BCCF]">Threat Detection</span>
                    <span className="text-white font-bold">72%</span>
                  </div>
                  <Progress value={72} className="h-1 bg-[#2E3A4F]" />
                </div>
              </div>

              <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C0FF00]" />
                  Elite Badges
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {badges.slice(0, 8).map((badge, i) => (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${badge.earned ? 'bg-[#C0FF00]/10 border border-[#C0FF00]/30 shadow-[0_0_10px_rgba(192,255,0,0.1)]' : 'bg-[#2E3A4F]/30 border border-[#2E3A4F]/50 grayscale opacity-20'}`}
                      title={badge.badge_name}
                    >
                      {badge.badge_icon}
                    </div>
                  ))}
                </div>
                <Link href="/achievements" className="mt-6 block text-center text-xs text-[#B8BCCF] hover:text-[#C0FF00] underline underline-offset-4">
                  View all achievements
                </Link>
              </div>
            </div>

            {/* Right Column: Tactical Feed */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Action Center */}
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/scan" className="p-4 bg-[#C0FF00]/5 border border-[#C0FF00]/20 rounded-2xl hover:bg-[#C0FF00]/10 transition-all flex flex-col items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-[#C0FF00] flex items-center justify-center text-[#0D1B2A] group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Scan Link</span>
                </Link>
                <Link href="/simulations" className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl hover:bg-blue-500/10 transition-all flex flex-col items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Start Sim</span>
                </Link>
                <Link href="/daily-challenge" className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl hover:bg-orange-500/10 transition-all flex flex-col items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Daily Challenge</span>
                </Link>
              </div>

              <ThreatLevel />
              
              <div className="grid md:grid-cols-2 gap-8">
                <MissionControl profile={profile} />
                <RecentThreats />
              </div>
              
              <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-6">
                 <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#C0FF00]" />
                    Activity Log
                  </h3>
                  <Link href="/profile#activity" className="text-[10px] text-[#B8BCCF] hover:text-[#C0FF00]">Full Log</Link>
                 </div>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-[#2E3A4F]/50 last:border-0 last:pb-0">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C0FF00] shadow-[0_0_8px_rgba(192,255,0,0.5)]" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white leading-tight">{activity.title}</p>
                        <p className="text-[10px] text-[#B8BCCF] mt-1">{new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <UiBadge variant="outline" className="text-[10px] bg-[#C0FF00]/5 border-[#C0FF00]/20 text-[#C0FF00] font-mono">
                        +{activity.points}
                      </UiBadge>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-[#B8BCCF]">No recent activity. Start a mission!</p>
                    </div>
                  )}
                </div>
              </div>

              <SubmissionsHeatmap activities={activities} />

              {/* AI Personalization Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D1B2A] to-[#1A2332] border border-[#C0FF00]/20 p-1">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C0FF00]/5 blur-3xl -mr-32 -mt-32" />
                <div className="relative bg-[#0D1B2A] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-[#C0FF00] flex items-center justify-center text-[#0D1B2A] shadow-[0_0_30px_rgba(192,255,0,0.3)]">
                        <Brain className="w-8 h-8" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 border-2 border-[#0D1B2A] flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AI Command Center</h3>
                      <p className="text-[#B8BCCF] text-sm max-w-md leading-relaxed">
                        Our intelligence engine has identified <span className="text-[#C0FF00] font-bold">QR Code Vulnerabilities</span> in your recent performance. 
                        We&apos;ve generated 3 tactical simulations to patch this weakness.
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/simulations" 
                    className="group whitespace-nowrap px-10 py-4 bg-[#C0FF00] text-[#0D1B2A] font-black rounded-xl hover:shadow-[0_0_40px_rgba(192,255,0,0.5)] transition-all flex items-center gap-2 uppercase tracking-tighter italic"
                  >
                    Engage Now
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
