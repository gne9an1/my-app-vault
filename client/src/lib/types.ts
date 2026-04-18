export type AppSource = 'github' | 'playstore' | 'fdroid' | 'manual';
export type Priority = 'high' | 'medium' | 'low';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  source: AppSource;
  sourceUrl: string;
  downloadPageUrl: string;
  version: string;
  category: string;
  priority: Priority;
  devices: string[];
  notes: string;
  dateAdded: string;
  dateUpdated: string;
  isChecked: boolean; // for format mode
}

export interface Device {
  id: string;
  name: string;
  icon: string; // emoji or icon name
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface AppVaultData {
  apps: AppItem[];
  devices: Device[];
  categories: Category[];
  version: string;
  exportDate: string;
}

export interface FetchedAppData {
  name: string;
  description: string;
  iconUrl: string;
  version: string;
  downloadPageUrl: string;
  source: AppSource;
}
