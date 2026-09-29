import React, { useState, useEffect } from 'react';
import { Search, Bell, Mic, Wifi, Battery, Volume2 } from 'lucide-react';
import { TeguhOneLogo } from './TeguhOneLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onNavigateHome,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 relative overflow-hidden shadow-lg border-b border-blue-400/30">
      {/* 
        Authentic Deep Sky Blue Clouds Background matching user screenshot:
        ChatGPT Image Sep 28, 2026, 01_34_34 AM (1) (2).png 
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#074783] via-[#0863aa] to-[#0284c7] z-0" />

      {/* Cloud & Light Ray Overlays */}
      <div
        className="absolute inset-0 opacity-35 mix-blend-screen pointer-events-none z-0 bg-cover bg-center"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 60%),
                            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-0" />

      {/* Header Content */}
      <div className="relative z-10 max-w-md mx-auto px-4 pt-2 pb-3.5 text-white">
        {/* Top Status Bar: Time 9:41 & Icons */}
        <div className="flex items-center justify-between text-xs font-semibold text-blue-100/90 pb-2">
          <span className="font-bold tracking-tight text-white">{currentTime}</span>

          <div className="flex items-center gap-2">
            {/* PWA Install Button for Mobile */}
            <PWAInstallButton />

            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
              aria-label="Notifikasi"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-1 ring-white">
                3
              </span>
            </button>

            {/* Profile Avatar */}
            <button
              onClick={onOpenProfile}
              className="relative p-0.5 rounded-full ring-2 ring-white/60 hover:ring-white transition-all cursor-pointer overflow-hidden"
              aria-label="Profil Pengguna"
              title="Profil Pengguna"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-xs">
                TR
              </div>
            </button>

            <Wifi className="w-3.5 h-3.5 text-white/90" />
            <Battery className="w-4 h-4 text-white/90" />
          </div>
        </div>

        {/* Brand Row: Glowing Badge + TEGUHONE + Satu Aplikasi, Banyak Manfaat */}
        <div className="flex items-center justify-between pt-0.5 pb-2.5">
          <TeguhOneLogo size="md" variant="light" onClick={onNavigateHome} />
        </div>

        {/* 
          Search Bar matching user screenshot:
          White rounded capsule pill, Search icon on left,
          "Cari apa yang Anda butuhkan...", and Microphone icon on right 
        */}
        <div className="mt-1">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between bg-white text-slate-900 rounded-full px-4 py-2.5 shadow-md hover:shadow-lg transition-all text-left cursor-pointer group border border-white/80 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Search className="w-4 h-4 text-slate-700 shrink-0 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs sm:text-sm font-medium text-slate-600 truncate">
                Cari apa yang Anda butuhkan...
              </span>
            </div>

            <div className="flex items-center gap-1.5 pl-2 shrink-0">
              <div className="p-1 rounded-full text-blue-600 hover:bg-blue-50 transition-colors">
                <Mic className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
