import React from 'react';
import { useAuth } from '../context/AuthContext';
import { OfflineBadge } from './OfflineBadge';
import { LogOut, User } from 'lucide-react';

interface NavbarProps {
  activeTab: 'presensi' | 'capaian' | 'santri' | 'pengaturan';
  onTabChange: (tab: 'presensi' | 'capaian' | 'santri' | 'pengaturan') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 border-b border-emerald-800 text-white shadow-xs">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('presensi')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-emerald-200 transition-colors"
        >
          Halaqoh App
        </button>

        {/* Zone 2: 4 Clean single-line text navigation links (Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-emerald-100">
          <button
            onClick={() => onTabChange('presensi')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'presensi'
                ? 'text-white border-b-2 border-amber-400 font-bold'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            Presensi Harian
          </button>
          <button
            onClick={() => onTabChange('capaian')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'capaian'
                ? 'text-white border-b-2 border-amber-400 font-bold'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            Laporan Capaian
          </button>
          <button
            onClick={() => onTabChange('santri')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'santri'
                ? 'text-white border-b-2 border-amber-400 font-bold'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            Santri &amp; Halaqoh
          </button>
          <button
            onClick={() => onTabChange('pengaturan')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'pengaturan'
                ? 'text-white border-b-2 border-amber-400 font-bold'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            Pengaturan
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions (Offline status & User avatar/Logout) */}
        <div className="flex items-center gap-2.5">
          <OfflineBadge />

          {currentUser && (
            <button
              onClick={() => onTabChange('pengaturan')}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-medium text-emerald-100 transition-colors border border-emerald-700/50"
              title="Profil Pengguna"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline truncate max-w-[120px]">
                {currentUser.fullName.split(' ')[0]}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
