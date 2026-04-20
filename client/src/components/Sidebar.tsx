/*
 * Design: Glass Vault / Frosted Modern - Vibrant refresh
 * Sidebar with glass morphism, vibrant teal accents
 * "فرز حسب" replaces old device filter - shows ONLY selected apps
 * MOBILE-FIRST: large touch targets inside Sheet on mobile
 */
import { useAppContext } from '@/contexts/AppContext';
import { Layers, Github, Play, Box, Tag, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const {
    categories, smartGroups, apps,
    activeFilter, setActiveFilter,
    activeDeviceFilter, setActiveDeviceFilter,
    activeSourceFilter, setActiveSourceFilter,
  } = useAppContext();

  const [showCategories, setShowCategories] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
  const [showSources, setShowSources] = useState(true);

  const sourceOptions = [
    { id: 'all', name: 'الكل', icon: <Layers size={15} />, count: apps.length },
    { id: 'github', name: 'GitHub', icon: <Github size={15} />, count: apps.filter(a => a.source === 'github').length },
    { id: 'playstore', name: 'Google Play', icon: <Play size={15} />, count: apps.filter(a => a.source === 'playstore').length },
    { id: 'fdroid', name: 'F-Droid', icon: <Box size={15} />, count: apps.filter(a => a.source === 'fdroid').length },
    { id: 'manual', name: 'يدوي', icon: <Tag size={15} />, count: apps.filter(a => a.source === 'manual').length },
  ];

  const getCategoryCount = (catId: string) => apps.filter(a => a.category === catId).length;

  function handleFilterClick(fn: () => void) {
    fn();
    if (onClose && isMobile) {
      setTimeout(onClose, 150);
    }
  }

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-base font-bold mb-3" style={{
          color: 'oklch(0.90 0.005 260)',
          fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
        }}>
          الفلاتر
        </h2>
        {renderContent()}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <aside className="glass-sidebar sticky top-[57px] h-[calc(100vh-57px)] w-56 xl:w-64 overflow-y-auto shrink-0">
      <div className="p-4 space-y-5">
        {renderContent()}
      </div>
    </aside>
  );

  function renderContent() {
    const itemClass = isMobile
      ? "flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-sm transition-all"
      : "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all";

    const activeStyle = {
      background: 'oklch(0.78 0.16 170 / 12%)',
      color: 'oklch(0.88 0.13 170)',
      border: '1px solid oklch(0.78 0.16 170 / 20%)',
    };

    const inactiveStyle = {
      color: 'oklch(0.72 0.01 260)',
      border: '1px solid transparent',
    };

    return (
      <>
        {/* فرز حسب - SmartGroups Filter */}
        {smartGroups.length > 0 && (
          <>
            <div>
              <button
                onClick={() => setShowGroups(!showGroups)}
                className="flex items-center justify-between w-full mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'oklch(0.60 0.04 170)' }}
              >
                <span className="flex items-center gap-1.5">
                  <Filter size={12} />
                  فرز حسب
                </span>
                {showGroups ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <AnimatePresence>
                {showGroups && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-0.5 sm:space-y-1 overflow-hidden"
                  >
                    <button
                      onClick={() => handleFilterClick(() => setActiveDeviceFilter('all'))}
                      className={`${itemClass} ${activeDeviceFilter === 'all' ? '' : 'hover:bg-white/5 active:bg-white/10'}`}
                      style={activeDeviceFilter === 'all' ? activeStyle : inactiveStyle}
                    >
                      <span className="flex items-center gap-2">
                        <Layers size={15} />
                        الكل
                      </span>
                      <span className="text-xs opacity-60">{apps.length}</span>
                    </button>
                    {smartGroups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleFilterClick(() => setActiveDeviceFilter(group.id))}
                        className={`${itemClass} ${activeDeviceFilter === group.id ? '' : 'hover:bg-white/5 active:bg-white/10'}`}
                        style={activeDeviceFilter === group.id ? activeStyle : inactiveStyle}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{group.icon}</span>
                          {group.name}
                        </span>
                        <span className="text-xs opacity-60">{group.appIds.length}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{ height: '1px', background: 'oklch(0.35 0.015 260 / 25%)' }} />
          </>
        )}

        {/* Sources Filter */}
        <div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'oklch(0.55 0.01 260)' }}
          >
            <span>المصدر</span>
            {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-0.5 sm:space-y-1 overflow-hidden"
              >
                {sourceOptions.map(src => (
                  <button
                    key={src.id}
                    onClick={() => handleFilterClick(() => setActiveSourceFilter(src.id))}
                    className={`${itemClass} ${activeSourceFilter === src.id ? '' : 'hover:bg-white/5 active:bg-white/10'}`}
                    style={activeSourceFilter === src.id ? activeStyle : inactiveStyle}
                  >
                    <span className="flex items-center gap-2">
                      {src.icon}
                      {src.name}
                    </span>
                    <span className="text-xs opacity-60">{src.count}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ height: '1px', background: 'oklch(0.35 0.015 260 / 25%)' }} />

        {/* Categories Filter */}
        <div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center justify-between w-full mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'oklch(0.55 0.01 260)' }}
          >
            <span>التصنيفات</span>
            {showCategories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-0.5 sm:space-y-1 overflow-hidden"
              >
                <button
                  onClick={() => handleFilterClick(() => setActiveFilter('all'))}
                  className={`${itemClass} ${activeFilter === 'all' ? '' : 'hover:bg-white/5 active:bg-white/10'}`}
                  style={activeFilter === 'all' ? activeStyle : inactiveStyle}
                >
                  <span className="flex items-center gap-2">
                    <Layers size={15} />
                    الكل
                  </span>
                  <span className="text-xs opacity-60">{apps.length}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterClick(() => setActiveFilter(cat.id))}
                    className={`${itemClass} ${activeFilter === cat.id ? '' : 'hover:bg-white/5 active:bg-white/10'}`}
                    style={activeFilter === cat.id ? {
                      background: `${cat.color}15`,
                      color: cat.color,
                      border: `1px solid ${cat.color}30`,
                    } : inactiveStyle}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-xs opacity-60">{getCategoryCount(cat.id)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  }
}
