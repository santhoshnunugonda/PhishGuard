import React from "react";
import Link from "next/link";
import { Check, AlertTriangle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-[#0D1B2A] overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A] via-[#0D1B2A] to-[#13233b] opacity-50" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          <div className="w-full lg:w-1/2 flex flex-col space-y-8 max-w-[600px] lg:max-w-none">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C0FF00]/10 border border-[#C0FF00]/30">
                <AlertTriangle className="w-4 h-4 text-[#C0FF00]" />
                <span className="text-[#C0FF00] text-sm font-medium">90% of data breaches start with phishing</span>
              </div>
              
              <h1 className="text-white font-bold text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] sm:leading-[1.15] lg:leading-[1.2] tracking-tight">
                Train your team to <span className="text-[#C0FF00]">spot phishing</span> before it strikes
              </h1>
              
              <p className="text-[#B8BCCF] text-lg sm:text-[18px] leading-[1.6] font-normal max-w-xl">
                Interactive phishing simulations with gamified learning. Build real-world awareness through hands-on scenarios that adapt to each user&apos;s skill level.
              </p>
            </div>

            <div className="max-w-[500px]">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  href="/simulations"
                  className="h-12 px-8 rounded-lg bg-[#C0FF00] text-[#0D1B2A] font-bold text-base hover:bg-[#b0e600] transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-[0px_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center"
                >
                  Try Simulations
                </Link>
                <Link
                  href="/learn"
                  className="h-12 px-8 rounded-lg border border-[#C0FF00] text-[#C0FF00] font-bold text-base hover:bg-[#C0FF00]/10 transition-all whitespace-nowrap flex items-center justify-center"
                >
                  Start Learning
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-[#B8BCCF] text-sm font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="bg-transparent rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#00D084] stroke-[3]" />
                  </div>
                  <span>Adaptive difficulty</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="bg-transparent rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#00D084] stroke-[3]" />
                  </div>
                  <span>Real-time analytics</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="bg-transparent rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#00D084] stroke-[3]" />
                  </div>
                  <span>Gamified training</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <div className="relative w-[340px] h-[400px] animate-[float_4s_ease-in-out_infinite]">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 340 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
              >
                <defs>
                  <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C0FF00" />
                    <stop offset="100%" stopColor="#88CC00" />
                  </linearGradient>
                  <linearGradient id="email-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1A2332" />
                    <stop offset="100%" stopColor="#2E3A4F" />
                  </linearGradient>
                  <linearGradient id="warning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF4D4D" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <g transform="translate(40, 60)">
                  <rect x="0" y="50" width="200" height="140" rx="12" fill="url(#email-gradient)" stroke="#3D4C63" strokeWidth="2" />
                  <path d="M0 70 L100 130 L200 70" stroke="#3D4C63" strokeWidth="2" fill="none" />
                  <rect x="20" y="100" width="120" height="8" rx="4" fill="#3D4C63" opacity="0.6" />
                  <rect x="20" y="120" width="80" height="8" rx="4" fill="#3D4C63" opacity="0.4" />
                  <rect x="20" y="140" width="100" height="8" rx="4" fill="#3D4C63" opacity="0.3" />
                  
                  <g transform="translate(140, 20)" filter="url(#glow)">
                    <circle cx="40" cy="40" r="40" fill="url(#warning-gradient)" opacity="0.2" />
                    <path d="M40 15 L65 60 L15 60 Z" fill="url(#warning-gradient)" />
                    <text x="40" y="52" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">!</text>
                  </g>
                </g>

                <g transform="translate(170, 200)" filter="url(#glow)">
                  <path d="M70 0 L140 40 L140 110 C140 140 105 165 70 180 C35 165 0 140 0 110 L0 40 L70 0 Z" 
                        fill="url(#shield-gradient)" />
                  <path d="M50 90 L65 105 L95 70" stroke="#0D1B2A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>

                <circle cx="50" cy="50" r="6" fill="#C0FF00" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="100" r="4" fill="#00D9FF" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="320" cy="300" r="5" fill="#C0FF00" opacity="0.4">
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="30" cy="350" r="3" fill="#FF4D4D" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 w-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute -bottom-16 -left-10 -right-10 h-40 border-t border-[#00D9FF]/30 rounded-[50%] scale-110"></div>
             <div className="absolute -bottom-20 -left-10 -right-10 h-40 border-t border-[#00D9FF]/20 rounded-[50%] scale-125"></div>
             <div className="absolute -bottom-24 -left-10 -right-10 h-40 border-t border-[#00D9FF]/10 rounded-[50%] scale-150"></div>
        </div>
      </div>
    </section>
  );
}
