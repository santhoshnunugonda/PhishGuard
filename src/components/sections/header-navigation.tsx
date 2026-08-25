'use client';

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  Shield, 
  ChevronDown, 
  Mail, 
  Target, 
  Trophy, 
  BarChart3, 
  Users, 
  Info, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  X, 
  Bot,
  ScanSearch
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type NavDropdownProps = {
  label: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  items?: { label: string; href: string }[];
  mobile?: boolean;
};

const NavDropdown = ({ label, icon, isOpen, onToggle, onClose, items = [], mobile = false }: NavDropdownProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`[data-dropdown="${label}"]`)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose, label]);

  if (mobile) {
    return (
      <div className="w-full border-b border-[#2E3A4F] last:border-0">
        <button 
          onClick={onToggle}
          className="flex w-full items-center justify-between py-4 text-[#B8BCCF] hover:text-[#C0FF00] transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium">{label}</span>
          </div>
          <ChevronDown className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
        <div 
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
          )}
        >
           <div className="overflow-hidden">
             <div className="flex flex-col gap-2 pl-9">
               {items.map((item, idx) => (
                 <Link key={idx} href={item.href} className="text-sm text-[#B8BCCF] hover:text-[#C0FF00] py-2">{item.label}</Link>
               ))}
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group" data-dropdown={label}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "flex flex-col items-center gap-1.5 px-3 py-2 rounded-md transition-colors duration-200",
          isOpen ? "text-[#C0FF00]" : "text-[#B8BCCF] hover:text-[#C0FF00]"
        )}
      >
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "size-[18px]" })}
        <span className="text-[13px] font-medium leading-none">{label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#1A2332] border border-[#2E3A4F] rounded-lg shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
           <div className="flex flex-col gap-1">
             {items.map((item, idx) => (
               <Link key={idx} href={item.href} className="block px-4 py-2 text-sm text-[#B8BCCF] hover:text-[#C0FF00] hover:bg-[#0D1B2A] rounded-md">
                 {item.label}
               </Link>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ label, href, icon }: { label: string, href: string, icon: React.ReactNode }) => (
  <Link 
    href={href}
    className="flex flex-col items-center gap-1.5 px-3 py-2 text-[#B8BCCF] hover:text-[#C0FF00] transition-colors duration-200 group"
  >
    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "size-[18px] group-hover:scale-110 transition-transform duration-200" })}
    <span className="text-[13px] font-medium leading-none">{label}</span>
  </Link>
);

