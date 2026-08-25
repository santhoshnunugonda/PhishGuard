import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-server';
import HeaderNavigation from "@/components/sections/header-navigation";
import HeroSection from "@/components/sections/hero-section";
import FeaturesSection from "@/components/sections/features-section";
import LearningPathways from "@/components/sections/learning-pathways";
import TestimonialsSection from "@/components/sections/testimonials-section";
import Footer from "@/components/sections/footer";

async function HeaderWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <HeaderNavigation initialUser={user} />;
}

async function AuthenticatedLearningPathways() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return <LearningPathways />;
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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderWrapper />
      </Suspense>
      <main>
        <HeroSection />
        <FeaturesSection />
        <Suspense fallback={null}>
          <AuthenticatedLearningPathways />
        </Suspense>
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
