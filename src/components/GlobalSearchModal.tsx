import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Play,
  Wrench,
  ShoppingBag,
  Bot,
  ExternalLink,
  Tag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType, extra?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    'Semua' | 'Video' | 'Tuning Pro' | 'TMarket' | 'Kang Teguh AI' | 'Iklan'
  >('Semua');

  const exampleSearches = [
    'servis motor beat',
    'drakor terbaru',
    'sparepart beat',
    'murotal merdu',
    'lowongan kerja',
  ];

  // Curated database for integrated search matching the mockup
  const allSearchData = useMemo(() => {
    return [
      {
        id: 's-vid-1',
        category: 'Video',
        title: 'Tutorial Servis Motor Beat Lengkap & Mudah Dipahami',
        subtitle: 'YouTube • 2.4M ditonton • 3 bulan lalu',
        actionLabel: 'Tonton',
        tab: 'video' as TabType,
        color: 'bg-red-500 text-white',
        icon: Play,
        keywords: ['servis', 'motor', 'beat', 'tutorial', 'mesin', 'honda'],
      },
      {
        id: 's-tun-1',
        category: 'Tuning Pro',
        title: 'Servis Motor Beat (Tune Up + Ganti Oli MPX2)',
        subtitle: 'Mulai Rp 75.000 • Booking Sekarang Bebas Antre',
        actionLabel: 'Pesan',
        tab: 'tuning' as TabType,
        color: 'bg-blue-600 text-white',
        icon: Wrench,
        keywords: ['servis', 'motor', 'beat', 'tune up', 'oli', 'bengkel'],
      },
      {
        id: 's-mkt-1',
        category: 'TMarket',
        title: 'Sparepart Beat Original AHM (Roller & V-Belt K44)',
        subtitle: 'Rp 120.000 • Tersedia • Lokasi Sekitar Anda',
        actionLabel: 'Lihat Produk',
        tab: 'tmarket' as TabType,
        color: 'bg-orange-500 text-white',
        icon: ShoppingBag,
        keywords: ['sparepart', 'beat', 'original', 'roller', 'v-belt', 'jual'],
      },
      {
        id: 's-ai-1',
        category: 'Kang Teguh AI',
        title: 'Tips Perawatan Motor Beat & Atasi Tarikan Brebet',
        subtitle: 'Konsultasi langsung dengan Montir Cerdas Sahabat Santri',
        actionLabel: 'Tanya Sekarang',
        tab: 'ai' as TabType,
        color: 'bg-sky-500 text-white',
        icon: Bot,
        keywords: ['tips', 'perawatan', 'motor', 'beat', 'ai', 'montir', 'santri', 'brebet'],
      },
      {
        id: 's-ad-1',
        category: 'Iklan',
        title: 'Bengkel Resmi Honda & Servis Partner TeguhOne',
        subtitle: 'Lokasi 2 km dari Anda • Promo Spesial Diskon Jasa 20%',
        actionLabel: 'Lihat',
        tab: 'tuning' as TabType,
        color: 'bg-amber-500 text-white',
        icon: Tag,
        keywords: ['iklan', 'bengkel', 'honda', 'beat', 'promo'],
      },
      {
        id: 's-vid-2',
        category: 'Video',
        title: 'Drakor Terbaru 2026: The Judge from Hell Sub Indo',
        subtitle: 'YouTube & TikTok • 1.2M ditonton • Episode Lengkap',
        actionLabel: 'Tonton',
        tab: 'video' as TabType,
        color: 'bg-red-500 text-white',
        icon: Play,
        keywords: ['drakor', 'drama', 'korea', 'terbaru', 'judge', 'film'],
      },
      {
        id: 's-til-1',
        category: 'Tilawah',
        title: 'Murotal Merdu Surah Ar-Rahman - Syaikh Mishary Rashid',
        subtitle: 'Audio HQ & Teks Terjemahan • Durasi 32 Menit',
        actionLabel: 'Dengarkan',
        tab: 'tilawah' as TabType,
        color: 'bg-emerald-600 text-white',
        icon: Play,
        keywords: ['murotal', 'merdu', 'ar-rahman', 'quran', 'tilawah', 'mengaji'],
      },
    ];
  }, []);

  const filteredResults = useMemo(() => {
    let list = allSearchData;
    if (activeCategory !== 'Semua') {
      list = list.filter((item) => item.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
      );
    }
    return list;
  }, [allSearchData, activeCategory, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 mt-2 sm:mt-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 bg-linear-to-r from-blue-900 via-sky-800 to-blue-950 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Search className="w-4 h-4 text-sky-200" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  Pencarian Cerdas TeguhOne
                </h3>
                <p className="text-[11px] text-sky-200/90 leading-tight">
                  Cari di seluruh fitur atau langsung ke kategori
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Box with Tombol Cari di Ujung */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="mt-3 flex items-center gap-1.5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ketik yang dicari (misal: servis motor beat)..."
                autoFocus
                className="w-full bg-white text-slate-900 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tombol Search di Ujung sesuai instruksi user */}
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Cari</span>
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1">
            {(['Semua', 'Video', 'Tuning Pro', 'TMarket', 'Kang Teguh AI', 'Iklan'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Example Queries */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Contoh:
          </span>
          {exampleSearches.map((item) => (
            <button
              key={item}
              onClick={() => setQuery(item)}
              className="text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-2.5 py-0.5 rounded-full shrink-0 transition-colors"
            >
              &quot;{item}&quot;
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5 divide-y divide-slate-100">
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">
                Tidak ada hasil untuk &quot;{query}&quot;
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Coba gunakan kata kunci lain seperti &quot;beat&quot;, &quot;servis&quot;, atau &quot;murotal&quot;
              </p>
            </div>
          ) : (
            filteredResults.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Direct Action Button */}
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate(item.tab, { searchTarget: item });
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            <span className="font-bold text-blue-800">Cukup Cari,</span> TeguhOne yang Menghubungkan.
          </p>
        </div>
      </div>
    </div>
  );
};
