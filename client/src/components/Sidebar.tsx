/*
 * Design: Glass Vault / Frosted Modern
 * Sidebar with glass morphism, teal accents, category/device filters
 */
import { useAppContext } from '@/contexts/AppContext';
import { Layers, Smartphone, Github, Play, Box, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
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
    { id: 'all', name: 'الكل', icon: <Layers size={14} />, count: apps.length },
    { id: 'github', name: 'GitHub', icon: <Github size={14} />, count: apps.filter(a => a.source === 'github').length },
    { id: 'playstore', name: 'Google Play', icon: <Play size={14} />, count: apps.filter(a => a.source === 'playstore').length },
    { id: 'fdroid', name: 'F-Droid', icon: <Box size={14} />, count: apps.filter(a => a.source === 'fdroid').length },
    { id: 'manual', name: 'يدوي', icon: <Tag size={14} />, count: apps.filter(a => a.source === 'manual').length },
  ];

  const getCategoryCount = (catId: string) => apps.filter(a => a.category === catId).length;

  return (
    <aside
      className={`glass-sidebar fixed lg:sticky top-[57px] right-0 h-[calc(100vh-57px)] z-30 transition-all duration-300 overflow-y-auto ${
        isOpen ? 'w-64 translate-x-0' : 'w-0 translate-x-full lg:w-64 lg:translate-x-0'
      }`}
    >
      <div className="p-4 space-y-5 w-64">
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
                className="space-y-0.5 overflow-hidden"
              >
                {sourceOptions.map(src => (
                  <button
                    key={src.id}
                    onClick={() => setActiveSourceFilter(src.id)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSourceFilter === src.id ? '' : 'hover:bg-white/5'
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
                className="space-y-0.5 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    activeFilter === 'all' ? '' : 'hover:bg-white/5'
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
                    <Layers size={14} />
                    الكل
                  </span>
                  <span className="text-xs opacity-60">{apps.length}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                      activeFilter === cat.id ? '' : 'hover:bg-white/5'
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
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
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
                className="space-y-0.5 overflow-hidden"
              >
                <button
                  onClick={() => setActiveDeviceFilter('all')}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    activeDeviceFilter === 'all' ? '' : 'hover:bg-white/5'
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
                    <Smartphone size={14} />
                    كل الأجهزة
                  </span>
                </button>
                {devices.map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => setActiveDeviceFilter(dev.id)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${
                      activeDeviceFilter === dev.id ? '' : 'hover:bg-white/5'
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
                      <span>{dev.icon}</span>
                      {dev.name}
                    </span>
                    <span className="text-xs opacity-60">
                      {apps.filter(a => a.devices.includes(dev.id)).length}
                    </span>
                  </button>
                ))}
                {devices.length === 0 && (
                  <p className="text-xs px-3 py-2" style={{ color: 'oklch(0.45 0.01 260)' }}>
                    لم تضف أي جهاز بعد
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
