import React from 'react';
import {
  Play,
  Moon,
  Cpu,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Bot,
  Radio,
  Share2,
  Stethoscope,
} from 'lucide-react';
import { TabType } from '../types';

interface FeatureGridProps {
  onSelectTab: (tab: TabType) => void;
  onOpenRadioModal: () => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  onSelectTab,
  onOpenRadioModal,
}) => {
  const features = [
    {
      id: 'video',
      label: 'Video',
      subtitle: 'YouTube & TikTok',
      icon: Play,
      gradient: 'from-red-500 to-rose-600 shadow-red-200/50',
      action: () => onSelectTab('video'),
    },
    {
      id: 'tilawah',
      label: 'Tilawah',
      subtitle: 'Murotal & Doa',
      icon: Moon,
      gradient: 'from-emerald-500 to-teal-600 shadow-emerald-200/50',
      action: () => onSelectTab('tilawah'),
    },
    {
      id: 'tuning',
      label: 'Dokter Otomotif',
      subtitle: 'Kuis & Simulasi',
      icon: Stethoscope,
      gradient: 'from-blue-600 to-cyan-600 shadow-blue-200/50',
      action: () => onSelectTab('tuning'),
    },
    {
      id: 'tchat',
      label: 'TChat',
      subtitle: 'Chat & Panggilan',
      icon: MessageSquare,
      gradient: 'from-purple-500 to-indigo-600 shadow-purple-200/50',
      action: () => onSelectTab('tchat'),
    },
    {
      id: 'tmarket',
      label: 'TMarket',
      subtitle: 'Marketplace',
      icon: ShoppingBag,
      gradient: 'from-amber-500 to-orange-500 shadow-amber-200/50',
      action: () => onSelectTab('tmarket'),
    },
    {
      id: 'belanja',
      label: 'Belanja',
      subtitle: 'Shopee & TikTok',
      icon: Sparkles,
      gradient: 'from-pink-500 to-rose-500 shadow-pink-200/50',
      action: () => onSelectTab('belanja'),
    },
    {
      id: 'ai',
      label: 'Kang Teguh AI',
      subtitle: 'Montir Cerdas',
      icon: Bot,
      gradient: 'from-sky-400 to-blue-600 shadow-sky-200/50',
      action: () => onSelectTab('ai'),
    },
    {
      id: 'radio',
      label: 'Radio Online',
      subtitle: 'Live Streaming',
      icon: Radio,
      gradient: 'from-teal-400 to-emerald-600 shadow-teal-200/50',
      action: onOpenRadioModal,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-4 pt-1">
      {features.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.action}
            className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-transform"
          >
            {/* Rounded Squircle Tile */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br ${item.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all duration-200`}
            >
              <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>

            {/* Title */}
            <span className="text-xs font-bold text-slate-800 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">
              {item.label}
            </span>

            {/* Subtitle */}
            <span className="text-[10px] text-slate-600 font-medium leading-tight line-clamp-1 mt-0.5">
              {item.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
};
