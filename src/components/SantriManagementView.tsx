import React, { useState, useEffect } from 'react';
import { Santri, Halaqoh } from '../types';
import { StorageService } from '../services/storage';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Check,
  Plus
} from 'lucide-react';

export const SantriManagementView: React.FC = () => {
  const [santriList, setSantriList] = useState<Santri[]>(() => StorageService.getSantriList());
  const [halaqohList, setHalaqohList] = useState<Halaqoh[]>(() => StorageService.getHalaqohs());
  const [search, setSearch] = useState<string>('');
  const [selectedHalaqohFilter, setSelectedHalaqohFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);

  const [name, setName] = useState<string>('');
  const [halaqohId, setHalaqohId] = useState<string>('');
  const [gender, setGender] = useState<'ikhwan' | 'akhwat'>('ikhwan');
  const [phoneParent, setPhoneParent] = useState<string>('');

  const refreshData = () => {
    setSantriList(StorageService.getSantriList());
    setHalaqohList(StorageService.getHalaqohs());
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('halaqoh_santri_updated', handleUpdate);
    window.addEventListener('halaqoh_halaqohs_updated', handleUpdate);
    return () => {
      window.removeEventListener('halaqoh_santri_updated', handleUpdate);
      window.removeEventListener('halaqoh_halaqohs_updated', handleUpdate);
    };
  }, []);

  const openAddModal = () => {
    setEditingSantri(null);
    setName('');
    setHalaqohId(halaqohList[0]?.id || 'hq-pra-1');
    setGender('ikhwan');
    setPhoneParent('');
    setIsModalOpen(true);
  };

  const openEditModal = (santri: Santri) => {
    setEditingSantri(santri);
    setName(santri.name);
    setHalaqohId(santri.halaqohId);
    setGender(santri.gender);
    setPhoneParent(santri.phoneParent || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedHalaqoh = halaqohList.find(h => h.id === halaqohId);
    const targetHalaqohName = matchedHalaqoh?.name || 'Halaqoh';

    const payload: Santri = {
      id: editingSantri ? editingSantri.id : 'st-' + Date.now(),
      name: name.trim(),
      halaqohId,
      halaqohName: targetHalaqohName,
      gender,
      phoneParent: phoneParent.trim(),
      joinDate: editingSantri?.joinDate || new Date().toISOString().split('T')[0]
    };

    StorageService.saveSantri(payload);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, santriName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus santri ${santriName}?`)) {
      StorageService.deleteSantri(id);
    }
  };

  const filteredSantri = santriList.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchHalaqoh = selectedHalaqohFilter === 'all' || s.halaqohId === selectedHalaqohFilter;
    return matchSearch && matchHalaqoh;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Manajemen Santri &amp; Halaqoh</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Total {santriList.length} santri terdaftar di {halaqohList.length} kelompok halaqoh.
          </p>
        </div>

        <button
          onClick={openAddModal}
          type="button"
          className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Santri Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama santri..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          />
        </div>

        {/* Halaqoh Filter */}
        <div>
          <select
            value={selectedHalaqohFilter}
            onChange={e => setSelectedHalaqohFilter(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          >
            <option value="all">Semua Kelompok Halaqoh</option>
            {halaqohList.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Santri Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredSantri.map((santri, idx) => (
          <div
            key={santri.id}
            className="bg-white rounded-2xl p-3.5 shadow-xs border border-stone-200 flex items-center justify-between hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-sm font-bold text-stone-900">{santri.name}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {santri.halaqohName}
                  </span>
                  <span>·</span>
                  <span>{santri.gender === 'ikhwan' ? 'Ikhwan' : 'Akhwat'}</span>
                  {santri.phoneParent && (
                    <>
                      <span>·</span>
                      <span className="text-stone-400 truncate max-w-[90px]">{santri.phoneParent}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(santri)}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center active:scale-95"
                title="Edit Santri"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(santri.id, santri.name)}
                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center active:scale-95"
                title="Hapus Santri"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-3">
              {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap Santri</label>
                <input
                  type="text"
                  placeholder="Misal: Rhazes"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Kelompok Halaqoh</label>
                <select
                  value={halaqohId}
                  onChange={e => setHalaqohId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 min-h-[44px]"
                  required
                >
                  {halaqohList.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.musyrifName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('ikhwan')}
                    className={`py-2 px-3 rounded-xl font-bold min-h-[44px] transition-colors ${
                      gender === 'ikhwan'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Ikhwan (Laki-laki)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('akhwat')}
                    className={`py-2 px-3 rounded-xl font-bold min-h-[44px] transition-colors ${
                      gender === 'akhwat'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Akhwat (Perempuan)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">No. WhatsApp Orang Tua / Wali (Opsional)</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={phoneParent}
                  onChange={e => setPhoneParent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 min-h-[44px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
