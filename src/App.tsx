/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { RadioModal } from './components/RadioModal';
import { HomeScreen } from './screens/HomeScreen';
import { VideoScreen } from './screens/VideoScreen';
import { TilawahScreen } from './screens/TilawahScreen';
import { TuningProScreen } from './screens/TuningProScreen';
import { TChatScreen } from './screens/TChatScreen';
import { TMarketScreen } from './screens/TMarketScreen';
import { BelanjaScreen } from './screens/BelanjaScreen';
import { KangTeguhAIScreen } from './screens/KangTeguhAIScreen';
import { p2pEngine } from './services/p2pSync';
import {
  Bell,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Share2,
  Download,
  Wifi,
  Cpu,
  Layers,
  Sparkles,
  Home,
} from 'lucide-react';
import { TeguhOneLogo } from './components/TeguhOneLogo';
import { SplashScreen } from './components/SplashScreen';
import { TuningTabType } from './screens/TuningProScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [tuningInitialTab, setTuningInitialTab] = useState<TuningTabType>('kuis');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRadioModalOpen, setIsRadioModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // User State
  const [userName, setUserName] = useState(p2pEngine.getNodeName());
  const [nodeId] = useState(p2pEngine.getNodeId());
  const [showSavedToast, setShowSavedToast] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Kajian Baru Tersedia',
      desc: 'Murotal Surah Ar-Rahman oleh Syaikh Mishary Rashid siap diputar.',
      time: '10 menit lalu',
      type: 'tilawah',
    },
    {
      id: 'n2',
      title: 'Pesan TChat Masuk',
      desc: 'Keluarga Besar: "Selamat pagi semua.. Jangan lupa sarapan"',
      time: '25 menit lalu',
      type: 'tchat',
    },
    {
      id: 'n3',
      title: 'Promo Sparepart Beat',
      desc: 'Diskon 50% Roller & V-Belt Daytona Kevlar di Belanja Afiliasi.',
      time: '1 jam lalu',
      type: 'belanja',
    },
  ];

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    p2pEngine.setNodeName(newName);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleOpenItem = (tab: TabType, id: string) => {
    if (tab === 'tuning') {
      if (id === 'kuis' || id.includes('kuis') || id.includes('dokter')) {
        setTuningInitialTab('kuis');
      } else if (id.includes('cvt')) {
        setTuningInitialTab('cvt');
      } else if (id.includes('injeksi')) {
        setTuningInitialTab('injeksi');
      } else {
        setTuningInitialTab('mesin4tak');
      }
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = currentTab === 'home';

  return (
    <>
      {showSplash && (
        <SplashScreen
          durationMs={3000}
          onFinish={() => setShowSplash(false)}
        />
      )}
      <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-500 selection:text-white">
        {/* 
          Header & Bottom Nav Discipline:
          ONLY shown on Home tab as requested! 
          When entering sub-screens, they are hidden to give maximum clean workspace ("ruang lega").
        */}
        {isHome && (
          <Header
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onNavigateHome={handleBackToHome}
          />
        )}

        {/* Main Screen Content Container */}
        <main
          className={`flex-1 max-w-md w-full mx-auto px-3.5 ${
            isHome ? 'pt-3 pb-20' : 'pt-2 pb-8'
          }`}
        >
          {currentTab === 'home' && (
            <HomeScreen
              onSelectTab={(tab) => {
                if (tab === 'tuning') {
                  setTuningInitialTab('kuis');
                }
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRadioModal={() => setIsRadioModalOpen(true)}
              onOpenItem={handleOpenItem}
            />
          )}

          {currentTab === 'video' && <VideoScreen onBack={handleBackToHome} />}
          {currentTab === 'tilawah' && <TilawahScreen onBack={handleBackToHome} />}
          {currentTab === 'tuning' && (
            <TuningProScreen
              initialTab={tuningInitialTab}
              onBack={handleBackToHome}
              onNavigateToAi={() => setCurrentTab('ai')}
            />
          )}
        {currentTab === 'tchat' && (
          <TChatScreen
            onBack={handleBackToHome}
            onNavigateToAi={() => setCurrentTab('ai')}
          />
        )}
        {currentTab === 'tmarket' && <TMarketScreen onBack={handleBackToHome} />}
        {currentTab === 'belanja' && <BelanjaScreen onBack={handleBackToHome} />}
        {currentTab === 'ai' && <KangTeguhAIScreen onBack={handleBackToHome} />}
        {currentTab === 'radio' && (
          <div className="pt-2">
            <RadioModal isOpen={true} onClose={handleBackToHome} />
          </div>
        )}
      </main>

      {/* Persistent Bottom Bar - ONLY on Home Tab! */}
      {isHome && (
        <BottomNavigation
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Floating Home Quick-Return for Sub-screens (Excluded on TChat to never block typing & send button) */}
      {!isHome && currentTab !== 'tchat' && (
        <button
          onClick={handleBackToHome}
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-6 z-30 px-3.5 py-2 rounded-full bg-linear-to-tr from-blue-700 to-sky-600 text-white shadow-xl hover:shadow-2xl transition-all active:scale-90 flex items-center gap-1.5 cursor-pointer border border-white/30"
          title="Kembali ke Beranda Utama"
        >
          <Home className="w-4 h-4" />
          <span className="text-xs font-bold">Beranda</span>
        </button>
      )}

      {/* Global Integrated Search Modal ("Pencarian Cerdas TeguhOne") */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Full Mode Radio Streaming Modal */}
      <RadioModal
        isOpen={isRadioModalOpen}
        onClose={() => setIsRadioModalOpen(false)}
      />

      {/* Profile & P2P Node Identity Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-linear-to-r from-blue-900 to-sky-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-300" />
                <h3 className="font-extrabold text-sm sm:text-base">Profil Pengguna &amp; Node P2P</h3>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-blue-600 to-sky-400 mx-auto flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white">
                  TR
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mt-2">{userName}</h4>
                <p className="text-[11px] text-slate-500 font-mono">Node ID: {nodeId}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ubah Nama Tampilan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={userName}
                    onBlur={(e) => handleUpdateUserName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Zero-Cost Architecture Metrics */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Beban Biaya Server:</span>
                  <span className="font-extrabold text-emerald-600">Rp 0 (Mandiri)</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Protokol Jaringan:</span>
                  <span className="font-mono text-slate-800">WebRTC DataChannel P2P</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Privasi Data:</span>
                  <span className="font-semibold text-blue-700">Enkripsi E2EE End-to-End</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Penyimpanan:</span>
                  <span className="text-slate-600">Lokal di Perangkat (Offline-First)</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <TeguhOneLogo size="sm" showTagline={true} showAuthor={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer/Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 mt-12 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">Notifikasi TeguhOne</h3>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setCurrentTab(n.type as TabType);
                  }}
                  className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{n.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Tutup Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}
      </div>
    </>
  );
}
