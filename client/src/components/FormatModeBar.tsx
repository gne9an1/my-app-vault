/*
 * Design: Glass Vault / Frosted Modern - Vibrant refresh
 * Format mode bar - uses smartGroups (فرز حسب) instead of old devices
 * MOBILE-FIRST: compact single-row on phones, expanded on desktop
 */
import { useAppContext } from '@/contexts/AppContext';
import { Filter, RotateCcw, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FormatModeBar() {
  const {
    isFormatMode, setIsFormatMode,
    formatDeviceId, setFormatDeviceId,
    smartGroups, getFilteredApps, resetAllChecks,
  } = useAppContext();

  if (!isFormatMode) return null;

  const filteredApps = getFilteredApps();
  const checkedCount = filteredApps.filter(a => a.isChecked).length;
  const totalCount = filteredApps.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="sticky top-[57px] z-30 w-full"
      style={{
        background: 'linear-gradient(135deg, oklch(0.22 0.04 80 / 90%), oklch(0.18 0.03 60 / 90%))',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid oklch(0.82 0.16 80 / 25%)',
      }}
    >
      <div className="container py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: icon + group selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Filter size={16} className="shrink-0 hidden sm:block" style={{ color: 'oklch(0.82 0.16 80)' }} />
            <select
              value={formatDeviceId}
              onChange={(e) => setFormatDeviceId(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none min-w-0 max-w-[120px] sm:max-w-none"
              style={{
                background: 'oklch(0.15 0.015 260 / 60%)',
                border: '1px solid oklch(0.40 0.015 260 / 30%)',
                color: 'oklch(0.90 0.005 260)',
              }}
            >
              <option value="all">كل التطبيقات</option>
              {smartGroups.map(group => (
                <option key={group.id} value={group.id}>{group.icon} {group.name}</option>
              ))}
            </select>
          </div>

          {/* Center: progress */}
          <div className="flex items-center gap-2 flex-1 max-w-[200px] sm:max-w-none">
            <div className="flex-1 h-2 sm:h-2.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.15 0.015 260 / 50%)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, oklch(0.78 0.16 170), oklch(0.82 0.16 80))' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs sm:text-sm font-mono shrink-0" style={{ color: 'oklch(0.82 0.16 80)' }}>
              {checkedCount}/{totalCount}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={resetAllChecks}
              className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all hover:bg-white/10 active:bg-white/15"
              style={{ color: 'oklch(0.70 0.01 260)' }}
              title="إعادة تعيين"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={() => setIsFormatMode(false)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all hover:bg-white/10 active:bg-white/15"
              style={{
                color: 'oklch(0.90 0.005 260)',
                border: '1px solid oklch(0.50 0.015 260 / 30%)',
              }}
            >
              <XCircle size={14} />
              <span className="hidden xs:inline">إنهاء</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
