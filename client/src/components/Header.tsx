/*
 * Design: Glass Vault / Frosted Modern
 * Header with glass morphism, teal accents, Space Grotesk display font
 */
import { Search, Plus, Download, Upload, Smartphone, Settings } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useState } from 'react';

interface HeaderProps {
  onAddClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  onSettingsClick: () => void;
  onFormatModeClick: () => void;
}

export default function Header({ onAddClick, onExportClick, onImportClick, onSettingsClick, onFormatModeClick }: HeaderProps) {
  const { searchQuery, setSearchQuery, isFormatMode, apps } = useAppContext();

  return (
    <header className="sticky top-0 z-40 w-full" style={{
      background: 'oklch(0.14 0.015 260 / 85%)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid oklch(0.35 0.015 260 / 25%)',
    }}>
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                boxShadow: '0 0 20px oklch(0.75 0.15 180 / 25%)',
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.15 0.015 260)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'oklch(0.95 0.005 260)' }}>
                App Vault
              </h1>
              <p className="text-xs" style={{ color: 'oklch(0.55 0.01 260)' }}>
                {apps.length} تطبيق محفوظ
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="glow-input flex items-center gap-2 rounded-xl px-3 py-2">
              <Search size={16} style={{ color: 'oklch(0.50 0.01 260)' }} />
              <input
                type="text"
                placeholder="ابحث عن تطبيق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm"
                style={{ color: 'oklch(0.90 0.005 260)' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onFormatModeClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isFormatMode
                  ? 'text-background'
                  : 'hover:bg-white/5'
              }`}
              style={isFormatMode ? {
                background: 'linear-gradient(135deg, oklch(0.78 0.15 80), oklch(0.70 0.18 60))',
                color: 'oklch(0.15 0.015 260)',
                boxShadow: '0 0 15px oklch(0.78 0.15 80 / 30%)',
              } : {
                color: 'oklch(0.70 0.01 260)',
                border: '1px solid oklch(0.35 0.015 260 / 30%)',
              }}
              title="وضع الفورمات"
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">فورمات</span>
            </button>

            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                color: 'oklch(0.15 0.015 260)',
                boxShadow: '0 0 15px oklch(0.75 0.15 180 / 20%)',
              }}
              title="إضافة تطبيق"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">إضافة</span>
            </button>

            <button
              onClick={onExportClick}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: 'oklch(0.65 0.01 260)', border: '1px solid oklch(0.30 0.015 260 / 30%)' }}
              title="تصدير البيانات"
            >
              <Download size={15} />
            </button>

            <button
              onClick={onImportClick}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: 'oklch(0.65 0.01 260)', border: '1px solid oklch(0.30 0.015 260 / 30%)' }}
              title="استيراد البيانات"
            >
              <Upload size={15} />
            </button>

            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: 'oklch(0.65 0.01 260)', border: '1px solid oklch(0.30 0.015 260 / 30%)' }}
              title="الإعدادات"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