const MobileNavItem = ({ label, href, icon }: { label: string, href: string, icon: React.ReactNode }) => (
  <Link 
    href={href}
    className="flex w-full items-center gap-3 py-4 border-b border-[#2E3A4F] text-[#B8BCCF] hover:text-[#C0FF00] transition-colors"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default function HeaderNavigation({ initialUser = null }: { initialUser?: SupabaseUser | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<SupabaseUser | null>(initialUser);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const toggleMobileDropdown = (name: string) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  useEffect(() => {
    const supabase = createClient();
    
    if (!initialUser) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const simulationsItems = [
    { label: 'All Simulations', href: '/simulations' },
    { label: 'Daily Challenge', href: '/daily-challenge' },
    { label: 'Email Phishing', href: '/simulations?type=email' },
    { label: 'SMS Phishing (Smishing)', href: '/simulations?type=sms' },
    { label: 'QR Code Phishing', href: '/simulations?type=qr' },
    { label: 'CEO Fraud / BEC', href: '/simulations?type=bec' },
  ];

  const leaderboardItems = [
    { label: 'Global Leaderboard', href: '/leaderboard' },
    { label: 'Weekly Champions', href: '/leaderboard?view=weekly' },
    { label: 'Achievements', href: '/achievements' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1A2332] shadow-[0_4px_12px_rgba(0,0,0,0.25)] h-[80px]">
        <div className="max-w-[1400px] h-full mx-auto px-4 lg:px-10 flex items-center justify-between">
          
          <div className="flex items-center gap-8 h-full">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-[#B8BCCF] hover:text-[#C0FF00] transition-colors p-2 -ml-2"
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>

            <Link href="/" className="shrink-0 flex items-center gap-2">
              <Shield className="size-8 text-[#C0FF00]" />
              <span className="text-white font-bold text-xl tracking-tight">PhishGuard</span>
            </Link>

              <nav className="hidden lg:flex items-center gap-1 h-full pt-2">
                {user ? (
                  <>
                    <NavItem label="Learn" href="/learn" icon={<Mail />} />
                    
                    <NavDropdown 
                      label="Simulations" 
                      icon={<Target />} 
                      isOpen={activeDropdown === 'simulations'}
                      onToggle={() => toggleDropdown('simulations')}
                      onClose={() => setActiveDropdown(null)}
                      items={simulationsItems}
                    />
                    
                    <NavDropdown 
                      label="Compete" 
                      icon={<Trophy />} 
                      isOpen={activeDropdown === 'compete'}
                      onToggle={() => toggleDropdown('compete')}
                      onClose={() => setActiveDropdown(null)}
                      items={leaderboardItems}
                    />

                    <NavItem label="Dashboard" href="/dashboard" icon={<BarChart3 />} />
                        <NavItem label="Scan" href="/scan" icon={<ScanSearch />} />
                        <NavItem label="Discuss" href="/discussions" icon={<MessageSquare />} />

                        <NavItem label="Team" href="/team" icon={<Users />} />
                      </>
                    ) : (
                      <>
                        <NavItem label="About" href="/#features" icon={<Info />} />
                        <NavItem label="Team" href="/team" icon={<Users />} />
                        <NavItem label="Testimonials" href="/#testimonials" icon={<Users />} />
                      </>
                    )}
                </nav>
              </div>


              <div className="flex items-center gap-4 lg:gap-6">
                <Link 
                  href="/contact"
                  className="hidden lg:flex flex-col items-center gap-1.5 px-3 py-2 text-[#B8BCCF] hover:text-[#C0FF00] transition-colors duration-200 group"
                >
                  <MessageSquare className="size-[18px] group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-[13px] font-medium leading-none">Contact</span>
                </Link>

                {user ? (
                <div className="relative" data-user-menu>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#2E3A4F] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#C0FF00]/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#C0FF00]" />
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-[#B8BCCF] hidden lg:block transition-transform", userMenuOpen && "rotate-180")} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A2332] border border-[#2E3A4F] rounded-lg shadow-xl p-2 z-50">
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#B8BCCF] hover:text-[#C0FF00] hover:bg-[#0D1B2A] rounded-md"
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#B8BCCF] hover:text-[#FF4D4D] hover:bg-[#0D1B2A] rounded-md"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-4">
                  <Link 
                    href="/login"
                    className="px-6 py-2.5 rounded-lg border border-[#B8BCCF] text-white font-medium text-sm hover:border-[#C0FF00] hover:text-[#C0FF00] transition-all duration-200"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/signup"
                    className="px-6 py-2.5 rounded-lg bg-[#C0FF00] text-[#0D1B2A] font-semibold text-sm hover:brightness-110 hover:shadow-[0_0_15px_rgba(192,255,0,0.3)] hover:scale-105 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {!user && (
                <div className="flex lg:hidden items-center gap-2">
                   <Link href="/login" className="text-sm font-medium text-white hover:text-[#C0FF00] px-2 py-1">
                     Log In
                   </Link>
                   <Link 
                     href="/signup"
                     className="px-4 py-2 rounded-lg bg-[#C0FF00] text-[#0D1B2A] font-semibold text-xs whitespace-nowrap"
                   >
                     Sign Up
                   </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <div className="absolute top-0 left-0 w-[300px] h-full bg-[#1A2332] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col border-r border-[#2E3A4F]">
              
              <div className="flex items-center justify-between p-6 border-b border-[#2E3A4F]">
                 <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                   <Shield className="size-7 text-[#C0FF00]" />
                   <span className="text-white font-bold text-lg">PhishGuard</span>
                 </Link>
                 <button 
                   onClick={() => setMobileMenuOpen(false)}
                   className="text-[#B8BCCF] hover:text-[#C0FF00] p-1 transition-colors"
                 >
                   <X className="size-6" />
                 </button>
              </div>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                  {user ? (
                    <>
                      <MobileNavItem 
                        label="Learn" 
                        href="/learn" 
                        icon={<Mail className="size-5" />} 
                      />
                      
                      <NavDropdown 
                        mobile
                        label="Simulations" 
                        icon={<Target className="size-5" />} 
                        isOpen={mobileDropdowns['simulations']}
                        onToggle={() => toggleMobileDropdown('simulations')}
                        onClose={() => {}}
                        items={simulationsItems}
                      />

                      <NavDropdown 
                        mobile
                        label="Compete" 
                        icon={<Trophy className="size-5" />} 
                        isOpen={mobileDropdowns['compete']}
                        onToggle={() => toggleMobileDropdown('compete')}
                        onClose={() => {}}
                        items={leaderboardItems}
                      />

<MobileNavItem 
                            label="Dashboard" 
                            href="/dashboard" 
                            icon={<BarChart3 className="size-5" />} 
                          />
                          <MobileNavItem 
                            label="Scan" 
                            href="/scan" 
                            icon={<ScanSearch className="size-5" />} 
                          />
                          <MobileNavItem 
                            label="AI Assistant" 
                            href="/ai-assistant" 
                            icon={<Bot className="size-5" />} 
                          />
                        <MobileNavItem 
                          label="Discussions" 
                          href="/discussions" 
                          icon={<Mail className="size-5" />} 
                        />
                          <MobileNavItem 
                            label="Team" 
                            href="/team" 
                            icon={<Users className="size-5" />} 
                          />
                        <MobileNavItem 
                          label="Contact" 
                          href="/contact" 
                          icon={<MessageSquare className="size-5" />} 
                        />
                      </>
                    ) : (
                      <>
                        <MobileNavItem 
                          label="About" 
                          href="/#features" 
                          icon={<Info className="size-5" />} 
                        />
                        <MobileNavItem 
                          label="Team" 
                          href="/team" 
                          icon={<Users className="size-5" />} 
                        />
                        <MobileNavItem 
                          label="Contact" 
                          href="/contact" 
                          icon={<MessageSquare className="size-5" />} 
                        />
                      </>
                    )}


                {user && (
                <MobileNavItem 
                  label="Profile Settings" 
                  href="/profile" 
                  icon={<Settings className="size-5" />} 
                />
              )}
            </div>

            <div className="p-6 border-t border-[#2E3A4F] grid gap-4">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg border border-[#FF4D4D] text-[#FF4D4D] font-medium hover:bg-[#FF4D4D]/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="flex items-center justify-center w-full px-6 py-3 rounded-lg border border-[#B8BCCF] text-white font-medium hover:border-[#C0FF00] hover:text-[#C0FF00] transition-all"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/signup"
                    className="flex items-center justify-center w-full px-6 py-3 rounded-lg bg-[#C0FF00] text-[#0D1B2A] font-semibold hover:shadow-[0_0_15px_rgba(192,255,0,0.3)] transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
