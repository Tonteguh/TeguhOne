import React from 'react';
import { ChevronRight, Play, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface ContentChoicesProps {
  onSelectTab: (tab: TabType) => void;
  onOpenItem: (type: TabType, id: string) => void;
}

export const ContentChoices: React.FC<ContentChoicesProps> = ({
  onSelectTab,
  onOpenItem,
}) => {
  const choices = [
    {
      id: 'vd-1',
      tab: 'video' as TabType,
      title: 'Video Dakwah',
      subtitle: 'Kajian Pilihan',
      badge: '12:45',
      badgeColor: 'bg-red-600',
      isPlayable: true,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'tl-1',
      tab: 'tilawah' as TabType,
      title: 'Murotal Al-Qur\'an',
      subtitle: 'Surah Ar-Rahman',
      badge: '32:18',
      badgeColor: 'bg-emerald-600',
      isPlayable: true,
      image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'tp-1',
      tab: 'tuning' as TabType,
      title: 'Dokter Otomotif & Kuis',
      subtitle: '10 Studi Kasus & Lab Fisika',
      badge: 'Edukasi SMK',
      badgeColor: 'bg-blue-600',
      isPlayable: true,
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'bl-1',
      tab: 'belanja' as TabType,
      title: 'Produk Terlaris',
      subtitle: 'Diskon Spesial',
      badge: '-50%',
      badgeColor: 'bg-rose-500',
      isPlayable: false,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="pt-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
          <span>Konten Pilihan</span>
        </h3>
        <button
          onClick={() => onSelectTab('video')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {choices.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenItem(item.tab, item.id)}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 flex flex-col"
          >
            {/* Thumbnail with Badge */}
            <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

              {/* Tag / Duration */}
              <span
                className={`absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-xs ${item.badgeColor}`}
              >
                {item.badge}
              </span>

              {/* Play Icon Overlay if playable */}
              {item.isPlayable && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-8 h-8 rounded-full bg-white/90 text-blue-900 flex items-center justify-center shadow-md">
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
