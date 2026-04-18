import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppItem, Device, Category, AppVaultData, AppSource, Priority } from '@/lib/types';
import { nanoid } from 'nanoid';

interface AppContextType {
  apps: AppItem[];
  devices: Device[];
  categories: Category[];
  activeFilter: string;
  activeDeviceFilter: string;
  activeSourceFilter: string;
  searchQuery: string;
  isFormatMode: boolean;
  formatDeviceId: string;

  setActiveFilter: (filter: string) => void;
  setActiveDeviceFilter: (filter: string) => void;
  setActiveSourceFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setIsFormatMode: (mode: boolean) => void;
  setFormatDeviceId: (id: string) => void;

  addApp: (app: Omit<AppItem, 'id' | 'dateAdded' | 'dateUpdated' | 'isChecked'>) => void;
  updateApp: (id: string, updates: Partial<AppItem>) => void;
  deleteApp: (id: string) => void;
  toggleAppChecked: (id: string) => void;
  resetAllChecks: () => void;

  addDevice: (name: string, icon: string) => void;
  updateDevice: (id: string, name: string, icon: string) => void;
  deleteDevice: (id: string) => void;

  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;

  exportData: () => string;
  importData: (jsonString: string) => boolean;

  getFilteredApps: () => AppItem[];
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'app-vault-data';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'essential', name: 'أساسي', color: '#2DD4BF' },
  { id: 'tools', name: 'أدوات', color: '#F59E0B' },
  { id: 'root', name: 'أدوات Root', color: '#EF4444' },
  { id: 'mods', name: 'مودات', color: '#A855F7' },
  { id: 'social', name: 'تواصل', color: '#3B82F6' },
  { id: 'magisk', name: 'Magisk Modules', color: '#10B981' },
  { id: 'other', name: 'أخرى', color: '#6B7280' },
];

function loadFromStorage(): { apps: AppItem[]; devices: Device[]; categories: Category[] } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        apps: data.apps || [],
        devices: data.devices || [],
        categories: data.categories?.length ? data.categories : DEFAULT_CATEGORIES,
      };
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return { apps: [], devices: [], categories: DEFAULT_CATEGORIES };
}

function saveToStorage(apps: AppItem[], devices: Device[], categories: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apps, devices, categories }));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDeviceFilter, setActiveDeviceFilter] = useState('all');
  const [activeSourceFilter, setActiveSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormatMode, setIsFormatMode] = useState(false);
  const [formatDeviceId, setFormatDeviceId] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const data = loadFromStorage();
    setApps(data.apps);
    setDevices(data.devices);
    setCategories(data.categories);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(apps, devices, categories);
    }
  }, [apps, devices, categories, isLoaded]);

  const addApp = useCallback((app: Omit<AppItem, 'id' | 'dateAdded' | 'dateUpdated' | 'isChecked'>) => {
    const now = new Date().toISOString();
    const newApp: AppItem = {
      ...app,
      id: nanoid(),
      dateAdded: now,
      dateUpdated: now,
      isChecked: false,
    };
    setApps(prev => [newApp, ...prev]);
  }, []);

  const updateApp = useCallback((id: string, updates: Partial<AppItem>) => {
    setApps(prev => prev.map(app =>
      app.id === id ? { ...app, ...updates, dateUpdated: new Date().toISOString() } : app
    ));
  }, []);

  const deleteApp = useCallback((id: string) => {
    setApps(prev => prev.filter(app => app.id !== id));
  }, []);

  const toggleAppChecked = useCallback((id: string) => {
    setApps(prev => prev.map(app =>
      app.id === id ? { ...app, isChecked: !app.isChecked } : app
    ));
  }, []);

  const resetAllChecks = useCallback(() => {
    setApps(prev => prev.map(app => ({ ...app, isChecked: false })));
  }, []);

  const addDevice = useCallback((name: string, icon: string) => {
    setDevices(prev => [...prev, { id: nanoid(), name, icon }]);
  }, []);

  const updateDevice = useCallback((id: string, name: string, icon: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, name, icon } : d));
  }, []);

  const deleteDevice = useCallback((id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setApps(prev => prev.map(app => ({
      ...app,
      devices: app.devices.filter(did => did !== id),
    })));
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    setCategories(prev => [...prev, { id: nanoid(), name, color }]);
  }, []);

  const updateCategory = useCallback((id: string, name: string, color: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, color } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setApps(prev => prev.map(app =>
      app.category === id ? { ...app, category: 'other' } : app
    ));
  }, []);

  const exportData = useCallback((): string => {
    const data: AppVaultData = {
      apps,
      devices,
      categories,
      version: '1.0.0',
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [apps, devices, categories]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const data: AppVaultData = JSON.parse(jsonString);
      if (data.apps && Array.isArray(data.apps)) {
        setApps(data.apps);
        if (data.devices) setDevices(data.devices);
        if (data.categories?.length) setCategories(data.categories);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const getFilteredApps = useCallback((): AppItem[] => {
    let filtered = [...apps];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.notes.toLowerCase().includes(q)
      );
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(app => app.category === activeFilter);
    }

    if (activeDeviceFilter !== 'all') {
      filtered = filtered.filter(app =>
        app.devices.length === 0 || app.devices.includes(activeDeviceFilter)
      );
    }

    if (activeSourceFilter !== 'all') {
      filtered = filtered.filter(app => app.source === activeSourceFilter);
    }

    if (isFormatMode && formatDeviceId !== 'all') {
      filtered = filtered.filter(app =>
        app.devices.length === 0 || app.devices.includes(formatDeviceId)
      );
    }

    // Sort by priority then name
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return a.name.localeCompare(b.name, 'ar');
    });

    return filtered;
  }, [apps, searchQuery, activeFilter, activeDeviceFilter, activeSourceFilter, isFormatMode, formatDeviceId]);

  return (
    <AppContext.Provider value={{
      apps, devices, categories,
      activeFilter, activeDeviceFilter, activeSourceFilter,
      searchQuery, isFormatMode, formatDeviceId,
      setActiveFilter, setActiveDeviceFilter, setActiveSourceFilter,
      setSearchQuery, setIsFormatMode, setFormatDeviceId,
      addApp, updateApp, deleteApp, toggleAppChecked, resetAllChecks,
      addDevice, updateDevice, deleteDevice,
      addCategory, updateCategory, deleteCategory,
      exportData, importData, getFilteredApps,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
