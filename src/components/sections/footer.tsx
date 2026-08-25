import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0D1B2A] border-t border-[#2E3A4F] py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="size-8 text-[#C0FF00]" />
              <span className="text-white font-bold text-xl">PhishGuard</span>
            </Link>
            <p className="text-[#B8BCCF] text-sm leading-relaxed">
              Train your team to recognize phishing attacks with interactive simulations and gamified learning.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Training</h3>
            <ul className="space-y-3">
              <li><Link href="/learn" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Learn</Link></li>
              <li><Link href="/simulations" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Simulations</Link></li>
              <li><Link href="/dashboard" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Dashboard</Link></li>
              <li><Link href="/leaderboard" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/threats" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Threat Library</Link></li>
                <li><Link href="/learn" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Video Tutorials</Link></li>
                <li><Link href="/contact" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Log In</Link></li>
              <li><Link href="/signup" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">Sign Up</Link></li>
              <li><Link href="/dashboard" className="text-[#B8BCCF] hover:text-[#C0FF00] text-sm transition-colors">My Progress</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#2E3A4F] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#B8BCCF] text-sm">
            © 2025 PhishGuard. All rights reserved.
          </p>
          <p className="text-[#B8BCCF] text-sm">
            Built by R Mithil Reddy, N Santhosh, CH Ram Surya
          </p>
        </div>
      </div>
    </footer>
  );
}
