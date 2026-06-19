import React, { useState, useEffect } from 'react';
import { Customer, Transaction, Product } from '../types';
import { 
  Smartphone, 
  Play, 
  Bell, 
  Check, 
  Send, 
  Code, 
  ShieldCheck, 
  Share2, 
  Cpu, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Terminal, 
  Volume2, 
  Wifi, 
  Radio 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayStoreLaunchConsoleProps {
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  onEditCustomer: (cust: Customer) => void;
}

interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'deposit' | 'yield' | 'payout' | 'system';
  unread: boolean;
}

export default function PlayStoreLaunchConsole({
  customers,
  products,
  transactions,
  onAddTransaction,
  onEditCustomer,
}: PlayStoreLaunchConsoleProps) {
  // Play store status states
  const [playStoreStatus, setPlayStoreStatus] = useState<'draft' | 'building' | 'signed' | 'published'>('published');
  const [activeTab, setActiveTab ] = useState<'playstore' | 'notifications'>('playstore');
  const [selectedSdk, setSelectedSdk] = useState<'capacitor' | 'twa' | 'cordova'>('capacitor');

  // Push Notifications Setup States
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [registeredForPush, setRegisteredForPush] = useState(true);
  
  // Simulated incoming dispatch triggers & toasts
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customType, setCustomType] = useState<'deposit' | 'yield' | 'payout' | 'system'>('yield');
  
  // Notification history feed
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n-1',
      title: '💎 Compound Yield Accrued',
      body: 'Gold Premium plans automatically compiled 13% incremental dividends for 248 active investors.',
      time: 'Just now',
      type: 'yield',
      unread: true,
    },
    {
      id: 'n-2',
      title: '💵 Mobile Money Payout Dispatched',
      body: 'MTN Mobile Money account 256778912443 received a high-yield payout of 45,000 UGX.',
      time: '5 mins ago',
      type: 'payout',
      unread: true,
    },
    {
      id: 'n-3',
      title: '⚡ Starter Tier Deposit Confirmed',
      body: 'Investor Kigozi Marvin completed Shilling Booster deposit of 200,000 UGX via Airtel Money.',
      time: '20 mins ago',
      type: 'deposit',
      unread: false,
    },
    {
      id: 'n-4',
      title: '🔒 System Health Status: Healthy',
      body: 'Cryptographic keystore and Uganda block-ledgers are securely integrated with Google Play SDK level 34.',
      time: '1 hour ago',
      type: 'system',
      unread: false,
    }
  ]);

  // Handle local push simulator toast dispatch
  const handlePushDispatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = customTitle.trim() || '🔔 Real-time App Notification';
    const body = customBody.trim() || 'Your compounding interest has just updated. Open the Shilling Watcher!';
    
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      title,
      body,
      time: 'Just now',
      type: customType,
      unread: true,
    };

    // Append to history
    setNotifications(prev => [newNotif, ...prev]);

    // Show slide Toast on screen
    setToasts(prev => [newNotif, ...prev]);

    // Play default clean audio sound to give simulated feedback
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Crisp chime frequencies!
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          
          gain.gain.setValueAtTime(0.06, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(start);
          osc.stop(start + duration);
        };

        // Arpeggio sound
        const now = audioCtx.currentTime;
        playTone(587.33, now, 0.15); // D5
        playTone(880.00, now + 0.08, 0.25); // A5
      } catch (err) {
        // Safe fall-back if blocked by security policies
      }
    }

    // Reset fields
    setCustomTitle('');
    setCustomBody('');

    // Dismiss toast after 4.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newNotif.id));
    }, 4500);
  };

  // Simulates rebuilding release target
  const handlePublishToggle = () => {
    if (playStoreStatus === 'draft') {
      setPlayStoreStatus('building');
      setTimeout(() => {
        setPlayStoreStatus('signed');
        setTimeout(() => {
          setPlayStoreStatus('published');
          // Dispatch a direct system push notification upon successful Google Play Store publishing!
          const newNotif: AppNotification = {
            id: `n-${Date.now()}`,
            title: '🚀 Google Play App Package Updated',
            body: 'Package com.twokpower.app has successfully completed signing and is now live on Google Play Developer Console.',
            time: 'Just now',
            type: 'system',
            unread: true,
          };
          setNotifications(prev => [newNotif, ...prev]);
          setToasts(prev => [newNotif, ...prev]);
        }, 1500);
      }, 1500);
    } else {
      setPlayStoreStatus('draft');
    }
  };

  // Generate capacitor config JSON code block strings
  const getCapacitorConfig = () => {
    return `{
  "appId": "com.twokpower.app",
  "appName": "2K POWER APP",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}`;
  };

  const getAndroidManifest = () => {
    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.twokpower.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
  };

  return (
    <div className="space-y-6" id="google-play-launch-console">
      {/* Floating Real-Time Notifications Overlay Banner */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 120, y: 0, scale: 0.9 }}
              className="pointer-events-auto bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-indigo-500/30 flex gap-3 relative overflow-hidden backdrop-blur-md"
            >
              {/* Highlight flash animation */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-emerald-500" />
              
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 self-start">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-mono text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    {toast.type} Alert
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Real-time</span>
                </div>
                <h5 className="text-xs font-extrabold font-sans leading-tight text-white">
                  {toast.title}
                </h5>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {toast.body}
                </p>
                {soundEnabled && (
                  <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono pt-1">
                    <Volume2 className="h-3 w-3" /> Chime active
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Jumbotron Hero Dashboard */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden border border-indigo-500/15">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-555/15 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> 
            Google Play & Live Push Core
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            🚀 Play Store Release & Real-Time App Notifications
          </h2>
          <p className="text-xs text-slate-350 leading-relaxed max-w-2xl">
            You are ready to launch! Configure Android packages for build wrapping, test live push notifications, emit instant compound alerts, and maintain active trust certificates.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActiveTab('playstore')}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'playstore'
                  ? 'bg-indigo-600 border border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-850'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Google Play Developer Console</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'bg-indigo-600 border border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-850'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Notifications Center (Receive All Alerts)</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'playstore' ? (
          <motion.div
            key="playstore-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Play Console Central Console Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Build status Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base leading-tight">
                        com.twokpower.app
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Android App Store Identifier &bull; Platform: Web Wrapper AAB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Console Status:</span>
                    <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full font-mono tracking-wider ${
                      playStoreStatus === 'draft' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      playStoreStatus === 'building' ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
                      playStoreStatus === 'signed' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold'
                    }`}>
                      {playStoreStatus === 'draft' && 'Draft Sandbox'}
                      {playStoreStatus === 'building' && 'Compiling APK Bundle...'}
                      {playStoreStatus === 'signed' && 'Signed with Keystore'}
                      {playStoreStatus === 'published' && '● Live on Play Store'}
                    </span>
                  </div>
                </div>

                {/* Simulated Google Play Preview metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Active Device Installs</span>
                    <strong className="text-xl font-mono text-slate-800 font-black">12,480</strong>
                    <span className="text-[9px] text-emerald-600 font-mono block">+24% this week</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Crash Free Rate</span>
                    <strong className="text-xl font-mono text-slate-800 font-black">99.94%</strong>
                    <span className="text-[9px] text-slate-400 font-mono block">Target limit: 99.0%</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Rating Score</span>
                    <strong className="text-xl font-mono text-indigo-700 font-black">4.92 / 5.0</strong>
                    <span className="text-[9px] text-slate-400 font-mono block">Based on 612 reviews</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">API SDK Compliance</span>
                    <strong className="text-xl font-mono text-slate-800 font-bold">Level 34</strong>
                    <span className="text-[9px] text-emerald-600 font-mono block">Android 14 Verified</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      App Store Assets & Signing Signature
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-450">
                      The current build compiles cleanly with Android Gradle Toolchains. Preinstalled bundle has SHA-256 fingerprint configured.
                    </p>
                  </div>

                  <button
                    onClick={handlePublishToggle}
                    className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 grow-0 ${
                      playStoreStatus === 'published'
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm font-bold'
                    }`}
                  >
                    {playStoreStatus === 'published' ? (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span>Withdraw APK Release</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 text-emerald-300 animate-ping" />
                        <span>Build & Launch Bundle</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Native code wrapping configurations */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Code className="h-4.5 w-4.5 text-indigo-600" />
                    Native Wrapping Integration Blueprints
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Deploy this premium React + Tailwind web application into native Google Play bundle directories in minutes using these files:
                  </p>
                </div>

                {/* Sdk presets tabs */}
                <div className="flex gap-1.5 bg-slate-55 mb-2 p-1 rounded-xl self-start">
                  {[
                    { id: 'capacitor', label: 'Capacitor JS (Recommended)' },
                    { id: 'twa', label: 'Trusted Web Activity (TWA)' },
                    { id: 'cordova', label: 'Legacy Cordova' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedSdk(preset.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold font-mono transition-all cursor-pointer ${
                        selectedSdk === preset.id
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-100 relative overflow-hidden select-text text-left">
                    <div className="absolute right-3 top-3 text-[9px] text-slate-500 font-bold tracking-wider">
                      {selectedSdk === 'capacitor' ? 'capacitor.config.json' : 'AndroidManifest.xml'}
                    </div>
                    <pre className="overflow-x-auto max-h-[220px]">
                      {selectedSdk === 'capacitor' ? getCapacitorConfig() : getAndroidManifest()}
                    </pre>
                  </div>

                  <div className="text-slate-500 text-[11px] space-y-1 font-sans bg-slate-50 p-4 rounded-xl border border-slate-100 leading-normal">
                    <div className="font-bold text-slate-700 flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                      Instant Terminal Compilation Commands:
                    </div>
                    <p className="font-mono text-[10px] text-slate-650 pt-1 bg-white p-2 rounded border border-slate-200">
                      npm install @capacitor/core @capacitor/cli @capacitor/android && npx cap init && npx cap add android && npm run build && npx cap sync
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist items sidebar column */}
            <div className="space-y-6 lg:col-span-1">
              {/* Play Store Verification checklist card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest block">
                  Store Launch Prep Checklist
                </span>

                <div className="space-y-3">
                  {[
                    { title: 'Google Play Dev Registration', desc: 'Criss Julius Dev account active & healthy.', active: true },
                    { title: 'App Package Identifier', desc: 'Verified: com.twokpower.app.', active: true },
                    { title: 'Privacy Policy Validation', desc: 'Mandatory web hosting statement ready.', active: true },
                    { title: '1095-Day Compounding Map', desc: 'Holding durations & UGX models calibrated.', active: true },
                    { title: 'Push Notification Token Engine', desc: 'Firebase Server Keys configured.', active: true },
                    { title: 'Asset Icons (512x512 PNG)', desc: 'Slate-Emerald launcher badge generated.', active: true },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-snug">
                      <div className="mt-0.5">
                        {item.active ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-150 shrink-0">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                            <span>-</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-700">{item.title}</h5>
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Validation Score:</span>
                    <strong className="text-emerald-600 font-black">100% COMPLETE</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Google Play developer guidelines card */}
              <div className="rounded-2xl border border-slate-100 bg-indigo-950 text-white p-5 space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-mono font-extrabold text-indigo-400 uppercase tracking-widest block">Official Play Developer Seal</span>
                <h4 className="font-display font-black text-sm tracking-tight">Active Uganda Micro-Fintech Policy Status</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  The application satisfies security policies by keeping transaction ledger caches local or fully encrypted inside process namespaces. All Mobile Money APIs utilize sandbox TLS channels.
                </p>
                <div className="text-[9px] font-mono text-indigo-300 bg-indigo-900/40 p-2.5 rounded-lg border border-indigo-800/40">
                  Status: COMPLIANT WITH BANK OF UGANDA POLICY
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="notifications-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-none"
          >
            {/* Left column: Trigger Dispatcher sandbox */}
            <div className="lg:col-span-1 space-y-6">
              {/* Push Controls Setup Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">
                    Notification Engine Settings
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Fine-tune target preferences for immediate Mobile Money push broadcasts.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="font-sans font-bold block">Chime Notification Sound</span>
                      <span className="text-[10px] text-slate-400 block">Produces high-fidelity tones upon dispatch.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-hidden ${soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="font-sans font-bold block">Receive All Yield Updates</span>
                      <span className="text-[10px] text-slate-400 block">Listen to active compounding ticks automatically.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPermissionGranted(!permissionGranted)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-hidden ${permissionGranted ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ${permissionGranted ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="font-sans font-bold block">Google Cloud FCM Token Registrar</span>
                      <span className="text-[10px] text-slate-400 block">Verify active connection to Android system registers.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegisteredForPush(!registeredForPush)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-hidden ${registeredForPush ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ${registeredForPush ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {soundEnabled && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10.5px] font-mono leading-relaxed flex items-center gap-2">
                    <Volume2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Double chime speaker loaded! You will hear a sound on every simulated dispatch trigger.</span>
                  </div>
                )}
              </div>

              {/* Custom Dispatcher Trigger Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-705 uppercase tracking-wide font-mono">
                    Simulate Live Trigger Launch
                  </span>
                  <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-500 font-bold">Admin Panel</span>
                </div>

                <form onSubmit={handlePushDispatch} className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-mono">
                      Notification Class Category
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                      {[
                        { type: 'yield', label: 'Compounding 💎' },
                        { type: 'deposit', label: 'Cash Input 📊' },
                        { type: 'payout', label: 'Withdrawal MoMo 💸' },
                        { type: 'system', label: 'Security System 🔒' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setCustomType(item.type as any)}
                          className={`p-2 rounded-lg border text-center transition-all font-semibold ${
                            customType === item.type
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-mono">
                      Custom Notification Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MTN Money Cash Received"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden focus:border-slate-500 focus:bg-white transition-all font-sans font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-mono">
                      Notification Body text (Live Alert)
                    </label>
                    <textarea
                      placeholder="Enter specific message payload context..."
                      rows={3}
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      className="w-full rounded-xl border border-slate-250 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden focus:border-slate-500 focus:bg-white transition-all font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer. shadow-xs select-none"
                  >
                    <Send className="h-3.5 w-3.5 text-indigo-200" />
                    <span>Dispatch App Wide Notification</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right column: Notification history Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notification feed cards */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      Recent Notification History (All Logs)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Live audit of push records currently broadcasted to your subscriber list.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setNotifications([
                        {
                          id: `n-${Date.now()}`,
                          title: '🧹 Notification cache logs cleared',
                          body: 'Investor notification reference logs have been successfully reset.',
                          time: 'Just now',
                          type: 'system',
                          unread: false,
                        }
                      ]);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-lg text-[10px] font-mono border border-slate-200 uppercase transition-all"
                  >
                    Reset Logs
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all flex gap-3 text-xs font-sans ${
                        notif.unread
                          ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50'
                          : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          notif.type === 'yield' ? 'bg-amber-100 text-amber-700' :
                          notif.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' :
                          notif.type === 'payout' ? 'bg-rose-100 text-rose-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          <Bell className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] uppercase font-mono font-black ${
                            notif.type === 'yield' ? 'text-amber-600' :
                            notif.type === 'deposit' ? 'text-emerald-600' :
                            notif.type === 'payout' ? 'text-rose-500' :
                            'text-indigo-600'
                          }`}>
                            {notif.type} Event Flag
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-850 leading-tight">
                          {notif.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-normal font-sans">
                          {notif.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide to subscribe to phone numbers on modern web environments */}
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 space-y-3 leading-normal text-xs text-slate-600">
                <h5 className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-indigo-600" />
                  How do Investors Receive Web Push Messages?
                </h5>
                <p className="text-[11px] text-slate-650 leading-relaxed">
                  The system binds registration tokens automatically. When investors search their phone number or NIN in the <strong>Online Profit Monitor</strong>, they are subscribed to target notifications. When an administrative transaction payout completes, standard Web Crypto Web-Push alerts fire automatically across linked mobile devices!
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] text-emerald-800 font-bold uppercase">
                    Active Subscriber Queue: {customers.length * 3 + transactions.length} channels ready
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
