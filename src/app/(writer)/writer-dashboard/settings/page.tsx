"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Lock, Bell, FileText, Upload, Save, Eye, EyeOff,
  CheckCircle, Loader2, Globe, BookOpen, Award
} from "lucide-react";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  specialization: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  languages: z.string().optional(),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
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
];

const SPECIALIZATIONS = [
  "Academic Writing", "Creative Writing", "Technical Writing", "Business Writing",
  "Research Papers", "Essay Writing", "Content Writing", "Copywriting",
  "Thesis & Dissertations", "SEO Writing",
];

export default function WriterSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notifications, setNotifications] = useState({
    newOrders: true, orderUpdates: true, messages: true,
    payments: true, reviews: true, emailDigest: false,
  });

  const { data } = useQuery({
    queryKey: ["writer-settings"],
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
      profileForm.reset({
        name: data.user.name || "",
        bio: data.writerProfile?.bio || "",
        specialization: data.writerProfile?.specialization || "",
        education: data.writerProfile?.education || "",
        experience: data.writerProfile?.experience?.toString() || "",
        languages: data.writerProfile?.languages?.join(", ") || "",
        portfolioUrl: data.writerProfile?.portfolioUrl || "",
      });
      setAvatarUrl(data.user.avatar || "");
    }
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileForm) => {
      const res = await fetch("/api/writers/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          avatar: avatarUrl,
          languages: values.languages?.split(",").map(l => l.trim()).filter(Boolean),
          experience: values.experience ? parseInt(values.experience) : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => toast.success("Profile updated successfully!"),
    onError: (err: Error) => toast.error(err.message || "Failed to update profile"),
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
    onError: (err: Error) => toast.error(err.message || "Failed to change password"),
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
      toast.success("Avatar uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your writer profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {/* Tab nav */}
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

        {/* Tab Content */}
        <div className="sm:col-span-3">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              {/* Avatar */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4">Profile Photo</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-500/20 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-brand-400">
                          {data?.user?.name?.[0] || "W"}
                        </span>
                      )}
                    </div>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={profileForm.handleSubmit(v => updateProfileMutation.mutate(v))} className="space-y-5">
                <div className="glass-card p-5 space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-400" /> Personal Info
                  </h3>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                    <input {...profileForm.register("name")} className="input-field w-full" />
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-red-400 mt-1">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Bio</label>
                    <textarea {...profileForm.register("bio")} rows={4} className="input-field w-full resize-none"
                      placeholder="Tell clients about yourself, your expertise, and writing style..." />
                    <p className="text-xs text-gray-500 mt-1">
                      {profileForm.watch("bio")?.length || 0}/500 characters
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-400" /> Professional Details
                  </h3>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Specialization</label>
                    <select {...profileForm.register("specialization")} className="input-field w-full">
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Education</label>
                      <input {...profileForm.register("education")} className="input-field w-full"
                        placeholder="e.g., B.Sc. English Language" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Years of Experience</label>
                      <input {...profileForm.register("experience")} type="number" min="0" max="50"
                        className="input-field w-full" placeholder="e.g., 3" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Languages (comma-separated)</label>
                    <input {...profileForm.register("languages")} className="input-field w-full"
                      placeholder="e.g., English, French, Spanish" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Portfolio URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...profileForm.register("portfolioUrl")} className="input-field w-full pl-9"
                        placeholder="https://yourportfolio.com" />
                    </div>
                    {profileForm.formState.errors.portfolioUrl && (
                      <p className="text-xs text-red-400 mt-1">{profileForm.formState.errors.portfolioUrl.message}</p>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={updateProfileMutation.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <form onSubmit={passwordForm.handleSubmit(v => updatePasswordMutation.mutate(v))}
                className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-400" /> Change Password
                </h3>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Current Password</label>
                  <div className="relative">
                    <input
                      {...passwordForm.register("currentPassword")}
                      type={showCurrentPw ? "text" : "password"}
                      className="input-field w-full pr-10"
                    />
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
                    <input
                      {...passwordForm.register("newPassword")}
                      type={showNewPw ? "text" : "password"}
                      className="input-field w-full pr-10"
                    />
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
                  Change Password
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="glass-card p-5 space-y-4">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-400" /> Notification Preferences
                </h3>
                {[
                  { key: "newOrders", label: "New Available Orders", desc: "Get notified when matching orders are posted" },
                  { key: "orderUpdates", label: "Order Updates", desc: "Status changes, revisions, and completions" },
                  { key: "messages", label: "New Messages", desc: "Notifications for client messages" },
                  { key: "payments", label: "Payment Alerts", desc: "Earnings credited and payout updates" },
                  { key: "reviews", label: "New Reviews", desc: "When clients rate your work" },
                  { key: "emailDigest", label: "Weekly Email Digest", desc: "Summary of your activity and performance" },
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
                <button
                  onClick={() => toast.success("Notification preferences saved!")}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
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
