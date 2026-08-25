import Link from "next/link";
import { Building2, GraduationCap, Users, BarChart3, Shield, Award } from "lucide-react";

export default function EnterpriseSection() {
  return (
    <section className="bg-[#0D1B2A] py-20 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col overflow-hidden rounded-2xl bg-[#1A2332] border border-[#2E3A4F] shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] hover:border-[#C0FF00]/50 group">
            <div className="p-8 pb-0 md:p-10 md:pb-0 flex-1 flex flex-col items-start">
              <div className="mb-4 h-1 w-12 bg-[#C0FF00] rounded-full"></div>
              <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">
                For Enterprise
              </h2>
              <p className="mb-6 text-lg text-[#B8BCCF] leading-relaxed">
                Deploy organization-wide phishing simulations, track employee risk scores, and generate compliance reports. PhishGuard scales with your security awareness program.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 w-full">
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <Users className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Unlimited users</span>
                </div>
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <BarChart3 className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Risk analytics</span>
                </div>
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <Shield className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Custom campaigns</span>
                </div>
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <Award className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Compliance reports</span>
                </div>
              </div>
              
              <Link
                href="/business"
                className="inline-flex items-center justify-center rounded-lg bg-[#C0FF00] px-8 py-3.5 text-base font-bold text-[#0D1B2A] transition-transform hover:scale-105 hover:bg-[#b2ed00] focus:outline-none focus:ring-2 focus:ring-[#C0FF00] focus:ring-offset-2 focus:ring-offset-[#1A2332]"
              >
                Request Demo
              </Link>
            </div>
            <div className="relative mt-auto w-full px-8 md:px-10 py-8 md:py-10">
              <div className="relative w-full overflow-hidden rounded-lg bg-[#0D1B2A] p-6 border border-[#2E3A4F]">
                <div className="flex items-center gap-4 mb-4">
                  <Building2 className="w-8 h-8 text-[#C0FF00]" />
                  <div>
                    <div className="text-white font-semibold">Enterprise Dashboard</div>
                    <div className="text-[#B8BCCF] text-sm">Real-time security metrics</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#1A2332] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#C0FF00]">73%</div>
                    <div className="text-xs text-[#B8BCCF]">Risk Reduction</div>
                  </div>
                  <div className="bg-[#1A2332] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#00D084]">98%</div>
                    <div className="text-xs text-[#B8BCCF]">Completion</div>
                  </div>
                  <div className="bg-[#1A2332] rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#00D9FF]">2.4k</div>
                    <div className="text-xs text-[#B8BCCF]">Active Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-2xl bg-[#1A2332] border border-[#2E3A4F] shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] hover:border-[#C0FF00]/50 group">
            <div className="p-8 pb-0 md:p-10 md:pb-0 flex-1 flex flex-col items-start">
              <div className="mb-4 h-1 w-12 bg-[#C0FF00] rounded-full"></div>
              <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">
                For Education
              </h2>
              <p className="mb-6 text-lg text-[#B8BCCF] leading-relaxed">
                Prepare students for real-world cybersecurity careers. Create classrooms, assign learning paths, and track progress with our education platform.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 w-full">
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <Users className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Classroom management</span>
                </div>
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <BarChart3 className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Progress tracking</span>
                </div>
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <Shield className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Hands-on labs</span>
                </div>
                <div className="flex items-center gap-3 text-[#B8BCCF]">
                  <Award className="w-5 h-5 text-[#C0FF00]" />
                  <span className="text-sm">Certificates</span>
                </div>
              </div>
              
              <Link
                href="/education"
                className="inline-flex items-center justify-center rounded-lg bg-[#C0FF00] px-8 py-3.5 text-base font-bold text-[#0D1B2A] transition-transform hover:scale-105 hover:bg-[#b2ed00] focus:outline-none focus:ring-2 focus:ring-[#C0FF00] focus:ring-offset-2 focus:ring-offset-[#1A2332]"
              >
                Get Started Free
              </Link>
            </div>
            <div className="relative mt-auto w-full px-8 md:px-10 py-8 md:py-10">
              <div className="relative w-full overflow-hidden rounded-lg bg-[#0D1B2A] p-6 border border-[#2E3A4F]">
                <div className="flex items-center gap-4 mb-4">
                  <GraduationCap className="w-8 h-8 text-[#C0FF00]" />
                  <div>
                    <div className="text-white font-semibold">Student Progress</div>
                    <div className="text-[#B8BCCF] text-sm">Cybersecurity 101 Class</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#B8BCCF]">Phishing Fundamentals</span>
                      <span className="text-[#C0FF00]">92%</span>
                    </div>
                    <div className="h-2 bg-[#1A2332] rounded-full">
                      <div className="h-2 bg-[#C0FF00] rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#B8BCCF]">Email Analysis</span>
                      <span className="text-[#00D084]">78%</span>
                    </div>
                    <div className="h-2 bg-[#1A2332] rounded-full">
                      <div className="h-2 bg-[#00D084] rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#B8BCCF]">Social Engineering</span>
                      <span className="text-[#00D9FF]">65%</span>
                    </div>
                    <div className="h-2 bg-[#1A2332] rounded-full">
                      <div className="h-2 bg-[#00D9FF] rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
