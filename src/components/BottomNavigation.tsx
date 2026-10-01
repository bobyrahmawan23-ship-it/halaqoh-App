import React from 'react';
import { CalendarCheck, Award, Users, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'presensi' | 'capaian' | 'santri' | 'pengaturan';
  onTabChange: (tab: 'presensi' | 'capaian' | 'santri' | 'pengaturan') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'presensi' as const, label: 'Presensi', icon: CalendarCheck },
    { id: 'capaian' as const, label: 'Capaian', icon: Award },
    { id: 'santri' as const, label: 'Santri', icon: Users },
    { id: 'pengaturan' as const, label: 'Pengaturan', icon: Settings }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe shadow-lg">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(20);
                onTabChange(tab.id);
              }}
              type="button"
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
