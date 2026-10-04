import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'si';

export interface AuthUser {
  _id: string;
  name: string;
  email?: string;
  studentId?: string;
  phone?: string;
  grade?: number;
  class?: string;
  stream?: string;
  role: 'ADMIN' | 'STUDENT';
  status?: string;
}

export interface GradeItem {
  _id: string;
  gradeNumber: number;
  labelEn: string;
  labelSi: string;
  isSenior: boolean;
  streams: string[];
  active: boolean;
}

export interface ClassItem {
  _id: string;
  grade: number;
  name: string;
  stream: string;
  classTeacher: string;
  active: boolean;
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (en: string, si?: string) => string;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  authLoading: boolean;
  settings: Record<string, any>;
  grades: GradeItem[];
  classes: ClassItem[];
  refreshPublicMeta: () => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gcc_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('gcc_lang');
    return saved === 'si' ? 'si' : 'en';
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({
    schoolName: 'A/GALENBINDUNUWEWA CENTRAL COLLEGE',
    schoolNameSi: 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය',
    location: 'Galenbindunuwewa, Sri Lanka',
    locationSi: 'ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව',
  });
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('gcc_lang', newLang);
  };

  const t = useCallback(
    (en: string, si?: string) => {
      if (lang === 'si' && si && si.trim().length > 0) {
        return si;
      }
      return en;
    },
    [lang]
  );

  const refreshPublicMeta = useCallback(async () => {
    try {
      const [settingsRes, gcRes] = await Promise.all([
        apiFetch('/api/public/settings'),
        apiFetch('/api/public/grades-classes'),
      ]);
      if (settingsRes.settings) setSettings(settingsRes.settings);
      if (gcRes.grades) setGrades(gcRes.grades);
      if (gcRes.classes) setClasses(gcRes.classes);
    } catch (err) {
      console.error('Failed to load public school metadata:', err);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setAuthLoading(true);
      const data = await apiFetch('/api/auth/me');
      setUser(data.user || null);
    } catch (_err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (_err) {
      // ignore
    }
    localStorage.removeItem('gcc_token');
    setUser(null);
  }, []);

  useEffect(() => {
    refreshPublicMeta();
    refreshSession();
  }, [refreshPublicMeta, refreshSession]);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        user,
        setUser,
        authLoading,
        settings,
        grades,
        classes,
        refreshPublicMeta,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
