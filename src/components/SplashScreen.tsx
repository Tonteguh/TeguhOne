import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number; // default 3000ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 3000,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress increment over 3 seconds
    const intervalTime = 30;
    const step = 100 / (durationMs / intervalTime);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return Math.min(100, prev + step);
      });
    }, intervalTime);

    // Fade out slightly before complete
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 400);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      onClick={onFinish}
      className={`fixed inset-0 z-50 flex flex-col justify-between select-none cursor-pointer overflow-hidden transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, #091a32 0%, #0d284f 30%, #153e75 60%, #091a32 100%)',
      }}
    >
      {/* 
        Scenic Mosque & Mountain Twilight Landscape Background 
        Matching user screenshot: ChatGPT Image Sep 27, 2026, 10_25_16 PM (1).png
      */}
      <div className="absolute inset-0 z-0">
        {/* Scenic photographic background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen scale-105 transform animate-pulse duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1080&q=85')`,
            backgroundPosition: 'center 60%',
          }}
        />

        {/* Golden Sun & Twilight Horizon Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[450px] h-[350px] bg-gradient-radial from-amber-500/30 via-cyan-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061224] via-transparent to-[#061224]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#091a32]/90 via-transparent to-[#061224] pointer-events-none" />
      </div>

      {/* Top Mobile Status Bar: 9:41, Wifi, Battery */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 pt-4 flex items-center justify-between text-white/90 text-xs font-semibold">
        <span className="font-bold">9:41</span>
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Center Hero: 3D Geometric Logo + TeguhApp Brand */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 flex flex-col items-center text-center -mt-6">
        {/* 3D Geometric 'T' Logo from user screenshot */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg
            width="88"
            height="88"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_10px_20px_rgba(2,132,199,0.5)]"
          >
            <defs>
              <linearGradient id="splashCyanT" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="splashOrangeT" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>

            {/* Left Top Cyan Geometric Bar */}
            <path
              d="M18 20 L76 14 L68 34 L48 34 L36 82 L20 82 L32 34 L16 34 Z"
              fill="url(#splashCyanT)"
            />
            {/* Right Segmented Orange Wings */}
            <path
              d="M56 36 L78 28 L72 46 L52 50 Z"
              fill="url(#splashOrangeT)"
            />
            <path
              d="M50 54 L68 49 L62 66 L46 69 Z"
              fill="url(#splashOrangeT)"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Brand Name "TeguhApp" */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline justify-center">
          <span>Teguh</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 ml-1">
            App
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-sm font-medium text-blue-100/90 tracking-wide mt-1 drop-shadow-md">
          Satu Aplikasi, Banyak Manfaat
        </p>
      </div>

      {/* Mosque Silhouette / Dome Visual in Middle-Lower View */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 text-center flex flex-col items-center">
        {/* Circular Glowing Spinner / Loader Ring */}
        <div className="relative w-12 h-12 mb-3">
          <div className="absolute inset-0 rounded-full border-3 border-cyan-500/20" />
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-cyan-400 border-r-sky-300 animate-spin" />
        </div>

        <p className="text-xs font-medium text-blue-200/90 tracking-wide drop-shadow-sm">
          Memuat pengalaman terbaik untuk Anda...
        </p>

        {/* Subtle Skip Indicator */}
        <span className="text-[10px] text-blue-300/50 mt-2 hover:underline">
          Ketuk layar untuk melewati
        </span>
      </div>

      {/* Bottom Signature Section matching screenshot */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 pb-6 text-center">
        {/* Handwritten Cursive Signature */}
        <div className="font-serif text-2xl text-white tracking-wider italic font-medium transform -rotate-2 drop-shadow-md">
          Teguh Rianto
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-blue-200/90 mt-1">
          <span>Owner &amp; Founder</span>
          <span className="text-rose-400">❤️</span>
          <span className="font-bold text-white">TeguhApp</span>
        </div>
      </div>
    </div>
  );
};
