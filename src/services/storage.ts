import {
  Santri,
  Halaqoh,
  PresensiHarian,
  CapaianBulanan,
  AppSettings,
  UserProfile
} from '../types';
import {
  INITIAL_HALAQOHS,
  INITIAL_SANTRI,
  INITIAL_PRESENSI,
  INITIAL_CAPAIAN_BULANAN,
  INITIAL_SETTINGS
} from '../data/initialData';

const STORAGE_KEYS = {
  SANTRI: 'halaqoh_app_santri_v1',
  HALAQOHS: 'halaqoh_app_halaqohs_v1',
  PRESENSI: 'halaqoh_app_presensi_v1',
  CAPAIAN: 'halaqoh_app_capaian_v1',
  SETTINGS: 'halaqoh_app_settings_v1',
  CURRENT_USER: 'halaqoh_app_current_user_v1',
  IS_LOGGED_IN: 'halaqoh_app_logged_in_v1'
};

export const StorageService = {
  // Initialize storage with defaults if empty
  initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.SANTRI)) {
      localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(INITIAL_SANTRI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HALAQOHS)) {
      localStorage.setItem(STORAGE_KEYS.HALAQOHS, JSON.stringify(INITIAL_HALAQOHS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRESENSI)) {
      localStorage.setItem(STORAGE_KEYS.PRESENSI, JSON.stringify(INITIAL_PRESENSI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAPAIAN)) {
      localStorage.setItem(STORAGE_KEYS.CAPAIAN, JSON.stringify(INITIAL_CAPAIAN_BULANAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
  },

  // Santri operations
  getSantriList(): Santri[] {
    this.initDefaults();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SANTRI);
      return data ? JSON.parse(data) : INITIAL_SANTRI;
    } catch {
      return INITIAL_SANTRI;
    }
  },

  getSantriByHalaqoh(halaqohId: string): Santri[] {
    const list = this.getSantriList();
    return list.filter(s => s.halaqohId === halaqohId);
  },

  saveSantri(santri: Santri): Santri[] {
    const list = this.getSantriList();
    const index = list.findIndex(s => s.id === santri.id);
    let updated: Santri[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = santri;
    } else {
      updated = [santri, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(updated));
    window.dispatchEvent(new Event('halaqoh_santri_updated'));
    return updated;
  },

  deleteSantri(santriId: string): Santri[] {
    const list = this.getSantriList();
    const updated = list.filter(s => s.id !== santriId);
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(updated));
    window.dispatchEvent(new Event('halaqoh_santri_updated'));
    return updated;
  },

  // Halaqoh operations
  getHalaqohs(): Halaqoh[] {
    this.initDefaults();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HALAQOHS);
      return data ? JSON.parse(data) : INITIAL_HALAQOHS;
    } catch {
      return INITIAL_HALAQOHS;
    }
  },

  saveHalaqoh(halaqoh: Halaqoh): Halaqoh[] {
    const list = this.getHalaqohs();
    const index = list.findIndex(h => h.id === halaqoh.id);
    let updated: Halaqoh[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = halaqoh;
    } else {
      updated = [...list, halaqoh];
    }
    localStorage.setItem(STORAGE_KEYS.HALAQOHS, JSON.stringify(updated));
    window.dispatchEvent(new Event('halaqoh_halaqohs_updated'));
    return updated;
  },

  // Presensi operations
  getPresensiList(): PresensiHarian[] {
    this.initDefaults();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESENSI);
      return data ? JSON.parse(data) : INITIAL_PRESENSI;
    } catch {
      return INITIAL_PRESENSI;
    }
  },

  getPresensiByDateAndHalaqoh(date: string, halaqohId: string): PresensiHarian | undefined {
    const list = this.getPresensiList();
    return list.find(p => p.date === date && p.halaqohId === halaqohId);
  },

  savePresensi(presensi: PresensiHarian): PresensiHarian[] {
    const list = this.getPresensiList();
    const index = list.findIndex(p => p.date === presensi.date && p.halaqohId === presensi.halaqohId);
    let updated: PresensiHarian[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...presensi, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...presensi, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.PRESENSI, JSON.stringify(updated));
    window.dispatchEvent(new Event('halaqoh_presensi_updated'));
    return updated;
  },

  // Capaian Bulanan operations
  getCapaianList(): CapaianBulanan[] {
    this.initDefaults();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAPAIAN);
      return data ? JSON.parse(data) : INITIAL_CAPAIAN_BULANAN;
    } catch {
      return INITIAL_CAPAIAN_BULANAN;
    }
  },

  getCapaianBySantriAndMonth(santriId: string, bulan: string): CapaianBulanan | undefined {
    const list = this.getCapaianList();
    return list.find(c => c.santriId === santriId && c.bulan.toLowerCase() === bulan.toLowerCase());
  },

  saveCapaian(capaian: CapaianBulanan): CapaianBulanan[] {
    const list = this.getCapaianList();
    const index = list.findIndex(c => c.id === capaian.id || (c.santriId === capaian.santriId && c.bulan === capaian.bulan));
    let updated: CapaianBulanan[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...capaian, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...capaian, updatedAt: new Date().toISOString() }, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.CAPAIAN, JSON.stringify(updated));
    window.dispatchEvent(new Event('halaqoh_capaian_updated'));
    return updated;
  },

  deleteCapaian(id: string): CapaianBulanan[] {
    const list = this.getCapaianList();
    const updated = list.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CAPAIAN, JSON.stringify(updated));
    window.dispatchEvent(new Event('halaqoh_capaian_updated'));
    return updated;
  },

  // Settings
  getSettings(): AppSettings {
    this.initDefaults();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): AppSettings {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('halaqoh_settings_updated'));
    return settings;
  },

  // Auth User
  getCurrentUser(): UserProfile | null {
    try {
      const isLogged = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      if (isLogged !== 'true') return null;
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    window.dispatchEvent(new Event('halaqoh_auth_updated'));
  },

  // Backup & Restore
  exportBackupJSON(): string {
    const payload = {
      santri: this.getSantriList(),
      halaqohs: this.getHalaqohs(),
      presensi: this.getPresensiList(),
      capaian: this.getCapaianList(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackupJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.santri) localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(parsed.santri));
      if (parsed.halaqohs) localStorage.setItem(STORAGE_KEYS.HALAQOHS, JSON.stringify(parsed.halaqohs));
      if (parsed.presensi) localStorage.setItem(STORAGE_KEYS.PRESENSI, JSON.stringify(parsed.presensi));
      if (parsed.capaian) localStorage.setItem(STORAGE_KEYS.CAPAIAN, JSON.stringify(parsed.capaian));
      if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      window.dispatchEvent(new Event('halaqoh_all_reloaded'));
      return true;
    } catch (err) {
      console.error('Failed to import backup JSON', err);
      return false;
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(INITIAL_SANTRI));
    localStorage.setItem(STORAGE_KEYS.HALAQOHS, JSON.stringify(INITIAL_HALAQOHS));
    localStorage.setItem(STORAGE_KEYS.PRESENSI, JSON.stringify(INITIAL_PRESENSI));
    localStorage.setItem(STORAGE_KEYS.CAPAIAN, JSON.stringify(INITIAL_CAPAIAN_BULANAN));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    window.dispatchEvent(new Event('halaqoh_all_reloaded'));
  }
};
