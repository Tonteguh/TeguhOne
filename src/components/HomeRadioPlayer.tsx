import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  ChevronRight,
  Sparkles,
  Sliders,
  Activity,
} from 'lucide-react';
import { radioService } from '../services/audioRadio';

interface HomeRadioPlayerProps {
  onOpenFullRadio: () => void;
}

export const HomeRadioPlayer: React.FC<HomeRadioPlayerProps> = ({
  onOpenFullRadio,
}) => {
  const [state, setState] = useState(radioService.getState());

  useEffect(() => {
    return radioService.subscribe(() => {
      setState(radioService.getState());
    });
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    radioService.togglePlay();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    radioService.prevChannel();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    radioService.nextChannel();
  };

  const handleVolumeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    radioService.setVolume(state.volume > 0 ? 0 : 0.85);
  };

  const elapsedStr = radioService.formatTime(state.currentTime);
  const remainingSecs = Math.max(0, state.totalDuration - state.currentTime);
  const remainingStr = '-' + radioService.formatTime(remainingSecs);
  const progressPercent = (state.currentTime / state.totalDuration) * 100;

  return (
    <div
      onClick={onOpenFullRadio}
      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0c2340] via-[#103158] to-[#0a192f] text-white p-4 shadow-lg border border-cyan-900/50 cursor-pointer group transition-all duration-300 hover:border-cyan-400/60"
    >
      {/* Background glow & subtle visualizer pulse */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between relative z-10 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* T1 Badge */}
          <div className="w-7 h-7 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0">
            T1
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white tracking-tight truncate">
                {state.currentChannel.name}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-red-500/90 text-[9px] font-bold text-white tracking-wider animate-pulse">
                ON AIR
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-200/90 font-medium">
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 text-[10px] font-mono text-cyan-300">
                {state.currentChannel.frequency || 'FM'}
              </span>
              <span className="truncate">{state.currentChannel.category}</span>
            </div>
          </div>
        </div>

        {/* Live Badge Action */}
        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-300 group-hover:text-white transition-colors shrink-0">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] hidden sm:inline">Equalizer Winamp</span>
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Main Body: Track Info & Artwork */}
      <div className="flex items-center gap-3.5 relative z-10 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wider mb-0.5 truncate">
            {state.currentChannel.tagline}
          </p>
          <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
            {state.currentChannel.host}
          </h4>
          <p className="text-xs text-slate-300 truncate mt-0.5">
            {state.currentChannel.program}
          </p>

          {/* Time Scrubber */}
          <div className="mt-2.5">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#22d3ee]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-cyan-300/80 font-mono mt-1">
              <span>{elapsedStr}</span>
              <span className="text-emerald-400 font-semibold">Live 128kbps</span>
              <span>{remainingStr}</span>
            </div>
          </div>
        </div>

        {/* Channel Artwork Card */}
        <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border border-cyan-500/20 group-hover:scale-105 transition-transform">
          <img
            src={state.currentChannel.artwork}
            alt={state.currentChannel.name}
            className="w-full h-full object-cover"
          />
          {state.isPlaying && (
            <div className="absolute inset-0 bg-cyan-950/40 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Audio Controls Bar & Mini Winamp Equalizer Bars */}
      <div className="flex items-center justify-between pt-2 border-t border-cyan-900/60 relative z-10">
        {/* Volume Button */}
        <button
          onClick={handleVolumeToggle}
          className="p-1.5 text-cyan-300 hover:text-white transition-colors cursor-pointer"
          title="Atur Volume"
        >
          {state.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Center Prev, Play/Pause, Next */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 text-cyan-300 hover:text-white transition-colors active:scale-90 cursor-pointer"
            title="Saluran Sebelumnya"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer ${
              state.isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/30'
            }`}
            title={state.isPlaying ? 'Jeda Siaran' : 'Putar Siaran'}
          >
            {state.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 text-cyan-300 hover:text-white transition-colors active:scale-90 cursor-pointer"
            title="Saluran Berikutnya"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Winamp Equalizer Live Dancing Indicator */}
        <div className="flex items-end gap-1 h-5 px-2 py-1 rounded bg-black/50 border border-cyan-900/60">
          {[12, 18, 10, 16, 20, 14, 8].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-xs transition-all duration-150 ${
                state.isPlaying
                  ? i > 4
                    ? 'bg-rose-500 animate-pulse'
                    : i > 2
                    ? 'bg-amber-400 animate-bounce'
                    : 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-700 h-1'
              }`}
              style={{
                height: state.isPlaying ? `${Math.max(4, (h * (i % 2 === 0 ? 0.9 : 1.1)))}px` : '3px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
