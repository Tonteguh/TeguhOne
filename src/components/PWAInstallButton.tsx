import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[11px] shadow-sm hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 cursor-pointer"
        title="Pasang Web APK TeguhOne di HP Android"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instal APK</span>
      </button>

      {/* iOS Guide if opened on iPhone */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm">Pasang di iPhone / iPad</h4>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Buka browser Safari.<br />
              2. Tekan tombol <strong>Bagikan (Share)</strong> di bagian bawah.<br />
              3. Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
