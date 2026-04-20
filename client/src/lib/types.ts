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
  developer: string;
  category: string;
  priority: Priority;
  devices: string[]; // kept for backward compat, now maps to smartGroups
  notes: string;
  dateAdded: string;
  dateUpdated: string;
  isChecked: boolean; // for format mode
}

/**
 * SmartGroup replaces the old Device concept.
 * Users can create any grouping: by device, by use-case, by preference, etc.
 * Each group contains a list of app IDs that belong to it.
 */
export interface SmartGroup {
  id: string;
  name: string;
  icon: string; // emoji
  appIds: string[]; // list of app IDs in this group
}

// Keep Device as alias for backward compatibility with stored data
export interface Device {
  id: string;
  name: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface AppVaultData {
  apps: AppItem[];
  devices: Device[]; // kept for backward compat in export/import
  smartGroups?: SmartGroup[]; // new grouping system
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
  developer: string;
  source: AppSource;
}
