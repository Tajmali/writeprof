"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Lock, Bell, Upload, Save, Eye, EyeOff,
  Loader2, CheckCircle, Moon, Sun, Globe
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: Globe },
];

export default function ClientSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState({
    orderUpdates: true, messages: true, payments: true,
    marketing: false, emailDigest: true,
  });

  const { data } = useQuery({
    queryKey: ["client-settings"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      return json.data;
    },
  });

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (data?.user) {
      profileForm.reset({ name: data.user.name || "", phone: data.user.phone || "" });
      setAvatarUrl(data.user.avatar || "");
    }
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileForm & { avatar?: string }) => {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast.success("Profile updated!");
      if (data?.user) setUser(data.user);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (values: PasswordForm) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      passwordForm.reset();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setAvatarUrl(json.data.secure_url);
      toast.success("Photo uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {/* Tab Nav */}
        <div className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="sm:col-span-3">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Avatar */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4">Profile Photo</h3>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-brand-500/20 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-brand-400">{data?.user?.name?.[0] || "C"}</span>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                    <p className="text-xs text-gray-500 mt-1.5">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(v => updateProfileMutation.mutate({ ...v, avatar: avatarUrl }))}
                className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-white">Personal Information</h3>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                  <input {...profileForm.register("name")} className="input-field w-full" />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-red-400 mt-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                  <input value={data?.user?.email || ""} disabled className="input-field w-full opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Phone Number</label>
                  <input {...profileForm.register("phone")} className="input-field w-full" placeholder="+234..." />
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                    data?.user?.emailVerified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {data?.user?.emailVerified ? "Email Verified" : "Email Not Verified"}
                  </div>
                </div>
                <button type="submit" disabled={updateProfileMutation.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <form onSubmit={passwordForm.handleSubmit(v => updatePasswordMutation.mutate(v))}
                className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-white">Change Password</h3>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Current Password</label>
                  <div className="relative">
                    <input {...passwordForm.register("currentPassword")}
                      type={showCurrentPw ? "text" : "password"} className="input-field w-full pr-10" />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-red-400 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">New Password</label>
                  <div className="relative">
                    <input {...passwordForm.register("newPassword")}
                      type={showNewPw ? "text" : "password"} className="input-field w-full pr-10" />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-400 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Confirm New Password</label>
                  <input {...passwordForm.register("confirmPassword")} type="password" className="input-field w-full" />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <button type="submit" disabled={updatePasswordMutation.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {updatePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
              </form>

              {/* Referral Code */}
              <div className="glass-card p-5 mt-5">
                <h3 className="font-semibold text-white mb-3">Referral Code</h3>
                <p className="text-sm text-gray-400 mb-3">Share your referral code and earn rewards when friends sign up</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 font-mono text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-2.5 text-center font-bold tracking-widest">
                    {data?.user?.referralCode || "LOADING..."}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data?.user?.referralCode || "");
                      toast.success("Copied!");
                    }}
                    className="btn-secondary px-4 py-2.5"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-white">Notification Preferences</h3>
                {[
                  { key: "orderUpdates", label: "Order Updates", desc: "Status changes, assignments, completions" },
                  { key: "messages", label: "New Messages", desc: "When writers send you messages" },
                  { key: "payments", label: "Payment Alerts", desc: "Successful payments and refunds" },
                  { key: "marketing", label: "Promotions & Offers", desc: "Special deals and promo codes" },
                  { key: "emailDigest", label: "Weekly Email Digest", desc: "Summary of your activity" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? "bg-brand-500" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
                <button onClick={() => toast.success("Preferences saved!")}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "preferences" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-white">Display Preferences</h3>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Theme</label>
                  <div className="flex gap-2">
                    {[
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "light", label: "Light", icon: Sun },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                          theme === t.id ? "border-brand-500/50 bg-brand-500/10 text-brand-400" : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Language</label>
                  <select className="input-field w-full">
                    <option value="en">English (US)</option>
                    <option value="en-gb">English (UK)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Currency Display</label>
                  <select className="input-field w-full" defaultValue="USD">
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <button onClick={() => toast.success("Preferences saved!")}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
