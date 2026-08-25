'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Determine visibility (e.g., check localStorage)
    // For this clone, we simulate an appearance delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // localStorage.setItem('cookie-consent', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 sm:p-6 md:p-8">
      <div 
        className="relative w-full max-w-[360px] overflow-hidden rounded-xl border border-[#2E3A4F] bg-[#1A2332] p-6 shadow-[0px_12px_24px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-5 fade-in duration-500"
        role="dialog"
        aria-labelledby="cookie-consent-text"
      >
        <p 
          id="cookie-consent-text" 
          className="mb-6 text-sm leading-relaxed text-white font-normal bg-transparent"
        >
          We use cookies to ensure you get the best user experience. For more information contact us.
        </p>
        
        <div className="flex items-center justify-between gap-4">
          <Link
            href="#"
            className="text-sm font-medium text-[#B8BCCF] underline decoration-[#B8BCCF] underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Read more
          </Link>
          
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-lg bg-[#C0FF00] px-6 py-2.5 text-sm font-bold text-[#0D1B2A] transition-transform hover:bg-[#b0e600] active:scale-95"
            aria-label="Dismiss cookie message"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}