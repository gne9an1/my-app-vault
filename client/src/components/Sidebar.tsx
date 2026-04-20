/*
 * LIGHT MODE - Vibrant colorful sidebar
 * Clear contrast, colorful category dots, orange/green/blue accents
 * "فرز حسب" smart group filter - shows ONLY selected apps
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
        <h2 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif" }}>
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

    return (
      <>
        {/* فرز حسب - SmartGroups */}
        {smartGroups.length > 0 && (
          <>
            <div>
              <button
                onClick={() => setShowGroups(!showGroups)}
                className="flex items-center justify-between w-full mb-2 text-xs font-bold uppercase tracking-wider text-orange-600"
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
                    className="space-y-1 overflow-hidden"
                  >
                    <button
                      onClick={() => handleFilterClick(() => setActiveDeviceFilter('all'))}
                      className={`${itemClass} ${activeDeviceFilter === 'all'
                        ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                        : 'text-gray-600 border border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers size={15} />
                        الكل
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{apps.length}</span>
                    </button>
                    {smartGroups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleFilterClick(() => setActiveDeviceFilter(group.id))}
                        className={`${itemClass} ${activeDeviceFilter === group.id
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                          : 'text-gray-600 border border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{group.icon}</span>
                          {group.name}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{group.appIds.length}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-px bg-gray-200" />
          </>
        )}

        {/* Sources */}
        <div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full mb-2 text-xs font-bold uppercase tracking-wider text-blue-600"
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
                className="space-y-1 overflow-hidden"
              >
                {sourceOptions.map(src => (
                  <button
                    key={src.id}
                    onClick={() => handleFilterClick(() => setActiveSourceFilter(src.id))}
                    className={`${itemClass} ${activeSourceFilter === src.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                      : 'text-gray-600 border border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {src.icon}
                      {src.name}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{src.count}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Categories */}
        <div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center justify-between w-full mb-2 text-xs font-bold uppercase tracking-wider text-green-600"
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
                className="space-y-1 overflow-hidden"
              >
                <button
                  onClick={() => handleFilterClick(() => setActiveFilter('all'))}
                  className={`${itemClass} ${activeFilter === 'all'
                    ? 'bg-green-50 text-green-700 border border-green-200 font-semibold'
                    : 'text-gray-600 border border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers size={15} />
                    الكل
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{apps.length}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterClick(() => setActiveFilter(cat.id))}
                    className={`${itemClass} ${activeFilter === cat.id
                      ? 'font-semibold'
                      : 'text-gray-600 border border-transparent hover:bg-gray-50'
                    }`}
                    style={activeFilter === cat.id ? {
                      background: `${cat.color}12`,
                      color: cat.color,
                      border: `1px solid ${cat.color}35`,
                    } : undefined}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{getCategoryCount(cat.id)}</span>
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
