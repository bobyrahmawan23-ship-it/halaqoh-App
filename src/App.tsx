/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { PresensiHarianView } from './components/PresensiHarianView';
import { CapaianBulananView } from './components/CapaianBulananView';
import { SantriManagementView } from './components/SantriManagementView';
import { PengaturanView } from './components/PengaturanView';

type TabType = 'presensi' | 'capaian' | 'santri' | 'pengaturan';

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('presensi');

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      {/* Top Navbar adhering strictly to 3-zone contract */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5">
        {activeTab === 'presensi' && <PresensiHarianView />}
        {activeTab === 'capaian' && <CapaianBulananView />}
        {activeTab === 'santri' && <SantriManagementView />}
        {activeTab === 'pengaturan' && <PengaturanView />}
      </main>

      {/* Mobile Thumb Zone Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
