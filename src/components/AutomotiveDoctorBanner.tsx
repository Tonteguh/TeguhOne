import React from 'react';
import {
  Stethoscope,
  Sparkles,
  Award,
  ChevronRight,
  Cpu,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface AutomotiveDoctorBannerProps {
  onStartQuiz: () => void;
}

export const AutomotiveDoctorBanner: React.FC<AutomotiveDoctorBannerProps> = ({
  onStartQuiz,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 p-5 text-white shadow-xl border border-blue-800/40">
      {/* Decorative Glow & Geometry */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
            Dokter Otomotif
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
            <Award className="w-3 h-3 text-amber-400" />
            Standar Siswa SMK &amp; Montir Ahli
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            Uji Kompetensi &amp; Kuis Edukasi Servis Motor
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            10 studi kasus riil bengkel: diagnosa pembakaran busi, celah klep, bobot roller CVT, rasio kompresi, kode DTC injeksi, dan kelistrikan spul disertai analisa ilmiah AI &amp; diagram interaktif.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-3 gap-2 py-1 text-[11px]">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
            <span className="block font-black text-amber-300 text-xs">10 Soal</span>
            <span className="text-[10px] text-slate-300">Pilihan Ganda</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
            <span className="block font-black text-emerald-300 text-xs">AI Diagnosis</span>
            <span className="text-[10px] text-slate-300">Penjelasan Ilmiah</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
            <span className="block font-black text-sky-300 text-xs">Diagram</span>
            <span className="text-[10px] text-slate-300">Visual Interaktif</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStartQuiz}
          className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Mulai Kuis Dokter Otomotif</span>
          <ChevronRight className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </div>
  );
};
