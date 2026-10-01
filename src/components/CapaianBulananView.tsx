import React, { useState, useEffect } from 'react';
import {
  CapaianBulanan,
  Santri,
  Halaqoh,
  TingkatTadarus,
  AppSettings
} from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  formatLaporanCapaianWhatsApp,
  openWhatsAppWithMessage,
  shareOrCopy
} from '../services/whatsapp';
import appLogo from '../assets/images/halaqoh_app_logo_1790147143678.jpg';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  Calendar,
  Send,
  Copy,
  Check,
  Edit,
  Plus,
  Eye,
  Trash2,
  Share2,
  TrendingUp,
  Search,
  ChevronDown,
  Printer,
  Sparkles,
  Phone
} from 'lucide-react';

const MONTH_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const CapaianBulananView: React.FC = () => {
  const { currentUser } = useAuth();
  const currentMonthIdx = new Date().getMonth();
  const defaultMonth = MONTH_LIST[currentMonthIdx] || 'Juli';

  const [selectedMonth, setSelectedMonth] = useState<string>('Juli');
  const [selectedHalaqohId, setSelectedHalaqohId] = useState<string>(
    currentUser?.assignedHalaqohId !== 'all' ? currentUser?.assignedHalaqohId || 'hq-pra-1' : 'hq-pra-1'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [halaqohList, setHalaqohList] = useState<Halaqoh[]>(() => StorageService.getHalaqohs());
  const [santriList, setSantriList] = useState<Santri[]>(() => StorageService.getSantriByHalaqoh(selectedHalaqohId));
  const [capaianList, setCapaianList] = useState<CapaianBulanan[]>(() => StorageService.getCapaianList());

  // Modals
  const [activeModal, setActiveModal] = useState<'edit' | 'preview' | null>(null);
  const [editingCapaian, setEditingCapaian] = useState<CapaianBulanan | null>(null);
  const [previewCapaian, setPreviewCapaian] = useState<CapaianBulanan | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const appSettings: AppSettings = StorageService.getSettings();

  const refreshData = () => {
    setHalaqohList(StorageService.getHalaqohs());
    setSantriList(StorageService.getSantriByHalaqoh(selectedHalaqohId));
    setCapaianList(StorageService.getCapaianList());
  };

  useEffect(() => {
    refreshData();
  }, [selectedHalaqohId]);

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('halaqoh_capaian_updated', handleUpdate);
    window.addEventListener('halaqoh_santri_updated', handleUpdate);
    window.addEventListener('halaqoh_all_reloaded', handleUpdate);
    return () => {
      window.removeEventListener('halaqoh_capaian_updated', handleUpdate);
      window.removeEventListener('halaqoh_santri_updated', handleUpdate);
      window.removeEventListener('halaqoh_all_reloaded', handleUpdate);
    };
  }, [selectedHalaqohId]);

  const currentHalaqoh = halaqohList.find(h => h.id === selectedHalaqohId) || halaqohList[0];

  // Filter santri and capaian
  const filteredSantri = santriList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCapaianForSantri = (santriId: string): CapaianBulanan | undefined => {
    return capaianList.find(
      c => c.santriId === santriId && c.bulan.toLowerCase() === selectedMonth.toLowerCase()
    );
  };

  // Quick action: Open form for student
  const handleOpenEdit = (santri: Santri) => {
    const existing = getCapaianForSantri(santri.id);
    if (existing) {
      setEditingCapaian({ ...existing });
    } else {
      // Create new initial template matching the user prompt standard
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();

      const newCapaian: CapaianBulanan = {
        id: `cap-${santri.id}-${selectedMonth.toLowerCase()}-${yyyy}`,
        santriId: santri.id,
        santriName: santri.name,
        halaqohId: santri.halaqohId,
        halaqohName: santri.halaqohName,
        musyrifName: currentUser?.fullName || currentHalaqoh?.musyrifName || 'Ustadz Abdullah Al-Hafidz',
        bulan: selectedMonth,
        tanggalPengambilan: `${dd}/${mm}/${yyyy}`,
        semester: appSettings.currentSemester || 'Ganjil',
        tahunAjaran: appSettings.academicYear || '2026/2027',
        programBacaan: {
          jenis: 'Pra Tahsin',
          jilid: '1 (satu)',
          halamanCapaianTerakhir: 'Halaman 47',
          standardisasiBacaan: '-',
          tingkatKemampuanTadarus: 'Ausat',
          capaianTadarusKhotmah: '-'
        },
        tahfidz: {
          totalSeluruhHafalan: '15 Halaman (Juz 30)',
          hafalanTerakhir: "QS. An-Naba' : 1-20"
        },
        programItqonHafalan: {
          totalMurojaah1Bulan: '12 surat (An-Naas sampai Al-Asr)',
          ujianHafalan: '-',
          tasmi: '-'
        },
        motivasiSaranMusyrif: `Masya Allah, pertahankan selalu semangat belajar nya yaa ${santri.name}, selalu murojaah pra tahsin dan surat hafalan nya di rumah yaa`,
        updatedAt: new Date().toISOString()
      };
      setEditingCapaian(newCapaian);
    }
    setActiveModal('edit');
  };

  const handleSaveCapaian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCapaian) return;

    StorageService.saveCapaian(editingCapaian);
    setActiveModal(null);
    setEditingCapaian(null);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#059669', '#d97706', '#10b981']
      });
    } catch {
      // Ignore
    }

    showToast('Laporan capaian santri berhasil disimpan!');
  };

  const handleSendToCoordinator = (capaian: CapaianBulanan) => {
    const message = formatLaporanCapaianWhatsApp(capaian);
    openWhatsAppWithMessage(appSettings.coordinatorPhone, message);
  };

  const handleCopyFormattedText = async (capaian: CapaianBulanan) => {
    const message = formatLaporanCapaianWhatsApp(capaian);
    const result = await shareOrCopy(`Laporan Capaian ${capaian.santriName}`, message);
    if (result === 'copied') {
      setCopiedId(capaian.id);
      setTimeout(() => setCopiedId(null), 2500);
      showToast('Format pesan WhatsApp berhasil disalin!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stats calculation
  const evaluatedCount = santriList.filter(s => !!getCapaianForSantri(s.id)).length;
  const ausatCount = capaianList.filter(
    c => c.halaqohId === selectedHalaqohId && c.bulan === selectedMonth && c.programBacaan.tingkatKemampuanTadarus === 'Ausat'
  ).length;
  const alaCount = capaianList.filter(
    c => c.halaqohId === selectedHalaqohId && c.bulan === selectedMonth && c.programBacaan.tingkatKemampuanTadarus === "A'la"
  ).length;

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-stone-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg border border-amber-400/30">
                  <Award className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Dasbor Laporan Capaian Santri
                </h2>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1">
                Rekap bulanan terstruktur dikirimkan langsung ke WhatsApp Koordinator Musyrif ({appSettings.coordinatorName})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 bg-emerald-950/60 rounded-lg border border-emerald-600/40 text-emerald-200">
                Semester: {appSettings.currentSemester} · {appSettings.academicYear}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-700/40 text-center">
            <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
              <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Terekap</p>
              <p className="text-base sm:text-lg font-extrabold text-white tabular-nums">
                {evaluatedCount} / {santriList.length}
              </p>
            </div>
            <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
              <p className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">Tingkat A'la</p>
              <p className="text-base sm:text-lg font-extrabold text-white tabular-nums">
                {alaCount} Santri
              </p>
            </div>
            <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
              <p className="text-[10px] text-teal-300 uppercase tracking-wider font-semibold">Tingkat Ausat</p>
              <p className="text-base sm:text-lg font-extrabold text-white tabular-nums">
                {ausatCount} Santri
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Month Picker Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Month Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bulan Evaluasi</span>
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              >
                {MONTH_LIST.map(m => (
                  <option key={m} value={m}>
                    Bulan {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Halaqoh Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Halaqoh</span>
            </label>
            <div className="relative">
              <select
                value={selectedHalaqohId}
                onChange={e => setSelectedHalaqohId(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
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

          {/* Search Santri */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cari Santri</span>
            </label>
            <input
              type="text"
              placeholder="Ketik nama santri..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* List of Santri Cards with Monthly Achievement Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-stone-800">
            Daftar Santri Halaqoh {currentHalaqoh?.name} — Bulan {selectedMonth}
          </h3>
          <span className="text-[11px] text-stone-500 font-medium">
            {filteredSantri.length} santri
          </span>
        </div>

        {filteredSantri.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
            <p className="text-sm font-medium text-stone-600">Santri tidak ditemukan.</p>
          </div>
        ) : (
          filteredSantri.map((santri, idx) => {
            const capaian = getCapaianForSantri(santri.id);
            const isEvaluated = !!capaian;

            return (
              <div
                key={santri.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200 hover:border-emerald-300 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {santri.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-stone-900 leading-tight">
                          {santri.name}
                        </h4>
                        {isEvaluated ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Siap Kirim
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Belum Ada Data
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                        <span>{santri.gender === 'ikhwan' ? 'Ikhwan' : 'Akhwat'}</span>
                        <span>·</span>
                        <span>{santri.halaqohName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit/Input Button */}
                  <button
                    onClick={() => handleOpenEdit(santri)}
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isEvaluated ? 'Edit Capaian' : 'Isi Capaian'}</span>
                  </button>
                </div>

                {/* Achievement Summary snippet if exists */}
                {capaian ? (
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 text-xs space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">1. Pra Tahsin / Tahsin</span>
                        <p className="font-bold text-stone-800">
                          Jilid {capaian.programBacaan.jilid} · {capaian.programBacaan.halamanCapaianTerakhir}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Tadarus</span>
                        <p className="font-bold text-emerald-700">
                          {capaian.programBacaan.tingkatKemampuanTadarus}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">2. Tahfidz</span>
                        <p className="font-bold text-stone-800 truncate" title={capaian.tahfidz.hafalanTerakhir}>
                          {capaian.tahfidz.hafalanTerakhir}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-semibold block">Total Hafalan</span>
                        <p className="font-bold text-stone-800">
                          {capaian.tahfidz.totalSeluruhHafalan}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-start gap-1.5 text-stone-600 italic">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">"{capaian.motivasiSaranMusyrif}"</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-200/60 text-xs text-amber-800 flex items-center justify-between">
                    <span>Data capaian bulan {selectedMonth} belum diinput.</span>
                    <button
                      onClick={() => handleOpenEdit(santri)}
                      className="font-bold text-emerald-700 underline text-xs"
                    >
                      Input Sekarang
                    </button>
                  </div>
                )}

                {/* Action Buttons: Send to Coordinator WA, Preview Digital Report, Copy */}
                {capaian && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {/* Primary Button: Kirim ke WhatsApp Koordinator Musyrif */}
                    <button
                      onClick={() => handleSendToCoordinator(capaian)}
                      type="button"
                      className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim ke WA Koordinator</span>
                    </button>

                    {/* View Digital Report Card */}
                    <button
                      onClick={() => {
                        setPreviewCapaian(capaian);
                        setActiveModal('preview');
                      }}
                      type="button"
                      className="min-h-[44px] px-3 py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-stone-200"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-600" />
                      <span>Lihat Rapor Digital</span>
                    </button>

                    {/* Copy WA Format */}
                    <button
                      onClick={() => handleCopyFormattedText(capaian)}
                      type="button"
                      className="min-h-[44px] px-3 py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-stone-200"
                    >
                      {copiedId === capaian.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-600" />
                          <span>Salin Format WA</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL 1: Edit / Create Capaian Bulanan Form */}
      {activeModal === 'edit' && editingCapaian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">
                  Input Capaian Santri: {editingCapaian.santriName}
                </h3>
                <p className="text-xs text-emerald-200">
                  Bulan {editingCapaian.bulan} · {editingCapaian.halaqohName}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCapaian} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Meta Header Information */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tanggal Data Diambil</label>
                  <input
                    type="text"
                    value={editingCapaian.tanggalPengambilan}
                    onChange={e => setEditingCapaian({ ...editingCapaian, tanggalPengambilan: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-medium text-stone-800"
                    placeholder="30/07/2026"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Semester</label>
                  <input
                    type="text"
                    value={editingCapaian.semester}
                    onChange={e => setEditingCapaian({ ...editingCapaian, semester: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-medium text-stone-800"
                    placeholder="Ganjil"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={editingCapaian.tahunAjaran}
                    onChange={e => setEditingCapaian({ ...editingCapaian, tahunAjaran: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-medium text-stone-800"
                    placeholder="2026/2027"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Nama Musyrif</label>
                  <input
                    type="text"
                    value={editingCapaian.musyrifName}
                    onChange={e => setEditingCapaian({ ...editingCapaian, musyrifName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-medium text-stone-800"
                    placeholder="Ustadz Abdullah Al-Hafidz"
                    required
                  />
                </div>
              </div>

              {/* 1️⃣ Program Perbaikan Bacaan: Pra Tahsin */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3.5 space-y-2.5">
                <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Program Perbaikan Bacaan (Pra Tahsin / Tahsin)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">Jenis Program</label>
                    <select
                      value={editingCapaian.programBacaan.jenis}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programBacaan: { ...editingCapaian.programBacaan, jenis: e.target.value as any }
                      })}
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    >
                      <option value="Pra Tahsin">Pra Tahsin</option>
                      <option value="Tahsin">Tahsin</option>
                      <option value="Tahfidz Lanjutan">Tahfidz Lanjutan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">a. Jilid</label>
                    <input
                      type="text"
                      value={editingCapaian.programBacaan.jilid}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programBacaan: { ...editingCapaian.programBacaan, jilid: e.target.value }
                      })}
                      placeholder="1 (satu)"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">b. Halaman Capaian Terakhir</label>
                    <input
                      type="text"
                      value={editingCapaian.programBacaan.halamanCapaianTerakhir}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programBacaan: { ...editingCapaian.programBacaan, halamanCapaianTerakhir: e.target.value }
                      })}
                      placeholder="Halaman 47"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">c. Standardisasi Bacaan</label>
                    <input
                      type="text"
                      value={editingCapaian.programBacaan.standardisasiBacaan}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programBacaan: { ...editingCapaian.programBacaan, standardisasiBacaan: e.target.value }
                      })}
                      placeholder="-"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      d. Tingkat Kemampuan Tadarus (Pilih):
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Adna', 'Ausat', "A'la"] as TingkatTadarus[]).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setEditingCapaian({
                            ...editingCapaian,
                            programBacaan: { ...editingCapaian.programBacaan, tingkatKemampuanTadarus: lvl }
                          })}
                          className={`py-1.5 px-2 rounded-lg font-bold text-center text-xs transition-colors ${
                            editingCapaian.programBacaan.tingkatKemampuanTadarus === lvl
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">e. Capaian Tadarus Khotmah</label>
                    <input
                      type="text"
                      value={editingCapaian.programBacaan.capaianTadarusKhotmah}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programBacaan: { ...editingCapaian.programBacaan, capaianTadarusKhotmah: e.target.value }
                      })}
                      placeholder="-"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 2️⃣ Tahfidz */}
              <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-3.5 space-y-2.5">
                <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Tahfidz</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      a. Total Seluruh Hafalan (dihitung perhalaman)
                    </label>
                    <input
                      type="text"
                      value={editingCapaian.tahfidz.totalSeluruhHafalan}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        tahfidz: { ...editingCapaian.tahfidz, totalSeluruhHafalan: e.target.value }
                      })}
                      placeholder="15 Halaman (Juz 30)"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      b. Hafalan terakhir (Quran surat dan ayat)
                    </label>
                    <input
                      type="text"
                      value={editingCapaian.tahfidz.hafalanTerakhir}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        tahfidz: { ...editingCapaian.tahfidz, hafalanTerakhir: e.target.value }
                      })}
                      placeholder="QS. An-Naba' : 1-20"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3️⃣ Program Itqon Hafalan */}
              <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-3.5 space-y-2.5">
                <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Program Itqon Hafalan</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      a. Total Murojaah selama 1 bulan
                    </label>
                    <input
                      type="text"
                      value={editingCapaian.programItqonHafalan.totalMurojaah1Bulan}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programItqonHafalan: { ...editingCapaian.programItqonHafalan, totalMurojaah1Bulan: e.target.value }
                      })}
                      placeholder="12 surat (An-Naas sampai Al-Asr)"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      b. Ujian Hafalan
                    </label>
                    <input
                      type="text"
                      value={editingCapaian.programItqonHafalan.ujianHafalan}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programItqonHafalan: { ...editingCapaian.programItqonHafalan, ujianHafalan: e.target.value }
                      })}
                      placeholder="-"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      c. Tasmi'
                    </label>
                    <input
                      type="text"
                      value={editingCapaian.programItqonHafalan.tasmi}
                      onChange={e => setEditingCapaian({
                        ...editingCapaian,
                        programItqonHafalan: { ...editingCapaian.programItqonHafalan, tasmi: e.target.value }
                      })}
                      placeholder="-"
                      className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 4️⃣ Motivasi/saran dari Musyrif */}
              <div className="border border-stone-200 bg-stone-50 rounded-xl p-3.5 space-y-2">
                <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-700 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Motivasi / Saran dari Musyrif</span>
                </h4>

                <textarea
                  rows={3}
                  value={editingCapaian.motivasiSaranMusyrif}
                  onChange={e => setEditingCapaian({ ...editingCapaian, motivasiSaranMusyrif: e.target.value })}
                  placeholder="Masya Allah, pertahankan selalu semangat belajar nya yaa Rhazes..."
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg font-medium text-stone-900 leading-relaxed"
                  required
                />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 font-semibold self-center">Template:</span>
                  <button
                    type="button"
                    onClick={() => setEditingCapaian({
                      ...editingCapaian,
                      motivasiSaranMusyrif: `Masya Allah, pertahankan selalu semangat belajar nya yaa ${editingCapaian.santriName}, selalu murojaah pra tahsin dan surat hafalan nya di rumah yaa`
                    })}
                    className="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-700 hover:bg-stone-100"
                  >
                    Motivasi Standar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCapaian({
                      ...editingCapaian,
                      motivasiSaranMusyrif: `Alhamdulillah makhraj & tajwid ${editingCapaian.santriName} semakin bagus. Tingkatkan kedisiplinan mengulang sabaq ba'da Maghrib.`
                    })}
                    className="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-700 hover:bg-stone-100"
                  >
                    Perbaikan Tajwid
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCapaian({
                      ...editingCapaian,
                      motivasiSaranMusyrif: `Baarakallahu fiik, santri sangat antusias. Mohon bimbingan orang tua untuk terus mendampingi tadarus di rumah.`
                    })}
                    className="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-700 hover:bg-stone-100"
                  >
                    Saran Orang Tua
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs active:scale-95 transition-all"
                >
                  Simpan Laporan Capaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Digital Report Card Preview ("Rapor Capaian Santri") */}
      {activeModal === 'preview' && previewCapaian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Action Bar */}
            <div className="p-3 bg-stone-900 text-white flex items-center justify-between shrink-0 no-print">
              <span className="text-xs font-semibold text-emerald-400">
                Rapor Capaian Santri Digital
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1 text-stone-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cetak</span>
                </button>
                <button
                  onClick={() => handleSendToCoordinator(previewCapaian)}
                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 text-white font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke WA</span>
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-7 h-7 rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Digital Card */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-50">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-emerald-800/20 relative">
                {/* Islamic Corner Motif */}
                <div className="text-center pb-4 border-b-2 border-emerald-800/20 mb-4">
                  <p className="font-arabic text-xl text-emerald-900 mb-1">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-emerald-950">
                    Laporan Capaian Santri Bulan {previewCapaian.bulan}
                  </h2>
                  <p className="text-xs font-semibold text-amber-700">
                    {appSettings.institutionName}
                  </p>
                </div>

                {/* Metadata Table */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-stone-800 mb-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <div>
                    <span className="text-stone-500">Data diambil tgl:</span>{' '}
                    <strong className="text-stone-900">{previewCapaian.tanggalPengambilan}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Halaqoh:</span>{' '}
                    <strong className="text-stone-900">{previewCapaian.halaqohName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Nama Musyrif:</span>{' '}
                    <strong className="text-stone-900">{previewCapaian.musyrifName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Semester:</span>{' '}
                    <strong className="text-stone-900">{previewCapaian.semester}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Tahun Ajaran:</span>{' '}
                    <strong className="text-stone-900">{previewCapaian.tahunAjaran}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Nama Santri:</span>{' '}
                    <strong className="text-emerald-900 text-sm font-extrabold">{previewCapaian.santriName}</strong>
                  </div>
                </div>

                {/* 1. Program Perbaikan Bacaan */}
                <div className="mb-3.5">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider mb-1.5 pb-1 border-b border-stone-200 flex items-center justify-between">
                    <span>1️⃣ Program Perbaikan Bacaan: {previewCapaian.programBacaan.jenis}</span>
                  </h4>
                  <ul className="text-xs space-y-1 text-stone-800 pl-2">
                    <li>a. Jilid : <strong>{previewCapaian.programBacaan.jilid}</strong></li>
                    <li>b. Halaman capaian terakhir : <strong>{previewCapaian.programBacaan.halamanCapaianTerakhir}</strong></li>
                    <li>c. Standardisasi Bacaan : <strong>{previewCapaian.programBacaan.standardisasiBacaan}</strong></li>
                    <li>
                      d. Tingkat Kemampuan Tadarus :{' '}
                      <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {previewCapaian.programBacaan.tingkatKemampuanTadarus}
                      </strong>
                    </li>
                    <li>e. Capaian Tadarus Khotmah : <strong>{previewCapaian.programBacaan.capaianTadarusKhotmah}</strong></li>
                  </ul>
                </div>

                {/* 2. Tahfidz */}
                <div className="mb-3.5">
                  <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider mb-1.5 pb-1 border-b border-stone-200">
                    2️⃣ Tahfidz
                  </h4>
                  <ul className="text-xs space-y-1 text-stone-800 pl-2">
                    <li>a. Total Seluruh Hafalan : <strong>{previewCapaian.tahfidz.totalSeluruhHafalan}</strong></li>
                    <li>b. Hafalan terakhir : <strong className="text-amber-800">{previewCapaian.tahfidz.hafalanTerakhir}</strong></li>
                  </ul>
                </div>

                {/* 3. Program Itqon Hafalan */}
                <div className="mb-3.5">
                  <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wider mb-1.5 pb-1 border-b border-stone-200">
                    3️⃣ Program Itqon Hafalan
                  </h4>
                  <ul className="text-xs space-y-1 text-stone-800 pl-2">
                    <li>a. Total Murojaah selama 1 bulan : <strong>{previewCapaian.programItqonHafalan.totalMurojaah1Bulan}</strong></li>
                    <li>b. Ujian Hafalan : <strong>{previewCapaian.programItqonHafalan.ujianHafalan}</strong></li>
                    <li>c. Tasmi' : <strong>{previewCapaian.programItqonHafalan.tasmi}</strong></li>
                  </ul>
                </div>

                {/* 4. Motivasi/saran dari Musyrif */}
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-xs text-stone-800 mb-1">
                    4️⃣ Motivasi/saran dari Musyrif:
                  </h4>
                  <p className="text-xs text-stone-700 italic leading-relaxed">
                    "{previewCapaian.motivasiSaranMusyrif}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
