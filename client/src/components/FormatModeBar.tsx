/*
 * LIGHT MODE - Vibrant format mode bar
 * Yellow/amber accent for format mode, clear progress bar
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
      className="sticky top-[57px] z-30 w-full bg-amber-50 border-b-2 border-amber-200"
    >
      <div className="container py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: group selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Filter size={16} className="shrink-0 hidden sm:block text-amber-600" />
            <select
              value={formatDeviceId}
              onChange={(e) => setFormatDeviceId(e.target.value)}
              className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm outline-none min-w-0 max-w-[130px] sm:max-w-none bg-white border-2 border-amber-300 text-gray-800 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              <option value="all">كل التطبيقات</option>
              {smartGroups.map(group => (
                <option key={group.id} value={group.id}>{group.icon} {group.name}</option>
              ))}
            </select>
          </div>

          {/* Center: progress */}
          <div className="flex items-center gap-2 flex-1 max-w-[200px] sm:max-w-xs">
            <div className="flex-1 h-2.5 sm:h-3 rounded-full overflow-hidden bg-amber-200">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #f97316, #22c55e)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs sm:text-sm font-bold text-amber-700 shrink-0">
              {checkedCount}/{totalCount}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={resetAllChecks}
              className="p-2 sm:p-2.5 rounded-xl text-gray-500 hover:bg-amber-100 hover:text-amber-700 transition-all"
              title="إعادة تعيين"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setIsFormatMode(false)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              <XCircle size={15} />
              <span className="hidden xs:inline">إنهاء</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
