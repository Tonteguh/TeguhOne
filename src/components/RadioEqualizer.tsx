import React, { useEffect, useState, useRef } from 'react';
import { radioService } from '../services/audioRadio';
import { Sliders, Activity, Disc, Sparkles } from 'lucide-react';

export type EqualizerMode = 'winamp' | 'spectrum' | 'vu_meter' | 'wave';

interface RadioEqualizerProps {
  className?: string;
  compact?: boolean;
}

export const RadioEqualizer: React.FC<RadioEqualizerProps> = ({
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(radioService.getState().isPlaying);
  const [mode, setMode] = useState<EqualizerMode>('winamp');
  const [levels, setLevels] = useState<number[]>(new Array(16).fill(0));
  const [peaks, setPeaks] = useState<number[]>(new Array(16).fill(0));
  const [vuLeft, setVuLeft] = useState(0);
  const [vuRight, setVuRight] = useState(0);

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const unsub = radioService.subscribe(() => {
      setIsPlaying(radioService.getState().isPlaying);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let phase = 0;
    const updateVisuals = () => {
      phase += 0.15;
      if (isPlaying) {
        // High quality simulated audio spectrum bands mimicking Winamp
        const newLevels = levels.map((old, idx) => {
          // generate realistic frequency curves: low bass heavier, mid stable, highs crisp
          const baseEnergy = Math.sin(phase * 1.5 + idx * 0.4) * 0.4 + 0.55;
          const noise = (Math.random() - 0.5) * 0.35;
          const bassBoost = idx < 4 ? 0.2 : idx > 12 ? -0.1 : 0.05;
          const target = Math.max(0.08, Math.min(0.98, baseEnergy + noise + bassBoost));
          // smooth lerp
          return old * 0.6 + target * 0.4;
        });

        // Update falling peak indicators
        const newPeaks = peaks.map((p, idx) => {
          const cur = newLevels[idx];
          if (cur >= p) return cur;
          return Math.max(0, p - 0.025); // slow gravity fall
        });

        setLevels(newLevels);
        setPeaks(newPeaks);

        // VU meter needle values (-20dB to +3dB mapped to 0..1)
        const avgBass = (newLevels[0] + newLevels[1] + newLevels[2]) / 3;
        const avgTreble = (newLevels[12] + newLevels[13] + newLevels[14]) / 3;
        setVuLeft((prev) => prev * 0.7 + avgBass * 0.3);
        setVuRight((prev) => prev * 0.7 + avgTreble * 0.3);
      } else {
        // Decay to zero when paused
        setLevels((prev) => prev.map((v) => Math.max(0, v * 0.85)));
        setPeaks((prev) => prev.map((p) => Math.max(0, p * 0.85)));
        setVuLeft((prev) => prev * 0.85);
        setVuRight((prev) => prev * 0.85);
      }

      animRef.current = requestAnimationFrame(updateVisuals);
    };

    animRef.current = requestAnimationFrame(updateVisuals);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const numBars = compact ? 12 : 16;
  const activeLevels = levels.slice(0, numBars);
  const activePeaks = peaks.slice(0, numBars);

  return (
    <div
      className={`rounded-2xl bg-[#06101e] border border-cyan-900/60 p-3 shadow-inner ${className}`}
    >
      {/* Mode switcher tabs */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-950">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
            Equalizer Winamp Pro
          </span>
          {isPlaying && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          )}
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-cyan-900/50">
          {(
            [
              { id: 'winamp', label: 'Winamp' },
              { id: 'spectrum', label: 'Neon' },
              { id: 'vu_meter', label: 'VU Meter' },
              { id: 'wave', label: 'Wave' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={(e) => {
                e.stopPropagation();
                setMode(m.id);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                mode === m.id
                  ? 'bg-cyan-500 text-black shadow-xs'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Display Area */}
      <div className="relative h-20 sm:h-24 w-full bg-black/80 rounded-xl p-2 overflow-hidden border border-cyan-950 flex items-end justify-center">
        {/* Background Grid Pattern like 90s audio gear */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.4) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />

        {/* 1. Classic Winamp Segmented LED Bars */}
        {mode === 'winamp' && (
          <div className="w-full h-full flex items-end justify-between gap-1 z-10">
            {activeLevels.map((lvl, i) => {
              const totalSegments = 14;
              const litSegments = Math.round(lvl * totalSegments);
              const peakSegment = Math.round(activePeaks[i] * totalSegments);

              return (
                <div key={i} className="flex-1 h-full flex flex-col justify-end gap-[2px]">
                  {Array.from({ length: totalSegments })
                    .map((_, segIdx) => {
                      const invertedIdx = totalSegments - 1 - segIdx; // 0 at bottom, 13 at top
                      const isLit = invertedIdx <= litSegments;
                      const isPeak = invertedIdx === peakSegment && isPlaying;

                      // Color mapping: Top 2 red, mid 4 yellow/amber, bottom green
                      let colorClass = 'bg-emerald-500';
                      let glowClass = 'shadow-[0_0_3px_#10b981]';
                      if (invertedIdx >= 12) {
                        colorClass = 'bg-rose-500';
                        glowClass = 'shadow-[0_0_3px_#f43f5e]';
                      } else if (invertedIdx >= 8) {
                        colorClass = 'bg-amber-400';
                        glowClass = 'shadow-[0_0_3px_#fbbf24]';
                      }

                      if (isPeak) {
                        return (
                          <div
                            key={segIdx}
                            className={`h-[3px] w-full rounded-xs bg-cyan-300 shadow-[0_0_4px_#22d3ee]`}
                          />
                        );
                      }

                      return (
                        <div
                          key={segIdx}
                          className={`h-[3px] w-full rounded-xs transition-opacity duration-75 ${
                            isLit
                              ? `${colorClass} ${glowClass} opacity-100`
                              : 'bg-slate-800/40 opacity-30'
                          }`}
                        />
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Neon Spectrum Cyber Glowing Bars */}
        {mode === 'spectrum' && (
          <div className="w-full h-full flex items-end justify-between gap-1 z-10 pt-2">
            {activeLevels.map((lvl, i) => {
              const heightPercent = Math.max(6, Math.min(100, lvl * 100));
              const peakPercent = Math.max(6, Math.min(100, activePeaks[i] * 100));

              return (
                <div key={i} className="flex-1 h-full flex flex-col justify-end relative">
                  {/* Floating Peak Cap */}
                  {isPlaying && (
                    <div
                      className="absolute w-full h-[2px] bg-white rounded-xs shadow-[0_0_6px_#fff]"
                      style={{ bottom: `${peakPercent}%` }}
                    />
                  )}
                  {/* Glowing Bar */}
                  <div
                    className="w-full rounded-t-sm bg-linear-to-t from-blue-600 via-cyan-400 to-pink-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-75"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Retro Analog Dual VU Meters */}
        {mode === 'vu_meter' && (
          <div className="w-full h-full flex items-center justify-around gap-3 z-10 px-2">
            {[
              { label: 'CH-L (BASS)', val: vuLeft },
              { label: 'CH-R (TREBLE)', val: vuRight },
            ].map((ch, idx) => {
              // Convert 0..1 to angle -45deg to +45deg
              const angle = -45 + ch.val * 90;
              return (
                <div
                  key={idx}
                  className="flex-1 h-full bg-[#18261e] rounded-xl border border-emerald-900/60 p-2 relative flex flex-col justify-between overflow-hidden shadow-inner"
                >
                  <div className="flex justify-between items-center text-[8px] font-mono font-bold text-emerald-400/80">
                    <span>-20</span>
                    <span>-10</span>
                    <span>-5</span>
                    <span>0</span>
                    <span className="text-rose-400">+3dB</span>
                  </div>

                  {/* Arc scale marking */}
                  <div className="w-full h-1 border-b border-dashed border-emerald-600/50 mt-1" />

                  {/* Needle Pivot & Needle */}
                  <div className="relative w-full h-8 flex items-end justify-center">
                    <div
                      className="w-0.5 h-12 bg-rose-500 origin-bottom rounded-full shadow-[0_0_4px_#f43f5e] transition-transform duration-75"
                      style={{ transform: `rotate(${angle}deg)` }}
                    />
                    <div className="absolute -bottom-1 w-3 h-3 rounded-full bg-slate-900 border border-emerald-500 z-10" />
                  </div>

                  <span className="text-center font-mono text-[9px] font-bold text-emerald-300">
                    {ch.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Digital Oscilloscope Audio Wave */}
        {mode === 'wave' && (
          <div className="w-full h-full flex items-center justify-center z-10 relative">
            <svg
              className="w-full h-full text-emerald-400"
              viewBox="0 0 300 80"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                d={
                  isPlaying
                    ? `M 0 40 ` +
                      activeLevels
                        .map((lvl, idx) => {
                          const x = (idx / (activeLevels.length - 1)) * 300;
                          const waveHeight = (lvl - 0.5) * 60;
                          const y = 40 + (idx % 2 === 0 ? waveHeight : -waveHeight);
                          return `Q ${x - 10} ${40 + waveHeight * 0.8}, ${x} ${y}`;
                        })
                        .join(' ') +
                      ` L 300 40`
                    : 'M 0 40 L 300 40'
                }
                fill="none"
                stroke="url(#waveGlow)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="filter drop-shadow-[0_0_4px_#10b981]"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 mt-1.5 pt-1 border-t border-cyan-950">
        <span>EQ PRESET: HI-FI DYNAMIC</span>
        <span className="text-slate-400">
          {isPlaying ? 'ACTIVE 44.1kHz • STEREO' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
};
