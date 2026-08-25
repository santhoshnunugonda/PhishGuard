import { Mail, Target, Trophy, Brain, BarChart3, Shield } from "lucide-react";

const features = [
  {
    title: "Real Phishing Simulations",
    description: "Practice with realistic email, SMS, and QR code phishing scenarios",
    icon: Mail,
  },
  {
    title: "Adaptive Difficulty",
    description: "Training that adjusts to each user's skill level automatically",
    icon: Target,
  },
  {
    title: "Gamified Learning",
    description: "Earn points, badges, and compete on leaderboards",
    icon: Trophy,
  },
  {
    title: "Spaced Repetition",
    description: "Reinforcement scheduling for long-term skill retention",
    icon: Brain,
  },
  {
    title: "Risk Analytics",
    description: "Track individual and team vulnerability scores in real-time",
    icon: BarChart3,
  },
  {
    title: "Compliance Ready",
    description: "Audit reports and certificates for regulatory requirements",
    icon: Shield,
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full bg-white py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <h2 className="text-[#1A2332] text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-[1.2] tracking-tight max-w-4xl">
            Comprehensive phishing awareness training
          </h2>
          
          <div className="w-24 h-1.5 bg-[#C0FF00] rounded-full mt-6 mb-8"></div>
          
          <p className="text-[#52525B] text-lg md:text-[1.125rem] leading-[1.6] max-w-[54rem] mx-auto font-normal">
            Build lasting security awareness with interactive simulations, real-time feedback, and behavioral tracking. PhishGuard transforms your workforce into your strongest defense against social engineering attacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#C0FF00] hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#0D1B2A] flex items-center justify-center mb-6 group-hover:bg-[#C0FF00] transition-colors duration-300">
                  <Icon className="w-7 h-7 text-[#C0FF00] group-hover:text-[#0D1B2A] transition-colors duration-300" />
                </div>
                <h3 className="text-[#0D1B2A] font-bold text-xl mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#64748B] text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
