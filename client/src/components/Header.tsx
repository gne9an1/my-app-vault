/*
 * Design: Glass Vault / Frosted Modern
 * Header with glass morphism, teal accents, Space Grotesk display font
 * MOBILE-FIRST: compact header on phones, expanded on desktop
 * - Mobile: logo + action icons in one row, search below
 * - Desktop: logo + search + full action buttons
 */
import { Search, Plus, Download, Upload, Smartphone, Settings, MoreVertical } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onAddClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  onSettingsClick: () => void;
  onFormatModeClick: () => void;
}

export default function Header({ onAddClick, onExportClick, onImportClick, onSettingsClick, onFormatModeClick }: HeaderProps) {
  const { searchQuery, setSearchQuery, isFormatMode, apps } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full" style={{
      background: 'oklch(0.14 0.015 260 / 90%)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid oklch(0.35 0.015 260 / 25%)',
    }}>
      <div className="container py-2.5 sm:py-3">
        {/* Top Row: Logo + Actions */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                boxShadow: '0 0 20px oklch(0.75 0.15 180 / 25%)',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(0.15 0.015 260)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'oklch(0.95 0.005 260)' }}>
                App Vault
              </h1>
              <p className="text-[11px] sm:text-xs hidden xs:block" style={{ color: 'oklch(0.55 0.01 260)' }}>
                {apps.length} تطبيق محفوظ
              </p>
            </div>
          </div>

          {/* Search Bar - hidden on mobile, shown on md+ */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="glow-input flex items-center gap-2 rounded-xl px-3 py-2.5 w-full">
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Format mode button */}
            <button
              onClick={onFormatModeClick}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs font-medium transition-all ${
                isFormatMode ? '' : 'hover:bg-white/5'
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
              <Smartphone size={15} />
              <span className="hidden sm:inline">فورمات</span>
            </button>

            {/* Add button */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                color: 'oklch(0.15 0.015 260)',
                boxShadow: '0 0 15px oklch(0.75 0.15 180 / 20%)',
              }}
              title="إضافة تطبيق"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">إضافة</span>
            </button>

            {/* Desktop: individual buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onExportClick}
                className="p-2.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: 'oklch(0.65 0.01 260)', border: '1px solid oklch(0.30 0.015 260 / 30%)' }}
                title="تصدير البيانات"
              >
                <Download size={16} />
              </button>
              <button
                onClick={onImportClick}
                className="p-2.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: 'oklch(0.65 0.01 260)', border: '1px solid oklch(0.30 0.015 260 / 30%)' }}
                title="استيراد البيانات"
              >
                <Upload size={16} />
              </button>
              <button
                onClick={onSettingsClick}
                className="p-2.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: 'oklch(0.65 0.01 260)', border: '1px solid oklch(0.30 0.015 260 / 30%)' }}
                title="الإعدادات"
              >
                <Settings size={16} />
              </button>
            </div>

            {/* Mobile: 3-dot menu for export/import/settings */}
            <div className="md:hidden relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 sm:p-2.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: 'oklch(0.65 0.01 260)', border: '1px solid oklch(0.30 0.015 260 / 30%)' }}
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 sm:w-52 rounded-xl py-1.5 z-50 shadow-2xl"
                  style={{
                    background: 'oklch(0.18 0.02 260)',
                    border: '1px solid oklch(0.35 0.015 260 / 40%)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <button
                    onClick={() => { onExportClick(); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/5 transition-all"
                    style={{ color: 'oklch(0.85 0.005 260)' }}
                  >
                    <Download size={16} style={{ color: 'oklch(0.60 0.01 260)' }} />
                    تصدير البيانات
                  </button>
                  <button
                    onClick={() => { onImportClick(); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/5 transition-all"
                    style={{ color: 'oklch(0.85 0.005 260)' }}
                  >
                    <Upload size={16} style={{ color: 'oklch(0.60 0.01 260)' }} />
                    استيراد البيانات
                  </button>
                  <button
                    onClick={() => { onSettingsClick(); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/5 transition-all"
                    style={{ color: 'oklch(0.85 0.005 260)' }}
                  >
                    <Settings size={16} style={{ color: 'oklch(0.60 0.01 260)' }} />
                    الإعدادات
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - below the main row */}
        <div className="md:hidden mt-2.5">
          <div className="glow-input flex items-center gap-2 rounded-xl px-3 py-2.5">
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
      </div>
    </header>
  );
}
