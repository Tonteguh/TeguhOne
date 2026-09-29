import React from 'react';
import {
  Home,
  PlaySquare,
  Moon,
  Wrench,
  MessageSquare,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../types';

interface BottomNavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'home' as TabType, label: 'Beranda', icon: Home },
    { id: 'video' as TabType, label: 'Video', icon: PlaySquare },
    { id: 'tilawah' as TabType, label: 'Tilawah', icon: Moon },
    { id: 'tuning' as TabType, label: 'Tuning Pro', icon: Wrench },
    { id: 'tchat' as TabType, label: 'TChat', icon: MessageSquare },
    { id: 'tmarket' as TabType, label: 'TMarket', icon: ShoppingBag },
    { id: 'belanja' as TabType, label: 'Belanja', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-safe">
      <div className="max-w-md mx-auto px-2 flex items-center justify-between py-1.5">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <IconComp
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.4] text-blue-600' : 'stroke-[1.8]'
                  }`}
                />
                {item.id === 'tchat' && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <span
                className={`text-[9px] mt-0.5 leading-tight tracking-tight truncate max-w-full px-0.5 ${
                  isActive ? 'text-blue-700 font-bold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
