import { Santri, Halaqoh, CapaianBulanan, AppSettings, PresensiHarian } from '../types';

export const INITIAL_HALAQOHS: Halaqoh[] = [
  {
    id: 'hq-pra-1',
    name: 'Pra Tahfidz 1',
    musyrifName: 'Ustadz Abdullah Al-Hafidz',
    tingkat: 'Pra Tahfidz',
    description: 'Halaqoh pemula fokus perbaikan bacaan (Pra Tahsin) & Juz 30'
  },
  {
    id: 'hq-pra-2',
    name: 'Pra Tahfidz 2',
    musyrifName: 'Ustadz Salman Al-Farisi',
    tingkat: 'Pra Tahfidz',
    description: 'Halaqoh Pra Tahfidz kelompok lanjutan Juz 30'
  },
  {
    id: 'hq-tahfidz-1',
    name: 'Tahfidz 1',
    musyrifName: 'Ustadz Zaid bin Tsabit',
    tingkat: 'Tahfidz',
    description: 'Halaqoh Tahfidz Reguler Juz 29 & 1'
  },
  {
    id: 'hq-itqon-1',
    name: 'Itqon Tahfidz',
    musyrifName: 'Ustadz Muadz bin Jabal',
    tingkat: 'Itqon',
    description: 'Halaqoh mutqin & tasmi hafalan'
  }
];

export const INITIAL_SANTRI: Santri[] = [
  {
    id: 'st-rhazes',
    name: 'Rhazes',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    gender: 'ikhwan',
    phoneParent: '6281298765432',
    joinDate: '2026-01-10'
  },
  {
    id: 'st-zaid',
    name: 'Zaid Al-Banna',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    gender: 'ikhwan',
    phoneParent: '6281234567801',
    joinDate: '2026-01-10'
  },
  {
    id: 'st-umar',
    name: 'Umar Al-Faruq',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    gender: 'ikhwan',
    phoneParent: '6281234567802',
    joinDate: '2026-01-15'
  },
  {
    id: 'st-fatimah',
    name: 'Fatimah Az-Zahra',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    gender: 'akhwat',
    phoneParent: '6281234567803',
    joinDate: '2026-01-15'
  },
  {
    id: 'st-abdullah',
    name: 'Abdullah Rabbani',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    gender: 'ikhwan',
    phoneParent: '6281234567804',
    joinDate: '2026-02-01'
  },
  {
    id: 'st-maryam',
    name: 'Maryam Salsabila',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    gender: 'akhwat',
    phoneParent: '6281234567805',
    joinDate: '2026-02-01'
  },
  {
    id: 'st-ali',
    name: 'Ali As-Sajjad',
    halaqohId: 'hq-pra-2',
    halaqohName: 'Pra Tahfidz 2',
    gender: 'ikhwan',
    phoneParent: '6281234567806',
    joinDate: '2026-02-10'
  },
  {
    id: 'st-khadijah',
    name: 'Khadijah Al-Kubra',
    halaqohId: 'hq-pra-2',
    halaqohName: 'Pra Tahfidz 2',
    gender: 'akhwat',
    phoneParent: '6281234567807',
    joinDate: '2026-02-10'
  }
];

