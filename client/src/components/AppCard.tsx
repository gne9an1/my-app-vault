/*
 * Design: Glass Vault / Frosted Modern
 * App card with glass morphism, glow on hover, source badges, priority indicators
 * MOBILE-FIRST: compact on phones (smaller icon, tighter spacing), expanded on desktop
 * Touch targets >= 44px for action buttons
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
      className={`glass-card rounded-xl p-3 sm:p-4 relative group ${
        isFormatMode && app.isChecked ? 'opacity-50' : ''
      }`}
    >
      {/* Format mode checkbox */}
      {isFormatMode && (
        <button
          onClick={() => toggleAppChecked(app.id)}
          className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all z-10"
          style={app.isChecked ? {
            background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
          } : {
            border: '2px solid oklch(0.45 0.015 260 / 50%)',
            background: 'oklch(0.18 0.015 260 / 50%)',
          }}
        >
          {app.isChecked && <Check size={14} style={{ color: 'oklch(0.15 0.015 260)' }} />}
        </button>
      )}

      <div className="flex gap-3">
        {/* App Icon */}
        <div className="shrink-0">
          {app.iconUrl ? (
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl object-cover"
              style={{
                border: '1px solid oklch(0.35 0.015 260 / 30%)',
                background: 'oklch(0.18 0.015 260)',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold ${app.iconUrl ? 'hidden' : ''}`}
            style={{
              background: 'linear-gradient(135deg, oklch(0.25 0.02 260), oklch(0.20 0.02 260))',
              border: '1px solid oklch(0.35 0.015 260 / 30%)',
              color: 'oklch(0.75 0.15 180)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {app.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* App Info */}
        <div className="flex-1 min-w-0">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate" style={{
              color: 'oklch(0.95 0.005 260)',
              fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
            }}>
              {app.name}
            </h3>
            {app.developer && (
              <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: 'oklch(0.60 0.10 180)' }}>
                {app.developer}
              </p>
            )}
            {app.description && (
              <p className="text-xs sm:text-sm mt-1 line-clamp-2" style={{ color: 'oklch(0.55 0.01 260)' }}>
                {app.description}
              </p>
            )}
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium ${source.className}`}>
              {source.icon}
              {source.label}
            </span>

            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold ${priority.className}`}>
              {priority.label}
            </span>

            {app.version && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-mono"
                style={{
                  background: 'oklch(0.25 0.015 260 / 60%)',
                  color: 'oklch(0.70 0.01 260)',
                  border: '1px solid oklch(0.35 0.015 260 / 20%)',
                }}>
                v{app.version.replace(/^v/i, '')}
              </span>
            )}

            {category && (
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium"
                style={{
                  background: `${category.color}18`,
                  color: category.color,
                  border: `1px solid ${category.color}25`,
                }}>
                {category.name}
              </span>
            )}
          </div>

          {/* Groups */}
          {appGroups.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 flex-wrap">
              {appGroups.map(group => (
                <span key={group.id} className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px]"
                  style={{
                    background: 'oklch(0.22 0.02 200 / 40%)',
                    color: 'oklch(0.70 0.06 200)',
                    border: '1px solid oklch(0.40 0.04 200 / 20%)',
                  }}>
                  {group.icon} {group.name}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {app.notes && showNotes && (
            <div className="mt-2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm" style={{
              background: 'oklch(0.18 0.015 260 / 60%)',
              color: 'oklch(0.65 0.01 260)',
              border: '1px solid oklch(0.30 0.015 260 / 20%)',
            }}>
              {app.notes}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - larger touch targets for mobile */}
      <div className="flex items-center justify-between mt-2.5 sm:mt-3.5 pt-2.5 sm:pt-3" style={{ borderTop: '1px solid oklch(0.30 0.015 260 / 20%)' }}>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {app.notes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 sm:p-2.5 rounded-lg transition-all hover:bg-white/5 active:bg-white/10"
              style={{ color: showNotes ? 'oklch(0.78 0.15 80)' : 'oklch(0.50 0.01 260)' }}
              title="ملاحظات"
            >
              <StickyNote size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(app)}
            className="p-2 sm:p-2.5 rounded-lg transition-all hover:bg-white/5 active:bg-white/10"
            style={{ color: 'oklch(0.50 0.01 260)' }}
            title="تعديل"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('هل تريد حذف هذا التطبيق؟')) deleteApp(app.id);
            }}
            className="p-2 sm:p-2.5 rounded-lg transition-all hover:bg-red-500/10 active:bg-red-500/20"
            style={{ color: 'oklch(0.50 0.01 260)' }}
            title="حذف"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <button
          onClick={handleDownloadClick}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95"
          style={{
            background: 'oklch(0.75 0.15 180 / 12%)',
            color: 'oklch(0.80 0.12 180)',
            border: '1px solid oklch(0.75 0.15 180 / 20%)',
          }}
        >
          <ExternalLink size={13} />
          التحميل
        </button>
      </div>
    </motion.div>
  );
}
