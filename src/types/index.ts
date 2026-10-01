export type KehadiranStatus = 'hadir' | 'izin_sakit' | 'berhalangan_2x_sepekan' | 'alpa';

export type TingkatTadarus = 'Adna' | 'Ausat' | "A'la";

export interface Santri {
  id: string;
  name: string;
  halaqohId: string;
  halaqohName: string;
  gender: 'ikhwan' | 'akhwat';
  phoneParent?: string;
  joinDate?: string;
}

export interface Halaqoh {
  id: string;
  name: string;
  musyrifName: string;
  tingkat: 'Pra Tahfidz' | 'Tahfidz' | 'Tahsin' | 'Itqon';
  description?: string;
}

export interface PresensiItem {
  santriId: string;
  santriName: string;
  status: KehadiranStatus;
  note?: string;
}

export interface PresensiHarian {
  id: string;
  date: string; // YYYY-MM-DD
  halaqohId: string;
  halaqohName: string;
  musyrifName: string;
  items: PresensiItem[];
  createdAt: string;
  updatedAt: string;
  quoteId?: number;
}

export interface ProgramBacaan {
  jenis: 'Pra Tahsin' | 'Tahsin' | 'Tahfidz Lanjutan';
  jilid: string; // e.g. "1 (satu)"
  halamanCapaianTerakhir: string; // e.g. "Halaman 47"
  standardisasiBacaan: string; // e.g. "-"
  tingkatKemampuanTadarus: TingkatTadarus;
  capaianTadarusKhotmah: string; // e.g. "-"
}

export interface ProgramTahfidz {
  totalSeluruhHafalan: string; // e.g. "15 Halaman (1.5 Juz)"
  hafalanTerakhir: string; // e.g. "QS. An-Naba' : 1-20"
}

export interface ProgramItqon {
  totalMurojaah1Bulan: string; // e.g. "12 surat (An-Naas sampai Al-Asr)"
  ujianHafalan: string; // e.g. "-"
  tasmi: string; // e.g. "-"
}

export interface CapaianBulanan {
  id: string;
  santriId: string;
  santriName: string;
  halaqohId: string;
  halaqohName: string;
  musyrifName: string;
  bulan: string; // e.g. "Juli"
  tanggalPengambilan: string; // DD/MM/YYYY, e.g. "30/07/2026"
  semester: string; // e.g. "Ganjil"
  tahunAjaran: string; // e.g. "2026/2027"
  programBacaan: ProgramBacaan;
  tahfidz: ProgramTahfidz;
  programItqonHafalan: ProgramItqon;
  motivasiSaranMusyrif: string;
  updatedAt: string;
}

export interface QuranQuote {
  id: number;
  surah: string;
  ayah: string;
  arabic: string;
  translation: string;
  theme: string;
  reflection: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: 'musyrif' | 'koordinator';
  assignedHalaqohId: string;
  assignedHalaqohName: string;
  phone: string;
}

export interface AppSettings {
  coordinatorName: string;
  coordinatorPhone: string;
  whatsappGroup1Name: string;
  whatsappGroup1LinkOrPhone: string;
  whatsappGroup2Name: string;
  whatsappGroup2LinkOrPhone: string;
  institutionName: string;
  academicYear: string;
  currentSemester: string;
}
