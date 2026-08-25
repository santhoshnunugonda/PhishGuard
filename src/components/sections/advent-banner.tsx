'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { X, Shield, Zap } from 'lucide-react';

const ParticleEffect = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = canvas.parentElement?.clientHeight || 110;

        canvas.width = width;
        canvas.height = height;

        const particles: { x: number; y: number; radius: number; speed: number; opacity: number; color: string }[] = [];
        const particleCount = Math.floor(width / 20);

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? '#C0FF00' : '#00D9FF',
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba').replace('#C0FF00', 'rgba(192, 255, 0').replace('#00D9FF', 'rgba(0, 217, 255');
                ctx.fill();

                p.y -= p.speed;
                p.x += Math.sin(p.y * 0.01) * 0.3;
                if (p.y < -5) {
                    p.y = height + 5;
                    p.x = Math.random() * width;
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
             width = window.innerWidth;
             height = canvas.parentElement?.clientHeight || 110;
             canvas.width = width;
             canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            aria-hidden="true"
        />
    );
};

const StatsCounter = () => {
    const [count, setCount] = useState(0);
    const targetCount = 94;

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = targetCount / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetCount) {
                setCount(targetCount);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-3" data-testid="stats-counter">
            <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold text-[#C0FF00] font-mono">{count}%</span>
                <span className="text-[10px] uppercase font-medium text-blue-200/80 leading-tight">of breaches</span>
            </div>
            <div className="text-blue-200/60 text-sm max-w-[140px] leading-tight">
                start with phishing attacks
            </div>
        </div>
    );
};

export default function AdventBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div 
            role="region" 
            aria-label="Security Awareness Promotion" 
            className="relative w-full bg-[#1E3A8A] overflow-hidden border-b border-[#2E3A4F]"
            style={{
                background: 'linear-gradient(269.83deg, #0D1B2A 0%, #1A2332 50%, #0D1B2A 100%)',
            }}
        >
            <ParticleEffect />
            
            <div className="absolute left-[-100px] top-[-50px] w-[300px] h-[200px] bg-[#C0FF00] opacity-10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute right-[-50px] bottom-[-50px] w-[400px] h-[200px] bg-[#00D9FF] opacity-10 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 h-auto min-h-[80px]">
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                    <div className="relative flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-[#C0FF00]/20 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 md:w-7 md:h-7 text-[#C0FF00]" />
                        <Zap className="w-3 h-3 text-[#C0FF00] absolute -top-1 -right-1" />
                    </div>
                    <div className="flex flex-col text-center md:text-left">
                        <h2 className="text-white font-bold text-lg md:text-xl leading-tight tracking-tight">
                            Security Awareness Month
                        </h2>
                        <p className="text-[#B8BCCF] text-xs md:text-sm font-medium mt-0.5 leading-snug max-w-[300px] md:max-w-none">
                            Get 30% off annual plans - Train your team today
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8">
                    <StatsCounter />
                    
                    <Link 
                        href="/signup" 
                        className="group relative inline-flex items-center justify-center bg-[#C0FF00] hover:bg-[#b0eb00] text-[#0D1B2A] font-bold text-sm px-6 py-2.5 rounded-md transition-all duration-200 transform hover:scale-105 shadow-lg"
                        aria-label="Start free trial"
                    >
                        <span>Start Free Trial</span>
                    </Link>
                </div>

                <button 
                    onClick={() => setIsVisible(false)}
                    aria-label="Close banner"
                    className="absolute top-2 right-2 md:top-1/2 md:-translate-y-1/2 md:right-4 p-1.5 text-blue-200/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
