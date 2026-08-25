'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CISO",
    company: "TechFlow Inc.",
    content: "PhishGuard reduced our click-through rate by 73% in just 3 months. The gamified approach keeps our employees engaged, and the real-time analytics help us identify high-risk users before incidents occur.",
    avatar: "SC",
  },
  {
    name: "Marcus Williams",
    role: "IT Security Manager",
    company: "Global Finance Corp",
    content: "The adaptive difficulty is a game-changer. New employees get beginner scenarios while our security team faces advanced spear phishing simulations. Everyone learns at their level.",
    avatar: "MW",
  },
  {
    name: "Jennifer Park",
    role: "HR Director",
    company: "HealthCare Plus",
    content: "Compliance reporting used to take days. With PhishGuard, I generate audit-ready reports in minutes. Our HIPAA training completion rate went from 67% to 98%.",
    avatar: "JP",
  },
  {
    name: "David Rodriguez",
    role: "Security Analyst",
    company: "RetailMax",
    content: "The explainable feedback after each scenario is brilliant. Users don't just learn they failed—they understand exactly why and how to spot similar attacks in the future.",
    avatar: "DR",
  },
  {
    name: "Emily Thompson",
    role: "Training Coordinator",
    company: "EduTech Solutions",
    content: "Our employees actually look forward to phishing training now. The leaderboards and badges created healthy competition between departments. Engagement is through the roof.",
    avatar: "ET",
  },
  {
    name: "Michael Chang",
    role: "VP of Operations",
    company: "Manufacturing Co",
    content: "After deploying PhishGuard, we blocked 3 real BEC attacks in the first month because employees recognized the patterns. The ROI speaks for itself.",
    avatar: "MC",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const visibleCount = 3;
  const maxIndex = testimonials.length - visibleCount;

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section className="bg-[#F8FAFC] py-20 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-[#1A2332] text-3xl md:text-4xl font-bold mb-4">
              Trusted by security teams worldwide
            </h2>
            <p className="text-[#64748B] text-lg max-w-2xl">
              See how organizations are transforming their security culture with PhishGuard
            </p>
          </div>
          
          <div className="flex gap-3 mt-6 md:mt-0">
            <button
              onClick={goToPrev}
              className="p-3 rounded-full bg-white border border-[#E2E8F0] hover:border-[#C0FF00] hover:bg-[#C0FF00]/10 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-[#1A2332]" />
            </button>
            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-white border border-[#E2E8F0] hover:border-[#C0FF00] hover:bg-[#C0FF00]/10 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-[#1A2332]" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div 
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleCount + 2)}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <div className="h-full p-8 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#C0FF00] hover:shadow-lg transition-all duration-300">
                  <Quote className="w-10 h-10 text-[#C0FF00] mb-6" />
                  
                  <p className="text-[#475569] text-base leading-relaxed mb-8">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0D1B2A] flex items-center justify-center text-[#C0FF00] font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-[#1A2332] font-semibold">{testimonial.name}</h4>
                      <p className="text-[#64748B] text-sm">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-[#C0FF00]' : 'bg-[#D1D5DB] hover:bg-[#9CA3AF]'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
