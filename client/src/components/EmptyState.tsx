/*
 * Design: Glass Vault / Frosted Modern
 * Empty state with vault illustration
 * MOBILE-FIRST: large touch targets, comfortable spacing
 */
import { Plus, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onAddClick: () => void;
  onImportClick: () => void;
}

export default function EmptyState({ onAddClick, onImportClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-10 sm:py-20 px-4 sm:px-5"
    >
      <img
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663296462128/hPcSjJmyRTSXUtFyPw4oDE/empty-state-fjCVBf3DtZf2RACQv9df5d.webp"
        alt="خزنة فارغة"
        className="w-24 h-24 sm:w-40 sm:h-40 object-contain mb-4 sm:mb-6 opacity-70"
      />
      <h2 className="text-lg sm:text-2xl font-bold mb-2" style={{
        color: 'oklch(0.85 0.005 260)',
        fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
      }}>
        خزنتك فارغة
      </h2>
      <p className="text-xs sm:text-base mb-5 sm:mb-8 text-center max-w-sm leading-relaxed" style={{ color: 'oklch(0.50 0.01 260)' }}>
        أضف تطبيقاتك المفضلة عشان تكون جاهزة لك بعد كل فورمات. الصق رابط من GitHub أو Google Play أو F-Droid وخل الموقع يسحب البيانات تلقائياً.
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto max-w-xs sm:max-w-none">
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
            color: 'oklch(0.15 0.015 260)',
            boxShadow: '0 0 25px oklch(0.75 0.15 180 / 25%)',
          }}
        >
          <Plus size={18} />
          أضف أول تطبيق
        </button>
        <button
          onClick={onImportClick}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all hover:bg-white/5 active:scale-95"
          style={{
            color: 'oklch(0.70 0.01 260)',
            border: '1px solid oklch(0.35 0.015 260 / 30%)',
          }}
        >
          <Upload size={18} />
          استورد بياناتك
        </button>
      </div>
    </motion.div>
  );
}
