import React, { useState, useEffect } from 'react';
import {
  Santri,
  Halaqoh,
  KehadiranStatus,
  PresensiHarian,
  PresensiItem,
  QuranQuote
} from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { getDailyDynamicQuote } from '../data/quranQuotes';
import { DailyMotivationCard } from './DailyMotivationCard';
import {
  formatPresensiWhatsApp,
  openWhatsAppWithMessage,
  shareOrCopy
} from '../services/whatsapp';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Send,
  MessageCircle,
  Copy,
  Check,
  Edit3,
  Sparkles,
  ChevronDown,
  UserCheck,
  Share2
} from 'lucide-react';

export const PresensiHarianView: React.FC = () => {
  const { currentUser } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedHalaqohId, setSelectedHalaqohId] = useState<string>(
    currentUser?.assignedHalaqohId !== 'all' ? currentUser?.assignedHalaqohId || 'hq-pra-1' : 'hq-pra-1'
  );

  const [halaqohList, setHalaqohList] = useState<Halaqoh[]>(() => StorageService.getHalaqohs());
  const [santriList, setSantriList] = useState<Santri[]>(() => StorageService.getSantriByHalaqoh(selectedHalaqohId));
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: KehadiranStatus; note: string }>>({});

  const [selectedQuote, setSelectedQuote] = useState<QuranQuote>(() => getDailyDynamicQuote(selectedDate));
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showSavedAlert, setShowSavedAlert] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const appSettings = StorageService.getSettings();

  // Reload halaqohs and santri
  const refreshData = () => {
    const halaqohs = StorageService.getHalaqohs();
    setHalaqohList(halaqohs);
    const santris = StorageService.getSantriByHalaqoh(selectedHalaqohId);
    setSantriList(santris);

    // Load existing presensi record if exists
    const existing = StorageService.getPresensiByDateAndHalaqoh(selectedDate, selectedHalaqohId);
    const map: Record<string, { status: KehadiranStatus; note: string }> = {};

    santris.forEach(s => {
      const match = existing?.items.find(i => i.santriId === s.id);
      if (match) {
        map[s.id] = { status: match.status, note: match.note || '' };
      } else {
        // Default to 'hadir'
        map[s.id] = { status: 'hadir', note: '' };
      }
    });

    setAttendanceMap(map);
    setSelectedQuote(getDailyDynamicQuote(selectedDate));
  };

  useEffect(() => {
    refreshData();
  }, [selectedDate, selectedHalaqohId]);

  useEffect(() => {
    const handleSync = () => refreshData();
    window.addEventListener('halaqoh_presensi_updated', handleSync);
    window.addEventListener('halaqoh_santri_updated', handleSync);
    window.addEventListener('halaqoh_all_reloaded', handleSync);
    return () => {
      window.removeEventListener('halaqoh_presensi_updated', handleSync);
      window.removeEventListener('halaqoh_santri_updated', handleSync);
      window.removeEventListener('halaqoh_all_reloaded', handleSync);
    };
  }, [selectedHalaqohId, selectedDate]);

  const currentHalaqoh = halaqohList.find(h => h.id === selectedHalaqohId) || halaqohList[0];

  const handleStatusChange = (santriId: string, status: KehadiranStatus) => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    setAttendanceMap(prev => ({
      ...prev,
      [santriId]: {
        ...prev[santriId],
        status
      }
    }));
  };

  const handleNoteChange = (santriId: string, note: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [santriId]: {
        ...prev[santriId],
        note
      }
    }));
  };

  const handleSetAllHadir = () => {
    const updated: Record<string, { status: KehadiranStatus; note: string }> = {};
    santriList.forEach(s => {
      updated[s.id] = {
        status: 'hadir',
        note: attendanceMap[s.id]?.note || ''
      };
    });
    setAttendanceMap(updated);
  };

  const constructPresensiObject = (): PresensiHarian => {
    const items: PresensiItem[] = santriList.map(s => ({
      santriId: s.id,
      santriName: s.name,
      status: attendanceMap[s.id]?.status || 'hadir',
      note: attendanceMap[s.id]?.note || ''
    }));

    return {
      id: `pres-${selectedDate}-${selectedHalaqohId}`,
      date: selectedDate,
      halaqohId: selectedHalaqohId,
      halaqohName: currentHalaqoh?.name || 'Halaqoh',
      musyrifName: currentUser?.fullName || currentHalaqoh?.musyrifName || 'Musyrif',
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quoteId: selectedQuote.id
    };
  };

  const handleSavePresensi = () => {
    const presensiObj = constructPresensiObject();
    StorageService.savePresensi(presensiObj);

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#f59e0b', '#059669', '#34d399']
      });
    } catch {
      // Ignore if canvas-confetti is not loaded
    }

    setShowSavedAlert(true);
    setTimeout(() => setShowSavedAlert(false), 3000);
  };

  const handleOpenShareModal = () => {
    // Automatically save before sharing
    handleSavePresensi();
    setShowShareModal(true);
  };

  // Stat calculation
  const totalCount = santriList.length;
  const hadirCount = Object.values(attendanceMap).filter(v => v.status === 'hadir').length;
  const izinCount = Object.values(attendanceMap).filter(v => v.status === 'izin_sakit').length;
  const berhalangan2xCount = Object.values(attendanceMap).filter(v => v.status === 'berhalangan_2x_sepekan').length;
  const alpaCount = Object.values(attendanceMap).filter(v => v.status === 'alpa').length;

  const currentPresensiObj = constructPresensiObject();
  const waMessage = formatPresensiWhatsApp(currentPresensiObj, selectedQuote, appSettings);

  const handleSendToGroup1 = () => {
    openWhatsAppWithMessage(appSettings.whatsappGroup1LinkOrPhone, waMessage);
  };

  const handleSendToGroup2 = () => {
    openWhatsAppWithMessage(appSettings.whatsappGroup2LinkOrPhone, waMessage);
  };

  const handleCopyText = async () => {
    const result = await shareOrCopy('Laporan Presensi Halaqoh', waMessage);
    if (result === 'copied') {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header & Filter Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tanggal Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tanggal Presensi</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-h-[44px]"
            />
          </div>

          {/* Kelompok Halaqoh Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kelompok Halaqoh</span>
            </label>
            <div className="relative">
              <select
                value={selectedHalaqohId}
                onChange={e => setSelectedHalaqohId(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-h-[44px]"
              >
                {halaqohList.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.musyrifName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Action & Stats Bar */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
          {/* Clean unboxed metadata stats */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Hadir: {hadirCount}
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Izin/Sakit: {izinCount}
            </span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              2x/Pekan: {berhalangan2xCount}
            </span>
            {alpaCount > 0 && (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Alpa: {alpaCount}
              </span>
            )}
            <span className="text-stone-500 text-xs font-normal">
              Total: {totalCount} Santri
            </span>
          </div>

          <button
            onClick={handleSetAllHadir}
            type="button"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Set Semua Hadir</span>
          </button>
        </div>
      </div>

      {/* Santri Attendance List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-800 tracking-tight">
            Daftar Kehadiran Santri ({santriList.length})
          </h3>
          <span className="text-[11px] text-stone-500 font-medium">
            Ketuk status untuk mengubah
          </span>
        </div>

        {santriList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-700">Belum ada santri di halaqoh ini.</p>
            <p className="text-xs text-stone-400 mt-1">Tambahkan santri di menu tab Santri &amp; Halaqoh.</p>
          </div>
        ) : (
          santriList.map((santri, index) => {
            const currentItem = attendanceMap[santri.id] || { status: 'hadir', note: '' };
            const isNoteOpen = expandedNoteId === santri.id || !!currentItem.note;

            return (
              <div
                key={santri.id}
                className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-stone-200 transition-all hover:border-emerald-300"
              >
                {/* Santri name & note toggle */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 leading-tight">
                        {santri.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium mt-0.5">
                        <span>{santri.gender === 'ikhwan' ? 'Ikhwan' : 'Akhwat'}</span>
                        <span>·</span>
                        <span>{santri.halaqohName}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedNoteId(expandedNoteId === santri.id ? null : santri.id)}
                    type="button"
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      currentItem.note
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{currentItem.note ? 'Ada Catatan' : '+ Catatan'}</span>
                  </button>
                </div>

                {/* 4 Status Option Buttons (Minimum 44px touch targets) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  {/* Hadir */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'hadir')}
                    className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      currentItem.status === 'hadir'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Hadir</span>
                  </button>

                  {/* Izin/Sakit */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'izin_sakit')}
                    className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      currentItem.status === 'izin_sakit'
                        ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500 ring-offset-1'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Izin / Sakit</span>
                  </button>

                  {/* Keterangan Khusus: Berhalangan / Mengaji 2x dalam sepekan */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'berhalangan_2x_sepekan')}
                    className={`min-h-[44px] px-2 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 leading-tight text-center transition-all active:scale-95 ${
                      currentItem.status === 'berhalangan_2x_sepekan'
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>2x / Sepekan</span>
                  </button>

                  {/* Alpa */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'alpa')}
                    className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      currentItem.status === 'alpa'
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600 ring-offset-1'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Alpa</span>
                  </button>
                </div>

                {/* Inline Quick Note Field */}
                {isNoteOpen && (
                  <div className="mt-2.5 pt-2 border-t border-stone-100 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Catatan santri (misal: sabaq lancar hlm 47, izin flu ortu)..."
                      value={currentItem.note || ''}
                      onChange={e => handleNoteChange(santri.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all min-h-[40px]"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Daily Quranic Motivation Card */}
      <div className="pt-2">
        <DailyMotivationCard
          currentDate={selectedDate}
          onQuoteSelect={quote => setSelectedQuote(quote)}
        />
      </div>

      {/* Sticky Bottom Action Buttons for Mobile */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-stone-200 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {/* Simpan Button */}
          <button
            onClick={handleSavePresensi}
            type="button"
            className="flex-1 min-h-[48px] bg-stone-800 hover:bg-stone-900 active:scale-[0.98] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Simpan Presensi</span>
          </button>

          {/* Kirim Laporan Presensi Button (WhatsApp Integration) */}
          <button
            onClick={handleOpenShareModal}
            type="button"
            className="flex-1 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Laporan WA</span>
          </button>
        </div>
      </div>

      {/* Floating Save Toast */}
      {showSavedAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Presensi harian berhasil disimpan offline!</span>
        </div>
      )}

      {/* WhatsApp Send Modal (Sends to 2 WhatsApp Groups) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Kirim Laporan ke WhatsApp</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Pilih target grup WhatsApp untuk membagikan rekap absensi harian beserta Kata-Kata Motivasi Qur'ani otomatis hari ini.
            </p>

            {/* 2 Target WhatsApp Groups */}
            <div className="space-y-2.5 mb-4">
              {/* Target 1: Grup Halaqoh 1 */}
              <button
                onClick={handleSendToGroup1}
                type="button"
                className="w-full text-left p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 group-hover:text-emerald-800">
                      Grup WA Halaqoh 1 (Wali Santri)
                    </h4>
                    <p className="text-[11px] text-emerald-700/80 mt-0.5">
                      {appSettings.whatsappGroup1Name || 'Grup Wali Santri Halaqoh'}
                    </p>
                  </div>
                </div>
                <Send className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Target 2: Grup Halaqoh 2 */}
              <button
                onClick={handleSendToGroup2}
                type="button"
                className="w-full text-left p-3.5 rounded-xl border border-teal-300 bg-teal-50/70 hover:bg-teal-100/80 transition-all flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 group-hover:text-teal-800">
                      Grup WA Halaqoh 2 (Musyrif / Pembina)
                    </h4>
                    <p className="text-[11px] text-teal-700/80 mt-0.5">
                      {appSettings.whatsappGroup2Name || 'Grup Musyrif & Koordinator'}
                    </p>
                  </div>
                </div>
                <Send className="w-4 h-4 text-teal-700 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quick Copy & Universal Share */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={handleCopyText}
                type="button"
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>

              <button
                onClick={() => openWhatsAppWithMessage('', waMessage)}
                type="button"
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-stone-600" />
                <span>Pilih Kontak Bebas</span>
              </button>
            </div>

            {/* Live Message Preview */}
            <div className="border border-stone-200 rounded-xl bg-stone-50 p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 mb-1.5">
                <span>Pratinjau Format Pesan WhatsApp:</span>
                <span className="text-[10px] text-emerald-700">Otomatis Termasuk Motivasi Qur'ani</span>
              </div>
              <pre className="text-[11px] text-stone-800 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto leading-relaxed select-all bg-white p-2.5 rounded-lg border border-stone-200/80">
                {waMessage}
              </pre>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