export const INITIAL_CAPAIAN_BULANAN: CapaianBulanan[] = [
  {
    id: 'cap-rhazes-juli-2026',
    santriId: 'st-rhazes',
    santriName: 'Rhazes',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    musyrifName: 'Ustadz Abdullah Al-Hafidz',
    bulan: 'Juli',
    tanggalPengambilan: '30/07/2026',
    semester: 'Ganjil',
    tahunAjaran: '2026/2027',
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
    motivasiSaranMusyrif: 'Masya Allah, pertahankan selalu semangat belajar nya yaa Rhazes, selalu murojaah pra tahsin dan surat hafalan nya di rumah yaa',
    updatedAt: '2026-07-30T10:00:00Z'
  },
  {
    id: 'cap-zaid-juli-2026',
    santriId: 'st-zaid',
    santriName: 'Zaid Al-Banna',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    musyrifName: 'Ustadz Abdullah Al-Hafidz',
    bulan: 'Juli',
    tanggalPengambilan: '30/07/2026',
    semester: 'Ganjil',
    tahunAjaran: '2026/2027',
    programBacaan: {
      jenis: 'Pra Tahsin',
      jilid: '2 (dua)',
      halamanCapaianTerakhir: 'Halaman 12',
      standardisasiBacaan: 'Lulus Standar Jilid 1',
      tingkatKemampuanTadarus: "A'la",
      capaianTadarusKhotmah: '-'
    },
    tahfidz: {
      totalSeluruhHafalan: '18 Halaman (Juz 30)',
      hafalanTerakhir: "QS. At-Takwir : 1-29"
    },
    programItqonHafalan: {
      totalMurojaah1Bulan: '15 surat (An-Naas s/d Al-Humazah)',
      ujianHafalan: 'Mumtaz (95)',
      tasmi: 'Tasmi 1/2 Juz 30'
    },
    motivasiSaranMusyrif: 'Alhamdulillah Zaid menunjukkan kemajuan makhraj huruf yang sangat baik. Tingkatkan murojaah rutin ba\'da Maghrib.',
    updatedAt: '2026-07-30T10:30:00Z'
  },
  {
    id: 'cap-umar-juli-2026',
    santriId: 'st-umar',
    santriName: 'Umar Al-Faruq',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    musyrifName: 'Ustadz Abdullah Al-Hafidz',
    bulan: 'Juli',
    tanggalPengambilan: '30/07/2026',
    semester: 'Ganjil',
    tahunAjaran: '2026/2027',
    programBacaan: {
      jenis: 'Pra Tahsin',
      jilid: '1 (satu)',
      halamanCapaianTerakhir: 'Halaman 35',
      standardisasiBacaan: '-',
      tingkatKemampuanTadarus: 'Ausat',
      capaianTadarusKhotmah: '-'
    },
    tahfidz: {
      totalSeluruhHafalan: '10 Halaman (Juz 30)',
      hafalanTerakhir: "QS. Al-Buruj : 1-15"
    },
    programItqonHafalan: {
      totalMurojaah1Bulan: '10 surat (An-Naas sampai Al-Fil)',
      ujianHafalan: '-',
      tasmi: '-'
    },
    motivasiSaranMusyrif: 'Bagus sekali Umar, perhatikan panjang pendek mad thabi\'i ya nak. Terus semangat!',
    updatedAt: '2026-07-30T11:00:00Z'
  }
];

export const INITIAL_PRESENSI: PresensiHarian[] = [
  {
    id: 'pres-2026-09-23-hq-pra-1',
    date: '2026-09-23',
    halaqohId: 'hq-pra-1',
    halaqohName: 'Pra Tahfidz 1',
    musyrifName: 'Ustadz Abdullah Al-Hafidz',
    items: [
      { santriId: 'st-rhazes', santriName: 'Rhazes', status: 'hadir', note: 'Sabaq lancar Halaman 48' },
      { santriId: 'st-zaid', santriName: 'Zaid Al-Banna', status: 'hadir', note: 'Ziyadah QS. Al-Infitar' },
      { santriId: 'st-umar', santriName: 'Umar Al-Faruq', status: 'hadir', note: 'Murojaah juz 30 lancar' },
      { santriId: 'st-fatimah', santriName: 'Fatimah Az-Zahra', status: 'berhalangan_2x_sepekan', note: 'Jadwal mengaji 2x sepekan (Senin & Kamis)' },
      { santriId: 'st-abdullah', santriName: 'Abdullah Rabbani', status: 'izin_sakit', note: 'Izin flu dari orang tua via WA' },
      { santriId: 'st-maryam', santriName: 'Maryam Salsabila', status: 'hadir', note: 'Pra tahsin hlm 30' }
    ],
    createdAt: '2026-09-23T07:30:00Z',
    updatedAt: '2026-09-23T07:30:00Z',
    quoteId: 2
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  coordinatorName: 'Ustadz Ahmad Fauzan, Lc.',
  coordinatorPhone: '6281234567890',
  whatsappGroup1Name: 'Grup Halaqoh Pra Tahfidz 1 (Wali Santri)',
  whatsappGroup1LinkOrPhone: 'https://chat.whatsapp.com/sampleGroup1',
  whatsappGroup2Name: 'Grup Musyrif & Koordinator Qur\'an',
  whatsappGroup2LinkOrPhone: 'https://chat.whatsapp.com/sampleGroup2',
  institutionName: 'Rumah Tahfidz & Halaqoh Al-Qur\'an',
  academicYear: '2026/2027',
  currentSemester: 'Ganjil'
};
