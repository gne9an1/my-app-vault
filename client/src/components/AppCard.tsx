/*
 * Design: Glass Vault / Frosted Modern
 * App card with glass morphism, glow on hover, source badges, priority indicators
 */
import { useAppContext } from '@/contexts/AppContext';
import type { AppItem } from '@/lib/types';
import { ExternalLink, Trash2, Edit3, Github, Play, Box, Tag, Check, GripVertical, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface AppCardProps {
  app: AppItem;
  index: number;
  onEdit: (app: AppItem) => void;
}

const sourceConfig = {
  github: { icon: <Github size={13} />, label: 'GitHub', className: 'source-github' },
  playstore: { icon: <Play size={13} />, label: 'Google Play', className: 'source-playstore' },
  fdroid: { icon: <Box size={13} />, label: 'F-Droid', className: 'source-fdroid' },
  manual: { icon: <Tag size={13} />, label: 'يدوي', className: 'source-manual' },
};

const priorityConfig = {
  high: { label: 'عالية', className: 'priority-high' },
  medium: { label: 'متوسطة', className: 'priority-medium' },
  low: { label: 'منخفضة', className: 'priority-low' },
};

export default function AppCard({ app, index, onEdit }: AppCardProps) {
  const { deleteApp, toggleAppChecked, isFormatMode, categories, devices } = useAppContext();
  const [showNotes, setShowNotes] = useState(false);

  const source = sourceConfig[app.source];
  const priority = priorityConfig[app.priority];
  const category = categories.find(c => c.id === app.category);
  const appDevices = devices.filter(d => app.devices.includes(d.id));

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
      className={`glass-card rounded-xl p-4 relative group ${
        isFormatMode && app.isChecked ? 'opacity-50' : ''
      }`}
    >
      {/* Format mode checkbox */}
      {isFormatMode && (
        <button
          onClick={() => toggleAppChecked(app.id)}
          className="absolute top-3 left-3 w-6 h-6 rounded-md flex items-center justify-center transition-all z-10"
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
              className="w-14 h-14 rounded-xl object-cover"
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
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${app.iconUrl ? 'hidden' : ''}`}
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
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate" style={{
                color: 'oklch(0.95 0.005 260)',
                fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
              }}>
                {app.name}
              </h3>
              {app.description && (
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'oklch(0.55 0.01 260)' }}>
                  {app.description}
                </p>
              )}
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Source Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${source.className}`}>
              {source.icon}
              {source.label}
            </span>

            {/* Priority Badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${priority.className}`}>
              {priority.label}
            </span>

            {/* Version Badge */}
            {app.version && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono"
                style={{
                  background: 'oklch(0.25 0.015 260 / 60%)',
                  color: 'oklch(0.70 0.01 260)',
                  border: '1px solid oklch(0.35 0.015 260 / 20%)',
                }}>
                v{app.version}
              </span>
            )}

            {/* Category Badge */}
            {category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                style={{
                  background: `${category.color}18`,
                  color: category.color,
                  border: `1px solid ${category.color}25`,
                }}>
                {category.name}
              </span>
            )}
          </div>

          {/* Devices */}
          {appDevices.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {appDevices.map(dev => (
                <span key={dev.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    background: 'oklch(0.22 0.015 260 / 50%)',
                    color: 'oklch(0.60 0.01 260)',
                  }}>
                  {dev.icon} {dev.name}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {app.notes && showNotes && (
            <div className="mt-2 p-2 rounded-lg text-xs" style={{
              background: 'oklch(0.18 0.015 260 / 60%)',
              color: 'oklch(0.65 0.01 260)',
              border: '1px solid oklch(0.30 0.015 260 / 20%)',
            }}>
              {app.notes}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid oklch(0.30 0.015 260 / 20%)' }}>
        <div className="flex items-center gap-1">
          {app.notes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-1.5 rounded-md transition-all hover:bg-white/5"
              style={{ color: showNotes ? 'oklch(0.78 0.15 80)' : 'oklch(0.50 0.01 260)' }}
              title="ملاحظات"
            >
              <StickyNote size={14} />
            </button>
          )}
          <button
            onClick={() => onEdit(app)}
            className="p-1.5 rounded-md transition-all hover:bg-white/5"
            style={{ color: 'oklch(0.50 0.01 260)' }}
            title="تعديل"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm('هل تريد حذف هذا التطبيق؟')) deleteApp(app.id);
            }}
            className="p-1.5 rounded-md transition-all hover:bg-red-500/10"
            style={{ color: 'oklch(0.50 0.01 260)' }}
            title="حذف"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <button
          onClick={handleDownloadClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'oklch(0.75 0.15 180 / 12%)',
            color: 'oklch(0.80 0.12 180)',
            border: '1px solid oklch(0.75 0.15 180 / 20%)',
          }}
        >
          <ExternalLink size={12} />
          صفحة التحميل
        </button>
      </div>
    </motion.div>
  );
}
