import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Check if running in standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Network status */}
        {!isOnline ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-medium">
            <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-600" />
            <span>Mode Offline</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-medium">
            <Wifi className="w-3 h-3 text-emerald-600" />
            <span>Tersinkron Lokal</span>
          </div>
        )}

        {/* PWA Install Trigger */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-800 text-emerald-50 rounded-lg hover:bg-emerald-900 active:scale-95 transition-all shadow-xs"
            title="Pasang aplikasi ke layar utama HP agar bisa diakses offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Pasang di HP</span>
            <span className="xs:hidden">Install</span>
          </button>
        )}
      </div>

      {/* iOS / General guide modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-emerald-800 mb-2">
              <Download className="w-5 h-5" />
              <h3 className="font-bold text-base">Pasang ke Layar Utama HP</h3>
            </div>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Aplikasi ini didesain offline-ready agar musyrif dapat mencatat presensi tanpa hambatan kuota atau sinyal.
            </p>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-2 mb-4">
              <p className="font-semibold text-stone-800">📱 Untuk Pengguna iPhone / Safari:</p>
              <p className="text-stone-600">1. Ketuk tombol <strong>Share</strong> (ikon kotak berpanah ke atas) di bawah browser.</p>
              <p className="text-stone-600">2. Gulir ke bawah lalu pilih <strong>Add to Home Screen</strong> (Tambah ke Layar Utama).</p>
              <p className="font-semibold text-stone-800 mt-2">🤖 Untuk Pengguna Android / Chrome:</p>
              <p className="text-stone-600">1. Ketuk titik tiga (⋮) di pojok kanan atas browser.</p>
              <p className="text-stone-600">2. Pilih <strong>Tambahkan ke Layar Utama</strong> (Install app).</p>
            </div>
            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
