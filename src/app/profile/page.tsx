'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { User, Camera, Lock, Calendar, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  date_of_birth: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setDateOfBirth(profileData.date_of_birth || '');
          setAvatarUrl(profileData.avatar_url);
        }
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingAvatar(true);
    setMessage(null);

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id);

    if (updateError) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } else {
      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    }

    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    }

    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setChangingPassword(true);
    setPasswordMessage(null);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C0FF00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-[#B8BCCF]">Manage your account information and preferences</p>
          </div>

          <div className="space-y-8">
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
              <h2 className="text-xl font-bold text-white mb-6">Profile Picture</h2>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-[#2E3A4F] flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl} 
                        alt="Profile" 
                        width={96} 
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-[#B8BCCF]" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 p-2 bg-[#C0FF00] rounded-full hover:bg-[#b0e600] transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 text-[#0D1B2A] animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-[#0D1B2A]" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-white font-medium">Upload a new photo</p>
                  <p className="text-sm text-[#B8BCCF]">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
              <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
              
              {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-[#00D084]/10 border border-[#00D084]/50 text-[#00D084]' 
                    : 'bg-red-500/10 border border-red-500/50 text-red-400'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {message.text}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full h-12 px-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-[#B8BCCF] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#B8BCCF] mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8BCCF]" />
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-white placeholder-[#B8BCCF] focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-white mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8BCCF]" />
                    <input
                      type="date"
                      id="dob"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-white focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-6">
              <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
              
              {passwordMessage && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                  passwordMessage.type === 'success' 
                    ? 'bg-[#00D084]/10 border border-[#00D084]/50 text-[#00D084]' 
                    : 'bg-red-500/10 border border-red-500/50 text-red-400'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {passwordMessage.text}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-white mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8BCCF]" />
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-white placeholder-[#B8BCCF] focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8BCCF]" />
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-white placeholder-[#B8BCCF] focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8BCCF]" />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full h-12 pl-10 pr-4 rounded-lg bg-[#0D1B2A] border border-[#2E3A4F] text-white placeholder-[#B8BCCF] focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2E3A4F] text-white font-bold rounded-lg hover:bg-[#3E4A5F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
