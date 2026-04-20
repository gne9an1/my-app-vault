import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AppItem, Device, SmartGroup, Category, AppVaultData, AppSource, Priority } from '@/lib/types';
import { nanoid } from 'nanoid';

interface AppContextType {
  apps: AppItem[];
  devices: Device[]; // kept for backward compat
  smartGroups: SmartGroup[];
  categories: Category[];
  activeFilter: string;
  activeDeviceFilter: string; // now maps to smartGroup filter
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

  // Legacy device functions (now delegate to smartGroups)
  addDevice: (name: string, icon: string) => void;
  updateDevice: (id: string, name: string, icon: string) => void;
  deleteDevice: (id: string) => void;

  // SmartGroup functions
  addSmartGroup: (name: string, icon: string) => string;
  updateSmartGroup: (id: string, name: string, icon: string) => void;
  deleteSmartGroup: (id: string) => void;
  addAppsToGroup: (groupId: string, appIds: string[]) => void;
  removeAppFromGroup: (groupId: string, appId: string) => void;
  setGroupApps: (groupId: string, appIds: string[]) => void;

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

function sanitizeIconUrl(iconUrl: string): string {
  if (!iconUrl) return '';
  const badPatterns = [
    'avatars.githubusercontent.com', 'avatars0.githubusercontent.com',
    'avatars1.githubusercontent.com', 'avatars2.githubusercontent.com',
    'avatars3.githubusercontent.com', 'contrib.rocks', 'contributors-img',
  ];
  const lower = iconUrl.toLowerCase();
  if (badPatterns.some(p => lower.includes(p))) return '';
  return iconUrl;
}

/**
 * Migrate old devices data to smartGroups format
 * Old format: devices[] + app.devices[] (device IDs on each app)
 * New format: smartGroups[] with appIds[] on each group
 */
function migrateDevicesToSmartGroups(
  devices: Device[],
  apps: AppItem[],
  existingGroups?: SmartGroup[]
): SmartGroup[] {
  if (existingGroups && existingGroups.length > 0) return existingGroups;
  if (!devices || devices.length === 0) return [];

  return devices.map(dev => ({
    id: dev.id,
    name: dev.name,
    icon: dev.icon,
    appIds: apps.filter(app => app.devices.includes(dev.id)).map(app => app.id),
  }));
}

function loadFromStorage(): {
  apps: AppItem[];
  devices: Device[];
  smartGroups: SmartGroup[];
  categories: Category[];
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const apps = (data.apps || []).map((app: AppItem) => ({
        ...app,
        iconUrl: sanitizeIconUrl(app.iconUrl),
      }));
      const devices = data.devices || [];
      const smartGroups = migrateDevicesToSmartGroups(devices, apps, data.smartGroups);
      return {
        apps,
        devices,
        smartGroups,
        categories: data.categories?.length ? data.categories : DEFAULT_CATEGORIES,
      };
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
  return { apps: [], devices: [], smartGroups: [], categories: DEFAULT_CATEGORIES };
}

function saveToStorage(apps: AppItem[], devices: Device[], smartGroups: SmartGroup[], categories: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apps, devices, smartGroups, categories }));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [smartGroups, setSmartGroups] = useState<SmartGroup[]>([]);
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
    setSmartGroups(data.smartGroups);
    setCategories(data.categories);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(apps, devices, smartGroups, categories);
    }
  }, [apps, devices, smartGroups, categories, isLoaded]);

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
    // Also remove from all smartGroups
    setSmartGroups(prev => prev.map(g => ({
      ...g,
      appIds: g.appIds.filter(aid => aid !== id),
    })));
  }, []);

  const toggleAppChecked = useCallback((id: string) => {
    setApps(prev => prev.map(app =>
      app.id === id ? { ...app, isChecked: !app.isChecked } : app
    ));
  }, []);

  const resetAllChecks = useCallback(() => {
    setApps(prev => prev.map(app => ({ ...app, isChecked: false })));
  }, []);

  // Legacy device functions - now create smartGroups
  const addDevice = useCallback((name: string, icon: string) => {
    const id = nanoid();
    setDevices(prev => [...prev, { id, name, icon }]);
    setSmartGroups(prev => [...prev, { id, name, icon, appIds: [] }]);
  }, []);

  const updateDevice = useCallback((id: string, name: string, icon: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, name, icon } : d));
    setSmartGroups(prev => prev.map(g => g.id === id ? { ...g, name, icon } : g));
  }, []);

  const deleteDevice = useCallback((id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    setSmartGroups(prev => prev.filter(g => g.id !== id));
    setApps(prev => prev.map(app => ({
      ...app,
      devices: app.devices.filter(did => did !== id),
    })));
  }, []);

  // SmartGroup functions
  const addSmartGroup = useCallback((name: string, icon: string): string => {
    const id = nanoid();
    setSmartGroups(prev => [...prev, { id, name, icon, appIds: [] }]);
    // Also add to legacy devices for backward compat
    setDevices(prev => [...prev, { id, name, icon }]);
    return id;
  }, []);

  const updateSmartGroup = useCallback((id: string, name: string, icon: string) => {
    setSmartGroups(prev => prev.map(g => g.id === id ? { ...g, name, icon } : g));
    setDevices(prev => prev.map(d => d.id === id ? { ...d, name, icon } : d));
  }, []);

  const deleteSmartGroup = useCallback((id: string) => {
    setSmartGroups(prev => prev.filter(g => g.id !== id));
    setDevices(prev => prev.filter(d => d.id !== id));
    setApps(prev => prev.map(app => ({
      ...app,
      devices: app.devices.filter(did => did !== id),
    })));
  }, []);

  const addAppsToGroup = useCallback((groupId: string, appIds: string[]) => {
    setSmartGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const newIds = Array.from(new Set([...g.appIds, ...appIds]));
      return { ...g, appIds: newIds };
    }));
    // Also update legacy app.devices
    setApps(prev => prev.map(app => {
      if (!appIds.includes(app.id)) return app;
      const newDevices = Array.from(new Set([...app.devices, groupId]));
      return { ...app, devices: newDevices };
    }));
  }, []);

  const removeAppFromGroup = useCallback((groupId: string, appId: string) => {
    setSmartGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, appIds: g.appIds.filter(id => id !== appId) };
    }));
    // Also update legacy app.devices
    setApps(prev => prev.map(app => {
      if (app.id !== appId) return app;
      return { ...app, devices: app.devices.filter(d => d !== groupId) };
    }));
  }, []);

  const setGroupApps = useCallback((groupId: string, appIds: string[]) => {
    setSmartGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, appIds };
    }));
    // Sync legacy app.devices
    setApps(prev => prev.map(app => {
      const shouldBeInGroup = appIds.includes(app.id);
      const isInGroup = app.devices.includes(groupId);
      if (shouldBeInGroup && !isInGroup) {
        return { ...app, devices: [...app.devices, groupId] };
      }
      if (!shouldBeInGroup && isInGroup) {
        return { ...app, devices: app.devices.filter(d => d !== groupId) };
      }
      return app;
    }));
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
      smartGroups,
      categories,
      version: '1.1.0',
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [apps, devices, smartGroups, categories]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const data: AppVaultData = JSON.parse(jsonString);
      if (data.apps && Array.isArray(data.apps)) {
        const cleanedApps = data.apps.map((app: AppItem) => ({
          ...app,
          iconUrl: sanitizeIconUrl(app.iconUrl),
        }));
        setApps(cleanedApps);
        if (data.devices) setDevices(data.devices);
        // Migrate or use smartGroups
        const groups = migrateDevicesToSmartGroups(
          data.devices || [],
          cleanedApps,
          data.smartGroups
        );
        setSmartGroups(groups);
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

    // SmartGroup filter (replaces old device filter)
    if (activeDeviceFilter !== 'all') {
      const group = smartGroups.find(g => g.id === activeDeviceFilter);
      if (group) {
        filtered = filtered.filter(app => group.appIds.includes(app.id));
      }
    }

    if (activeSourceFilter !== 'all') {
      filtered = filtered.filter(app => app.source === activeSourceFilter);
    }

    if (isFormatMode && formatDeviceId !== 'all') {
      const group = smartGroups.find(g => g.id === formatDeviceId);
      if (group) {
        filtered = filtered.filter(app => group.appIds.includes(app.id));
      }
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
  }, [apps, searchQuery, activeFilter, activeDeviceFilter, activeSourceFilter, isFormatMode, formatDeviceId, smartGroups]);

  return (
    <AppContext.Provider value={{
      apps, devices, smartGroups, categories,
      activeFilter, activeDeviceFilter, activeSourceFilter,
      searchQuery, isFormatMode, formatDeviceId,
      setActiveFilter, setActiveDeviceFilter, setActiveSourceFilter,
      setSearchQuery, setIsFormatMode, setFormatDeviceId,
      addApp, updateApp, deleteApp, toggleAppChecked, resetAllChecks,
      addDevice, updateDevice, deleteDevice,
      addSmartGroup, updateSmartGroup, deleteSmartGroup,
      addAppsToGroup, removeAppFromGroup, setGroupApps,
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
