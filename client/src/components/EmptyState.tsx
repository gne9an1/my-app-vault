/*
 * LIGHT MODE - Vibrant empty state
 * Orange primary button, clear text, cheerful design
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
        className="w-24 h-24 sm:w-40 sm:h-40 object-contain mb-4 sm:mb-6 opacity-80"
      />
      <h2 className="text-lg sm:text-2xl font-bold mb-2 text-gray-900" style={{
        fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
      }}>
        خزنتك فارغة
      </h2>
      <p className="text-xs sm:text-base mb-5 sm:mb-8 text-center max-w-sm leading-relaxed text-gray-500">
        أضف تطبيقاتك المفضلة عشان تكون جاهزة لك بعد كل فورمات. الصق رابط من GitHub أو Google Play أو F-Droid وخل الموقع يسحب البيانات تلقائياً.
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto max-w-xs sm:max-w-none">
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white transition-all active:scale-95 shadow-lg hover:shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
          }}
        >
          <Plus size={18} />
          أضف أول تطبيق
        </button>
        <button
          onClick={onImportClick}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all active:scale-95"
        >
          <Upload size={18} />
          استورد بياناتك
        </button>
      </div>
    </motion.div>
  );
}
