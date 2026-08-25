import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-server';
import { TeamSection } from "@/components/ui/team-section";
import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";

async function HeaderWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <HeaderNavigation initialUser={user} />;
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 bg-[#1A2332] shadow-[0_4px_12px_rgba(0,0,0,0.25)] h-[80px]">
      <div className="max-w-[1400px] h-full mx-auto px-4 lg:px-10 flex items-center justify-between">
        <div className="w-32 h-8 bg-gray-700 animate-pulse rounded" />
        <div className="hidden lg:flex gap-4">
          <div className="w-20 h-4 bg-gray-700 animate-pulse rounded" />
          <div className="w-20 h-4 bg-gray-700 animate-pulse rounded" />
          <div className="w-20 h-4 bg-gray-700 animate-pulse rounded" />
        </div>
        <div className="w-24 h-10 bg-gray-700 animate-pulse rounded" />
      </div>
    </header>
  );
}

const teamMembers = [
  {
    name: "R Mithil Reddy",
    designation: "Lead Security Researcher",
    imageSrc: "/team/mithil.jpg",
  },
  {
    name: "N Santhosh",
    designation: "Frontend Architect",
    imageSrc: "/team/santhosh.jpeg",
  },
  {
    name: "CH Ram Surya",
    designation: "Backend Developer",
    imageSrc: "/team/ramsurya.png",
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderWrapper />
      </Suspense>
      <main className="pt-20">
        <TeamSection
          title="DEVELOPER TEAM"
          description="Meet the talented individuals behind PhishGuard. Our mission is to empower everyone with the knowledge to stay safe in the digital world. Our team combines expertise in cybersecurity, design, and education to build the best phishing awareness platform."
          members={teamMembers}
          registerLink="/signup"
          logo={<span className="text-primary font-bold">PHISHGUARD</span>}
        />
      </main>
      <Footer />
    </div>
  );
}
