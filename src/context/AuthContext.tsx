import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, pinOrPass: string) => boolean;
  loginAsDemo: (role: 'musyrif' | 'koordinator') => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return StorageService.getCurrentUser();
  });

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(StorageService.getCurrentUser());
    };
    window.addEventListener('halaqoh_auth_updated', handleAuthChange);
    return () => {
      window.removeEventListener('halaqoh_auth_updated', handleAuthChange);
    };
  }, []);

  const login = (username: string, pinOrPass: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pinOrPass.trim();

    // Default predefined credentials
    if (
      (cleanUser === 'musyrif' || cleanUser === 'abdullah' || cleanUser === 'ustadz.abdullah') &&
      (cleanPin === '123456' || cleanPin === '1234' || cleanPin === 'admin')
    ) {
      const user: UserProfile = {
        id: 'usr-musyrif-1',
        username: 'ustadz.abdullah',
        fullName: 'Ustadz Abdullah Al-Hafidz',
        role: 'musyrif',
        assignedHalaqohId: 'hq-pra-1',
        assignedHalaqohName: 'Pra Tahfidz 1',
        phone: '6281234567891'
      };
      StorageService.setCurrentUser(user);
      setCurrentUser(user);
      return true;
    }

    if (
      (cleanUser === 'koordinator' || cleanUser === 'ahmad' || cleanUser === 'ustadz.ahmad') &&
      (cleanPin === '123456' || cleanPin === '1234' || cleanPin === 'admin')
    ) {
      const user: UserProfile = {
        id: 'usr-koordinator-1',
        username: 'ustadz.ahmad',
        fullName: 'Ustadz Ahmad Fauzan, Lc.',
        role: 'koordinator',
        assignedHalaqohId: 'hq-pra-1',
        assignedHalaqohName: 'Semua Halaqoh',
        phone: '6281234567890'
      };
      StorageService.setCurrentUser(user);
      setCurrentUser(user);
      return true;
    }

    // Flexible fallback: if PIN has at least 4 digits, permit custom login as musyrif
    if (cleanUser.length >= 3 && cleanPin.length >= 4) {
      const user: UserProfile = {
        id: 'usr-' + Date.now(),
        username: cleanUser,
        fullName: username.startsWith('Ustadz') ? username : `Ustadz ${username}`,
        role: 'musyrif',
        assignedHalaqohId: 'hq-pra-1',
        assignedHalaqohName: 'Pra Tahfidz 1',
        phone: ''
      };
      StorageService.setCurrentUser(user);
      setCurrentUser(user);
      return true;
    }

    return false;
  };

  const loginAsDemo = (role: 'musyrif' | 'koordinator') => {
    if (role === 'musyrif') {
      const user: UserProfile = {
        id: 'usr-musyrif-1',
        username: 'ustadz.abdullah',
        fullName: 'Ustadz Abdullah Al-Hafidz',
        role: 'musyrif',
        assignedHalaqohId: 'hq-pra-1',
        assignedHalaqohName: 'Pra Tahfidz 1',
        phone: '6281234567891'
      };
      StorageService.setCurrentUser(user);
      setCurrentUser(user);
    } else {
      const user: UserProfile = {
        id: 'usr-koordinator-1',
        username: 'ustadz.ahmad',
        fullName: 'Ustadz Ahmad Fauzan, Lc.',
        role: 'koordinator',
        assignedHalaqohId: 'all',
        assignedHalaqohName: 'Semua Halaqoh',
        phone: '6281234567890'
      };
      StorageService.setCurrentUser(user);
      setCurrentUser(user);
    }
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    StorageService.setCurrentUser(updated);
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginAsDemo,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
