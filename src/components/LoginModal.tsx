import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import appLogo from '../assets/images/halaqoh_app_logo_1790147143678.jpg';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const [username, setUsername] = useState<string>('musyrif');
  const [pinOrPass, setPinOrPass] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = login(username, pinOrPass);
    if (!success) {
      setErrorMsg('Username atau PIN/Password salah. Coba username: musyrif, PIN: 123456');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
        {/* App Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-md border-2 border-emerald-600/30">
            <img
              src={appLogo}
              alt="Halaqoh App Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Halaqoh Qur'an
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Sistem Presensi Harian &amp; Dasbor Capaian Belajar Santri
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Perlindungan Privasi Data:</strong> Masuk untuk mengakses data presensi dan capaian santri yang tersimpan aman secara offline.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Username / ID Musyrif</span>
            </label>
            <input
              type="text"
              placeholder="musyrif / ustadz.abdullah"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>PIN / Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="123456"
                value={pinOrPass}
                onChange={e => setPinOrPass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20"
          >
            <span>Masuk ke Aplikasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access for Testing */}
        <div className="pt-2 border-t border-stone-200 space-y-2">
          <p className="text-[11px] font-semibold text-stone-500 text-center uppercase tracking-wider">
            Akses Cepat (Akun Demo)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginAsDemo('musyrif')}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-colors active:scale-95 group"
            >
              <p className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                Ustadz Abdullah
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">Musyrif Pra Tahfidz 1</p>
            </button>

            <button
              type="button"
              onClick={() => loginAsDemo('koordinator')}
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-teal-50 hover:border-teal-300 text-left transition-colors active:scale-95 group"
            >
              <p className="text-xs font-bold text-stone-900 group-hover:text-teal-800">
                Ustadz Ahmad
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">Koordinator Musyrif</p>
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-stone-500 mt-4 text-center">
        Versi 1.0 · Aplikasi Offline-First &amp; Terintegrasi WhatsApp
      </p>
    </div>
  );
};
