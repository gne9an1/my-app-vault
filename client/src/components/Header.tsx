/*
 * LIGHT MODE - Vibrant colorful header
 * Orange primary, green/blue/yellow accents
 * Clear contrast, easy to read
 */
import { Search, Plus, Download, Upload, Settings, MoreVertical, ListChecks } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container py-2.5 sm:py-3">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[20px] sm:h-[20px]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                App Vault
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 hidden xs:block">
                {apps.length} تطبيق محفوظ
              </p>
            </div>
          </div>

          {/* Search - desktop */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="glow-input flex items-center gap-2 px-3.5 py-2.5 w-full">
              <Search size={17} className="text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن تطبيق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Format mode */}
            <button
              onClick={onFormatModeClick}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isFormatMode ? 'shadow-md' : 'hover:bg-gray-50'
              }`}
              style={isFormatMode ? {
                background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(234,179,8,0.3)',
              } : {
                color: '#64748b',
                border: '1.5px solid #e2e8f0',
              }}
              title="وضع الفورمات"
            >
              <ListChecks size={16} />
              <span className="hidden sm:inline">فورمات</span>
            </button>

            {/* Add */}
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
              }}
              title="إضافة تطبيق"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">إضافة</span>
            </button>

            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={onExportClick}
                className="p-2.5 rounded-xl text-gray-500 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
                title="تصدير البيانات"
              >
                <Download size={17} />
              </button>
              <button
                onClick={onImportClick}
                className="p-2.5 rounded-xl text-gray-500 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                title="استيراد البيانات"
              >
                <Upload size={17} />
              </button>
              <button
                onClick={onSettingsClick}
                className="p-2.5 rounded-xl text-gray-500 border border-gray-200 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all"
                title="الإعدادات"
              >
                <Settings size={17} />
              </button>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-xl text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <MoreVertical size={17} />
              </button>
              {menuOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 rounded-xl py-1.5 z-50 bg-white border border-gray-200 shadow-xl">
                  <button
                    onClick={() => { onExportClick(); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
                  >
                    <Download size={17} className="text-green-500" />
                    تصدير البيانات
                  </button>
                  <button
                    onClick={() => { onImportClick(); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
                  >
                    <Upload size={17} className="text-blue-500" />
                    استيراد البيانات
                  </button>
                  <button
                    onClick={() => { onSettingsClick(); setMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-all"
                  >
                    <Settings size={17} className="text-violet-500" />
                    الإعدادات
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-2.5">
          <div className="glow-input flex items-center gap-2 px-3.5 py-2.5">
            <Search size={17} className="text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن تطبيق..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm text-gray-900"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
