'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (submitError) {
        console.error('Error submitting contact form:', submitError);
        setError('Something went wrong. Please try again later.');
      } else {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-12 lg:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-[#B8BCCF] text-lg max-w-2xl mx-auto">
              Have questions about phishing awareness or need support? We're here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#C0FF00]/10 rounded-lg">
                      <Mail className="w-6 h-6 text-[#C0FF00]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Email Us</p>
                      <p className="text-[#B8BCCF]">support@phishguard.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#C0FF00]/10 rounded-lg">
                      <Phone className="w-6 h-6 text-[#C0FF00]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Call Us</p>
                      <p className="text-[#B8BCCF]">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#C0FF00]/10 rounded-lg">
                      <MapPin className="w-6 h-6 text-[#C0FF00]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Our Office</p>
                      <p className="text-[#B8BCCF]">123 Cyber Way, San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1A2332] to-[#0D1B2A] rounded-2xl border border-[#C0FF00]/20 p-8">
                <h4 className="text-xl font-bold text-white mb-4">Why Contact Us?</h4>
                <ul className="space-y-3 text-[#B8BCCF]">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C0FF00]" />
                    Enterprise training solutions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C0FF00]" />
                    Custom simulation requests
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C0FF00]" />
                    Platform technical support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C0FF00]" />
                    Security partnership inquiries
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#1A2332] rounded-2xl border border-[#2E3A4F] p-8 shadow-xl">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[#00D084]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-[#00D084]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-[#B8BCCF] mb-8">
                    Thank you for reaching out. Our team will get back to you within 24-48 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#B8BCCF] mb-2">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white focus:outline-none focus:border-[#C0FF00] transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#B8BCCF] mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white focus:outline-none focus:border-[#C0FF00] transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#B8BCCF] mb-2">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white focus:outline-none focus:border-[#C0FF00] transition-all"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#B8BCCF] mb-2">Message</label>
                    <textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-[#0D1B2A] border border-[#2E3A4F] rounded-lg text-white focus:outline-none focus:border-[#C0FF00] transition-all resize-none"
                      placeholder="Your message here..."
                    ></textarea>
                  </div>
                  {error && (
                    <p className="text-[#FF4D4D] text-sm bg-[#FF4D4D]/10 p-3 rounded-lg border border-[#FF4D4D]/30">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,255,0,0.2)]"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
