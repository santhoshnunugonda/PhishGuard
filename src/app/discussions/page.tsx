'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { MessageSquare, ThumbsUp, Reply, Plus, Search, Clock, Filter, ChevronRight, Loader2, X, Send, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

type Discussion = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
};

type DiscussionReply = {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
};

const categories = [
  { id: 'all', label: 'All Topics' },
  { id: 'general', label: 'General' },
  { id: 'phishing', label: 'Phishing' },
  { id: 'email-security', label: 'Email Security' },
  { id: 'tips', label: 'Tips & Tricks' },
  { id: 'help', label: 'Help & Support' },
];

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 8000);
    
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const { data, error } = await supabase
          .from('discussions')
          .select(`
            *,
            profiles (full_name, avatar_url)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          setDiscussions(data);
        }
      } catch (err) {
        console.error('Discussions fetch error:', err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchData();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const fetchReplies = async (discussionId: string) => {
    setLoadingReplies(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('discussion_replies')
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });

    if (data) {
      setReplies(data);
    }
    setLoadingReplies(false);
  };

  const handleCreateDiscussion = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setCreating(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('discussions')
      .insert({
        user_id: user.id,
        title: newTitle,
        content: newContent,
        category: newCategory,
      })
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .single();

    if (data && !error) {
      setDiscussions([data, ...discussions]);
      setShowNewDiscussion(false);
      setNewTitle('');
      setNewContent('');
      setNewCategory('general');
    }
    setCreating(false);
  };

  const handleCreateReply = async () => {
    if (!user || !newReply.trim() || !selectedDiscussion) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('discussion_replies')
      .insert({
        discussion_id: selectedDiscussion.id,
        user_id: user.id,
        content: newReply,
      })
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .single();

    if (data && !error) {
      setReplies([...replies, data]);
      setNewReply('');
      await supabase
        .from('discussions')
        .update({ replies_count: (selectedDiscussion.replies_count || 0) + 1 })
        .eq('id', selectedDiscussion.id);
    }
  };

  const handleLike = async (discussionId: string) => {
    if (!user) return;
    const supabase = createClient();
    
    const { data: existing } = await supabase
      .from('discussion_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('discussion_id', discussionId)
      .single();

    if (existing) {
      await supabase
        .from('discussion_likes')
        .delete()
        .eq('id', existing.id);
      setDiscussions(discussions.map(d => 
        d.id === discussionId ? { ...d, likes_count: d.likes_count - 1 } : d
      ));
    } else {
      await supabase
        .from('discussion_likes')
        .insert({ user_id: user.id, discussion_id: discussionId });
      setDiscussions(discussions.map(d => 
        d.id === discussionId ? { ...d, likes_count: d.likes_count + 1 } : d
      ));
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredDiscussions = discussions.filter(d => {
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Community Discussions</h1>
              <p className="text-[#B8BCCF]">Share knowledge, ask questions, and connect with other security enthusiasts</p>
            </div>
            {user && (
              <button
                onClick={() => setShowNewDiscussion(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
              >
                <Plus className="w-5 h-5" />
                New Discussion
              </button>
            )}
          </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8BCCF]" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1A2332] border border-[#2E3A4F] rounded-lg text-white placeholder:text-[#B8BCCF] focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#C0FF00] text-[#0D1B2A]'
                      : 'bg-[#1A2332] text-[#B8BCCF] border border-[#2E3A4F] hover:border-[#C0FF00]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 hover:border-[#C0FF00]/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedDiscussion(discussion);
                      fetchReplies(discussion.id);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={discussion.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${discussion.user_id}`} />
                        <AvatarFallback>{discussion.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{discussion.profiles?.full_name || 'Anonymous'}</span>
                          <span className="text-[#B8BCCF] text-xs">• {getTimeAgo(discussion.created_at)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 hover:text-[#C0FF00] transition-colors">
                          {discussion.title}
                        </h3>
                        <p className="text-[#B8BCCF] text-sm line-clamp-2 mb-4">{discussion.content}</p>
                        <div className="flex items-center gap-6">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-[#C0FF00]/10 text-[#C0FF00]">
                            {categories.find(c => c.id === discussion.category)?.label || discussion.category}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLike(discussion.id); }}
                            className="flex items-center gap-1 text-[#B8BCCF] hover:text-[#C0FF00] text-sm"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {discussion.likes_count}
                          </button>
                          <div className="flex items-center gap-1 text-[#B8BCCF] text-sm">
                            <MessageSquare className="w-4 h-4" />
                            {discussion.replies_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-[#B8BCCF] mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No discussions yet</h3>
                  <p className="text-[#B8BCCF] text-sm mb-4">Be the first to start a conversation!</p>
                  {user && (
                    <button
                      onClick={() => setShowNewDiscussion(true)}
                      className="px-6 py-2 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
                    >
                      Start Discussion
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
                <h3 className="text-white font-semibold mb-4">Community Guidelines</h3>
                <ul className="space-y-3 text-sm text-[#B8BCCF]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C0FF00]">•</span>
                    Be respectful and constructive
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C0FF00]">•</span>
                    Share real experiences and insights
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C0FF00]">•</span>
                    Don't share personal sensitive info
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C0FF00]">•</span>
                    Report suspicious content
                  </li>
                </ul>
              </div>

              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/learn" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                    <span className="text-[#B8BCCF] text-sm">Learning Center</span>
                    <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                  </Link>
                    <Link href="/simulations" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                      <span className="text-[#B8BCCF] text-sm">Simulations</span>
                      <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                    </Link>
                    <Link href="/leaderboard" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                      <span className="text-[#B8BCCF] text-sm">Leaderboard</span>
                      <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                    </Link>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {showNewDiscussion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Start a Discussion</h3>
              <button onClick={() => setShowNewDiscussion(false)} className="text-[#B8BCCF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#B8BCCF] mb-2">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What's your question or topic?"
                  className="w-full px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white placeholder:text-[#B8BCCF] focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#B8BCCF] mb-2">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white focus:outline-none focus:border-[#C0FF00]"
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#B8BCCF] mb-2">Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or experiences..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white placeholder:text-[#B8BCCF] focus:outline-none focus:border-[#C0FF00] resize-none"
                />
              </div>
              <button
                onClick={handleCreateDiscussion}
                disabled={creating || !newTitle.trim() || !newContent.trim()}
                className="w-full px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Posting...' : 'Post Discussion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDiscussion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#2E3A4F] flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedDiscussion.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDiscussion.user_id}`} />
                  <AvatarFallback>{selectedDiscussion.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedDiscussion.title}</h3>
                  <p className="text-[#B8BCCF] text-sm">
                    {selectedDiscussion.profiles?.full_name} • {getTimeAgo(selectedDiscussion.created_at)}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDiscussion(null)} className="text-[#B8BCCF] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-[#B8BCCF] mb-6">{selectedDiscussion.content}</p>
              
              <div className="border-t border-[#2E3A4F] pt-6">
                <h4 className="text-white font-semibold mb-4">Replies ({replies.length})</h4>
                {loadingReplies ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#C0FF00] animate-spin" />
                  </div>
                ) : replies.length > 0 ? (
                  <div className="space-y-4">
                    {replies.map(reply => (
                      <div key={reply.id} className="flex gap-3 p-4 bg-[#0D1B2A] rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={reply.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user_id}`} />
                          <AvatarFallback>{reply.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-medium">{reply.profiles?.full_name || 'Anonymous'}</span>
                            <span className="text-[#B8BCCF] text-xs">{getTimeAgo(reply.created_at)}</span>
                          </div>
                          <p className="text-[#B8BCCF] text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#B8BCCF] text-center py-4">No replies yet. Be the first to respond!</p>
                )}
              </div>
            </div>

            {user && (
              <div className="p-4 border-t border-[#2E3A4F]">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white placeholder:text-[#B8BCCF] focus:outline-none focus:border-[#C0FF00]"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateReply()}
                  />
                  <button
                    onClick={handleCreateReply}
                    disabled={!newReply.trim()}
                    className="px-4 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
