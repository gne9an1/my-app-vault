/*
 * Design: Glass Vault / Frosted Modern
 * Add/Edit app dialog with smart URL detection and auto-fetch
 * MOBILE-FIRST: compact inputs on phones, comfortable on desktop
 * Dialog uses max-h-[85dvh] for better mobile viewport handling
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import type { AppItem, AppSource, Priority } from '@/lib/types';
import { fetchAppData, detectSource } from '@/lib/fetcher';
import { useState, useEffect } from 'react';
import { Loader2, Link2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editApp?: AppItem | null;
}

export default function AddAppDialog({ open, onOpenChange, editApp }: AddAppDialogProps) {
  const { addApp, updateApp, categories, smartGroups } = useAppContext();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [version, setVersion] = useState('');
  const [downloadPageUrl, setDownloadPageUrl] = useState('');
  const [source, setSource] = useState<AppSource>('manual');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [developer, setDeveloper] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    if (editApp) {
      setName(editApp.name);
      setDescription(editApp.description);
      setIconUrl(editApp.iconUrl);
      setVersion(editApp.version);
      setDownloadPageUrl(editApp.downloadPageUrl);
      setSource(editApp.source);
      setCategory(editApp.category);
      setPriority(editApp.priority);
      setSelectedDevices(editApp.devices);
      setNotes(editApp.notes);
      setDeveloper(editApp.developer || '');
      setUrl(editApp.sourceUrl);
      setIsManualMode(true);
    } else {
      resetForm();
    }
  }, [editApp, open]);

  function resetForm() {
    setUrl(''); setName(''); setDescription(''); setIconUrl('');
    setVersion(''); setDownloadPageUrl(''); setSource('manual');
    setCategory('other'); setPriority('medium'); setSelectedDevices([]);
    setNotes(''); setDeveloper(''); setFetchError(''); setIsManualMode(false);
  }

  async function handleFetch() {
    if (!url.trim()) return;
    setIsFetching(true);
    setFetchError('');

    try {
      const data = await fetchAppData(url.trim());
      setName(data.name);
      setDescription(data.description);
      setIconUrl(data.iconUrl);
      setVersion(data.version);
      setDownloadPageUrl(data.downloadPageUrl);
      setSource(data.source);
      setDeveloper(data.developer || '');
      setIsManualMode(true);
      toast.success('تم سحب بيانات التطبيق بنجاح');
    } catch (err: any) {
      setFetchError(err.message || 'حدث خطأ في سحب البيانات');
      setIsManualMode(true);
      const detected = detectSource(url.trim());
      if (detected) {
        setSource(detected);
        setDownloadPageUrl(url.trim());
      }
    } finally {
      setIsFetching(false);
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم التطبيق');
      return;
    }

    const appData = {
      name: name.trim(),
      description: description.trim(),
      iconUrl: iconUrl.trim(),
      source,
      sourceUrl: url.trim(),
      downloadPageUrl: downloadPageUrl.trim() || url.trim(),
      version: version.trim(),
      developer: developer.trim(),
      category,
      priority,
      devices: selectedDevices,
      notes: notes.trim(),
    };

    if (editApp) {
      updateApp(editApp.id, appData);
      toast.success('تم تحديث التطبيق');
    } else {
      addApp(appData);
      toast.success('تم إضافة التطبيق');
    }

    onOpenChange(false);
    resetForm();
  }

  function toggleDevice(deviceId: string) {
    setSelectedDevices(prev =>
      prev.includes(deviceId) ? prev.filter(d => d !== deviceId) : [...prev, deviceId]
    );
  }

  const inputStyle = {
    background: 'oklch(0.20 0.02 260 / 85%)',
    border: '1px solid oklch(0.45 0.03 260 / 45%)',
    color: 'oklch(0.95 0.005 260)',
  };

  const labelStyle = { color: 'oklch(0.72 0.02 200)' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] max-h-[85dvh] overflow-y-auto" style={{
        background: 'oklch(0.16 0.02 260)',
        border: '1px solid oklch(0.35 0.015 260 / 30%)',
        backdropFilter: 'blur(24px)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold" style={{
            color: 'oklch(0.95 0.005 260)',
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            {editApp ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 mt-1 sm:mt-2">
          {/* URL Input with Fetch */}
          {!editApp && (
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block" style={labelStyle}>
                رابط التطبيق (GitHub / Google Play / F-Droid)
              </label>
              <div className="flex gap-2">
                <div className="glow-input flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 sm:py-3">
                  <Link2 size={16} className="shrink-0" style={{ color: 'oklch(0.50 0.01 260)' }} />
                  <input
                    type="url"
                    placeholder="الصق الرابط هنا..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                    className="bg-transparent border-none outline-none w-full text-sm"
                    style={{ color: 'oklch(0.90 0.005 260)' }}
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleFetch}
                  disabled={isFetching || !url.trim()}
                  className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all disabled:opacity-40 shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                    color: 'oklch(0.15 0.015 260)',
                  }}
                >
                  {isFetching ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  جلب
                </button>
              </div>
              {fetchError && (
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm" style={{ color: 'oklch(0.70 0.18 40)' }}>
                  <AlertCircle size={14} />
                  {fetchError} - يمكنك الإضافة يدوياً
                </div>
              )}
              <button
                onClick={() => { setIsManualMode(true); setSource('manual'); }}
                className="text-xs sm:text-sm mt-2 transition-all hover:underline"
                style={{ color: 'oklch(0.60 0.12 180)' }}
              >
                أو أضف يدوياً بدون رابط
              </button>
            </div>
          )}

          {/* Manual/Fetched Form */}
          {(isManualMode || editApp) && (
            <>
              {/* App Icon Preview + Name */}
              <div className="flex gap-3 items-start">
                <div className="shrink-0">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover"
                      style={{ border: '1px solid oklch(0.35 0.015 260 / 30%)' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold"
                      style={{
                        background: 'oklch(0.22 0.02 260)',
                        border: '1px solid oklch(0.35 0.015 260 / 30%)',
                        color: 'oklch(0.75 0.15 180)',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2.5 sm:space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>اسم التطبيق *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm sm:text-base outline-none focus:ring-1 focus:ring-teal/30"
                      style={inputStyle}
                      placeholder="مثال: Magisk"
                    />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>رابط الأيقونة</label>
                    <input
                      type="url"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                      className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-xs sm:text-sm outline-none focus:ring-1 focus:ring-teal/30"
                      style={inputStyle}
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>الوصف</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm outline-none resize-none focus:ring-1 focus:ring-teal/30"
                  style={inputStyle}
                  rows={2}
                  placeholder="وصف مختصر للتطبيق..."
                />
              </div>

              {/* Download Page URL */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>رابط صفحة التحميل</label>
                <input
                  type="url"
                  value={downloadPageUrl}
                  onChange={(e) => setDownloadPageUrl(e.target.value)}
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-xs sm:text-sm outline-none focus:ring-1 focus:ring-teal/30"
                  style={inputStyle}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>

              {/* Developer */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>المطور</label>
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal/30"
                  style={inputStyle}
                  placeholder="اسم المطور"
                />
              </div>

              {/* Version + Source Row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>الإصدار</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-teal/30"
                    style={inputStyle}
                    placeholder="1.0.0"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>المصدر</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as AppSource)}
                    className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="github">GitHub</option>
                    <option value="playstore">Google Play</option>
                    <option value="fdroid">F-Droid</option>
                    <option value="manual">يدوي</option>
                  </select>
                </div>
              </div>

              {/* Category + Priority Row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              {/* Smart Groups - فرز حسب */}
              {smartGroups.length > 0 && (
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block" style={labelStyle}>فرز حسب (اختياري)</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {smartGroups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => toggleDevice(group.id)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all"
                        style={selectedDevices.includes(group.id) ? {
                          background: 'oklch(0.78 0.16 170 / 15%)',
                          color: 'oklch(0.88 0.13 170)',
                          border: '1px solid oklch(0.78 0.16 170 / 30%)',
                        } : {
                          background: 'oklch(0.20 0.015 260 / 50%)',
                          color: 'oklch(0.60 0.01 260)',
                          border: '1px solid oklch(0.35 0.015 260 / 20%)',
                        }}
                      >
                        {group.icon} {group.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] sm:text-xs mt-1.5" style={{ color: 'oklch(0.50 0.02 200)' }}>
                    يمكنك أيضاً إدارة المجموعات من الإعدادات &gt; فرز حسب
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block" style={labelStyle}>ملاحظات شخصية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-sm outline-none resize-none focus:ring-1 focus:ring-teal/30"
                  style={inputStyle}
                  rows={2}
                  placeholder="مثال: لازم أفعل إعداد معين بعد التثبيت..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                  color: 'oklch(0.15 0.015 260)',
                  boxShadow: '0 0 20px oklch(0.75 0.15 180 / 20%)',
                }}
              >
                {editApp ? 'حفظ التعديلات' : 'إضافة التطبيق'}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
