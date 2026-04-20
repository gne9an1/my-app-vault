/*
 * LIGHT MODE - Vibrant colorful app card
 * White card, clear borders, colorful badges, orange/green/blue accents
 */
import { useAppContext } from '@/contexts/AppContext';
import type { AppItem } from '@/lib/types';
import { ExternalLink, Trash2, Edit3, Github, Play, Box, Tag, Check, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface AppCardProps {
  app: AppItem;
  index: number;
  onEdit: (app: AppItem) => void;
}

const sourceConfig = {
  github: { icon: <Github size={12} />, label: 'GitHub', className: 'source-github' },
  playstore: { icon: <Play size={12} />, label: 'Play', className: 'source-playstore' },
  fdroid: { icon: <Box size={12} />, label: 'F-Droid', className: 'source-fdroid' },
  manual: { icon: <Tag size={12} />, label: 'يدوي', className: 'source-manual' },
};

const priorityConfig = {
  high: { label: 'عالية', className: 'priority-high' },
  medium: { label: 'متوسطة', className: 'priority-medium' },
  low: { label: 'منخفضة', className: 'priority-low' },
};

export default function AppCard({ app, index, onEdit }: AppCardProps) {
  const { deleteApp, toggleAppChecked, isFormatMode, categories, smartGroups } = useAppContext();
  const [showNotes, setShowNotes] = useState(false);

  const source = sourceConfig[app.source];
  const priority = priorityConfig[app.priority];
  const category = categories.find(c => c.id === app.category);
  const appGroups = smartGroups.filter(g => g.appIds.includes(app.id));

  const handleDownloadClick = () => {
    if (app.downloadPageUrl) {
      window.open(app.downloadPageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`glass-card rounded-xl p-3.5 sm:p-4 relative group ${
        isFormatMode && app.isChecked ? 'opacity-50' : ''
      }`}
    >
      {/* Format mode checkbox */}
      {isFormatMode && (
        <button
          onClick={() => toggleAppChecked(app.id)}
          className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all z-10"
          style={app.isChecked ? {
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
          } : {
            border: '2px solid #d1d5db',
            background: '#ffffff',
          }}
        >
          {app.isChecked && <Check size={14} className="text-white" />}
        </button>
      )}

      <div className="flex gap-3">
        {/* App Icon */}
        <div className="shrink-0">
          {app.iconUrl ? (
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-gray-100 bg-gray-50 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-sm ${app.iconUrl ? 'hidden' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              border: '2px solid #fed7aa',
              color: '#ea580c',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {app.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* App Info */}
        <div className="flex-1 min-w-0">
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base truncate text-gray-900" style={{
              fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
            }}>
              {app.name}
            </h3>
            {app.developer && (
              <p className="text-[11px] sm:text-xs mt-0.5 text-blue-600 font-medium">
                {app.developer}
              </p>
            )}
            {app.description && (
              <p className="text-xs sm:text-sm mt-1 line-clamp-2 text-gray-500">
                {app.description}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium ${source.className}`}>
              {source.icon}
              {source.label}
            </span>

            <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold ${priority.className}`}>
              {priority.label}
            </span>

            {app.version && (
              <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-mono bg-gray-100 text-gray-600 border border-gray-200">
                v{app.version.replace(/^v/i, '')}
              </span>
            )}

            {category && (
              <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-semibold"
                style={{
                  background: `${category.color}15`,
                  color: category.color,
                  border: `1px solid ${category.color}30`,
                }}>
                {category.name}
              </span>
            )}
          </div>

          {/* Groups */}
          {appGroups.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {appGroups.map(group => (
                <span key={group.id} className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] bg-violet-50 text-violet-600 border border-violet-200 font-medium">
                  {group.icon} {group.name}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {app.notes && showNotes && (
            <div className="mt-2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm bg-amber-50 text-amber-800 border border-amber-200">
              {app.notes}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {app.notes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 sm:p-2.5 rounded-lg transition-all ${showNotes ? 'bg-amber-50 text-amber-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
              title="ملاحظات"
            >
              <StickyNote size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(app)}
            className="p-2 sm:p-2.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
            title="تعديل"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('هل تريد حذف هذا التطبيق؟')) deleteApp(app.id);
            }}
            className="p-2 sm:p-2.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <button
          onClick={handleDownloadClick}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 text-white shadow-md hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            boxShadow: '0 2px 10px rgba(249,115,22,0.25)',
          }}
        >
          <ExternalLink size={13} />
          التحميل
        </button>
      </div>
    </motion.div>
  );
}
