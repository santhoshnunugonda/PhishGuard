import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { Mail, MessageSquare, QrCode, Briefcase, Phone, Wifi, AlertTriangle, ChevronRight, Shield } from "lucide-react";

const threatTypes = [
  {
    icon: Mail,
    title: "Email Phishing",
    description: "Fraudulent emails impersonating trusted entities to steal credentials or spread malware.",
    examples: ["Credential harvesting", "Malware attachments", "Invoice fraud", "Account verification scams"],
    severity: "High",
    frequency: "Very Common",
    color: "#FF4D4D",
  },
  {
    icon: Briefcase,
    title: "Business Email Compromise (BEC)",
    description: "Targeted attacks impersonating executives or vendors to redirect payments.",
    examples: ["CEO fraud", "Wire transfer scams", "Vendor impersonation", "Payment redirect"],
    severity: "Critical",
    frequency: "Common",
    color: "#FF8C00",
  },
  {
    icon: MessageSquare,
    title: "SMS Phishing (Smishing)",
    description: "Text message attacks using urgency to trick victims into clicking malicious links.",
    examples: ["Delivery notifications", "Bank alerts", "OTP hijacking", "Prize scams"],
    severity: "High",
    frequency: "Growing",
    color: "#FFB800",
  },
  {
    icon: Phone,
    title: "Voice Phishing (Vishing)",
    description: "Phone-based social engineering attacks impersonating support or authorities.",
    examples: ["Tech support scams", "IRS impersonation", "Bank fraud calls", "Warranty scams"],
    severity: "Medium",
    frequency: "Common",
    color: "#00D9FF",
  },
  {
    icon: QrCode,
    title: "QR Code Phishing (Quishing)",
    description: "Malicious QR codes that redirect to credential theft or malware sites.",
    examples: ["Parking meter stickers", "Fake invoices", "Email QR codes", "Physical posters"],
    severity: "Medium",
    frequency: "Emerging",
    color: "#C0FF00",
  },
  {
    icon: Wifi,
    title: "Spear Phishing",
    description: "Highly targeted attacks using personal information for convincing impersonation.",
    examples: ["Personalized emails", "LinkedIn attacks", "Industry-specific scams", "Executive targeting"],
    severity: "Critical",
    frequency: "Targeted",
    color: "#FF4D4D",
  },
];

const recentThreats = [
  { title: "New Microsoft 365 Credential Phishing Campaign", date: "Dec 9, 2024", severity: "High" },
  { title: "Tax Season IRS Impersonation Surge", date: "Dec 8, 2024", severity: "Critical" },
  { title: "AI-Generated Voice Clone Scams Increasing", date: "Dec 7, 2024", severity: "High" },
  { title: "QR Code Payment Scams at Gas Stations", date: "Dec 6, 2024", severity: "Medium" },
];

export default function ThreatsPage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Threat Library</h1>
            <p className="text-[#B8BCCF]">Learn about different types of phishing attacks and how to recognize them</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {threatTypes.map((threat) => (
              <div key={threat.title} className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6 hover:border-[#C0FF00]/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${threat.color}20` }}>
                    <threat.icon className="w-6 h-6" style={{ color: threat.color }} />
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${threat.color}20`, color: threat.color }}>
                      {threat.severity}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#C0FF00] transition-colors">{threat.title}</h3>
                <p className="text-[#B8BCCF] text-sm mb-4">{threat.description}</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-white">Common Examples:</p>
                  <ul className="space-y-1">
                    {threat.examples.map((example, i) => (
                      <li key={i} className="text-xs text-[#B8BCCF] flex items-center gap-2">
                        <span style={{ color: threat.color }}>•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#2E3A4F] flex items-center justify-between">
                  <span className="text-xs text-[#B8BCCF]">Frequency: {threat.frequency}</span>
                  <Link href="/simulations" className="text-[#C0FF00] text-xs font-medium flex items-center gap-1 hover:underline">
                    Practice <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#FF4D4D]" />
                  Recent Threat Alerts
                </h2>
                <div className="space-y-4">
                  {recentThreats.map((threat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#0D1B2A] rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{threat.title}</h4>
                        <p className="text-[#B8BCCF] text-sm">{threat.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        threat.severity === 'Critical' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D]' :
                        threat.severity === 'High' ? 'bg-[#FF8C00]/10 text-[#FF8C00]' :
                        'bg-[#FFB800]/10 text-[#FFB800]'
                      }`}>
                        {threat.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#C0FF00]" />
                Protection Tips
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-[#C0FF00] font-bold">1.</span>
                  <p className="text-[#B8BCCF] text-sm">Always verify sender email addresses and domains before clicking links</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C0FF00] font-bold">2.</span>
                  <p className="text-[#B8BCCF] text-sm">Hover over links to preview URLs before clicking</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C0FF00] font-bold">3.</span>
                  <p className="text-[#B8BCCF] text-sm">Be suspicious of urgent requests for money or credentials</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C0FF00] font-bold">4.</span>
                  <p className="text-[#B8BCCF] text-sm">Verify unexpected requests through known contact methods</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#C0FF00] font-bold">5.</span>
                  <p className="text-[#B8BCCF] text-sm">Report suspicious emails to your security team</p>
                </li>
              </ul>
              
              <Link 
                href="/simulations" 
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
              >
                Practice Identifying Threats
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
