/*
 * Design: Glass Vault / Frosted Modern
 * Format mode bar - appears when format mode is active
 */
import { useAppContext } from '@/contexts/AppContext';
import { Smartphone, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FormatModeBar() {
  const {
    isFormatMode, setIsFormatMode,
    formatDeviceId, setFormatDeviceId,
    devices, getFilteredApps, resetAllChecks,
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
        borderBottom: '1px solid oklch(0.78 0.15 80 / 25%)',
      }}
    >
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Smartphone size={16} style={{ color: 'oklch(0.78 0.15 80)' }} />
              <span className="text-sm font-semibold" style={{ color: 'oklch(0.90 0.005 260)' }}>
                وضع الفورمات
              </span>
            </div>

            {/* Device Selector */}
            <select
              value={formatDeviceId}
              onChange={(e) => setFormatDeviceId(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: 'oklch(0.15 0.015 260 / 60%)',
                border: '1px solid oklch(0.40 0.015 260 / 30%)',
                color: 'oklch(0.90 0.005 260)',
              }}
            >
              <option value="all">كل الأجهزة</option>
              {devices.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.icon} {dev.name}</option>
              ))}
            </select>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'oklch(0.15 0.015 260 / 50%)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, oklch(0.75 0.15 180), oklch(0.78 0.15 80))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-mono" style={{ color: 'oklch(0.78 0.15 80)' }}>
                {checkedCount}/{totalCount}
              </span>
            </div>

            <button
              onClick={resetAllChecks}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all hover:bg-white/10"
              style={{ color: 'oklch(0.70 0.01 260)' }}
              title="إعادة تعيين"
            >
              <RotateCcw size={12} />
            </button>

            <button
              onClick={() => setIsFormatMode(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/10"
              style={{
                color: 'oklch(0.90 0.005 260)',
                border: '1px solid oklch(0.50 0.015 260 / 30%)',
              }}
            >
              <XCircle size={13} />
              إنهاء
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
