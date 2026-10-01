import React, { useState } from 'react';
import { AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Phone,
  MessageCircle,
  Database,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  User,
  Shield,
  Check,
  Building
} from 'lucide-react';

export const PengaturanView: React.FC = () => {
  const { currentUser, logout, updateProfile } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [musyrifName, setMusyrifName] = useState<string>(currentUser?.fullName || '');
  const [musyrifPhone, setMusyrifPhone] = useState<string>(currentUser?.phone || '');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);

    if (currentUser) {
      updateProfile({
        fullName: musyrifName,
        phone: musyrifPhone
      });
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-halaqoh-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const ok = StorageService.importBackupJSON(content);
      if (ok) {
        setImportStatus('Data offline berhasil dipulihkan!');
        setSettings(StorageService.getSettings());
      } else {
        setImportStatus('Gagal memulihkan file. Pastikan format JSON valid.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang data ke contoh bawaan (Santri Rhazes, Pra Tahfidz 1, dll)?')) {
      StorageService.resetToDefaults();
      setSettings(StorageService.getSettings());
      setImportStatus('Data berhasil di-reset ke data bawaan!');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-24 text-xs">
      {/* User Session Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-base">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900 leading-tight">
              {currentUser?.fullName}
            </h3>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Role: <strong className="text-emerald-700 capitalize">{currentUser?.role}</strong> · {currentUser?.assignedHalaqohName}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          type="button"
          className="min-h-[44px] px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* WhatsApp Integration Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 border-b border-stone-100 pb-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">Pengaturan Integrasi WhatsApp</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Koordinator WA Number */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nomor WhatsApp Koordinator Musyrif
              </label>
              <input
                type="text"
                placeholder="628123456789"
                value={settings.coordinatorPhone}
                onChange={e => setSettings({ ...settings, coordinatorPhone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
                required
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Nomor penerima laporan capaian santri bulanan.
              </p>
            </div>

            {/* Koordinator Name */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nama Koordinator Musyrif
              </label>
              <input
                type="text"
                placeholder="Ustadz Ahmad Fauzan, Lc."
                value={settings.coordinatorName}
                onChange={e => setSettings({ ...settings, coordinatorName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
                required
              />
            </div>

            {/* Grup WA 1 */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Grup WA 1: Wali Santri (Link / Nomor)
              </label>
              <input
                type="text"
                placeholder="https://chat.whatsapp.com/..."
                value={settings.whatsappGroup1LinkOrPhone}
                onChange={e => setSettings({ ...settings, whatsappGroup1LinkOrPhone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
              />
            </div>

            {/* Grup WA 2 */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Grup WA 2: Musyrif / Pembina (Link / Nomor)
              </label>
              <input
                type="text"
                placeholder="https://chat.whatsapp.com/..."
                value={settings.whatsappGroup2LinkOrPhone}
                onChange={e => setSettings({ ...settings, whatsappGroup2LinkOrPhone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Institution & Academic Period */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 border-b border-stone-100 pb-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">Informasi Lembaga &amp; Tahun Ajaran</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Lembaga / Halaqoh</label>
              <input
                type="text"
                value={settings.institutionName}
                onChange={e => setSettings({ ...settings, institutionName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={e => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Semester Aktif</label>
              <input
                type="text"
                value={settings.currentSemester}
                onChange={e => setSettings({ ...settings, currentSemester: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Musyrif Profile Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 border-b border-stone-100 pb-2">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">Profil Akun Musyrif</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap &amp; Gelar</label>
              <input
                type="text"
                value={musyrifName}
                onChange={e => setMusyrifName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">No. HP / WhatsApp Pribadi</label>
              <input
                type="text"
                value={musyrifPhone}
                onChange={e => setMusyrifPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="min-h-[44px] px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-amber-300" /> : <Settings className="w-4 h-4" />}
            <span>{savedSuccess ? 'Pengaturan Tersimpan!' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Offline Storage & Backup / Restore */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 border-b border-stone-100 pb-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm">Penyimpanan Offline &amp; Cadangan Data</h3>
        </div>

        <p className="text-stone-600 text-xs leading-relaxed">
          Semua data presensi harian dan capaian bulanan tersimpan secara lokal di memori HP Anda. Anda dapat mengunduh file cadangan (backup JSON) agar data tetap aman.
        </p>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="min-h-[44px] p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Cadangkan Data (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="min-h-[44px] p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Pulihkan Data (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="min-h-[44px] p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold flex items-center justify-center gap-2 transition-colors border border-amber-200"
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Reset ke Contoh Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
