import { PresensiHarian, CapaianBulanan, QuranQuote, AppSettings } from '../types';

export function formatPresensiWhatsApp(
  presensi: PresensiHarian,
  quote: QuranQuote,
  settings: AppSettings
): string {
  // Format Date cleanly
  let dateFormatted = presensi.date;
  try {
    const d = new Date(presensi.date + 'T00:00:00');
    dateFormatted = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    dateFormatted = presensi.date;
  }

  // Count statuses
  const total = presensi.items.length;
  const hadir = presensi.items.filter(i => i.status === 'hadir').length;
  const izinSakit = presensi.items.filter(i => i.status === 'izin_sakit').length;
  const berhalangan2x = presensi.items.filter(i => i.status === 'berhalangan_2x_sepekan').length;
  const alpa = presensi.items.filter(i => i.status === 'alpa').length;

  const lines: string[] = [
    `*📋 REKAP PRESENSI HARIAN SANTRI*`,
    `*${settings.institutionName || 'Halaqoh Qur\'an'}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📅 *Hari/Tanggal:* ${dateFormatted}`,
    `🕌 *Halaqoh:* ${presensi.halaqohName}`,
    `👳🏻‍♂️ *Musyrif:* ${presensi.musyrifName}`,
    ``,
    `*📊 Ringkasan Kehadiran (${total} Santri):*`,
    `✅ Hadir: ${hadir} santri`,
    `⚠️ Izin/Sakit: ${izinSakit} santri`,
    `🔄 Berhalangan / Mengaji 2x/Pekan: ${berhalangan2x} santri`,
    alpa > 0 ? `❌ Tanpa Keterangan: ${alpa} santri` : ``,
    ``,
    `*📝 Rincian Kehadiran Santri:*`
  ].filter(Boolean);

  presensi.items.forEach((item, index) => {
    let statusText = '';
    let statusIcon = '';
    switch (item.status) {
      case 'hadir':
        statusIcon = '✅';
        statusText = 'Hadir';
        break;
      case 'izin_sakit':
        statusIcon = '⚠️';
        statusText = 'Izin/Sakit';
        break;
      case 'berhalangan_2x_sepekan':
        statusIcon = '🔄';
        statusText = 'Berhalangan / Mengaji 2x dalam sepekan';
        break;
      case 'alpa':
        statusIcon = '❌';
        statusText = 'Alpa';
        break;
    }

    let line = `${index + 1}. *${item.santriName}* — ${statusIcon} ${statusText}`;
    if (item.note && item.note.trim()) {
      line += `\n    _Catatan: ${item.note.trim()}_`;
    }
    lines.push(line);
  });

  lines.push(
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✨ *KATA-KATA MOTIVASI QUR'ANI HARI INI* ✨`,
    `📖 *${quote.surah} : ${quote.ayah}*`,
    `_"${quote.arabic}"_`,
    ``,
    `*Artinya:*`,
    `"${quote.translation}"`,
    ``,
    `💡 *Nasehat/Tadabbur:*`,
    `_${quote.reflection}_`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `_Jazakumullahu khairan katsiran atas perhatian dan dukungan Ayah/Bunda/Asatidzah._`
  );

  return lines.join('\n');
}

export function formatLaporanCapaianWhatsApp(capaian: CapaianBulanan): string {
  const b = capaian.programBacaan;
  const t = capaian.tahfidz;
  const i = capaian.programItqonHafalan;

  // Format matches exactly the user prompt specification
  return [
    `*Laporan Capaian Santri Bulan ${capaian.bulan}*`,
    `Data diambil dari tanggal ${capaian.tanggalPengambilan}`,
    `Halaqoh : ${capaian.halaqohName}`,
    `Nama Musyrif : ${capaian.musyrifName}`,
    `semester : ${capaian.semester}`,
    `tahun ajaran : ${capaian.tahunAjaran}`,
    `Nama Santri: ${capaian.santriName}`,
    ``,
    `1️⃣ *Program Perbaikan Bacaan: ${b.jenis}*`,
    `a. Jilid : ${b.jilid}`,
    `b. Halaman capaian terakhir: ${b.halamanCapaianTerakhir}`,
    `c. Standardisasi Bacaan: ${b.standardisasiBacaan}`,
    `d. Tingkat Kemampuan Tadarus: ${b.tingkatKemampuanTadarus}`,
    `e. Capaian Tadarus Khotmah: ${b.capaianTadarusKhotmah}`,
    ``,
    `2️⃣ *Tahfidz*`,
    `a. Total Seluruh Hafalan : ${t.totalSeluruhHafalan}`,
    `b. Hafalan terakhir: ${t.hafalanTerakhir}`,
    ``,
    `3️⃣ *Program Itqon Hafalan*`,
    `a. Total Murojaah selama 1 bulan: ${i.totalMurojaah1Bulan}`,
    `b. Ujian Hafalan: ${i.ujianHafalan}`,
    `c. Tasmi': ${i.tasmi}`,
    ``,
    `4️⃣ *Motivasi/saran dari Musyrif:*`,
    `${capaian.motivasiSaranMusyrif}`
  ].join('\n');
}

export function cleanPhoneNumber(raw: string): string {
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function openWhatsAppWithMessage(phoneOrLink: string | undefined, message: string) {
  const encodedText = encodeURIComponent(message);
  
  if (!phoneOrLink || phoneOrLink.trim() === '') {
    // Open universal WhatsApp share
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, '_blank');
    return;
  }

  const trimmed = phoneOrLink.trim();
  // Check if it's already a link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it's a wa group link or wa.me link
    if (trimmed.includes('chat.whatsapp.com')) {
      // Group link doesn't accept prefilled text in URL parameters reliably, so copy and open group
      navigator.clipboard?.writeText(message);
      window.open(trimmed, '_blank');
      return;
    }
    window.open(trimmed, '_blank');
    return;
  }

  // It's a phone number
  const phone = cleanPhoneNumber(trimmed);
  const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  window.open(url, '_blank');
}

export async function shareOrCopy(title: string, text: string): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text
      });
      return 'shared';
    } catch {
      // Fallback to copy if user cancelled or error
    }
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return 'copied';
  }

  return 'copied';
}
