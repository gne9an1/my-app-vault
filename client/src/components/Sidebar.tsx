/*
 * Design: Glass Vault / Frosted Modern
 * Sidebar with glass morphism, teal accents, category/device filters
 * MOBILE-FIRST: large touch targets (min 44px) inside Sheet on mobile
 * Desktop: compact sticky sidebar
 */
import { useAppContext } from '@/contexts/AppContext';
import { Layers, Smartphone, Github, Play, Box, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const {
    categories, devices, apps,
    activeFilter, setActiveFilter,
    activeDeviceFilter, setActiveDeviceFilter,
    activeSourceFilter, setActiveSourceFilter,
  } = useAppContext();

  const [showCategories, setShowCategories] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [showSources, setShowSources] = useState(true);

  const sourceOptions = [
    { id: 'all', name: 'الكل', icon: <Layers size={15} />, count: apps.length },
    { id: 'github', name: 'GitHub', icon: <Github size={15} />, count: apps.filter(a => a.source === 'github').length },
    { id: 'playstore', name: 'Google Play', icon: <Play size={15} />, count: apps.filter(a => a.source === 'playstore').length },
    { id: 'fdroid', name: 'F-Droid', icon: <Box size={15} />, count: apps.filter(a => a.source === 'fdroid').length },
    { id: 'manual', name: 'يدوي', icon: <Tag size={15} />, count: apps.filter(a => a.source === 'manual').length },
  ];

  const getCategoryCount = (catId: string) => apps.filter(a => a.category === catId).length;

  // On mobile, close sidebar after selecting a filter
  function handleFilterClick(fn: () => void) {
    fn();
    if (onClose && isMobile) {
      setTimeout(onClose, 150);
    }
  }

  // When used inside Sheet (mobile), render without fixed positioning
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

  // Desktop: sticky sidebar
  return (
    <aside
      className="glass-sidebar sticky top-[57px] h-[calc(100vh-57px)] w-56 xl:w-64 overflow-y-auto shrink-0"
    >
      <div className="p-4 space-y-5">
        {renderContent()}
      </div>
    </aside>
  );

  function renderContent() {
    const itemClass = isMobile
      ? "flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-sm transition-all"
      : "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all";

    return (
      <>
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
                    className={`${itemClass} ${
                      activeSourceFilter === src.id ? '' : 'hover:bg-white/5 active:bg-white/10'
                    }`}
                    style={activeSourceFilter === src.id ? {
                      background: 'oklch(0.75 0.15 180 / 12%)',
                      color: 'oklch(0.85 0.12 180)',
                      border: '1px solid oklch(0.75 0.15 180 / 20%)',
                    } : {
                      color: 'oklch(0.72 0.01 260)',
                      border: '1px solid transparent',
                    }}
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

        {/* Separator */}
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
                  className={`${itemClass} ${
                    activeFilter === 'all' ? '' : 'hover:bg-white/5 active:bg-white/10'
                  }`}
                  style={activeFilter === 'all' ? {
                    background: 'oklch(0.75 0.15 180 / 12%)',
                    color: 'oklch(0.85 0.12 180)',
                    border: '1px solid oklch(0.75 0.15 180 / 20%)',
                  } : {
                    color: 'oklch(0.72 0.01 260)',
                    border: '1px solid transparent',
                  }}
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
                    className={`${itemClass} ${
                      activeFilter === cat.id ? '' : 'hover:bg-white/5 active:bg-white/10'
                    }`}
                    style={activeFilter === cat.id ? {
                      background: `${cat.color}15`,
                      color: cat.color,
                      border: `1px solid ${cat.color}30`,
                    } : {
                      color: 'oklch(0.72 0.01 260)',
                      border: '1px solid transparent',
                    }}
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

        {/* Separator */}
        <div style={{ height: '1px', background: 'oklch(0.35 0.015 260 / 25%)' }} />

        {/* Devices Filter */}
        <div>
          <button
            onClick={() => setShowDevices(!showDevices)}
            className="flex items-center justify-between w-full mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'oklch(0.55 0.01 260)' }}
          >
            <span>الأجهزة</span>
            {showDevices ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <AnimatePresence>
            {showDevices && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-0.5 sm:space-y-1 overflow-hidden"
              >
                <button
                  onClick={() => handleFilterClick(() => setActiveDeviceFilter('all'))}
                  className={`${itemClass} ${
                    activeDeviceFilter === 'all' ? '' : 'hover:bg-white/5 active:bg-white/10'
                  }`}
                  style={activeDeviceFilter === 'all' ? {
                    background: 'oklch(0.75 0.15 180 / 12%)',
                    color: 'oklch(0.85 0.12 180)',
                    border: '1px solid oklch(0.75 0.15 180 / 20%)',
                  } : {
                    color: 'oklch(0.72 0.01 260)',
                    border: '1px solid transparent',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Smartphone size={15} />
                    كل الأجهزة
                  </span>
                </button>
                {devices.map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => handleFilterClick(() => setActiveDeviceFilter(dev.id))}
                    className={`${itemClass} ${
                      activeDeviceFilter === dev.id ? '' : 'hover:bg-white/5 active:bg-white/10'
                    }`}
                    style={activeDeviceFilter === dev.id ? {
                      background: 'oklch(0.75 0.15 180 / 12%)',
                      color: 'oklch(0.85 0.12 180)',
                      border: '1px solid oklch(0.75 0.15 180 / 20%)',
                    } : {
                      color: 'oklch(0.72 0.01 260)',
                      border: '1px solid transparent',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{dev.icon}</span>
                      {dev.name}
                    </span>
                    <span className="text-xs opacity-60">
                      {apps.filter(a => a.devices.includes(dev.id)).length}
                    </span>
                  </button>
                ))}
                {devices.length === 0 && (
                  <p className="text-xs sm:text-sm px-3 py-3" style={{ color: 'oklch(0.45 0.01 260)' }}>
                    لم تضف أي جهاز بعد
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
    );
  }
}
