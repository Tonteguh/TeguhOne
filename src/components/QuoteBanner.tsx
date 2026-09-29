import React from 'react';
import { ShieldCheck, Cpu, Zap, WifiOff } from 'lucide-react';

export const QuoteBanner: React.FC = () => {
  return (
    <div className="space-y-3 pt-1">
      {/* Visual Quote Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 shadow-sm border border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-amber-300 italic tracking-wide font-serif leading-relaxed">
              &ldquo; Teknologi yang mendekatkan, bukan menjauhkan. &rdquo;
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Prinsip TeguhOne: Kemandirian teknologi, gotong royong, dan manfaat tanpa sekat modal.
            </p>
          </div>

          {/* T1 Badge */}
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-md shrink-0 border border-white/20">
            T1
          </div>
        </div>
      </div>

      {/* Decentralized & Zero-Cost Architecture Status Bar */}
      <div className="rounded-xl bg-slate-100/90 border border-slate-200/80 p-3 text-[11px] text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">
            Arsitektur Terdesentralisasi (P2P Mesh):
          </span>
          <span className="text-emerald-700 font-medium">Beban Server Rp 0</span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            E2EE Enkripsi Penuh
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600" />
            Hemat Baterai
          </span>
          <span className="inline-flex items-center gap-1">
            <WifiOff className="w-3 h-3 text-slate-500" />
            Sinkronisasi Offline
          </span>
        </div>
      </div>
    </div>
  );
};
