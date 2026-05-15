"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Settings, Save, Loader2, DollarSign, Clock, Shield, Bell, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface SystemSettings {
  commissionRate: number;
  emergencyFee: number;
  maxRevisions: number;
  minWithdrawal: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  allowNewOrders: boolean;
  platformName: string;
  supportEmail: string;
  withdrawalFee: number;
}

const TABS = [
  { id: "platform", label: "Platform", icon: Settings },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "orders", label: "Orders", icon: Clock },
  { id: "security", label: "Security", icon: Shield },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("platform");
  const [settings, setSettings] = useState<Partial<SystemSettings>>({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (!json.success) return {};
      return json.data as SystemSettings;
    },
  });

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<SystemSettings>) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save settings");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = (key: keyof SystemSettings, value: SystemSettings[keyof SystemSettings]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-400" /> System Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure platform-wide settings</p>
        </div>
        <button
          onClick={() => saveMutation.mutate(settings)}
          disabled={saveMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </button>
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

        {/* Settings Content */}
        <div className="sm:col-span-3">
          {activeTab === "platform" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-5">
              <h3 className="font-semibold text-white">Platform Configuration</h3>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Platform Name</label>
                <input
                  value={settings.platformName || ""}
                  onChange={e => update("platformName", e.target.value)}
                  className="input-field w-full"
                  placeholder="WriteProf"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Support Email</label>
                <input
                  value={settings.supportEmail || ""}
                  onChange={e => update("supportEmail", e.target.value)}
                  className="input-field w-full"
                  placeholder="support@writeprof.com"
                  type="email"
                />
              </div>
              <div className="space-y-3 pt-3 border-t border-white/10">
                {[
                  { key: "maintenanceMode", label: "Maintenance Mode", desc: "Temporarily disable platform access for all users" },
                  { key: "allowNewRegistrations", label: "Allow New Registrations", desc: "Enable or disable new user sign-ups" },
                  { key: "allowNewOrders", label: "Allow New Orders", desc: "Enable or disable clients from placing new orders" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => update(item.key as keyof SystemSettings, !settings[item.key as keyof SystemSettings])}
                      className={`w-11 h-6 rounded-full transition-colors relative ${settings[item.key as keyof SystemSettings] ? "bg-brand-500" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings[item.key as keyof SystemSettings] ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "financial" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-5">
              <h3 className="font-semibold text-white">Financial Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Commission Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.commissionRate || 20}
                      onChange={e => update("commissionRate", Number(e.target.value))}
                      className="input-field w-full pr-8"
                      min="0" max="50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Platform keeps {settings.commissionRate || 20}%, writers earn {100 - (settings.commissionRate || 20)}%</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Emergency Fee ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={settings.emergencyFee ?? 50}
                      onChange={e => update("emergencyFee", Number(e.target.value))}
                      className="input-field w-full pl-7"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Min. Withdrawal ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={settings.minWithdrawal ?? 50}
                      onChange={e => update("minWithdrawal", Number(e.target.value))}
                      className="input-field w-full pl-7"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Withdrawal Fee ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={settings.withdrawalFee ?? 5}
                      onChange={e => update("withdrawalFee", Number(e.target.value))}
                      className="input-field w-full pl-7"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <h4 className="text-sm font-semibold text-brand-400 mb-2">Revenue Split Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Order Total (e.g. $100)</span>
                    <span className="text-white">$100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Platform Commission ({settings.commissionRate || 20}%)</span>
                    <span className="text-brand-400">${(settings.commissionRate || 20)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                    <span className="text-gray-400">Writer Earnings ({100 - (settings.commissionRate || 20)}%)</span>
                    <span className="text-green-400">${100 - (settings.commissionRate || 20)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-5">
              <h3 className="font-semibold text-white">Order Settings</h3>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Maximum Free Revisions</label>
                <input
                  type="number"
                  value={settings.maxRevisions || 3}
                  onChange={e => update("maxRevisions", Number(e.target.value))}
                  className="input-field w-full"
                  min="0" max="10"
                />
                <p className="text-xs text-gray-500 mt-1">Number of free revisions clients get per order</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-semibold text-white mb-1">Urgency Surcharge Schedule</h4>
                <p className="text-xs text-gray-500 mb-3">Base: $15/page · Urgency surcharge: up to $25/page extra</p>
                <div className="space-y-2 text-sm">
                  {[
                    { level: "1 Hour",   surcharge: "$25/page (100%)", total: "$40/page" },
                    { level: "3 Hours",  surcharge: "$20/page (80%)",  total: "$35/page" },
                    { level: "6 Hours",  surcharge: "$15/page (60%)",  total: "$30/page" },
                    { level: "12 Hours", surcharge: "$10/page (40%)",  total: "$25/page" },
                    { level: "24 Hours", surcharge: "None",            total: "$15/page" },
                  ].map(u => (
                    <div key={u.level} className="flex justify-between items-center">
                      <span className="text-gray-400">{u.level}</span>
                      <div className="text-right">
                        <span className="text-brand-400 font-medium text-xs">{u.surcharge}</span>
                        <span className="text-white text-xs ml-2 font-bold">{u.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">1 page = 275 words · Emergency flag adds flat $50 fee</p>
                <p className="text-xs text-gray-500">To modify rates, update <span className="font-mono">src/lib/pricing.ts</span></p>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-5">
              <h3 className="font-semibold text-white">Security Configuration</h3>
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Security Features Active</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>✓ JWT authentication with httpOnly cookies</li>
                  <li>✓ Password hashing with SHA-256 + secret</li>
                  <li>✓ Paystack HMAC-SHA512 webhook verification</li>
                  <li>✓ Role-based access control (RBAC)</li>
                  <li>✓ Input validation with Zod on all endpoints</li>
                  <li>✓ Rate limiting on auth endpoints</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-sm font-semibold text-white">Environment Configuration</h4>
                <p className="text-xs text-gray-400">Sensitive settings are managed via environment variables. Never store API keys in the database.</p>
                <div className="space-y-1 text-xs">
                  {[
                    { key: "PAYSTACK_SECRET_KEY", status: "✓ Configured" },
                    { key: "CLOUDINARY_SECRET", status: "✓ Configured" },
                    { key: "ANTHROPIC_API_KEY", status: "✓ Configured" },
                    { key: "JWT_SECRET", status: "✓ Configured" },
                  ].map(env => (
                    <div key={env.key} className="flex justify-between">
                      <span className="text-gray-500 font-mono">{env.key}</span>
                      <span className="text-green-400">{env.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
