import Link from 'next/link';
import { ArrowRight, Clock, Users, Star } from 'lucide-react';

const courses = [
  { 
    title: "Phishing Fundamentals", 
    duration: "2 hours",
    level: "Beginner",
    enrolled: "12.4k",
    color: "from-green-500 to-emerald-600"
  },
  { 
    title: "Email Header Analysis", 
    duration: "1.5 hours",
    level: "Beginner",
    enrolled: "8.2k",
    color: "from-blue-500 to-cyan-600"
  },
  { 
    title: "Spear Phishing Detection", 
    duration: "3 hours",
    level: "Intermediate",
    enrolled: "6.8k",
    color: "from-purple-500 to-violet-600"
  },
  { 
    title: "CEO Fraud & BEC Attacks", 
    duration: "2.5 hours",
    level: "Intermediate",
    enrolled: "5.4k",
    color: "from-orange-500 to-red-600"
  },
  { 
    title: "SMS Phishing (Smishing)", 
    duration: "1.5 hours",
    level: "Beginner",
    enrolled: "9.1k",
    color: "from-pink-500 to-rose-600"
  },
  { 
    title: "QR Code Phishing (Quishing)", 
    duration: "1 hour",
    level: "Beginner",
    enrolled: "4.3k",
    color: "from-teal-500 to-cyan-600"
  },
  { 
    title: "Social Engineering Psychology", 
    duration: "2 hours",
    level: "Intermediate",
    enrolled: "7.2k",
    color: "from-indigo-500 to-purple-600"
  },
  { 
    title: "Malware & Attachments", 
    duration: "2 hours",
    level: "Intermediate",
    enrolled: "5.9k",
    color: "from-red-500 to-orange-600"
  },
  { 
    title: "URL Analysis & Link Safety", 
    duration: "1.5 hours",
    level: "Beginner",
    enrolled: "11.2k",
    color: "from-amber-500 to-yellow-600"
  },
  { 
    title: "Credential Harvesting Defense", 
    duration: "2 hours",
    level: "Intermediate",
    enrolled: "6.1k",
    color: "from-lime-500 to-green-600"
  },
  { 
    title: "Advanced Threat Detection", 
    duration: "4 hours",
    level: "Advanced",
    enrolled: "3.2k",
    color: "from-slate-500 to-zinc-600"
  },
  { 
    title: "MFA Fatigue Attacks", 
    duration: "1.5 hours",
    level: "Advanced",
    enrolled: "2.8k",
    color: "from-fuchsia-500 to-pink-600"
  },
  { 
    title: "Vendor Impersonation", 
    duration: "2 hours",
    level: "Intermediate",
    enrolled: "4.7k",
    color: "from-sky-500 to-blue-600"
  },
  { 
    title: "Deepfake & AI Threats", 
    duration: "2.5 hours",
    level: "Advanced",
    enrolled: "2.1k",
    color: "from-violet-500 to-purple-600"
  },
  { 
    title: "Incident Response Basics", 
    duration: "3 hours",
    level: "Intermediate",
    enrolled: "5.5k",
    color: "from-emerald-500 to-teal-600"
  },
  { 
    title: "Security Awareness Champion", 
    duration: "6 hours",
    level: "Advanced",
    enrolled: "1.9k",
    color: "from-yellow-500 to-amber-600"
  },
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner': return 'bg-green-500/20 text-green-400';
    case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
    case 'Advanced': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export default function LearningPathways() {
  return (
    <section className="bg-[#0D1B2A] py-20 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl font-bold md:text-4xl">Phishing Training Pathways</h2>
          <p className="mt-4 text-lg text-[#B8BCCF]">
            Structured learning paths from beginner awareness to advanced threat detection
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course, index) => (
            <Link 
              href="/learn"
              key={index} 
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#2E3A4F] bg-[#1A2332] transition-all duration-300 hover:-translate-y-1 hover:border-[#C0FF00] hover:shadow-lg hover:shadow-[#C0FF00]/10"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${course.color}`} />
              
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 text-[#B8BCCF] text-xs">
                    <Star className="w-3 h-3 fill-[#C0FF00] text-[#C0FF00]" />
                    <span>4.8</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold leading-tight text-white group-hover:text-[#C0FF00] transition-colors mb-4">
                  {course.title}
                </h3>
                
                <div className="mt-auto flex items-center justify-between text-sm text-[#B8BCCF]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{course.enrolled}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#2E3A4F] flex items-center text-sm font-medium text-[#B8BCCF] group-hover:text-[#C0FF00] transition-colors">
                  <span>Start Learning</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}