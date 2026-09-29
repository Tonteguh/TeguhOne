import React, { useState } from 'react';
import { ChevronRight, Sparkles, Compass, HeartHandshake } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      badge: 'Inspirasi Hidup',
      headline: 'Jadikan Setiap',
      highlight: 'Langkahmu Lebih Bermakna',
      subtext: 'Dengan Fitur Lengkap TeguhOne',
      bgGradient: 'from-blue-950/90 via-indigo-900/80 to-transparent',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    },
    {
      badge: 'Solusi Mandiri',
      headline: 'Teknologi Cerdas',
      highlight: 'Sahabat Santri & Montir',
      subtext: 'Servis Motor, Tilawah & Bisnis Tanpa Biaya',
      bgGradient: 'from-slate-950/90 via-sky-950/80 to-transparent',
      img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    },
    {
      badge: 'P2P Terdesentralisasi',
      headline: 'Privasi Terjaga',
      highlight: 'Biaya Nol Rupiah',
      subtext: 'Enkripsi End-to-End Tanpa Server Mahal',
      bgGradient: 'from-purple-950/90 via-slate-900/80 to-transparent',
      img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const current = slides[slide];

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      onClick={onExplore}
      className="relative overflow-hidden rounded-3xl cursor-pointer shadow-md border border-slate-200/80 group transition-transform duration-300 active:scale-[0.99]"
    >
      {/* Background Image with scenic mountain backdrop */}
      <img
        src={current.img}
        alt="TeguhOne Banner"
        className="w-full h-44 sm:h-48 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
      />

      {/* Atmospheric Overlays */}
      <div className={`absolute inset-0 bg-linear-to-r ${current.bgGradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
        {/* Top Tag */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-semibold tracking-wide text-amber-200">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{current.badge}</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Headline & Subtitle matching the mockup */}
        <div className="pr-10">
          <h2 className="text-lg sm:text-xl font-extrabold leading-snug tracking-tight text-white drop-shadow-sm">
            {current.headline}{' '}
            <span className="text-amber-400 font-serif italic block text-xl sm:text-2xl mt-0.5">
              {current.highlight}
            </span>
          </h2>
          <p className="text-xs text-slate-200 font-medium mt-1 drop-shadow-xs">
            {current.subtext}
          </p>
        </div>

        {/* Right Arrow Navigation Button */}
        <button
          onClick={nextSlide}
          className="absolute right-3.5 bottom-12 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all shadow-md active:scale-90"
          aria-label="Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
