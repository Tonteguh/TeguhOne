import React from 'react';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface SubScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export const SubScreenHeader: React.FC<SubScreenHeaderProps> = ({
  title,
  subtitle,
  icon,
  badge,
  badgeColor = 'bg-blue-50 text-blue-700 border-blue-200',
  onBack,
  rightAction,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-2.5 mb-3 -mx-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900 truncate leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}
            >
              {badge}
            </span>
          )}

          {rightAction}

          <button
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
            title="Ke Beranda Utama"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
